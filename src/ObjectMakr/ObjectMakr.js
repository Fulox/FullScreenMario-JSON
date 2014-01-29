/* ObjectMakr.js
 * A factory for JavaScript objects derived from Full Screen Mario
*/
function ObjectMakr(settings) {
  "use strict";
  
  /* Member Variables
  */
  var version = "1.0",
      
      // The default settings, applied to all objects
      defaults,
      // Settings for each of the sub-types
      type_defaults,
      
      // An associative array of types, as "name"=>{properties}
      types,
      
      // The sketch of which objects inherit from where
      inheritance,
      
      // Whether and how type defaults have some indices mapped to different strings
      index_map,
      keep_mapped_keys,
      
      // An optional member function to be run immediately on made objects
      on_make,
      
      // Whether to store the name of the object type in produced objects
      store_type,
      
      // If allowed, what to call the parent type from an object
      // Be aware this is read/write, and the end-user can mess things up!
      parent_name;
      
  // make("type"[, {settings})
  // Outputs a thing of the given type, optionally with user-given settings
  this.make = function(type, settings) {
    // If type is an array, use type[0] instead
    if(type instanceof Array) {
      // Make sure settings exists
      if(!settings) settings = {};
      // Copy any extra parts of type over as settings
      for(var i = 1, len = type.length; i < len; ++i)
        proliferate(settings, type[i])
      type = type[0];
    }
    
    // Make
    if(!types.hasOwnProperty(type)) {
      console.error("The type '" + type + "' does not exist.");
      return;
    }
    return proliferateDefaults({}, type, settings);
  }
  
  // proliferateDefaults({}, "type"[, {settings})
  // Proliferates all defaults of the given type to an object
  var proliferateDefaults = this.proliferateDefaults = function(recipient, type, settings) {
    // Copy the default settings from the specified type
    proliferate(recipient, types[type]);
    
    // Override in any user-defined settings
    if(settings)
      proliferate(recipient, settings);
      
    // If specified, run a function on the object immediately
    if(on_make && recipient[on_make]) {
      recipient[on_make](type, settings, type_defaults[type]);
    }
    
    return recipient;
  }
  
  /* Simple gets
  */
  this.getInheritance = function() { return inheritance; }
  this.getDefaults = function() { return defaults; }
  this.getTypeDefaults = function() { return type_defaults; }
  this.hasType = function(type) { return types.hasOwnProperty(type); }
  
  /* Proliferate helper
   * Proliferates all members of the donor to the recipient recursively
  */
  function proliferate(recipient, donor, no_override) {
    var setting, i;
    // For each attribute of the donor
    for(i in donor) {
      // If no_override is specified, don't override if it already exists
      if(no_override && recipient.hasOwnProperty(i)) continue;
      // If it's an object, recurse on a new version of it
      if(typeof(setting = donor[i]) == "object") {
        if(!recipient.hasOwnProperty(i)) recipient[i] = new setting.constructor();
        proliferate(recipient[i], setting, no_override);
      }
      // Regular primitives are easy to copy otherwise
      else recipient[i] = setting;
    }
    return recipient;
  }
  
  /* Index mapping
   * For each index, if there's a match in the map, change it to that
  */
  function mapIndices(objects, mapping, delete_keys) {
    // To do: switch the order of the loops?
    var object, key, i;
    // For each object in objects:
    for(i in objects) {
      object = objects[i];
      // For each key of that object,
      for(key in object) {
        if(mapping.hasOwnProperty(key)) {
          object[mapping[key]] = object[key];
          if(delete_keys)
            delete object[key];
        }
      }
    }
  }
  
  /* Resetting
  */
  function reset(settings) {
    on_make = settings.on_make;
    parent_name = settings.parent_name;
    
    // Create the default attributes every produced Object will have
    defaults = {};
    proliferate(defaults, settings.defaults || {});
    
    // Create the initial attributes for everything
    type_defaults = {};
    proliferate(type_defaults, settings.type_defaults || {});
    // (also performing the index mapping if requested)
    if(settings.index_map)
      mapIndices(type_defaults, settings.index_map, !settings.keep_mapped_keys);
    
    // Set up the default type attributes
    // (By default, 'defaults' is the parent of everything)
    inheritance = { defaults: {} };
    types = {};
    proliferate(inheritance.defaults, settings.inheritance || {});
    // Recursively proliferate the type inheritences
    resetInheritance(defaults, inheritance, "defaults");
  }
  // For each type and all its children, submissively copy the type's attributes
  function resetInheritance(source, structure, name, parent) {
    var type_name, type;
    for(type_name in structure) {
      // Make sure the new type exists
      if(!type_defaults[type_name])
        type_defaults[type_name] = {};
      
      // Submissively copy over all of them
      proliferate(type_defaults[type_name], source, true);
      types[type_name] = type_defaults[type_name];
      
      // If specified, keep a reference to the parent
      if(parent_name)
        type_defaults[type_name][parent_name] = parent;
      
      // Recurse on the child type
      resetInheritance(type_defaults[type_name], structure[type_name], type_name, source);
    }
  }
  reset(settings || {});
}