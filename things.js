/* Things.js */
// Stores Thing creators, functions, and manipulators

/* To-do list:
  * Integrate visual scenery (see Pirhana) as a typical thing
  * turn collide, movement, etc. into onCollide, onMovement, etc.
  * gravity vs map.gravity vs onThingMake() {...gravity...}
  * auto-generate properties based on names
  * auto-generate important names based on properties
  * use more inheritance:
    * NPCs
    * TreeTops
  * use collider/spawner for more stuff
*/

function resetThings() {
  // The default things will need to be manipulated
  window.ObjectMaker = new ObjectMakr({
    on_make: "onMake",
    store_type: "title",
    index_map: {
      0: "width",
      1: "height"
    },
    defaults: {
      // Sizing
      width:  8,
      height: 8,
      tolx:   0,
      toly:   unitsized8,
      // Velocity
      xvel:  0,
      yvel:  0,
      speed: 0,
      // Placement
      alive:    true,
      placed:   false,
      grouping: "solid",
      // Quadrants
      maxquads:  4,
      quadrants: new Array(4),
      outerok:   false,
      overlaps:  [],
      // Sprites
      sprite:      "",
      sprite_type: "neither",
      // Triggered functions
      animate:  emergeUp,
      onMake:   thingProcess,
      death:    killNormal,
      collide:  false,
      movement: false
    },
    inheritance: {
      character: {
        Player: {},
        enemy: {
          Goomba: {},
          Koopa: {},
          Pirhana: {},
          HammerBro: {
            Bowser: {}
          }
        },
        item: {
          Mushroom: {
            Mushroom1Up: {},
            MushroomDeathly: {}
          },
          FireFlower: {},
          Fireball: {
            CastleFireball: {}
          },
          Star: {},
          Shell: {},
          Vine: {}
        },
        BrickShard: {},
        Coin: {},
        Firework: {},
      },
      solid: {
        Block: {},
        BridgeBase: {},
        Brick: {},
        DeadGoomba: {},
        Pipe: {},
        PipeHorizontal: {},
        PipeVertical: {},
        Platform: {},
        PlatformGenerator: {},
        Stone: {},
        Floor: {},
        TreeTop: {},
        ShroomTop: {},
        CastleAxe: {},
        CastleBlock: {},
        CastleBridge: {},
        Coral: {},
        detector: {
          DetectCollision: {},
          DetectSpawn: {}
        },
      },
      scenery: {
        Axe: {},
        Blank: {},
        BrickHalf: {},
        BrickPlain: {},
        Bush1: {},
        Bush2: {},
        Bush3: {},
        Castle: {},
        CastleDoor: {},
        CastleChain: {},
        CastleRailing: {},
        CastleRailingFilled: {},
        CastleTop: {},
        CastleWall: {},
        Cloud1: {},
        Cloud2: {},
        Cloud3: {},
        Fence: {},
        Flag: {},
        FlagPole: {},
        FlagTop: {},
        HillSmall: {},
        HillLarge: {},
        PirhanaScenery: {},
        PlantSmall: {},
        PlantLarge: {},
        Railing: {},
        ShroomTrunk: {},
        String: {},
        TreeTrunk: {},
        Water: {},
        WaterFill: {}
      }
    },
    type_defaults: {
      character: { 
        grouping: "character",
        libtype: "characters",
        character: true,
        moveleft: true,
        movement: moveSimple
      },
        Player: {
          player: 1,
          power: 1,
          canjump: 1,
          nofiredeath: 1,
          nofire: 1,
          nokillend: 1,
          numballs: 0,
          moveleft: 0,
          skidding: 0,
          star: 0,
          dying: 0,
          nofall: 0,
          maxvel: 0,
          paddling: 0,
          jumpers: 0,
          landing: 0,
          tolx: unitsizet2,
          toly: 0,
          walkspeed: unitsized2,
          maxspeed: unitsize * 1.35, // Really only used for timed animations
          maxspeedsave: unitsize * 1.35,
          scrollspeed: unitsize * 1.75,
          running: '', // Evaluates to false for cycle checker
          fire: playerFires,
          movement: movePlayer,
          death: killPlayer,
          type: "character",
          name: "player normal small still"
        },
        enemy: {
          type: "enemy",
          speed: unitsize * .21,
          collide: collideEnemy,
          death: killFlip
        },
          Goomba: {
            toly: unitsize,
            death: killGoomba,
            spriteCycleSynched: [[unflipHoriz, flipHoriz]]
          },
          Koopa: {
            height: 12,
            toly: unitsizet2,
            death: function(me, big) { console.warn("killKoopa should become killSpawn and rely on .spawntype"); return killKoopa(me, big); },
            spriteCycle: [["one", "two"]],
            attributes: {
              "smart": { movement: moveSmart },
              "jumping": {
                movement: moveJumping,
                jumpheight: unitsize * 1.17,
                gravity: gravity / 2.8
              },
              "floating": { 
                movement: moveFloating,
                nofall: true,
                yvel: unitsized4,
                maxvel: unitsized4
              }
            }
          },
          Pirhana: {
            height: 12,
            counter: 0,
            countermax: 12 * unitsize, // height * unitsize
            dir: unitsized8,
            toly: unitsizet8,
            nofall: true,
            deadly: true,
            nocollidesolid: true,
            death: killPirhana,
            movement: false,
            spriteCycleSynched: [["one", "two"]]
            // movement: movePirhanaInit
          },
            Bowser: {
              width: 16,
              height: 16,
              speed: unitsize * .28,
              gravity: gravity / 2.8,
              spawntype: "Goomba",
              // killonend: freezeBowser,
              // death: killBowser,
              // onadding: addBowser,
              spriteCycle: [["one", "two"]]
            },
        item: {
          group: "item",
          collide: collideFriendly,
          jump: itemJump,
          nofire: true
        },
          Mushroom: {
            action: playerShroom,
            speed: .42 * unitsize
          },
            Mushroom1Up: {
              action: gainLife
            },
            MushroomDeathly: {
              action: killPlayer
            },
          FireFlower: {
            action: playerShroom,
            spriteCycle: [["one", "two", "three", "four"]]
          },
          Fireball: {
            width: 4,
            height: 4,
            nofire: true,
            nostar: true,
            collide_primary: true,
            animate: emergeFire,
            collide: fireEnemy,
            death: fireExplodes,
            spriteCycleSynched: [["one", "two", "three", "four"], "spinning", 4]
          },
            CastleFireball: {
              deadly: true,
              nocollidesolid: true,
              nocollidechar: true,
              nofall: true,
              collide: collideEnemy
            },
          Firework: {
            nocollide: true,
            nofall: true,
            animate: fireworkAnimate
          },
          Star: {
            name: "star item", // Item class so player's star isn't confused with this
            width: 7,
            speed: unitsize * .56,
            action: playerStar,
            movement: moveJumping,
            jumpheight: unitsize * 1.17,
            gravity: gravity / 2.8,
            spriteCycle: [["one", "two", "three", "four"], 0, 7]
          },
          Shell: {
            height: 7,
            speed: unitsizet2,
            collide_primary: true,
            nofire: false,
            moveleft: 0,
            xvel: 0,
            move: 0,
            hitcount: 0,
            peeking: 0,
            counting: 0,
            landing: 0,
            enemyhitcount: 0,
            movement: moveShell,
            collide: hitShell,
            death: killFlip,
            spawntype: "Koopa",
            attributes: { smart: {} }
          },
          Vine: {
            width: 7,
            movement: false,
            nofall: true,
            repeat: true
          },
        BrickShard: {
          width: 4,
          height: 4,
          nocollide: true,
          skipoverlaps: true,
          movement: false,
          spriteCycle: [[unflipHoriz, flipHoriz]]
        },
        Coin: {
          width: 5,
          height: 7,
          nofall: true,
          nocollidechar: true,
          // nocollidesolid: true, // (disabled for brick bumps)
          animate: coinEmerge,
          collide: hitCoin,
          spriteCycleSynched: [["one", "two", "three", "two", "one"]]
        },
      solid: {
        grouping: "solid",
        type: "solid",
        libtype: "solids",
        spritewidth: 8,
        spriteheight: 8,
        repeat: true,
        solid: true,
        nocollidesolid: true,
        collide: characterTouchedSolid
      },
        Brick: {
          bottomBump: brickBump
        },
        Block: {
          unused: true,
          contents: "Coin",
          bottomBump: blockBump,
          spriteCycleSynched: [["one", "two", "three", "two", "one"]]
        },
        BridgeBase: {
          height: 4,
          spritewidth: 4,
        },
        DeadGoomba: {
          height: 4,
          nocollide: true
        },
        Pipe: {
          width: 16,
          spritewidth: 16,
          actionTop: intoPipeVertical
        },
        PipeHorizontal: {
          height: 16,
          spriteheight: 16,
          width: 19.5,
          spritewidth: 19.5,
          actionLeft: intoPipeHorizontal,
          attributes: {
            width: 8,
            spritewidth: 8
          }
        },
        PipeVertical: {
          width: 16,
          spritewidth: 16
        },
        Platform: {
          height: 4,
          spritewidth: 4,
          repeat: true,
          killonend: true,
          // maxvel: unitsized4 * 1.5,
          attributes: {
            "floating": {
              // movement: moveFloating,
              // yvel: unitsized4 * 1.5
            },
            "sliding": {
              // movement: moveSliding,
              // xvel: unitsized4 * 1.5
            },
            "transport": {
              movement: false,
              collide: collideTransport
            },
            "falling": {
              collide: function() { console.log("Nope!"); }
            }
          }
        },
        PlatformGenerator: {
          interval: 35,
          nocollide: true,
          hidden: true,
          movement: PlatformGeneratorInit
        },
        CastleBlock: {
          direction: -1, // Kept here because attributes override user-given settings!
          attributes: {
            "fireballs": {
              onadding: makeCastleBlock,
              balls: [],
              dt: .07,
              angle: .25,
              interval: 7
            }
          }
        },
        CastleBridge: {
          spritewidth: 4
        },
        detector: {
          hidden: true
        },
          DetectCollision: {
            collide: onDetectorCollision
          },
          DetectSpawn: {
            movement: onDetectorSpawn
          },
      scenery: {
        grouping: "scenery",
        libtype: "scenery",
        repeat: true
      },
        Axe: {
          nocollide: true,
          spriteCycle: [["one", "two", "three", "two"]]
        },
        // Blank: [0, 0],
        BrickHalf: [8, 4],
        BrickPlain: [8, 8],
        Bush1: [16, 8],
        Bush2: [24, 8],
        Bush3: [32, 8],
        Castle: [75, 88],
        CastleChain: [7.5, 7.5],
        CastleDoor: [8, 20],
        CastleRailing: [8, 4],
        CastleRailingFilled: [8, 4],
        CastleTop: [12, 12],
        CastleWall: [8, 48],
        Cloud1: [16, 12],
        Cloud2: [24, 12],
        Cloud3: [32, 12],
        Flag: [8, 8],
        FlagPole: [1, 72],
        FlagTop: [4, 4],
        Fence: [8, 8],
        HillSmall: [24, 9.5],
        HillLarge: [40, 17.5],
        PirhanaScenery: [8, 12],
        PlantSmall: [7, 15],
        PlantLarge: [8, 23],
        Railing: [4, 4],
        ShroomTrunk: [8, 8],
        String: [1, 1],
        TreeTrunk: [4, 4],
        Water: { 
            0: 4,
            1: 5,
            spriteCycle: [["one", "two", "three", "four"]]
          },
        WaterFill: [4, 5]
    }
  });
}

