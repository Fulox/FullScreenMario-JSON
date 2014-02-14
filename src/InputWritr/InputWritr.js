/* InputWritr.js
 * A middleman that manages input events and their associated triggers
 
 
 
*/



function InputWritr(settings) {
  "use strict";
  
  // Member variables
  var version = "1.0",
      self = this,
      
      // 
      triggers,
      
      // The arguments to be passed to calls activated by triggers
      recipients,
      
      // An array of every action that has happened, with a timestamp
      history,
      // A record of all histories, initially an array but with indices also set by this.save
      histories,
      
      // For compatibility, a var reference to getting the performance.now() timestamp
      get_timestamp,
      // 
      starting_time;
  
  this.restart = function() {
    if(history) histories.push(history);
    history = {};
    starting_time = get_timestamp();
  }
  
  // Returns a history identified by name (passing no name returns the current history)
  this.get = function(name) {
    return arguments.length ? histories[name] : history;
  }
  this.getHistories = function() {
    return histories;
  }
  
  this.save = function(name) {
    histories[name] = history;
  }
  
  // Sets a native JS timeout for each of the events in history
  this.play = function(events) {
    if(!arguments.length) events = history;
    
    for(var timestamp in events) {
      var event = events[timestamp];
      setTimeout(makeEventCall(events[timestamp]), Math.round(timestamp - starting_time));
    }
  }
  
  // Returns a closure function that actives a trigger when called
  function makeEventCall(info) {
    return function() {
      call(info[0], info[1]);
    };
  }
  
  // Primary driver function to run an event
  // Overloaded to support the following forms of 'event':
  // 1. Function: Event is called on the recipient
  // 2. String: The triggers[event][keycode] function is called on the recipient
  // To do: don't use player.keys...
  function call(event, keycode) {
    var recipient = player.keys;
    switch(event.constructor) {
      case Function:
        event(recipient);
      break;
      case String:
        triggers[event][keycode](recipient);
      break;
    }
  }
  
  this.pipe = function(trigger, code_label, prevent_defaults) {
    // Make sure this trigger is recognized
    if(!triggers.hasOwnProperty(trigger)) {
      console.warn("No trigger of label '" + trigger + "' has been defined.");
      return;
    }
    
    var functions = triggers[trigger],
        use_label = arguments.length >= 2;
    return function(alias) {
      // Typical usage means alias will be an event from a key/mouse input
      if(prevent_defaults && alias.preventDefault instanceof Function)
        alias.preventDefault();
      
      // If a code_label is needed, use that as the alias instead of the given
      if(use_label) alias = alias[code_label];
      
      // If there's a function under that alias, run it
      if(!functions.hasOwnProperty(alias)) return;
      
      history[Math.round(get_timestamp())] = [trigger, alias];
      call(functions[alias]);
    }
  }
  
  function reset(settings) {
    get_timestamp = (
      performance.now
      || performance.webkitNow
      || performance.mozNow
      || performance.msNow
      || performance.oNow
      || function() { return new Date().getTime(); }
    ).bind(performance);
    
    histories  = [];
    triggers   = settings.triggers || {};
    recipients = settings.recipients || {};
    
    // Each alias must be stored in each trigger, so pipes can refer to them natively
    var aliases = settings.aliases || {},
        alias_name, alias_group, alias_individual,
        trigger_name, trigger_group;
    // alias_name = ("left", "right", "up", ...)
    for(alias_name in aliases) {
      // alias_group = ([37, 65], ...)
      alias_group = aliases[alias_name];
      for(trigger_name in triggers) {
        // trigger_group = ({ "left": function, "right": function }, ...)
        trigger_group = triggers[trigger_name];
        for(alias_individual in alias_group) {
          trigger_group[alias_group[alias_individual]] = trigger_group[alias_name];
        }
      }
    }
  }
  
  reset(settings);
  log("Triggers are", triggers);
}