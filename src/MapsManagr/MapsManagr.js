/* MapsManagr.js
 * (relies on ObjectMakr.js)
 * A map creation engine used for Full Screen Mario
 
To do:
* Enable adding things to the end (generator, castles)
* Enable sorting (order each grouping at [current_num, end]

Maps stored in the MapsCreatr are JSON objects that each contain an array of
locations and an array of areas. Areas have a 'creation' array detailing how
to reconstruct them, along with general map state information. Locations are
x-y-entrances in a single area that keep info on how the player enters. Each
Location may contain an entrance function, and may be be attached to a thing
by the creation listing.
In short:
* Maps hold Areas and Locations.
* Areas hold instructions on how to create the in-game objects.
* Locations hold entrance positions for Areas
*/
function MapsManagr(settings) {
  "use strict";
  
  // Member variables
  var version = "1.0",
      self = this,
      
      // Object factory (ObjectMakr) used for maps, areas, and locations
      object_maker,
      
      // Externally made factory for PreThings
      prething_maker,
  
      // The object that receives map/area settings changes
      recipient,
      
      // What area variables should be passed to the recipient in setLocation
      recipient_receives,
      
      // A bottom-up ordering of groupings Things may be in (character, solid, etc.)
      groupings,
      
      // Default grouping name (optional)
      default_group,
      
      // The collection of default attributes
      // Contains settings for maps, areas, and locations
      defaults,
      
      // Macro functions to be used in .creation (listed as "name"=>function)
      macros,
      // Default settings for the macro functions (listed as "name"=>{defaults})
      macros_defaults,
      
      // Patterns to be used with makePrePattern
      patterns,
      
      // The currently manipulated map name, and the current area
      map_current,
      area_current,
      map_name,
      
      // Container for prething groupings to be manipulated
      prethings,
      
      // Current indeces of each prething groupings
      currents,
      
      // Locations used for creating prethings, then spawning them
      xloc,
      yloc,
      
      // Function to spawn a prething from spawnMap
      on_spawn,
      
      // Entrance function for Locations
      entry_functions,
      // Default entrance function name
      entry_default,
      // Default function to be run for all locations
      on_entry,
      
      // Whether to keep map_, area_, and locations_ raw after parsing maps.
      keep_raws,
      
      // An associative array of maps, as {"name"=>map} or {"name"=>{"name"=>map}}
      maps,
      
      // What folder to preload maps from (normally "Maps")
      folder,
      // What filetype to preload maps from (normally ".json")
      filetype;
      
  
  /* Major constructors
  */
  
  // Makes and stores a map in this.maps
  this.mapStore = function(name, settings) {
    // Make the map normally
    var map = this.mapMake(settings);
    
    // Find where to store this in maps
    if(name instanceof Array) {
      var current = maps,
          sub, len, i;
      // For each name, recurse into that 'directory'
      for(i = 0, len = name.length - 1; i < len; ++i) {
        sub = name[i];
        // (making it if necessary)
        if(!current[sub]) current[sub] = {};
        current = current[sub];
      }
      current[name[i]] = map;
    }
    else maps[name] = map;
    
    return this;
  }
  
  // Maps
  this.mapMake = function(settings) { return new Map(settings); }
  function Map(settings) {
    object_maker.proliferateDefaults(this, "Map", settings);
    // Make sure everything is valid
    if(!this.areas) {
      console.warn("A map is being created with no areas.", this);
      this.areas = [];
    }
    if(!this.locations) {
      console.warn("A map is being created with no locations.", this);
      this.locations = [];
    }
    
    // Set the one-to-many Map->Area relationships
    setMapAreas(this);

    // Set the one-to-many Area->Location relationships
    setMapLocations(this);
    
    // If desired, remember the raw settings
    if(keep_raws) this.map_raw = settings;
  }
  // Initially sets up the areas within a map
  function setMapAreas(map) {
    var areas_raw = map.areas,
        output = new areas_raw.constructor(),
        area, i;
    
    // Create each of the area objects in output
    for(i in areas_raw) {
      output[i] = new Area(areas_raw[i]);
      output[i].map = map;
    }
    
    // Store the real .areas, and if necessary also the .areas_raw
    map.areas = output;
    if(keep_raws) map.areas_raw = areas_raw;
  }
  // Initially sets up the locations within a map's areas
  function setMapLocations(map) {
    var locations_raw = map.locations,
        output = new locations_raw.constructor(),
        location, i;
    
    // Create each of the location objects in output
    for(i in locations_raw) {
      location = output[i] = new Location(locations_raw[i]);
      // Make sure that location has a valid area
      if(!map.areas.hasOwnProperty(location.area))
        console.warn("A Location is being made with an invalid area.", location);
      else location.area = map.areas[location.area];
    }
    
    // Store the real .locations, and if necessary also the .locations_raw
    map.locations = output;
    if(keep_raws) map.locations_raw = locations_raw;
    
    map.location = false;
  }
  // Areas
  function Area(settings) {
    object_maker.proliferateDefaults(this, "Area", settings);
    
    // Make sure this Area's .creation listing is valid
    if(!this.creation)
      console.warn("An Area is being made with no .creation listing.", this);
    else if(!(this.creation instanceof Array))
      if(!creation.length) {
        if(!creation.hasOwnProperty(length) || !(typeof(creation.length) == "number"))
          console.warn("An Area's .creation listing must act like an Array.", this);
        else console.warn("An area's .creation listing must have at least one entry.", this);
      }
    
    // Allow the area to be used in-game as a listing of PreThings
    this.IDs = {};
    this.setPreThings = setPreThings;
    this.getThingsByID = getThingsByID;
    this.getThingByID = getThingByID;
  }
  // Returns the array under the given ID, or [] if it doesn't exist
  function getThingsByID(id) {
    return this.IDs.hasOwnProperty(id) ? this.IDs[id] : [];
  }
  // Returns the first element of the array under the given ID, or undefined if it doesn't exist
  function getThingByID(id) {
    return this.getThingsByID(id)[0];
  }
  // Locations
  function Location(settings) {
    object_maker.proliferateDefaults(this, "Location", settings);
    // Make sure this has an entrance function
    if(!this.hasOwnProperty("entry"))
      this.entry = entry_default;
    // Area is set in setMapLocations
  }
  
  
  /* Map & PreThing creating
  */
  
  // Area.setPreThings()
  // Called whenever an Area needs to be reset and used
  function setPreThings() {
    // For each grouping, set the current_~ ints and pre_~ arrays
    var currents = this.currents = {},
        prethings = this.prethings = {},
        creation = this.creation,
        map = this.map,
        reference, len, i, j;
    for(i = 0, len = groupings.length; i < len; ++i) {
      reference = groupings[i];
      currents[reference] = 0;
      prethings[reference] = [];
      // The recipient should know this too.. and this should be genericized
      recipient[reference] = recipient[reference + 's'] = [];
    }
    
    // For each creation entry, analyze it appropriately
    for(i = 0; i < creation.length; ++i) {
      reference = creation[i];
      analyzePreThing(reference, prethings, this, map);
    }
    
    // Sort each pre-grouping by xloc, then yloc
    for(i = 0, len = groupings.length; i < len; ++i)
      sortPreThings(prethings[groupings[i]], "xloc");
    
    return this;
  }
  
  // Analyzes a single PreThing's reference settings
  // Also takes in optional arguments, like location setters and macros
  function analyzePreThing(reference, prethings, area, map) {
    // If it's a location, start creating from that point
    if(reference.hasOwnProperty("location"))
      return analyzePreLocation(reference, map);
    
    // If it's a macro function, call it
    if(reference.hasOwnProperty("macro"))
      return analyzePreMacro(reference, prethings, area, map);
    
    // Otherwise it's a regular PreThing to be made
    return analyzePreThingRegular(reference, prethings, area, map);
  }
  // Shifts the current xloc and yloc to a location's point
  function analyzePreLocation(reference, map) {
    // (making sure that location exists)
    if(!map.locations.hasOwnProperty(reference.location)) {
      console.warn("A location setter is attempting to reference a non-existent location.", reference);
      return;
    }
    var location = map.locations[reference.location]
    xloc = location.x;
    yloc = location.y;
  }
  // Checks for and runs a given macro function
  // That function should return an object for analyzePreThing, or an array of them
  function analyzePreMacro(reference, prethings, area, map) {
    // (making sure that function exists)
    if(!macros.hasOwnProperty(reference.macro)) {
      console.warn("Map " + map_name + " references an unlisted function.", reference);
      return;
    }
    // Proliferate any defaults for that macro, submissively
    proliferate(reference, macros_defaults[reference.macro] || {}, true);
    
    // Capture the output of the macro function
    var output = macros[reference.macro](reference, prethings, area, map),
        len, i;
    
    // If there's output from the function, pipe it into analyzePreThing
    if(output) {
      if(output instanceof Array)
        for(i = 0, len = output.length; i < len; ++i)
          analyzePreThing(output[i], prethings, area, map);
      else
        analyzePreThing(output, prethings, area, map);
    }
  }
  // A typical PreThing to be made
  function analyzePreThingRegular(reference, prethings, area, map) {
    // (making sure the PreThing actually exists)
    if(!prething_maker.hasType(reference.thing)) {
      console.warn("Map " + map_name + " references an unlisted Thing.", reference);
      return;
    }
    
    // Make the actual in-game object based on the reference information
    var thing = prething_maker.make(reference.thing, reference),
        prething = new PreThing(reference, thing);
    
    // Attempt to add the thing to the correct grouping
    if(!prethings.hasOwnProperty(thing.grouping)) {
      console.warn("Map " + map_name + "references a Thing of unknown grouping.", reference);
      return;
    }
    prethings[thing.grouping].push(prething);
    
    // Change a location's xloc if the Thing exits at that location
    if(thing.exit) {
      map.locations[thing.exit].xloc = prething.xloc;
      map.locations[thing.exit].entrance = prething.thing;
    }
    
    return thing;
  }
  
  // Container class that contains an in-game object and information on placing it
  function PreThing(reference, thing) {
    this.thing = thing;
    this.title = thing.title;
    this.xloc = reference.x || reference.xloc || 0;
    this.yloc = reference.y || reference.yloc || 0;
    this.reference = reference;
    if(thing.hasOwnProperty("id"))
      this.id = thing.id;
  }
  
  // Sorts an array of PreThings so the game can efficiently spawn them in order
  function sortPreThings(prethings, attr) {
    prethings.sort(function(a, b) {
      return a[attr] - b[attr];
    });
  }
  
  /* Default functions for analyzePreMacro
  */

  function exampleMacro(reference, prethings, area, map) {
    log("This is an example of a macro that may be called by a map creation. \nThe arguments are");
    log("Reference (the listing from area.creation):  ", reference);
    log("Prethings (the area's listing of prethings): ", prethings);
    log("Area      (the currently generated area):    ", area);
    log("Map       (the map containing the area):     ", map);
  }

  // Private: macroFillPreThings({...})
  // Macro to place a single type of Thing multiple times, drawing down/left to up/right
  // Required arguments are:
  // * "macro" = "Fill"
  // * "thing"
  // * #x
  // * #y
  // Optional arguments are:
  // * #xnum (to repeat in the x-direction)
  // * #ynum (to repeat in the y-direction)
  // * #xwidth (to space out in the x-direction)
  // * #ywidth (to space out in the y-direction)
  // Sample usage: { macro: "Fill", thing: "Brick", x: 664, y: 64, xnum: 5, xwidth: 8 },
  function macroFillPreThings(reference) {
    var xnum = reference.xnum || 1,
        ynum = reference.ynum || 1,
        xwidth = reference.xwidth || 0,
        yheight = reference.yheight || 0,
        x = reference.x || 0,
        y, yref = reference.y || 0,
        ynum = reference.ynum || 1,
        filltype = reference.fill,
        fill = reference[filltype],
        outputs = new Array(xnum * ynum),
        output, filltype,
        o = 0, i, j;
    
    for(i = 0; i < xnum; ++i) {
      y = yref;
      for(j = 0; j < ynum; ++j) {
        outputs[o++] = proliferate(output = {x: x, y: y}, reference, true);
        y += yheight;
        // Otherwise don't let infinite re-listings happen
        delete output.macro;
      }
      x += xwidth;
    }
    return outputs;
  }
  
  // Private: makePrePattern({...})
  // Macro to place a pre-defined sequence of objects any number of times
  function makePrePattern(reference) {
    // Make sure the pattern exists
    if(!patterns.hasOwnProperty(reference.pattern)) {
      console.warn("Map " + map_name + "references a pattern of unknown type.", reference);
      return;
    }
    
    var pattern = patterns[reference.pattern],
        length = pattern.length,
        defaults = ObjectMaker.getTypeDefaults(),
        repeats = reference.repeat || 1,
        xpos = reference.x || 0,
        ypos = reference.y || 0,
        outputs = new Array(length * repeats),
        o = 0,
        output, prething, i, j;
    for(i = 0; i < repeats; ++i) {
      for(j = 0; j < length; ++j) {
        prething = pattern[j];
        output = { thing: prething[0], x: xpos + prething[1], y: ypos + prething[2] };
        output.y += defaults[prething[0]].height;
        outputs[o] = output;
        ++o;
      }
      xpos += pattern.width;
    }
    return outputs;
  }
  
  /* Running maps
  */
  
  // Public function to get and reset a map
  this.setMap = function(name, location) {
    // Get the map, stopping if it doesn't exist
    var map = this.getMap(name);
    if(!map) {
      console.error("No map found for", name);
      return;
    }
    map_current = map;
    map_name = name;
    
    // Most of the work is done by shifting to a location (by default, first in the map)
    return this.setLocation(location || 0);
  }
  
  // Goes to a particular location
  this.setLocation = function(location) {
    if(typeof(location) == "number")
      location = map_current.location = map_current.locations[location];
    area_current = map_current.area = location.area;
    
    // Copy the area settings into the recipient
    for(var i = 0, len = recipient_receives.length; i < len; ++i) {
      recipient[recipient_receives[i]] = area_current[recipient_receives[i]];
    }
    
    // Create the area itself
    area_current.setPreThings();
    prethings = area_current.prethings;
    currents = area_current.currents;
    
    // This should be genericized
    resetGameScreenPosition();
    clearTexts();
    recipient.fillStyle = getAreaFillStyle(area_current.setting);
    TimeHandler.addEvent(AudioPlayer.playTheme, 2);
    
    // If there's a function for this, do it
    if(on_entry) on_entry();
    
    // This should be genericized
    if(location.xloc) scrollPlayer(location.xloc * unitsize);
    
    // If the location wants to set some things, let it
    if(location.entry)
      entry_functions[location.entry](location.entrance);
    
    return this;
  }
  
  // Map function to ...
  this.spawnMap = function(xloc_new) {
    // Make sure an xloc_new is given
    if(arguments.length == 0 || !(typeof(xloc_new) == "number")) {
      console.warn("An xloc_new must be provided as a number. You gave ", xloc_new);
      return;
    }
    
    // If xloc_new is <= xloc, you know you won't be spawning anything
    if(xloc_new <= xloc) return;
    xloc = xloc_new;
    
    // For each listing of prethings;
    var xloc_real = round(xloc),
        prethings_current,
        prething,
        group, id, i;
    for(group in prethings) {
      // Start at where the last spawnMap call left off
      prethings_current = prethings[group];
      i = currents[group];

      // Continuously check next objects, and spawn as necessary
      while(prething = prethings_current[i]) {
        if(prething.xloc > xloc_real) break;
        ++i;
        
        // Place the thing in the game
        on_spawn(prething, xloc);
        
        // If the prething has an ID, store the thing under the area
        if(id = prething.id) {
          if(!area_current.IDs[id]) area_current.IDs[id] = [ prething.thing ];
          else area_current.IDs[id].push(prething.thing);
        }
        
        // If it's an exit point, let the map_settings know
        if(prething.reference.exit != undefined) {
          this.getLocation().entrance = prething.thing;
        }
      }
      
      // Save the new location for later
      currents[group] = i;
    }
    
    return this;
  }
  
  // Sets a new recipient
  this.setRecipient = function(recipient_new) {
    recipient = recipient_new;
  }
  
  /* Simple gets
  */
  this.getXloc = function() { return xloc; }
  this.getMapName = function() { return map_name; }
  this.getMaps = function() { return maps; }
  this.getMap = function(name) {
    // If no input is provided, simply return the current map
    if(arguments.length == 0) return map_current;
    
    // Find the map in .maps
    var map;
    if(name instanceof Array) {
      map = followPathStrict(maps, name, 0);
    }
    else map = maps[name];
    
    // Warn the user if it doesn't exist
    if(!map) console.warn("No such map (", name, ") exists in maps.", maps);
    
    return map;
  }
  this.getArea = function(name) {
    return arguments.length == 0 ? this.getMap().area : this.getMap().areas[name];
  }
  this.getLocation = function(name) {
    return arguments.length == 0 ? this.getMap().location : this.getMap().locations[name];
  }
  
  /* Resetting
  */

  // Maps are given as a tree, with tree paths (names) leading to strings (file paths)
  function preload(path, settings) {
    for(var name in settings) {
      path.push(name);
      if(typeof(settings[name]) == "string")
        try {
          loadFile(path.slice(), settings[name]);
        }
        catch(err) {
          console.log(err);
        }
      else preload(path, settings[name]);
      path.pop(name);
    }
  }
  // Starts an AJAX request to load the contents of the file as a JSON map
  function loadFile(path, filename) {
    filename = folder + "/" + filename;
    if(filename.indexOf(filetype) == -1) filename += filetype;
    var ajax = new XMLHttpRequest();
    ajax.open("GET", filename);
    ajax.send();
    ajax.onreadystatechange = function() {
      if(ajax.readyState != 4) return;
      // Map file found, load it up!
      if(ajax.status == 200) {
        try {
          self.mapStore(path, JSON.parse(ajax.responseText));
        }
        catch(err) {
          console.warn("There was an error parsing", filename, "- check the JSON data for typos.", ajax);
        }
      }
      else console.warn("No map file found under " + filename);
    }
  }
  
  function reset(settings) {
    // An external prething_maker must be provided
    if(!settings.prething_maker) {
      console.error("No ObjectMakr for prethings is being provided.", settingS);
      return;
    }
    prething_maker  = settings.prething_maker;
    
    recipient          = settings.recipient          || window;
    recipient_receives = settings.recipient_receives || []
    groupings          = settings.groupings          || [];
    defaults           = settings.defaults           || {};
    patterns           = settings.patterns           || {};
    entry_functions    = settings.entry_functions    || {};
    macros_defaults    = settings.macros_defaults    || {};
    on_entry           = settings.on_entry           || {};
    folder             = settings.folder             || "Maps";
    filetype           = settings.filetype           || ".json";
    maps = {};
    
    // Every grouping must have at least a {} in defaults
    var grouping, i;
    for(i = groupings.length - 1; i >= 0; --i) {
      grouping = groupings[i];
      if(!defaults[grouping])
        defaults[grouping] = {};
    }
    
    // For a useful spawnMap, an on_spawn function must be provided
    on_spawn = settings.on_spawn || function() {
      console.warn("No spawnMap callback provided.", arguments);
    }
    
    // There are a few good default macro functions, which may be overriden
    macros = proliferate({
      "exampleMacro": exampleMacro,
      "Fill": macroFillPreThings,
      "Pattern": makePrePattern,
    }, settings.macros || {});
    
    // Set up the object maker to produce
    object_maker = new ObjectMakr({
      inheritance: {
        Map: {},
        Area: {},
        Location: {}
      },
      type_defaults: defaults
    });
  
    // Preload any necessary maps
    if(settings.preload)
      preload([], settings.preload);
  }
  reset(settings || {});
}