// Takes in a newly produced Thing and sets it up for gameplay
function thingProcess(type, settings, defaults) {
  this.title = type;
  
  // If a width/height is provided but no spritewidth/height, use the original sprite*
  if(this.width && !this.spritewidth)
    this.spritewidth = defaults.spritewidth || defaults.width;
  if(this.height && !this.spriteheight)
    this.spriteheight = defaults.spriteheight || defaults.height;
  
  // Maximum quadrants (for QuadsKeeper)
  var maxquads = 4, num;
  if((num = floor(this.width * unitsize / QuadsKeeper.getQuadWidth())) > 0)
    maxquads += ((num + 1) * maxquads / 2);
  if((num = floor(this.height * unitsize / QuadsKeeper.getQuadHeight())) > 0)
    maxquads += ((num + 1) * maxquads / 2);
  this.maxquads = maxquads;
  this.quadrants = new Array(this.maxquads);
  
  // Basic sprite information
  var spritewidth = this.spritewidth = this.spritewidth || this.width,
      spriteheight = this.spriteheight = this.spriteheight || this.height,
      // Sprite sizing
      spritewidthpixels = this.spritewidthpixels = spritewidth * unitsize,
      spriteheightpixels = this.spriteheightpixels = spriteheight * unitsize;
  
  // Canvas, context, imageData
  var canvas = this.canvas = getCanvas(spritewidthpixels, spriteheightpixels),
      context = this.context = canvas.getContext("2d"),
      imageData = this.imageData = context.getImageData(0, 0, spritewidthpixels, spriteheightpixels);
  context.imageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  
  // Process attributes, such as Koopa.smart
  if(this.attributes) thingProcessAttributes(this, this.attributes, settings);
  
  // Important custom functions
  if(this.onThingMake) this.onThingMake(this, settings);
  
  // Initial class / sprite setting
  setClassInitial(this, this.name || type);
  
  // Sprite cycles
  var cycle;
  if(cycle = this.spriteCycle) TimeHandler.addSpriteCycle(this, cycle[0], cycle[1] || null, cycle[2] || null);
  if(cycle = this.spriteCycleSynched) TimeHandler.addSpriteCycleSynched(this, cycle[0], cycle[1] || null, cycle[2] || null);
}
// Processes optional attributes for Things
function thingProcessAttributes(thing, attributes) {
  var attribute, i;
  
  // For each listing in the attributes...
  for(attribute in attributes) {
    // If the thing has that attribute as true:
    if(thing[attribute]) {
      // Add the extra options
      proliferate(thing, attributes[attribute]);
      // Also add a marking to the name, which will go into the className
      if(thing.name) thing.name += ' ' + attribute;
      else thing.name = thing.title + ' ' + attribute;
    }
  }
}

// The primary function for placing a thing on the map
function addThing(me, left, top) {
  // If me is a string (e.g. 'addThing("Goomba", ...)), make a new thing with that
  if(typeof(me) == "string") me = ObjectMaker.make(me);
  
  // Place the Thing in the game and in its correct grouping array
  placeThing(me, left, top);
  if(!window[me.libtype]) window[me.libtype] = [];
  window[me.libtype].push(me);
  me.placed = true;
  
  // It may need to react to this, such as sprite cycles and CastleBlock.makeCastleBlock
  if(me.onadding) me.onadding(me);
  
  // Hidden items (like 1-1's block) should't have horizontal overlap checking
  if(me.hidden) me.skipoverlaps = true;
  
  setThingSprite(me);
  window["last_" + (me.title || me.group || "unknown")] = me;
  return me;
}
// Called by addThing for simple placement
function placeThing(me, left, top) {
  setLeft(me, left);
  setTop(me, top);
  updateSize(me);
  return me;
}

function addText(html, left, top) {
  var element = createElement("div", {innerHTML: html, className: "text",
    left: left,
    top: top,
    onclick: body.onclick || canvas.onclick, 
    style: {
      marginLeft: left + "px",
      marginTop: top + "px"
    }});
  body.appendChild(element);
  texts.push(element);
  return element;
}
// Called by funcSpawner placed by pushPreText
// Kills the text once it's too far away
function spawnText(me, settings) {
  var element = me.element = addText("", me.left, me.top);
  if(typeof(settings) == "object") proliferate(element, settings);
  else element.innerHTML = settings;
  me.movement = false;
}

// Set at the end of shiftToLocation
function checkTexts() {
  var delx = QuadsKeeper.getDelX(),
      element, me, i;
  for(i = texts.length - 1; i >= 0; --i) {
    me = texts[i]
    element = texts[i].element || me;
    me.right = me.left + element.clientWidth
    if(me.right < delx) {
      body.removeChild(element);
      killNormal(me);
      deleteThing(element, texts, i);
    }
  }
}

/*
 * Characters (except player, who has his own .js)
 */
 

/*
 * Items
 */

function itemJump(me) {
  me.yvel -= unitsize * 1.4;
  me.top -= unitsize;
  me.bottom -= unitsize;
  updatePosition(me);
}

function fireEnemy(enemy, me) {
  if(!me.alive || me.emerging || enemy.height <= unitsize) return;
  if(enemy.nofire) {
    if(enemy.nofire > 1) return me.death(me);
    return;
  }

  if(enemy.solid) {
    AudioPlayer.playLocal("Bump", me.right);
  }
  else {
    AudioPlayer.playLocal("Kick", me.right);
    enemy.death(enemy, 2);
    scoreEnemyFire(enemy);
  }
  me.death(me);
}
function fireDeleted() {
  --player.numballs;
}
function fireExplodes(me) {
  var fire = ObjectMaker.make("Firework");
  addThing(fire, me.left - fire.width / 2, me.top - fire.height / 2);
  fire.animate(fire);
  killNormal(me);
}

function fireworkAnimate(me) {
  var name = me.className + " n";
  TimeHandler.addEvent(function(me) { setClass(me, name + 1); }, 0, me);
  TimeHandler.addEvent(function(me) { setClass(me, name + 2); }, 7, me);
  TimeHandler.addEvent(function(me) { setClass(me, name + 3); }, 14, me);
  TimeHandler.addEvent(function(me) { killNormal(me); }, 21, me);
}

function moveShell(me) {
  if(me.xvel != 0) return;
  
  if(++me.counting == 350) { 
    addClass(me, "peeking");
    me.peeking = true;
    me.height += unitsized8;
    updateSize(me);
  } else if(me.counting == 490) {
    var spawn = ObjectMaker.make(me.spawntype, { smart: me.smart } );
    addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
    killNormal(me);
  }
}
function hitShell(one, two) {
  // Assuming two is shell
  if(one.title == "shell" && two.type != one.type) return hitShell(two, one);
  
  // Hitting a wall
  if(one.grouping == "solid") return hitShellSolid(one, two);
  
  // Hitting the player
  if(one.player) return hitShellPlayer(one, two);
  
  // Hitting another shell
  if(one.title == "Shell") return hitShellShell(one, two);
  
  // Assume anything else to be an enemy
  // If the shell is moving, kill the enemy
  if(two.xvel) {
    if(one.type.split(" ")[0] == "koopa") {
      // If the enemy is a koopa, make it a shell
      // To do: automate this for things with shells (koopas, beetles)
      var spawn = ObjectMaker.make("Shell", { smart: one.smart });
      addThing(spawn, one.left, one.bottom - spawn.height * unitsize);
      killFlip(spawn);
      killNormal(one);
    } // Otherwise just kill it normally
    else killFlip(one);
    
    AudioPlayer.play("Kick");
    score(one, findScore(two.enemyhitcount), true);
    ++two.enemyhitcount;
  }
  // Otherwise the enemy just turns around
  else one.moveleft = objectToLeft(one, two);
}
// Hitting a wall
function hitShellSolid(one, two) {
  if(two.right < one.right) {
    AudioPlayer.playLocal("Bump", one.left);
    setRight(two, one.left);
    two.xvel = -two.speed;
    two.moveleft = true;
  } else {
    AudioPlayer.playLocal("Bump", one.right);
    setLeft(two, one.right);
    two.xvel = two.speed;
    two.moveleft = false;
  }
}
// Hitting the player
function hitShellPlayer(one, two) {
  var shelltoleft = objectToLeft(two, one),
      playerjump = one.yvel > 0 && one.bottom <= two.top + unitsizet2;
  
  // Star Player is pretty easy
  if(one.star) {
    scorePlayerShell(one, two);
    return two.death(two, 2);
  }
  
  // If the shell is already being landed on by Player:
  if(two.landing) {
    // If the recorded landing direction hasn't changed:
    if(two.shelltoleft == shelltoleft) {
      // Increase the landing count, and don't do anything.
      ++two.landing;
      // If it's now a count of 1, score the shell
      if(two.landing == 1) scorePlayerShell(one, two);
      // Reduce that count very soon
      TimeHandler.addEvent(function(two) { --two.landing; }, 2, two);
    }
    // Otherwise, the shell has reversed direction during land. Player should die.
    else {
      // This prevents accidentally scoring Player's hit
      player.death(player);
    }
    return;
  }
  
  // Player is kicking the shell (either hitting a still shell or jumping onto a shell)
  if(two.xvel == 0 || playerjump) {
    // Player has has hit the shell in a dominant matter. You go, Player!
    two.counting = 0;
    scorePlayerShell(one, two);
    // The shell is peeking
    if(two.peeking) {
      two.peeking = false;
      removeClass(two, "peeking");
      two.height -= unitsized8;
      updateSize(two);
    }
    
    // If the shell's xvel is 0 (standing still)
    if(two.xvel == 0) {
      if(shelltoleft) {
        two.moveleft = true;
        two.xvel = -two.speed;
      } else {
        two.moveleft = false;
        two.xvel = two.speed;
      }
      // Make sure to know not to kill Player too soon
      ++two.hitcount;
      TimeHandler.addEvent(function(two) { --two.hitcount; }, 2, two);
    }
    // Otherwise set the xvel to 0
    else two.xvel = 0;
    
    // Player is landing on the shell (movements, xvels already set)
    if(playerjump) {
      AudioPlayer.play("Kick");
      // The shell is moving
      if(!two.xvel) {
        jumpEnemy(one, two);
        one.yvel *= 2;
        scorePlayerShell(one, two);
        setBottom(one, two.top - unitsize, true);
      }
      // The shell isn't moving
      else {
        // shelltoleft ? setRight(two, one.left) : setLeft(two, one.right);
        scorePlayerShell(one, two);
      }
      ++two.landing;
      two.shelltoleft = shelltoleft;
      TimeHandler.addEvent(function(two) { --two.landing; }, 2, two);
    }
  }
  else {
    // Since the shell is moving and Player isn't, if the xvel is towards player, that's a death
    if(!two.hitcount && ((shelltoleft && two.xvel < 0) || (!shelltoleft && two.xvel > 0)))
      one.death(one);
  }
}
// Hitting another shell
function hitShellShell(one, two) {
  // If one is moving...
  if(one.xvel != 0) {
    // and two is also moving, knock off each other
    if(two.xvel != 0) {
      var temp = one.xvel;
      shiftHoriz(one, one.xvel = two.xvel);
      shiftHoriz(two, two.xvel = temp);
    }
    // otherwise one kills two
    else {
      score(two, 500);
      two.death(two);
    }
  }
  // otherwise two kills one
  else if(two.xvel != 0) {
    score(one, 500);
    one.death(one);
  }
}

