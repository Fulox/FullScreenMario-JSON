/* Triggers.js */
// Keeps track of triggers, which mainly consist of key presses,
// and messages, which would be from an index.html UI

function resetTriggers() {
  // Gamepad.js support for joysticks and controllers
  window.gamepad = new Gamepad();
  gamepad.bind(Gamepad.Event.BUTTON_DOWN, InputWriter.pipe("onkeydown", "keyCode"));
  gamepad.bind(Gamepad.Event.BUTTON_UP, InputWriter.pipe("onkeyup", "keyCode"));
  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(event) {
    var value = event.value,
        value_abs = abs(value);
    
    // Don't allow tremors
    if(value_abs < 0.1) return;
    
    // Depending on the axis used...
    switch(event.axis) {
      // Left stick, vertical
      case "LEFT_STICK_Y":
      case "RIGHT_STICK_Y":
        // If it actually has a direction, either go up or down
        if(value_abs > 0.5) {
          keydown(value > 0 ? "DPAD_DOWN" : "DPAD_UP");
        }
        // It doesn't have a direction, so they're both unpressed
        else {
          keyup("DPAD_UP");
          keyup("DPAD_DOWN");
        }
      break;
      // Left stick, horizontal
      case "LEFT_STICK_X":
      case "RIGHT_STICK_X":
        // If it actually has a direction, either go left or right
        if(value_abs > 0.5) {
          keydown(value < 0 ? "DPAD_LEFT" : "DPAD_RIGHT");
        }
        // It doesn't have a direction, so they're both unpressed
        else {
          keyup("DPAD_UP");
          keyup("DPAD_DOWN");
        }
      break;
    }
  });

  gamepad.init();

  // Set the key events on the body
  proliferate(body, {
    "onkeydown": InputWriter.pipe("onkeydown", "keyCode"),
    "onkeyup": InputWriter.pipe("onkeyup", "keyCode"),
    "onmousedown": InputWriter.pipe("onmousedown", "which"),
    "oncontextmenu": InputWriter.pipe("oncontextmenu", null, true)
  });
  
  // Set UI triggers
  setMessageTriggers();
}

function lulz(options, timer) {
  player.star = true;
  options = options || ["Goomba"];
  timer = timer || 7;
  TimeHandler.addEventInterval(function() {
    if(characters.length > 210) return;
    var lul = ObjectMaker.make(options[randInt(options.length)], randBoolJS(), randBoolJS());
    lul.yvel = random() * -unitsizet4;
    lul.xvel = lul.speed = random() * unitsizet2 * randSign();
    addThing(lul, (32 * random() + 128) * unitsize, (88 * random()) * unitsize);
  }, timer, Infinity);
}
function superlulz() {
  lulz(["Goomba", "Koopa", "HammerBro"/*, "Podoboo", "Beetle", "Lakitu", "Blooper"*/]);
}
function hyperlulz() {
  lulz(["Bowser"], 21);
}
function maxlulz() {
  // Sigh....
  // window.palette = arrayShuffle(window.palette, 1);
  // clearAllSprites(true);
  TimeHandler.addEventInterval(function(arr) {
      setAreaSetting(arr[randInt(arr.length)]);
    }, 7, Infinity, ["Overworld", "Underworld", "Underwater", "Sky", "Castle"]);
}



/* Triggers (from a UI)
*/
function setMessageTriggers() {
  // Commands will be sent in by these codes
  var command_codes = {
    setMap: triggerSetMap,
    startEditor: function() { loadEditor(); },
    toggleOption: function(data) { 
      var name = "toggle" + data.option;
      console.log(name, window[name]);
      if(window[name]) window[name]();
      else log("Could not toggle", name);
    }
  };
  
  // When a message is received, send it to the appropriate command code
  window.addEventListener("message", function(event) {
    var data = event.data,
        type = data.type;
    // If the type is known, do it
    if(command_codes[type])
      command_codes[type](data);
    // Otherwise complain
    else {
      console.log("Unknown event type received:", type, ".\n", data);
    }
  });
}

// The UI has requested a map change
function triggerSetMap(data) {
  clearPlayerStats();
  setMap.apply(this, data.map || []);
  setLives(3);
}

