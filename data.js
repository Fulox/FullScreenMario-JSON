/* Data.js */
// A few functions to store and display ~persistent data using a StatsHoldr

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
    "separator": "<br />",
    values: {
      "power": {
        value_default: 1,
        store_locally: false
      },
      "traveled": { value_default: 0 },
      "score": {
        value_default: 0,
        digits: 6,
        has_element: true,
        modularity: 100000,
        on_modular: gainLife
      },
      "time": {
        value_default: 0,
        digits: 3,
        has_element: true,
        minimum: 0,
        on_minimum: function() { killPlayer(player, true); }
      },
      "world": {
        value_default: 0,
        has_element: true
      },
      "coins": {
        value_default: 0,
        has_element: true,
        modularity: 100,
        on_modular: gainLife
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
  
  body.appendChild(StatsHolder.makeContainer());
}

function toggleLuigi(nochange) {
  if(!nochange) StatsHolder.toggle("luigi");
  // (StatsHolder.get("luigi") ? addClass : removeClass)(player, "Luigi");
  player.title = StatsHolder.get("luigi") ? "Luigi" : "Player";
  setThingSprite(player);
}

// Starts the interval of updating data time
// 1 game second is about 25*16.667=416.675ms
function startDataTime() {
  StatsHolder.set("time", MapsManager.getArea().time);
}
function updateDataTime() {
  if(notime) return;
  // To do: increasing time for random / no time for editor
  StatsHolder.decrease("time", 1);
}


function score(me, amount, appears) {
  // Don't do negative values
  if(amount <= 0) return;
  // If it's in the form 'score(X)', return 'score(player, x)'
  if(arguments.length == 1) return score(player, me);
  
  // If it appears, add the element
  if(appears) {
    var text = addText(amount, me.left, me.top);
    text.yvel = -unitsized4;
    TimeHandler.addEvent(killScore, 49, text);
  }
  
  // Check for life gaining (above 10000)
  amount += StatsHolder.get("score");
  while(amount > 10000) {
    gainLife();
    amount = amount % 10000;
  }
  
  // Set the new score amount, which updates the element
  StatsHolder.set("score", amount);
}
function killScore(text) {
  if(body.contains(text))
    body.removeChild(text);
  killNormal(text);
  deleteThing(text, texts, texts.indexOf(text));
}

// For hopping on / shelling enemies, the score given increases each time
// Once it passes the threshold, gainLife happens instead
function findScore(lev) {
  if(lev < 10) return [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000][lev];
  gainLife();
}

function gainLife(num, nosound) {
  if(typeof(num) != "number") num = 1;
  StatsHolder.increase("lives", num);
  if(!nosound) AudioPlayer.play("Gain Life");
}