// Assuming one is player, two is item
function collideFriendly(one, two) {
  if(!one.player) return;
  if(two.action) two.action(one);
  two.death(two);
}

/*
 * Enemies
 */
function jumpEnemy(me, enemy) {
  if(me.keys.up) me.yvel = unitsize * -1.4;
  else me.yvel = unitsize * -.7;
  me.xvel *= .91;
  AudioPlayer.play("Kick");
  if(enemy.group != "item" || enemy.type == "shell")
    score(enemy, findScore(me.jumpcount++ + me.jumpers), true);
  ++me.jumpers;
  TimeHandler.addEvent(function(me) { --me.jumpers; }, 1, me);
}
// Big: true if it should skip squash (fire, shell, etc)
function killGoomba(me, big) {
  if(!me.alive) return;
  if(!big) {
    var squash = ObjectMaker.make("DeadGoomba");
    addThing(squash, me.left, me.bottom - squash.height * unitsize);
    TimeHandler.addEvent(killNormal, 21, squash);
    killNormal(me);
  }
  else killFlip(me);
}

// Big: true if it should skip shell (fire, shell, etc)
function killKoopa(me, big) {
  if(!me.alive) return;
  var spawn;
  if((big && big != 2) || me.winged) spawn = ObjectMaker.make("Koopa", {smart: me.smart});
  else spawn = ObjectMaker.make("Shell", {smart: me.smart});
  // Puts it on stack, so it executes immediately after upkeep
  TimeHandler.addEvent(
    function(spawn, me) { 
      addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
      spawn.moveleft = me.moveleft;
    }, 0, spawn, me 
  );
  killNormal(me);
  if(big == 2) killFlip(spawn);
  else return spawn;
}

// The visual representation of a pirhana is visual_scenery; the collider is a character
function movePirhanaInit(me) {
  me.hidden = true;
  var scenery = me.visual_scenery = ObjectMaker.make("PirhanaScenery");
  addThing(scenery, me.left, me.top);
  TimeHandler.addSpriteCycle(scenery, ["one", "two"]);
  me.movement = movePirhanaNew;
  // Pirhanas start out minimal
  movePirhanaNew(me, me.height * unitsize);
}
// Moving a pirhana moves both it and its scenery
function movePirhanaNew(me, amount) {
  amount = amount || me.dir;
  me.counter += amount;
  shiftVert(me, amount);
  shiftVert(me.visual_scenery, amount);
  
  // Height is 0
  if(me.counter <= 0 || me.counter >= me.countermax) {
    me.movement = false;
    me.dir *= -1;
    TimeHandler.addEvent(movePirhanaRestart, 35, me);
  }
}
function movePirhanaRestart(me) {
  var marmid = getMidX(player);
  // If Player's too close and counter == 0, don't do anything
  if(me.counter >= me.countermax && marmid > me.left - unitsizet8 && marmid < me.right + unitsizet8) {
    setTimeout(movePirhanaRestart, 7, me);
    return;
  }
  // Otherwise start again
  me.movement = movePirhanaNew;
}
function killPirhana(me) {
  if(!me && !(me = this)) return;
  killNormal(me);
  killNormal(me.visual_scenery);
}

// Really just checks toly for pirhanas.
function playerAboveEnemy(player, enemy) {
  if(player.bottom < enemy.top + enemy.toly) return true;
  return false;
}

// Assuming one should generally be Player/thing, two is enemy
function collideEnemy(one, two) {
  // Check for life
  if(!characterIsAlive(one) || !characterIsAlive(two)) return;
  
  // Check for nocollidechar
  if((one.nocollidechar && !two.player) || (two.nocollidechar && !one.player)) return;
  
  // Items
  if(one.group == "item") {
    if(one.collide_primary) return one.collide(two, one);
    // if(two.height < unitsized16 || two.width < unitsized16) return;
    return;
  }
  
  // Player on top of enemy
  if(!map_settings.underwater && one.player && ((one.star && !two.nostar) || (!two.deadly && objectOnTop(one, two)))) {
    // Enforces toly
    if(playerAboveEnemy(one, two)) return;
    // Player is on top of them (or star):
    if(one.player && !one.star) TimeHandler.addEvent(function(one, two) { jumpEnemy(one, two); }, 0, one, two);
    else two.nocollide = true;
    // Kill the enemy
    //// If killed returns a Thing, then it's a shell
    //// Make sure Player isn't immediately hitting the shell
    var killed = two.death(two, one.star * 2);
    if(one.star) scoreEnemyStar(two);
    else {
      scoreEnemyStomp(two);
      /*TimeHandler.addEvent(function(one, two) { */setBottom(one, min(one.bottom, two.top + unitsize));/* }, 0, one, two);*/
    }
    // Make Player have the hopping thing
    addClass(one, "hopping");
    removeClasses(one, "running skidding jumping one two three")
    // addClass(one, "running three");
    one.hopping = true;
    if(player.power == 1)  setPlayerSizeSmall(one);
  }
  
  // Player getting hit by an enemy
  else if(one.player) {
    if(!playerAboveEnemy(one, two)) one.death(one);
  }
  
  // Two regular characters colliding
  else two.moveleft = !(one.moveleft = objectToLeft(one, two));
}  

function movePodobooInit(me) {
  if(!characterIsAlive(me)) return;
  // For the sake of the editor, flip this & make it hidden on the first movement
  // flipVert(me);
  me.hidden = true;
  me.heightnorm = me.top;
  me.heightfall = me.top - me.jumpheight;
  TimeHandler.addEvent(podobooJump, me.betweentime, me);
  me.movement = false;
}
function podobooJump(me) {
  if(!characterIsAlive(me)) return;
  unflipVert(me);
  me.yvel = me.speed + me.gravity;
  me.movement = movePodobooUp;
  me.hidden = false;
  
  // Sadly, this appears to be occasionally necessary
  setThingSprite(me);
}
function movePodobooUp(me) {
  shiftVert(me, me.speed, true);
  if(me.top - gamescreen.top > me.heightfall) return;
  me.nofall = false;
  me.movement = movePodobooSwitch;
}
function movePodobooSwitch(me) {
  if(me.yvel <= 0) return;
  flipVert(me);
  me.movement = movePodobooDown;
}
function movePodobooDown(me) {
  if(me.top < me.heightnorm) return;
  setTop(me, me.heightnorm, true);
  me.movement = false;
  me.nofall = me.hidden = true;
  me.heightfall = me.top - me.jumpheight;
  TimeHandler.addEvent(podobooJump, me.betweentime, me);
}

function moveHammerBro(me) {
  // Slide side to side
  me.xvel = Math.sin(Math.PI * (me.counter += .007)) / 2.1;
  
  // Make him turn to look at player if needed
  lookTowardPlayer(me);
  
  // If falling, don't collide with solids
  me.nocollidesolid = me.yvel < 0 || me.falling;
}
function throwHammer(me, count) {
  if(!characterIsAlive(me) || me.nothrow || me.right < -unitsizet32) return;
  if(count != 3) {
    switchClass(me, "thrown", "throwing");
  }
  TimeHandler.addEvent(function(me) {
    if(count != 3) {
      if(!characterIsAlive(me)) return;
      // Throw the hammer...
      switchClass(me, "throwing", "thrown");
      addThing(ObjectMaker.make("Hammer"), me.left - unitsizet2, me.top - unitsizet2);
    }
    // ...and go again
    if(count > 0) TimeHandler.addEvent(throwHammer, 7, me, --count);
    else {
      TimeHandler.addEvent(throwHammer, 70, me, 7);
      removeClass(me, "thrown");
    }
  }, 14, me);
}
function jumpHammerBro(me) {
  if(!characterIsAlive(me)) return true; // finish
  if(!me.resting) return; // just skip
  // If it's ok, jump down
  if(map_settings.floor - (me.bottom / unitsize) >= jumplev1 - 2 && me.resting.name != "floor" && Math.floor(Math.random() * 2)) {
    me.yvel = unitsize * -.7;
    me.falling = true;
    TimeHandler.addEvent(function(me) { me.falling = false; }, 42, me);
  }
  // Otherwise, jump up
  else me.yvel = unitsize * -2.1;
  me.resting = false;
}

