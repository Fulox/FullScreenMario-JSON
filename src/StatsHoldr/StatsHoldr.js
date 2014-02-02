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
      containers,
      
      // A bit of text between an element's label and value
      separator;
  
  function Value(key, settings) {
    this.key = key;
    proliferate(this, defaults);
    proliferate(this, settings);
 
    if(!this.hasOwnProperty("value"))
      this.value = this.value_default;
    
    if(this.has_element) {
      this.element = createElement(this.element || "div", {
        className: prefix + "_value " + key,
        innerHTML: this.key + separator + this.value
      });
      this.updateElement = updateElement;
    }
    
    if(this.modularity) {
      this.check_modularity = checkModularity;
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
    if(arguments.length == 1) value = 1;
    values[key].value += value;
    values[key].update();
  }
  this.decrease = function(key, value) {
    if(!checkExistence(key)) return;
    if(arguments.length == 1) value = 1;
    values[key].value -= value;
    values[key].update();
  }
  // Toggling requires the type to be a bool, since true -> "true" -> NaN
  this.toggle = function(key) {
    if(!checkExistence(key)) return;
    values[key].value = values[key].value ? 0 : 1;
    values[key].update();
  }
  function checkExistence(key) {
    if(values.hasOwnProperty(key)) return true;
    console.warn("The key '" + key + "' does not exist in storage.");
    return false;
  }
  function checkModularity() {
    while(this.value > this.modularity) {
      this.value = this.value % this.modularity;
      if(this.on_modular) this.on_modular();
    }
  }
  
  
  /* Updating components
  */
  
  // Updates whatever's needed from the visual element and localStorage
  function update() {
    // Mins and maxes must be obeyed before any other considerations
    if(this.hasOwnProperty("minimum") && Number(this.value) <= Number(this.minimum)) {
      this.value = this.minimum;
      if(this.on_minimum) this.on_minimum();
    }
    else if(this.hasOwnProperty("maximum") && Number(this.value) <= Number(this.maximum)) {
      this.value = this.maximum;
      if(this.on_maximum) this.on_maximum();
    }
    
    if(this.modularity)    this.check_modularity();
    if(this.has_element)   this.updateElement();
    if(this.store_locally) this.updateLocalStorage();
  }
  function updateElement() {
    this.element.innerHTML = this.key + separator + this.value;
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
    separator    = settings.separator  || "";
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