// Functions are kept in this scope, so as to not clutter the global namespace
function resetInputWriter() {
  
  function KeyDownLeft(keys) {
    keys.run = -1;
    keys.left_down = true; // independent of changes to player.keys.run
  }
  
  function KeyDownRight(keys) {
    keys.run = 1;
    keys.right_down = true; // independent of changes to player.keys.run
  }
  
  function KeyDownUp(keys) {
    keys.up = true;
    if(player.canjump &&/* !player.crouching &&*/ (player.resting || map_settings.underwater)) {
      keys.jump = 1;
      player.canjump = keys.jumplev = 0;
      // To do: can player make a jumping sound during the spring, and during the pipe cutscenes?
      AudioPlayer.play(player.power > 1 ? "Jump Super" : "Jump Small");
      if(map_settings.underwater) setTimeout(function() {
        player.jumping = keys.jump = false;
      }, timer * 14);
    }
  }
  
  function KeyDownDown(keys) {
    keys.crouch = true;
  }
  
  function KeyDownSprint(keys) {
    if(player.power == 3 && keys.sprint == 0 && !keys.crouch)
      player.fire();
    keys.sprint = 1;
  }
  
  function KeyDownPause(keys) {
    if(!window.paused) addEvent(pause, 1, true);
  }
  
  function KeyDownMute(keys) {
    AudioPlayer.toggleMute();
  }
  
  function KeyDownL(keys) {
    toggleLuigi();
  }
  
  function KeyDownQ(keys) {
    if(++window.qcount > 28) maxlulz();
    switch(qcount) {
      case 7: lulz(); break;
      case 14: superlulz(); break;
      case 21: hyperlulz(); break;
    }
  }
  
  
  function KeyUpLeft(keys) {
    keys.run = 0;
    keys.left_down = false;
  }
  
  function KeyUpRight(keys) {
    keys.run = 0;
    keys.right_down = false;
  }
  
  function KeyUpUp(keys) {
    if(!map_settings.underwater) keys.jump = keys.up = 0;
    player.canjump = true;
  }
  
  function KeyUpDown(keys) {
    keys.crouch = 0;
    removeCrouch();
  }
  
  function KeyUpSprint(keys) {
    keys.sprint = 0;
  }
  
  function KeyUpPause(keys) {
    unpause(true);
  }
  
  
  function MouseDownRight() {
    if(paused) unpause();
    else pause(true);
  }
  
  
  window.InputWriter = new InputWritr({
    "aliases": {
      // Keyboard aliases
      "left":   [37, 65,      "AXIS_LEFT", "DPAD_LEFT"],                     // a,     left
      "right":  [39, 68,      "AXIS_RIGHT", "DPAD_RIGHT"],                   // d,     right
      "up":     [38, 87, 32,  "FACE_1", "DPAD_UP", "LEFT_BOTTOM_SHOULDER"],  // w,     up
      "down":   [40, 83,      "AXIS_DOWN", "DPAD_DOWN"],                     // s,     down
      "sprint": [16, 17,      "FACE_1"],                                     // shift, ctrl
      "pause":  [80,          "START_FORWARD"],                              // p (pause)
      "mute":   [77],                                                        // m (mute)
      "q":      [81],                                                        // q (qcount)
      "l":      [76],                                                        // l (luigi)
      // Mouse aliases
      "rightclick": [3]
    },
    "triggers": {
      "onkeydown": {
        "left": KeyDownLeft,
        "right": KeyDownRight,
        "up": KeyDownUp,
        "down": KeyDownDown,
        "sprint": KeyDownSprint,
        "pause": KeyDownPause,
        "mute": KeyDownMute,
        "l": KeyDownL,
        "q": KeyDownQ
      },
      "onkeyup": {
        "left": KeyUpLeft,
        "right": KeyUpRight,
        "up": KeyUpUp,
        "down": KeyUpDown,
        "sprint": KeyUpSprint,
        "pause": KeyUpPause
      },
      "onmousedown": {
        "rightclick": MouseDownRight
      },
      "oncontextmenu": {}
    }
  });
}