function moveCannonInit(me) {
  TimeHandler.addEventInterval(
    function(me) {
      if(player.right > me.left - unitsizet8 && player.left < me.right + unitsizet8)
        return; // don't fire if Player is too close
      var spawn = ObjectMaker.make("BulletBill");
      if(objectToLeft(player, me)) {
        addThing(spawn, me.left, me.top);
        spawn.direction = spawn.moveleft = true;
        spawn.xvel *= -1;
        flipHoriz(spawn);
      }
      else addThing(spawn, me.left + me.width, me.top);
      AudioPlayer.playLocal("Bump", me.right);
    }, 270, Infinity, me);
  me.movement = false;
}


// Normally goes up at increasing rate
// Every X seconds, squeezes to go down
//// Minimum Y seconds, continues if Player is below until bottom is 8 above floor
function moveBlooper(me) {
  switch(me.counter) {
    case 56: me.squeeze = true; ++me.counter; break;
    case 63: squeezeBlooper(me); break;
    default: ++me.counter; break;
  }

  if(me.top < unitsizet16 + 10) {
    squeezeBlooper(me);
  }

  if(me.squeeze) me.yvel = max(me.yvel + .021, .7); // going down
  else me.yvel = min(me.yvel - .035, -.7); // going up
  shiftVert(me, me.yvel, true);
  
  if(!me.squeeze) {
    if(player.left > me.right + unitsizet8) {
      // Go to the right
      me.xvel = min(me.speed, me.xvel + unitsized32);
    }
    else if(player.right < me.left - unitsizet8) {
      // Go to the left
      me.xvel = max(me.speedinv, me.xvel - unitsized32);
    }
  }
}
function squeezeBlooper(me) {
  if(me.squeeze != 2) addClass(me, "squeeze");
  // if(!me.squeeze) me.yvel = 0;
  me.squeeze = 2;
  me.xvel /= 1.17;
  setHeight(me, 10, true, true);
  // (104 (map_settings.floor) - 12 (blooper.height) - 2) * unitsize
  if(me.top > player.bottom || me.bottom > 360) unsqueezeBlooper(me);
}
function unsqueezeBlooper(me) {
  me.squeeze = false;
  removeClass(me, "squeeze");
  me.counter = 0;
  setHeight(me, 12, true, true);
  // me.yvel /= 3;
}

function setCheepVelocities(me) {
  if(me.red) {
    me.xvel = -unitsized4;
    me.yvel = unitsize / -24;
  } else {
    me.xvel = unitsize / -6;
    me.yvel = -unitsized32;
  }
}
function moveCheepInit(me) {
  setCheepVelocities(me);
  if(me.top < player.top) me.yvel *= -1;
  moveCheep(me);
  me.movement = moveCheep;
}
function moveCheep(me) {
  shiftVert(me, me.yvel);
}
function moveCheepJumping(me) {
  shiftVert(me, me.yvel += unitsize / 14);
}
function startCheepSpawn() {
  return map_settings.zone_cheeps = TimeHandler.addEventInterval(
    function() {
      if(!map_settings.zone_cheeps) return true;
      var spawn = ObjectMaker.make("CheepCheep", { smart: true, flying: true});
      addThing(spawn, Math.random() * player.left * player.maxspeed / unitsized2, gamescreen.height * unitsize);
      spawn.xvel = Math.random() * player.maxspeed;
      spawn.yvel = unitsize * -2.33;
      flipHoriz(spawn);
      spawn.movement = function(me) {
        if(me.top < ceilmax) me.movement = moveCheepJumping; 
        else shiftVert(me, me.yvel);
      };
    }, 21, Infinity
  );
}

// The lakitu's position starts to the right of player ...
function moveLakituInit(me) {
  if(map_settings.has_lakitu && me.norepeat) return killNormal(me);
  TimeHandler.addEventInterval(function(me) {
    if(me.alive) throwSpiny(me);
    else return true;
  }, 140, Infinity, me);
  me.movement = moveLakituInit2;
  moveLakituInit2(me);
  map_settings.has_lakitu = me;
}
function moveLakituInit2(me) {
  if(me.right < player.left) {
    moveLakitu(me);
    me.movement = moveLakitu;
    map.lakitu = me;
    return true;
  }
  shiftHoriz(me, -unitsize);
}
// Then, once it's close enough, is always relative to player.
// This fluctuates between +/-32 (* unitsize)
function moveLakitu(me) {
  // If player is moving quickly to the right, move in front of him and stay there
  if(player.xvel > unitsized8 && player.left > gamescreen.width * unitsized2) {
    if(me.left < player.right + unitsizet16) {
      // To the 'left' of player
      slideToXLoc(me, player.right + unitsizet32 + player.xvel, player.maxspeed * 1.4);
      me.counter = 0;
    }
  }
  // Otherwise, creepily orbit around him
  else {
    // me.xvel = 0;
    me.counter += .007;
    slideToXLoc(me, player.left + player.xvel + Math.sin(Math.PI * me.counter) * 117, player.maxspeed * .7);
  }
  // log("moveLakitu after: " + (me.right - me.left) + "\n");
}
function throwSpiny(me) {
  if(!characterIsAlive(me)) return false;
  switchClass(me, "out", "hiding");
  TimeHandler.addEvent(function(me) {
    if(me.dead) return false;
    var spawn = ObjectMaker.make("SpinyEgg");
    addThing(spawn, me.left, me.top);
    spawn.yvel = unitsize * -2.1;
    switchClass(me, "hiding", "out");
  }, 21, me);
}
function killLakitu(me) {
  delete me.noscroll;
  killFlip(me);
}

function moveSpinyEgg(me) {
  if(me.resting) createSpiny(me);
}
function createSpiny(me) {
  var spawn = ObjectMaker.make("Spiny");
  addThing(spawn, me.left, me.top);
  spawn.moveleft = objectToLeft(player, spawn);
  killNormal(me);
}

// Big: true if it should skip shell (fire, shell, etc)
function killBeetle(me, big) {
  if(!me.alive) return;
  var spawn;
  if(big && big != 2) spawn = ObjectMaker.make("Koopa", { smart: me.smart });
  else spawn = ObjectMaker.make("BeetleShell", { smart: me.smart });
  // Puts it on stack, so it executes immediately after upkeep
  TimeHandler.addEvent(
    function(spawn, me) {
      addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
      spawn.moveleft = me.moveleft;
    },
    0, spawn, me );
  killNormal(me);
  if(big == 2) killFlip(spawn);
  else return spawn;
}

function coinBecomesSolid(me) {
  switchContainers(me, characters, solids);
  me.movement = false;
}
function hitCoin(me, coin) {
  if(!me.player) return;
  AudioPlayer.play("Coin");
  score(me, 200, false);
  gainCoin();
  killNormal(coin);
}
function gainCoin() {
  StatsHolder.increase("coins", 1);
}
function coinEmerge(me, solid) {
  AudioPlayer.play("Coin");
  removeClass(me, "still");
  switchContainers(me, characters, scenery);
  score(me, 200, false);
  gainCoin();
  me.nocollide = me.alive = me.nofall = me.emerging = true;
  
  if(me.blockparent) me.movement = coinEmergeMoveParent;
  else me.movement = coinEmergeMove;
  me.yvel = -unitsize;
  TimeHandler.addEvent(function(me) { me.yvel *= -1; }, 25, me);
  TimeHandler.addEvent(function(me) {
    killNormal(me);
    deleteThing(me, scenery, scenery.indexOf(me));
  }, 49, me);
  TimeHandler.addEventInterval(coinEmergeMovement, 1, Infinity, me, solid);
  TimeHandler.clearClassCycle(me, 0);
  addClass(me, "anim");
  TimeHandler.addSpriteCycle(me, ["anim1", "anim2", "anim3", "anim4", "anim3", "anim2"], 0, 5);
}
function coinEmergeMovement(me, solid) {
  if(!me.alive) return true;
  shiftVert(me, me.yvel);
  // if(solid && solid.alive && me.bottom > solid.bottom || me.top > solid.top) {
    // killNormal(me);
    // return true;
  // }
}

function coinEmergeMove(me) {
  shiftVert(me, me.yvel, true);
}
function coinEmergeMoveParent(me) {
  if(me.bottom >= me.blockparent.bottom) killNormal(me);
  else shiftVert(me, me.yvel, true);
}

/*
 * Player
 */
function placePlayer(xloc, yloc) {
  clearOldPlayer();
  window.player = ObjectMaker.make("Player", {
    gravity: map_settings.gravity,
    keys: new Keys(),
    power: StatsHolder.get("power")
  });
  toggleLuigi(true);
  setPlayerSizeSmall(player);
  
  if(map_settings.underwater) {
    player.swimming = true;
    TimeHandler.addSpriteCycle(player, ["swim1", "swim2"], "swimming", 5);
  }

  var adder = addThing(player, xloc || unitsizet16, yloc || (map_settings.floor - player.height) * unitsize);
  if(StatsHolder.get("power") >= 2) {
    playerGetsBig(player, true);
    if(StatsHolder.get("power") == 3)
      playerGetsFire(player, true);
  }
  return adder;
}
function clearOldPlayer() {
  if(!window.player) return;
  player.alive = false;
  player.dead = true;
  nokeys = notime = false;
}

function Keys() {
  // Run: 0 for no, 1 for right, -1 for left
  // Crouch: 0 for no, 1 for yes
  // Jump: 0 for no, jumplev = 1 through jumpmax for yes
  this.run = this.crouch = this.jump = this.jumplev = this.sprint = 0;
}

// Stores .*vel under .*velold for shroom-style events
function thingStoreVelocity(me, keepmove) {
  me.xvelOld = me.xvel || 0;
  me.yvelOld = me.yvel || 0;
  me.nofallOld = me.nofall || false;
  me.nocollideOld = me.nocollide || false;
  me.movementOld = me.movement || me.movementOld;
  
  me.nofall = me.nocollide = true;
  me.xvel = me.yvel = false;
  if(!keepmove) me.movement = false;
}
// Retrieves .*vel from .*velold
function thingRetrieveVelocity(me, novel) {
  if(!novel) {
    me.xvel = me.xvelOld || 0;
    me.yvel = me.yvelOld || 0;
  }
  me.movement = me.movementOld || me.movement;
  me.nofall = me.nofallOld || false;
  me.nocollide = me.nocollideOld || false;
}

