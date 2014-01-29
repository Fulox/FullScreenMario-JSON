/* StatsHoldr.js
 * A storage container used for Full Screen Mario
 
This acts as a fancy associative array, storing a listing of keys and their values.
Each key may also have other properties, such as localStorage and a display element.

*/
function StatsHoldr(settings) {
  "use strict";
  
  // Member variables
  var version = "1.0",
      
      // The names of the objects being stored, as "name"=>{settings}
      values,
      
      // Default attributes for value, as "name"=>{setting}
      defaults,
      
      // A reference to localStorage, or a replacement object
      localStorage,
      
      // A prefix to store things under in localStorage
      prefix,
      
      // An array of elements as createElement arguments, outside-to-inside
      containers;
  
  function Value(key, settings) {
    this.key = key;
    proliferate(this, defaults);
    proliferate(this, settings);
    
    if(!this.hasOwnProperty("value"))
      this.value = this.value_default;
    
    if(this.has_element) {
      this.element = createElement(this.element || "div", {
        className: prefix + "_value " + key,
        innerHTML: this.value
      });
      this.updateElement = updateElement;
    }
    
    if(this.store_locally) {
      this.updateLocalStorage = updateLocalStorage;
      
      // If there exists an old version of this property, get it 
      if(localStorage.hasOwnProperty([prefix + key])) {
        var reference = localStorage[prefix + key],
            constructor;
        
        // If possible, use the same type as value_default (e.g. #7 is not "7")
        if(this.hasOwnProperty("value"))
          constructor = this.value.constructor;
        else if(this.hasOwnProperty("value_default"))
          constructor = this.value_default.constructor;
          
        if(constructor) this.value = new constructor(reference).valueOf();
        else this.value = reference;
      
        // Remember that the boolean false will be stored as "false", which evaluates to true
        if(this.value.constructor == Boolean)
          console.warn("Key '" + key + "' is a boolean instead of a Number, which will always save to true.");
      }
      // Otherwise save the new version to memory
      else this.updateLocalStorage();
    }
    
    this.update = update;
  }
  
  
  /* Updating values
  */
  
  this.set = function(key, value) {
    if(!checkExistence(key)) return;
    
    // Giving a value sets it, otherwise the current one is used
    if(arguments.length == 2)
      values[key].value = value;
    
    values[key].update();
  }
  this.increase = function(key, value) {
    if(!checkExistence(key)) return;
    values[key].value += value;
    values[key].update();
  }
  this.decrease = function(key, value) {
    if(!checkExistence(key)) return;
    values[key].value -= value;
    values[key].update();
  }
  function checkExistence(key) {
    if(values.hasOwnProperty(key)) return true;
    console.warn("The key '" + key + "' does not exist in storage.");
    return false;
  }
  
  
  /* Updating components
  */
  
  // Updates whatever's needed from the visual element and localStorage
  function update() {
    if(this.has_element)   this.updateElement();
    if(this.store_locally) this.updateLocalStorage();
  }
  function updateElement() {
    this.element.innerHTML = this.value;
  }
  function updateLocalStorage() {
    localStorage[prefix + this.key] = this.value;
  }
  
  /* HTML
  */
  
  this.makeContainer = function() {
    var output = createElement.apply(this, containers[0]),
        current = output,
        child;
    for(var i = 1, len = containers.length; i < len; ++i) {
      child = createElement.apply(this, containers[i]);
      current.appendChild(child);
      current = child;
    }
    for(var key in values)
      if(values[key].has_element)
        child.appendChild(values[key].element);
    return output;
  }
  
  
  /* Retrieval
  */
  
  this.get = function(key) {
    if(!checkExistence(key)) return;
    return values[key].value;
  }
  this.getObject = function(key) {
    return values[key];
  }
  
  
  function reset(settings) {
    localStorage = window.localStorage || settings.localStorage || {};
    prefix       = settings.prefix     || "";
    containers   = settings.containers || [ ["div", { "className": prefix + "_container" }] ]
    
    defaults = {};
    if(settings.defaults)
      proliferate(defaults, settings.defaults);
    
    values = {};
    if(settings.values)
      for(var key in settings.values)
        values[key] = new Value(key, settings.values[key]);
  }
  reset(settings);
}

function resetStatsHolder() {
  window.StatsHolder = new StatsHoldr({
    prefix: "FullScreenMario",
    containers: [
      [ "table", {
        "id": "data_display",
        "className": "display",
        "style": {
          "width": (gamescreen.right + 14) + "px"
        }
      }],
      [
        "tr"
      ]
    ],
    defaults: {
      "element": "td"
    },
    values: {
      "power": {
        value_default: 1,
        store_locally: true
      },
      "traveled": { value_default: 0 },
      "score": {
        value_default: 0,
        digits: 6,
        has_element: true
      },
      "time": {
        value_default: 0,
        digits: 3,
        has_element: true
      },
      "world": {
        value_default: 0,
        has_element: true
      },
      "coins": {
        value_default: 0,
        has_element: true
      },
      "lives": {
        value_default: 3,
        store_locally: true,
        has_element: true
      },
      "luigi": {
        value_default: 0,
        store_locally: true
      }
    }
  });
}