function removeCrouch() {
  player.crouching = false;
  player.toly = player.tolyold || 0;
  if(player.power != 1) {
    removeClass(player, "crouching");
    player.height = 16;
    updateBottom(player, 0);
    updateSize(player);
  }
}

function playerShroom(me) {
  if(me.shrooming) return;
  AudioPlayer.play("Powerup");
  StatsHolder.increase("power");
  score(me, 1000, true);
  if(me.power == 3) return;
  me.shrooming = true;
  (++me.power == 3 ? playerGetsFire : playerGetsBig)(me);
}
// These three modifiers don't change power levels.
function playerGetsBig(me, noanim) {
  setPlayerSizeLarge(me);
  me.keys.down = 0;
  removeClasses(player, "crouching small");
  updateBottom(me, 0);
  updateSize(me);
  if(!noanim) {
    // pause();
    // Player cycles through 'shrooming1', 'shrooming2', etc.
    addClass(player, "shrooming");
    var stages = [1,2,1,2,3,2,3];
    for(var i = stages.length - 1; i >= 0; --i)
      stages[i] = "shrooming" + stages[i];
    
    // Clear Player's movements
    thingStoreVelocity(player);
    
    // The last event in stages clears it, resets Player's movements, and stops
    stages.push(function(me, settings) {
      me.shrooming = settings.length = 0;
      addClass(me, "large");
      removeClasses(me, "shrooming shrooming3");
      thingRetrieveVelocity(player);
      return true;
    });
    
    TimeHandler.addSpriteCycle(me, stages, "shrooming", 6);
  }
  else addClass(me, "large");
}
function playerGetsSmall(me) {
  var bottom = player.bottom;
  // pause();
  me.keys.down = 0;
  thingStoreVelocity(me);
  addClass(me, "small");
  flicker(me);
  // Step one
  removeClasses(player, "running skidding jumping fiery");
  addClass(player, "paddling");
  // Step two (t+21)
  TimeHandler.addEvent(function(player) {
    removeClass(player, "large");
    setPlayerSizeSmall(player);
    setBottom(player, bottom - unitsize);
  }, 21, player);
  // Step three (t+42)
  TimeHandler.addEvent(function(player) {
    thingRetrieveVelocity(player, false);
    player.nocollidechar = true;
    removeClass(player, "paddling");
    if(player.running || player.xvel) addClass(player, "running");
    TimeHandler.addEvent(setThingSprite, 1, player);
  }, 42, player);
  // Step four (t+70);
  TimeHandler.addEvent(function(player) {
    player.nocollidechar = false;
  }, 70, player);
}
function playerGetsFire(me) {
  removeClass(me, "intofiery");
  addClass(me, "fiery");
  player.shrooming = false;
}
function setPlayerSizeSmall(me) {
  setSize(me, 8, 8, true);
  updateSize(me);
}
function setPlayerSizeLarge(me) {
  setSize(me, 8, 16, true);
  updateSize(me);
}

// To do: add in unitsize measurement?
function movePlayer(me) {
  // Not jumping
  if(!me.keys.up) me.keys.jump = 0;
  
  // Jumping
  else if(me.keys.jump > 0 && (me.yvel <= 0 || map_settings.underwater) ) {
    if(map_settings.underwater) playerPaddles(me);
    if(me.resting) {
      if(me.resting.xvel) me.xvel += me.resting.xvel;
      me.resting = false;
    }
    // Jumping, not resting
    else {
      if(!me.jumping && !map_settings.underwater) {
        switchClass(me, "running skidding", "jumping");
      }
      me.jumping = true;
    }
    if(!map_settings.underwater) {
      var dy = unitsize / (pow(++me.keys.jumplev, map_settings.jumpmod - .0014 * me.xvel));
      me.yvel = max(me.yvel - dy, map_settings.maxyvelinv);
    }
  }
  
  // Crouching
  if(me.keys.crouch && !me.crouching && me.resting) {
    if(me.power != 1) {
      me.crouching = true;
      addClass(me, "crouching");
      me.height = 11;
      me.tolyold = me.toly;
      me.toly = unitsizet4;
      updateBottom(me, 0);
      updateSize(me);
    }
    // Pipe movement
    if(me.resting.actionTop)
      me.resting.actionTop(me, me.resting);
  }
  
  // Running
  var decel = 0 ; // (how much to decrease)
  // If a button is pressed, hold/increase speed
  if(me.keys.run != 0 && !me.crouching) {
    var dir = me.keys.run,
        // No sprinting underwater
        sprinting = (me.keys.sprint && !map_settings.underwater) || 0,
        adder = dir * (.098 * (sprinting + 1));
    // Reduce the speed, both by subtracting and dividing a little
    me.xvel += adder || 0;
    me.xvel *= .98;
    decel = .0007;
    // If you're accelerating in the opposite direction from your current velocity, that's a skid
    if(/*sprinting && */signBool(me.keys.run) == me.moveleft) {
      if(!me.skidding) {
        addClass(me, "skidding");
        me.skidding = true;
      }
    }
    // Otherwise make sure you're not skidding
    else if(me.skidding) {
      removeClass(me, "skidding");
      me.skidding = false;
    }
  }
  // Otherwise slow down a bit/*, with a little more if crouching*/
  else {
    me.xvel *= (.98/* - Boolean(me.crouching) * .07*/);
    decel = .035;
  }

  if(me.xvel > decel) me.xvel-=decel;
  else if(me.xvel < -decel) me.xvel+=decel;
  else if(me.xvel!=0) {
	me.xvel = 0;
	if(!window.nokeys && me.keys.run == 0) {
    if(me.keys.left_down) me.keys.run = -1;
    else if(me.keys.right_down) me.keys.run = 1;
  }  
}
  
  // Movement mods
  // Slowing down
  if(Math.abs(me.xvel) < .14) {
    if(me.running) {
      me.running = false;
      if(player.power == 1) setPlayerSizeSmall(me);
      removeClasses(me, "running skidding one two three");
      addClass(me, "still");
      TimeHandler.clearClassCycle(me, "running");
    }
  }
  // Not moving slowly
  else if(!me.running) {
    me.running = true;
    switchClass(me, "still", "running");
    playerStartRunningCycle(me);
    if(me.power == 1) setPlayerSizeSmall(me);
  }
  if(me.xvel > 0) {
    me.xvel = min(me.xvel, me.maxspeed);
    if(me.moveleft && (me.resting || map_settings.underwater)) {
      unflipHoriz(me);
      me.moveleft = false;
    }
  }
  else if(me.xvel < 0) {
    me.xvel = max(me.xvel, me.maxspeed * -1);
    if(!me.moveleft && (me.resting || map_settings.underwater)) {
      flipHoriz(me);
      me.moveleft = true;
    }
  }
  
  // Resting stops a bunch of other stuff
  if(me.resting) {
    // Hopping
    if(me.hopping) {
      removeClass(me, "hopping");
      if(me.xvel) addClass(me, "running");
      me.hopping = false;
    }
    // Jumping
    me.keys.jumplev = me.yvel = me.jumpcount = 0;
    if(me.jumping) {
      me.jumping = false;
      removeClass(me, "jumping");
      if(me.power == 1) setPlayerSizeSmall(me);
      addClass(me, abs(me.xvel) < .14 ? "still" : "running");
    }
    // Paddling
    if(me.paddling) {
      me.paddling = me.swimming = false;
      removeClasses(me, "paddling swim1 swim2");
      TimeHandler.clearClassCycle(me, "paddling");
      addClass(me, "running");
    }
  }
}

// Gives player visual running
function playerStartRunningCycle(me) {
  // setPlayerRunningCycler sets the time between cycles
  me.running = TimeHandler.addSpriteCycle(me, ["one", "two", "three", "two"], "running", setPlayerRunningCycler);
}
// Used by player's running cycle to determine how fast he should switch between sprites
function setPlayerRunningCycler(event) {
  event.timeout = 5 + ceil(player.maxspeedsave - abs(player.xvel));
}

function playerPaddles(me) {
  if(!me.paddling) {
    removeClasses(me, /*"running */"skidding paddle1 paddle2 paddle3 paddle4 paddle5");
    addClass(me, "paddling");
    TimeHandler.clearClassCycle(me, "paddling_cycle");
    TimeHandler.addSpriteCycle(me, ["paddle1", "paddle2", "paddle3", "paddle3", "paddle2", "paddle1", function() { return me.paddling = false; }], "paddling_cycle", 5);
  }
  me.paddling = me.swimming = true;
  me.yvel = unitsize * -.84;
}

function playerBubbles() {
  var bubble = ObjectMaker.make("Bubble");
  addThing(bubble, player.right, player.top);
  // TimeHandler.addEvent(killNormal, 140, bubble);
}

function movePlayerVine(me) {
  var attached = me.attached;
  if(me.bottom < attached.top) return unattachPlayer(me);
  if(me.keys.run == me.attachoff) {
    while(objectsTouch(me, attached))
      shiftHoriz(me, me.keys.run, true);
    return unattachPlayer(me);
  }
  
  // If Player is moving up, simply move up
  if(me.keys.up) {
    me.animatednow = true;
    shiftVert(me, unitsized4 * -1, true);
  }
  // If player is moving down, move down and check for unattachment
  else if(me.keys.crouch) {
    me.animatednow = true;
    shiftVert(me, unitsized2, true);
    if(me.bottom > attached.bottom - unitsizet4) return unattachPlayer(me);
  }
  else me.animatednow = false;
  
  if(me.animatednow && !me.animated) {
    addClass(me, "animated");
  } else if(!me.animatednow && me.animated) {
    removeClass(me, "animated");
  }
  
  me.animated = me.animatednow;
  
  if(me.bottom < -16) { // ceilmax (104) - ceillev (88)
    locMovePreparations(me);
    if(!attached.locnum && map_settings.random) goToTransport(["Random", "Sky", "Vine"]);
    else shiftToLocation(attached.locnum);
  }
}

function unattachPlayer(me) {
  me.movement = movePlayer;//me.movementsave;
  removeClasses(me, "climbing", "animated");
  TimeHandler.clearClassCycle(me, "climbing");
  me.yvel = me.skipoverlaps = me.attachoff = me.nofall = me.climbing = me.attached = me.attached.attached = false;
  me.xvel = me.keys.run;
}

function playerHopsOff(me, addrun) {
  removeClasses(me, "climbing running");
  addClass(me, "jumping");
  
  me.nocollide = me.nofall = me.climbing = false;
  me.gravity = map_settings.gravity / 14;
  me.xvel = 1.4;
  me.yvel = -1.4;
  TimeHandler.addEvent(function(me) {
    unflipHoriz(me);
    me.gravity = map_settings.gravity;
    me.movement = movePlayer;
    me.attached = false;
    if(addrun) {
      addClass(me, "running")
      playerStartRunningCycle(me);
    }
  }, 21, me);
  
}

function playerFires() {
  if(player.numballs >= 2) return;
  ++player.numballs;
  addClass(player, "firing");
  var ball = ObjectMaker.make("Fireball", {
    moveleft: player.moveleft,
    speed: unitsize * 1.75,
    gravity: map_settings.gravity * 1.56,
    jumpheight: unitsize * 1.56,
    yvel: unitsize,
    movement: moveJumping
  });
  addThing(ball, player.right + unitsized4, player.top + unitsizet8);
  if(player.moveleft) setRight(ball, player.left - unitsized4, true);
  ball.animate(ball);
  ball.ondelete = fireDeleted;
  TimeHandler.addEvent(function(player) { removeClass(player, "firing"); }, 7, player);
}
function emergeFire(me) {
  AudioPlayer.play("Fireball");
}

function playerStar(me) {
  if(me.star) return;
  ++me.star;
  AudioPlayer.play("Powerup");
  AudioPlayer.playTheme("Star", true);
  TimeHandler.addEvent(playerRemoveStar, 560, me);
  switchClass(me, "normal", "star");
  TimeHandler.addSpriteCycle(me, ["star1", "star2", "star3", "star4"], "star", 5);
}
function playerRemoveStar(me) {
  if(!me.star) return;
  --me.star;
  removeClasses(me, "star star1 star2 star3 star4");
  TimeHandler.clearClassCycle(me, "star");
  addClass(me, "normal");
  AudioPlayer.playTheme();
}

// Big means it must happen: 2 means no animation
function killPlayer(me, big) {
  if(!me.alive || me.flickering || me.dying) return;
  // If this is an auto kill, it's for rizzles
  if(big == 2) {
    notime = true;
    me.dead = me.dying = true;
  }
  // Otherwise it's just a regular (enemy, time, etc.) kill
  else {
    // If Player can survive this, just power down
    if(!big && me.power > 1) {
      AudioPlayer.play("Power Down");
      me.power = 1;
      return playerGetsSmall(me);
    }
    // Otherwise, if this isn't a big one, animate a death
    else if(big != 2) {
      // Make this look dead
      TimeHandler.clearAllCycles(me);
      setSize(me, 7.5, 7, true);
      updateSize(me);
      setClass(me, "character player dead");
      // Pause some things
      nokeys = notime = me.dying = true;
      thingStoreVelocity(me);
      // Make this the top of characters
      containerForefront(me, characters);
      // After a tiny bit, animate
      TimeHandler.addEvent(function(me) {
        thingRetrieveVelocity(me, true);
        me.nocollide = true;
        me.movement = me.resting = false;
        me.gravity = gravity / 2.1;
        me.yvel = unitsize * -1.4;
      }, 7, me);
    }
  }

  // Clear and reset
  AudioPlayer.pause();
  if(!window.editing) AudioPlayer.play("Player Dies");
  me.nocollide = me.nomove = nokeys = 1;
  StatsHolder.decrease("lives");
  
  // If it's in editor, (almost) immediately set map
  if(window.editing) {
    setTimeout(function() {
      editorSubmitGameFuncPlay();
      editor.playing = editor.playediting = true;
    }, 35 * timer);
  }
  // If the map is normal, or failing that a game over is reached, timeout a reset
  else if(!map_settings.random || StatsHolder.get("lives") <= 0) {
    TimeHandler.addEvent(StatsHolder.get("lives") ? setMap : gameOver, 280);
  }
  // Otherwise it's random; spawn him again
  else {
      nokeys = notime = false;
      TimeHandler.addEvent(function() {
        playerDropsIn();
        AudioPlayer.playTheme();
      // }, 7 * (map.respawndist || 17));
      }, 117);
  }
}
// Used by random maps to respawn
function playerDropsIn() {
  // Clear and place Player
  clearOldPlayer();
  placePlayer(unitsizet16, unitsizet8 * -1 + (map.underwater * unitsize * 24));
  flicker(player);
  
  // Give a Resting Stone for him to land, unless it's underwater...
  if(!map.underwater) {
    player.nocollide = true;
    
    TimeHandler.addEvent(function() {
      player.nocollide = false;
      addThing("RestingStone", player.left, player.bottom + player.yvel);
    }, map.respawndist || 17);
  }
  // ...in which case just fix his gravity
  else player.gravity = gravity / 2.8;
}

function gameOver() {
  // Having a gamecount of -1 truly means it's all over
  gameon = false;
  pause();
  AudioPlayer.pauseTheme();
  AudioPlayer.play("Game Over");
  
  var innerHTML = "<div style='font-size:49px;padding-top: " + (innerHeight / 2 - 28/*49*/) + "px'>GAME OVER</div>";
  // innerHTML += "<p style='font-size:14px;opacity:.49;width:490px;margin:auto;margin-top:49px;'>";
  // innerHTML += "You have run out of lives. Maybe you're not ready for playing real games...";
  innerHTML += "</p>";
  
  body.className = "Night"; // to make it black
  body.innerHTML = innerHTML;
  
  window.gamecount = Infinity;
  
  setTimeout(gameRestart, 7000);
}

function gameRestart() {
  seedlast = .007;
  body.style.visibility = "hidden";
  body.innerHTML = body.style.paddingTop = body.style.fontSize = "";
  body.appendChild(canvas);
  gameon = true;
  map.random ? setMapRandom() : setMap("World11");
  TimeHandler.addEvent(function() { body.style.visibility = ""; });
  StatsHolder.set("lives", 3);
}




/*
 * Solids
 */

function Floor(me, length, height) {
  // log(arguments);
  me.width = (length || 1) * 8;
  me.height = (height * 8) || unitsizet32;
  me.spritewidth = 8;
  me.spriteheight = 8;
  me.repeat = true;
  setSolid(me, "floor");
}

// To do: stop using clouds, and use Stone instead
function Clouds(me, length) {
  me.width = length * 8;
  me.height = 8;
  setSolid(me, "clouds");
}

function Brick(me, content) {
  me.width = me.height = 8;
  me.used = false;
  me.bottomBump = brickBump;
  if(!content) me.contents = false;
  else {
    if(content instanceof Array) {
      me.contents = content;
      while(me.contents.length < 3) me.contents.push(false);
    } else me.contents = [content, false, false];
  }
  me.death = killNormal;
  setSolid(me, "brick unused");
  me.tolx = 1;
}
function brickBump(me, character) {
  if(me.up || !character.player) return;
  AudioPlayer.play("Bump");
  if(me.used) return;
  me.up = character;
  if(character.power > 1 && !me.contents)
    return TimeHandler.addEvent(brickBreak, 2, me, character); // wait until after collision testing to delete (for coins)
  
  // Move the brick
  blockBumpMovement(me);
  
  // If the brick has contents,
  if(me.contents) {
    checkContentsMushroom(me);
    TimeHandler.addEvent(
      function(me) {
        var contents = me.contents,
            out = ObjectMaker.make(contents);
        addThing(out, me.left, me.top);
        setMidXObj(out, me, true);
        out.blockparent = me;
        out.animate(out, me);
        // Do special preps for coins
        if(me.contents == "Coin") {
          if(me.lastcoin) makeUsedBlock(me);
          TimeHandler.addEvent( function(me) { me.lastcoin = true; }, 245, me );
        }
        else makeUsedBlock(me);
      }, 
      7,
      me
    );
  }
}
function makeUsedBlock(me) {
  me.used = true;
  switchClass(me, "unused", "used");
}
function brickBreak(me, character) {
  AudioPlayer.play("Break Block");
  score(me, 50);
  me.up = character;
  TimeHandler.addEvent(placeShards, 1, me);
  killNormal(me);
}
function placeShards(me) {
  for(var i = 0, shard; i < 4; ++i) {
    shard = ObjectMaker.make("BrickShard");
    addThing(shard,
                me.left + (i < 2) * me.width * unitsize - unitsizet2,
                me.top + (i % 2) * me.height * unitsize - unitsizet2);
    shard.xvel = shard.speed = unitsized2 - unitsize * (i > 1);
    shard.yvel = unitsize * -1.4 + i % 2;
    TimeHandler.addEvent(killNormal, 350, shard);
  }
}

function attachEmerge(me, solid) {
  me.animate = setInterval(function() {
    setBottom(me, solid.top, true);
    if(!solid.up) {
      clearInterval(me.animate);
      me.animate = false;
    }
  }, timer);
}

function blockBump(me, character) {
  if(!character.player) return;
  if(me.used) {
    AudioPlayer.play("Bump");
    return;
  }
  me.used = 1;
  me.hidden = me.hidden = me.skipoverlaps = false;
  me.up = character;
  blockBumpMovement(me);
  removeClass(me, "hidden");
  switchClass(me, "unused", "used");
  checkContentsMushroom(me);
  TimeHandler.addEvent(blockContentsEmerge, 7, me);
}
// out is a coin by default, but can also be other things - [1] and [2] are arguments
function blockContentsEmerge(me) {
  var out = ObjectMaker.make(me.contents);
  addThing(out, me.left, me.top);
  setMidXObj(out, me, true);
  out.blockparent = me;
  out.animate(out, me);
}

// Turn normal Mushrooms into FireFlowers if Player is large
function checkContentsMushroom(me) {
  if(player.power > 1 && me.contents == "Mushroom")
    me.contents = "FireFlower";
}

function vineEmerge(me, solid) {
  AudioPlayer.play("Vine Emerging");
  setHeight(me, 0);
  me.movement = vineMovement;
  TimeHandler.addEvent(vineEnable, 14, me);
  TimeHandler.addEventInterval(vineStay, 1, 14, me, solid);
}
function vineStay(me, solid) {
  setBottom(me, solid.top);
}
function vineEnable(me) {
  me.nocollide = false;
  me.collide = touchVine;
}

function vineMovement(me) {
  increaseHeightTop(me, unitsized4);
  if(me.attached) shiftVert(me.attached, -unitsized4, true);
}

function touchVine(me, vine) {
  if(!me.player || me.attached || me.climbing || me.bottom > vine.bottom + unitsizet2) return;
  vine.attached = me;
  
  me.attached = vine;
  me.nofall = me.skipoverlaps = true;
  me.xvel = me.yvel = me.resting = me.jumping = me.jumpcount = me.running = 0;
  me.attachleft = !objectToLeft(me, vine);
  me.attachoff = me.attachleft * 2 - 1;
  me.movementsave = me.movement;
  me.movement = movePlayerVine;
  me.keys = new Keys();
  
  // Reset classes to be in vine mode
  TimeHandler.clearClassCycle(me, "running");
  removeClass(me, "running skidding");
  unflipHoriz(me);
  if(me.attachleft) flipHoriz(me);
  addClass(me, "climbing");
  // setSize(me, 7, 8, true);
  me.climbing = TimeHandler.addSpriteCycle(me, ["one", "two"], "climbing");
  
  // Make sure you're looking at the vine, and from the right distance
  lookTowardThing(me, vine);
  if(!me.attachleft) setRight(me, vine.left + unitsizet4);
  else setLeft(me, vine.right - unitsizet4);
  
}

function collideSpring(me, spring) {
  if(me.yvel >= 0 && me.player && !spring.tension && characterOnSolid(me, spring))
    return springPlayerInit(spring, me);
  return characterTouchedSolid(me, spring);
}
function springPlayerInit(spring, player) {
  spring.tension = spring.tensionsave = max(player.yvel * .77, unitsize);
  player.movement = movePlayerSpringDown;
  player.spring = spring;
  player.xvel /= 2.8;
}
function movePlayerSpringDown(me) {
  // If you've moved off the spring, get outta here
  if(!objectsTouch(me, me.spring)) {
    me.movement = movePlayer;
    me.spring.movement = moveSpringUp;
    me.spring = false;
    return;
  }
  // If the spring is contracted, go back up
  if(me.spring.height < unitsize * 2.5 || me.spring.tension < unitsized32) {
    me.movement = movePlayerSpringUp;
    me.spring.movement = moveSpringUp;
    return;
  }
  // Make sure it's hard to slide off
  if(me.left < me.spring.left + unitsizet2 || me.right > me.spring.right - unitsizet2)
    me.xvel /= 1.4;
  
  reduceSpringHeight(me.spring, me.spring.tension);
  setBottom(me, me.spring.top, true);
  me.spring.tension /= 2;
  
  updateSize(me.spring);
}
function movePlayerSpringUp(me) {
  if(!me.spring || !objectsTouch(me, me.spring)) {
    me.spring = false;
    me.movement = movePlayer;
  }
}
function moveSpringUp(spring) {
  reduceSpringHeight(spring, -spring.tension);
  spring.tension *= 2;
  if(spring == player.spring) 
    setBottom(player, spring.top, true);
  
  if(spring.height > spring.heightnorm) {
    if(spring == player.spring) {
      player.yvel = max(-unitsizet2, spring.tensionsave * -.98);
      player.resting = player.spring = false;
    }
    reduceSpringHeight(spring, (spring.height - spring.heightnorm) * unitsize);
    spring.tension = spring.tensionsave = spring.movement = false;
  }
}
function reduceSpringHeight(spring, dy) {
  reduceHeight(spring, dy, true);
}

function RestingStoneUnused(me) {
  // Wait until Player isn't resting
  if(!player.resting) return;
  // If Player is resting on something else, this is unecessary
  if(player.resting != me) return killNormal(me);
  // Make the stone wait until it's no longer being rested upon
  me.movement = RestingStoneUsed;
  removeClass(me, "hidden");
  setThingSprite(player);
}
function RestingStoneUsed(me) { 
  if(!player.resting) return killNormal(me);
}

function makeCastleBlock(me, settings) {
  // The block will need to manage the balls later
  var length = me.fireballs,
      balls = me.balls = new Array(length),
      midx = getMidX(me) - unitsizet2, // Fireballs are 4x4, so (unitsize * 4) / 2
      midy = getMidY(me) - unitsizet2;
  
  // These start at the center and will have their positions set by castleBlockEvent
  for(i = 0; i < length; ++i)
    balls[i] = addThing("CastleFireball", midx, midy);
  
  // Start rotating the Fireballs on an interval
  TimeHandler.addEventInterval(castleBlockEvent, me.interval, Infinity, me);
}
function castleBlockEvent(me) {
  // Stop if the block is dead (moved out of the game)
  if(!characterIsAlive(me)) return true;
  
  var left = me.left,
      top = me.top,
      angle = me.angle += me.dt * me.direction, // typically += .07 * -1
      balls = me.balls,
      len, i;
  // Each ball is an increasing distance from center, at the same angle
  // (the first is skipped because it stays at the center);
  for(i = 1, len = balls.length; i < len; ++i) {
    setMidX(balls[i], left + (i * unitsizet4 * Math.cos(angle * Math.PI)));
    setMidY(balls[i], top + (i * unitsizet4 * Math.sin(angle * Math.PI)));
  }
  // me.midx = me.left;// + me.width * unitsize / 2;
  // me.midy = me.top;// + me.height * unitsize / 2;
  // me.counter = 0;
  // me.angle += me.dt
  // // Skip i=0 because it doesn't move
  // for(var i = 1; i < me.balls.length; ++i) {
    // setMidX(me.balls[i], me.midx + (i) * unitsizet4 * Math.cos(me.angle * Math.PI), true);
    // setMidY(me.balls[i], me.midy + (i) * unitsizet4 * Math.sin(me.angle * Math.PI), true);
  // }
}
// Set to solids because they spawn with their CastleBlocks
function CastleFireBall(me, distance) {
  me.width = me.height = 4;
  me.deadly = me.nofire = me.nocollidechar = me.nocollidesolid = me.nofall = me.nostar = me.outerok = me.skipoverlaps = true;
  me.movement = false;
  me.collide = collideEnemy;
  setCharacter(me, "fireball castle");
  TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 4);
}

// Step 1 of getting to that jerkface Toad
function CastleAxeFalls(me, collider) {
  var axe = collider.axe;
  // Don't do this if Player would fall without the bridge
  if(!me.player || 
    me.right < axe.left + unitsize ||
    me.bottom > axe.bottom - unitsize) return;
  // Immediately kill the axe and collider
  killNormal(axe);
  killNormal(collider);
  // Pause Player & wipe the other characters
  notime = nokeys = true;
  thingStoreVelocity(me);
  killOtherCharacters();
  TimeHandler.addEvent(killNormal, 7, axe.chain);
  TimeHandler.addEvent(CastleAxeKillsBridge, 14, axe.bridge, axe);
  AudioPlayer.pauseTheme();
  AudioPlayer.playTheme("World Clear", false, false);
}
// Step 2 of getting to that jerkface Toad
function CastleAxeKillsBridge(bridge, axe) {
  // Decrease the size of the bridge
  bridge.width -= 2;
  bridge.right -= unitsizet2;
  // If it's still here, go again
  if(bridge.width > 0) TimeHandler.addEvent(CastleAxeKillsBridge, 1, bridge, axe);
  // Otherwise call the next step
  else {
    bridge.width = 0;
    TimeHandler.addEvent(CastleAxeKillsBowser, 1, axe.bowser);
  }
  setWidth(bridge, bridge.width);
}
// Step 3 of getting to that jerkface Toad
function CastleAxeKillsBowser(bowser) {
  bowser.nofall = false;
  bowser.nothrow = true;
  // this is a total hack to avoid being hit by hammers after Bowser dies in 6-4, 7-4, 8-4
  ++player.star;
  TimeHandler.addEvent(CastleAxeContinues, 35, player);
}
// Step 4 of getting to that jerkface Toad
function CastleAxeContinues(player) {
  map.canscroll = true;
  startWalking(player);
}
// CollideCastleNPC is actually called by the FuncCollider
function collideCastleNPC(me, collider) {
  killNormal(collider);
  me.keys.run = 0;
  TimeHandler.addEvent(function(text) {
    var i;
    for(i = 0; i < text.length; ++i)
      TimeHandler.addEvent(proliferate, i * 70, text[i].element, {style: {visibility: "visible"}});
    TimeHandler.addEvent(endLevel, (i + 3) * 70);
  }, 21, collider.text);
}

function PlatformGeneratorInit(me) {
  for(var i = 0, inc = me.interval, height = me.height; i < height; i += inc) {
    me.platlast = ObjectMaker.make("Platform", { movement: movePlatformSpawn });
    me.platlast.yvel *= me.dir;
    if(me.dir == 1) addThing(me.platlast, me.left, me.top + i * unitsize);
    else addThing(me.platlast, me.left, me.bottom - i * unitsize);
    me.platlast.parent = me;
    i += me.interval;
  }
  me.movement = false;
}
function movePlatformSpawn(me) {
  // This is like movePlatformNorm, but also checks for whether it's out of bounds
  // Assumes it's been made with a PlatformGenerator as the parent
  // To do: make the PlatformGenerator check one at a time, not each of them.
  if(me.bottom < me.parent.top) {
    setBottom(me, me.parent.bottom);
    detachPlayer(me);
  }
  else if(me.top > me.parent.bottom) {
    setTop(me, me.parent.top);
    detachPlayer(me);
  }
  else movePlatformNorm(me);
}
function movePlatformNorm(me) {
  shiftHoriz(me, me.xvel);
  shiftVert(me, me.yvel);
  if(me == player.resting && me.alive) {
    setBottom(player, me.top);
    shiftHoriz(player, me.xvel);
    if(player.right > innerWidth) setRight(player, innerWidth);
  }
}
function detachPlayer(me) {
  if(player.resting != me) return;
  player.resting = false;
}

function FlagCollisionTop(me, detector) {
  AudioPlayer.pause();
  AudioPlayer.play("Flagpole");
  
  // All other characters die, and the player is no longer in control
  killOtherCharacters();
  nokeys = notime = true;

  // The player also is frozen in this dropping state, on the pole
  me.xvel = me.yvel = 0;
  me.dropping = me.nofall = me.nocollidechar = 1;
  setRight(me, detector.left);
  
  // Visually, the player is now climbing, and invincible
  ++me.star;
  removeClasses(me, "running jumping skidding");
  addClass(me, "climbing animated");
  TimeHandler.addSpriteCycle(me, ["one", "two"], "climbing");
  
  // Start moving the player down, as well as the end flag
  var endflag = MapsManager.getArea().getThingByID("endflag"),
      bottom_cap = (map_settings.floor - 9) * unitsize;
  me.movement = function(me) { 
    if(me.bottom < bottom_cap)
      shiftVert(me, unitsize);
    if(endflag.bottom < bottom_cap)
      shiftVert(endflag, unitsize);
    
    // If both are at the bottom, clear climbing and allow walking
    if(me.bottom >= bottom_cap && endflag.bottom >= bottom_cap) {
      me.movement = false;
      TimeHandler.clearClassCycle(me, "climbing");
      
      // Wait a little bit to FlagOff, which will start the player walking
      TimeHandler.addEvent(FlagOff, 21, me);
    }
  }
}
// See http://themushroomkingdom.net/smb_breakdown.shtml near bottom
// Stages: 8, 28, 40, 62
function scorePlayerFlag(diff, stone) {
  var amount;
  // log(diff);
  // Cases of...
  if(diff < 28) {
    // 0 to 8
    if(diff < 8) { amount = 100; }
    // 8 to 28
    else { amount = 400; }
  }
  else {
    // 28 to 40
    if(diff < 40) { amount = 800; }
    // 40 to 62
    else if(diff < 62) { amount = 2000; }
    // 62 to infinity and beyond
    else { amount = 5000; }
  }
  score(player, amount, true);
}

function FlagOff(me, solid) {
  // Flip the player to the other side of the solid
  flipHoriz(me);
  shiftHoriz(me, (me.width + 1) * unitsize);
  
  // Prepare the player to walk to the right
  me.keys.run = 1;
  me.maxspeed = me.walkspeed;
  
  // The walking happens a little bit later as well
  TimeHandler.addEvent(function() {
    AudioPlayer.play("Stage Clear");
    playerHopsOff(me, true);
  }, 14, me);
}

// Me === Player
function endLevelPoints(me, detector) {
  if(!me || !me.player) return;
  
  // Stop the game, and get rid of player and the detectors
  notime = nokeys = true;
  killNormal(me);
  
  // Determine the number of fireballs (1, 3, and 6 become not 0)
  var numfire = parseInt(getLast(String(StatsHolder.get("time"))));
  if(!(numfire == 1 || numfire == 3 || numfire == 6)) numfire = 0;
  // Count down the points (x50)
  var points = setInterval(function() {
    // 50 points for each unit of time
    StatsHolder.decrease("time");
    StatsHolder.increase("score", 50);
    // Each point(x50) plays the coin noise
    AudioPlayer.play("Coin");
    // Once it's done, move on to the fireworks.
    if(StatsHolder.get("time") <= 0)  {
      // pause();
      clearInterval(points);
      setTimeout(function() { endLevelFireworks(me, numfire, detector); }, timer * 49);
    }
  }, timer);
}
function endLevelFireworks(me, numfire, detector) {
  var nextnum, nextfunc,
      i = 0;
  if(numfire) {
    // var castlemid = detector.castle.left + detector.castle.width * unitsized2;
    var castlemid = detector.left + 32 * unitsized2;
    while(i < numfire)
      explodeFirework(++i, castlemid); // Pre-increment since explodeFirework expects numbers starting at 1
    nextnum = timer * (i + 2) * 42;
  }
  else nextnum = 0;
  
  // The actual endLevel happens after all the fireworks are done
  nextfunc = function() { setTimeout(function() { endLevel(); }, nextnum); };
  
  // If the Stage Clear sound is still playing, wait for it to finish
  AudioPlayer.addEventImmediate("Stage Clear", "ended", function() { TimeHandler.addEvent(nextfunc, 35); });
}
function explodeFirework(num, castlemid) {
  setTimeout(function() {
    log("Not placing fireball.");
    // var fire = ObjectMaker.make("Firework");
    // addThing(fire, castlemid + fire.locs[0] - unitsize * 6, unitsizet16 + fire.locs[1]);
    // fire.animate();
  }, timer * num * 42);
}
function Firework(me, num) {
  me.width = me.height = 8;
  me.nocollide = me.nofire = me.nofall = true;
  // Number is >0 if this is ending of level
  if(num)
    switch(num) {
      // These probably aren't the exact same as original... :(
      case 1: me.locs = [unitsizet16, unitsizet16]; break;
      case 2: me.locs = [-unitsizet16, unitsizet16]; break;
      case 3: me.locs = [unitsizet16 * 2, unitsizet16 * 2]; break;
      case 4: me.locs = [unitsizet16 * -2, unitsizet16 * 2]; break;
      case 5: me.locs = [0,unitsizet16 * 1.5]; break;
      default: me.locs = [0,0]; break;
    }
  // Otherwise, it's just a normal explosion
  me.animate = function() {
    var name = me.className + " n";
    if(me.locs) AudioPlayer.play("Firework");
    TimeHandler.addEvent(function(me) { setClass(me, name + 1); }, 0, me);
    TimeHandler.addEvent(function(me) { setClass(me, name + 2); }, 7, me);
    TimeHandler.addEvent(function(me) { setClass(me, name + 3); }, 14, me);
    TimeHandler.addEvent(function(me) { killNormal(me); }, 21, me);
  }
  setCharacter(me, "firework");
  score(me, 500);
}

function setWarpWorldInit(me) {
  // Just reduces the size 
  shiftHoriz(me, me.width * unitsized2);
  me.width /= 2;
  updateSize(me); 
  me.movement = false;
}

function enableWarpWorldText(me, warp) {
  var pirhanas = warp.pirhanas,
      texts = warp.texts, i;
  for(i in pirhanas) {
    pirhanas[i].death();
  }
  for(i in texts)
    texts[i].element.style.visibility = "";
  killNormal(warp);
}

/* Scenery */

// Scenery sizes are stored in window.scenery
// After creation, they're processed
function resetScenery() {
  // Patterns of scenery that can be placed in one call
  // Each ends with "Blank" to signify the ending width
  window.Scenery = {
    BackRegular: [
      ["HillLarge", 0, 0],
      ["Cloud1", 68, 68],
      ["Bush3", 92, 0],
      ["HillSmall", 128, 0],
      ["Cloud1", 156, 76],
      ["Bush1", 188, 0],
      ["Cloud3", 220, 68],
      ["Cloud2", 292, 76],
      ["Bush2", 332, 0],
      ["Blank", 384]
    ],
    BackCloud: [
      ["Cloud2", 28, 64],
      ["Cloud1", 76, 32],
      ["Cloud2", 148, 72],
      ["Cloud1", 228, 0],
      ["Cloud1", 284, 32],
      ["Cloud1", 308, 40],
      ["Cloud1", 372, 0],
      ["Blank", 384]
    ],
    BackCloudMin: [ // used for random map generation
      ["Cloud1", 68, 68],
      ["Cloud1", 156, 76],
      ["Cloud3", 220, 68],
      ["Cloud2", 292, 76],
      ["Blank", 384]
    ],
    BackFence: [
      ["PlantSmall", 88, 0],
      ["PlantLarge", 104, 0],
      ["Fence", 112, 0, 4],
      ["Cloud1", 148, 68],
      ["PlantLarge", 168, 0],
      ["PlantSmall", 184, 0],
      ["PlantSmall", 192, 0],
      ["Cloud1", 220, 76],
      ["Cloud2", 244, 68],
      ["Fence", 304, 0, 2],
      ["PlantSmall", 320, 0],
      ["Fence", 328, 0],
      ["PlantLarge", 344, 0],
      ["Cloud1", 364, 76],
      ["Cloud2", 388, 68],
      ["Blank", 384]
    ],
    BackFenceMin: [
      ["PlantLarge", 104, 0],
      ["Fence", 112, 0, 4],
      ["Cloud1", 148, 68],
      ["PlantLarge", 168, 0],
      ["PlantSmall", 184, 0],
      ["PlantSmall", 192, 0],
      ["Cloud1", 220, 76],
      ["Cloud2", 244, 68],
      ["Fence", 304, 0, 2],
      ["PlantSmall", 320, 0],
      ["Fence", 328, 0],
      ["Cloud1", 364, 76],
      ["Cloud2", 388, 68],
      ["Blank", 384]
    ],
    BackFenceMin2: [
      ["Cloud2", 4, 68],
      ["PlantSmall", 88, 0],
      ["PlantLarge", 104, 0],
      ["Fence", 112, 0, 1],
      ["Fence", 128, 0, 2],
      ["Cloud1", 148, 68],
      // ["PlantLarge", 168, 0],
      ["PlantSmall", 184, 0],
      ["PlantSmall", 192, 0],
      ["Cloud1", 220, 76],
      ["Cloud2", 244, 68],
      ["Fence", 304, 0, 2],
      ["PlantSmall", 320, 0],
      ["Fence", 328, 0],
      ["PlantLarge", 344, 0],
      ["Cloud1", 364, 76],
      ["Cloud2", 388, 68],
      ["Blank", 384]
    ],
    BackFenceMin3: [
      ["Cloud2", 4, 68],
      ["PlantSmall", 88, 0],
      ["PlantLarge", 104, 0],
      ["Fence", 112, 0, 4],
      ["Cloud1", 148, 68],
      ["PlantSmall", 184, 0],
      ["PlantSmall", 192, 0],
      ["Cloud1", 220, 76],
      ["Cloud2", 244, 68],
      ["Cloud1", 364, 76],
      ["Cloud2", 388, 68],
      ["Blank", 384]
    ]
  };
  
  processSceneryPatterns(Scenery);
}

// Sets the width of them and removes the blank element
function processSceneryPatterns(patterns) {
  var current, i;
  for(i in patterns) {
    current = patterns[i];
    if(!current.length) continue;
    // The last array in current should be ["blank", width]
    current.width = current[current.length - 1][1];
    current.pop();
  }
}
function collideLocationShifter(me, shifter) {
  if(!me.player) return;
  shifter.nocollide = true;
  TimeHandler.addEvent( 
    function(me) {
      shiftToLocation(shifter.loc);
      if(map.random) entryRandom(me);
    }, 1, me );
}
// Functions used for ObjectMakr-style detectors
function onDetectorCollision(character, me) {
  if(!character.player) {
    if(me.activate_fail) me.activate_fail(character);
    return;
  }
  me.activate(character, me);
  killNormal(me);
}
function onDetectorSpawn(me) {
  me.activate(me);
  killNormal(me);
}