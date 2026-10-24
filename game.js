// =============================================
// Wiener Dog in Space
// Plain JavaScript, no libraries, no APIs.
//
// The game moves through these states, in order:
//   "title"    -> title screen with a Start button
//   "menu"     -> menu with a New Game button
//   "cutscene" -> crash animation and dialogue
//   "play"     -> the player controls Laika
//   "tutorial" -> ship monitor tutorial is open (Laika can't move)
// =============================================

// ----- Canvas setup -----
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// The game is drawn at a small "pixel art" size, then scaled up
// to fit the browser window. All positions below use this size.
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;

// Where the walkable floor starts in each scene
const GROUND_TOP = 130;        // outside
const INSIDE_FLOOR_TOP = 110;  // inside the ship

// How big each game pixel is on screen (changed by resizeCanvas)
let scale = 1;

function resizeCanvas() {
  // Pick the biggest scale that still fits the whole game in the window
  scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);

  canvas.width = Math.floor(GAME_WIDTH * scale);
  canvas.height = Math.floor(GAME_HEIGHT * scale);

  // Changing canvas size resets these settings, so set them again
  ctx.imageSmoothingEnabled = false; // keep pixels crisp
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ----- HTML elements -----
const titleScreen = document.getElementById("title-screen");
const menuScreen = document.getElementById("menu-screen");
const startButton = document.getElementById("start-button");
const newGameButton = document.getElementById("new-game-button");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueText = document.getElementById("dialogue-text");
const dialogueNext = document.getElementById("dialogue-next");
const dialoguePortrait = document.getElementById("dialogue-portrait");
const portraitCtx = dialoguePortrait.getContext("2d");
const controlsPanel = document.getElementById("controls");
const tutorialPanel = document.getElementById("tutorial");
const tutorialCanvas = document.getElementById("tutorial-canvas");
const tutorialCtx = tutorialCanvas.getContext("2d");
const tutorialCaption = document.getElementById("tutorial-caption");
const tutorialClose = document.getElementById("tutorial-close");

// ----- Game state -----
let state = "title";        // always start on the title screen
let currentScene = "outside"; // during play: "outside" or "inside"
let screenFade = 0;         // 0 = normal, 1 = fully black (used for transitions)
let playTime = 0;           // seconds since gameplay started
let tutorialTime = 0;       // seconds since the tutorial was opened
let treats = 0;             // Treats are the game's money (rewards for missions)

// =============================================
// CRASH CUTSCENE SETTINGS
// Edit this section to change the cutscene.
// =============================================

// Each line has a speaker, the text, and which animation "phase"
// plays behind it. Phases are drawn in drawCutscene() below:
//   "space"      ship flying through space
//   "shaking"    ship shaking, red alarm
//   "descending" ship on fire, falling toward the planet
//   "impact"     ship crashes onto the planet surface
//   "blackout"   screen fades to black
//   "laika"      fade back in, Laika at the ship's hatch
//   "inside"     inside the ship, Laika next to the astronaut
const CUTSCENE_LINES = [
  { speaker: "Astronaut", text: "Laika, are you okay?", phase: "space" },
  { speaker: "Astronaut", text: "Warning! The ship is losing control!", phase: "shaking" },
  { speaker: "Computer", text: "Emergency landing sequence activated.", phase: "descending" },
  { speaker: "Computer", text: "Warning. Life-support systems damaged.", phase: "descending" },
  { speaker: "Astronaut", text: "I need to get us out of here...", phase: "descending" },
  { speaker: "Computer", text: "Critical systems failure.", phase: "impact" },
  { speaker: "Narration", text: "The astronaut loses consciousness after the crash.", phase: "blackout" },
  { speaker: "Narration", text: "Laika is okay, but her human needs help.", phase: "laika" },
  { speaker: "Narration", text: "... she seems unconscious?", phase: "inside" },
  { speaker: "Laika", text: "Whines", phase: "inside" }
];

// Name colors in the dialogue box
const SPEAKER_COLORS = {
  Astronaut: "#ff6fd8",
  Computer: "#3fa7ff",
  Narration: "#cccccc",
  Laika: "#ffb347"
};

// Faces shown in the dialogue box (32x32 pixels).
// PLACEHOLDERS: replace these with your team's portrait art later.
// Speakers without a face here (Computer, Narration) show no portrait.
function portraitRect(x, y, w, h, color) {
  portraitCtx.fillStyle = color;
  portraitCtx.fillRect(x, y, w, h);
}

function drawAstronautPortrait() {
  portraitRect(0, 0, 32, 32, "#1a0b33");      // background
  // Helmet
  portraitRect(8, 2, 16, 2, "#e0e0e0");
  portraitRect(6, 4, 20, 24, "#e0e0e0");
  portraitRect(4, 8, 2, 16, "#e0e0e0");
  portraitRect(26, 8, 2, 16, "#e0e0e0");
  // Visor glass
  portraitRect(9, 8, 14, 14, "#2a3550");
  // Hair and face
  portraitRect(10, 9, 12, 3, "#6b3a1f");
  portraitRect(10, 12, 2, 8, "#6b3a1f");
  portraitRect(20, 12, 2, 8, "#6b3a1f");
  portraitRect(12, 12, 8, 9, "#f1c27d");
  portraitRect(13, 15, 2, 2, "#000000");      // eyes
  portraitRect(17, 15, 2, 2, "#000000");
  portraitRect(15, 19, 2, 1, "#c0504d");      // mouth
  portraitRect(20, 9, 2, 2, "rgba(255,255,255,0.6)"); // shine on the glass
  // Suit collar with pink stripe
  portraitRect(4, 28, 24, 4, "#f2f2f2");
  portraitRect(4, 29, 24, 1, "#ff6fd8");
}

function drawLaikaPortrait() {
  portraitRect(0, 0, 32, 32, "#1a0b33");      // background
  portraitRect(8, 20, 10, 12, "#8b4a1f");     // neck
  portraitRect(8, 10, 14, 10, "#8b4a1f");     // head
  portraitRect(22, 14, 7, 6, "#8b4a1f");      // long snout
  portraitRect(28, 14, 2, 2, "#000000");      // nose
  portraitRect(23, 19, 5, 1, "#5c2e10");      // mouth
  portraitRect(17, 12, 2, 2, "#000000");      // eye
  portraitRect(17, 12, 1, 1, "#ffffff");      // eye shine
  portraitRect(16, 11, 3, 1, "#5c2e10");      // sad eyebrow
  portraitRect(9, 10, 5, 13, "#5c2e10");      // floppy ear
}

const PORTRAITS = {
  Astronaut: drawAstronautPortrait,
  Laika: drawLaikaPortrait
};

const INTRO_TIME = 2.5;     // seconds of flying before the first line appears
const TYPE_SPEED = 35;       // letters per second for the typing effect
const MIN_LINE_TIME = 0.8;   // a line can't be skipped faster than this (seconds)
const IMPACT_FLY_TIME = 1.2; // seconds for the ship to fall onto the ground

// Everything the cutscene needs to remember while it plays
const cutscene = {
  time: 0,        // seconds since the cutscene started
  phase: "space", // current animation phase
  phaseTime: 0,   // seconds since the current phase started
  lineIndex: -1,  // which line is showing (-1 = none yet)
  lineTime: 0,    // seconds since the current line appeared
  typed: 0,       // how many letters of the line are showing
  ending: false   // true while fading out to gameplay
};

// ----- Keyboard input -----
// keys["arrowleft"] is true while that key is held down
const keys = {};

window.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();
  keys[key] = true;

  // Stop arrow keys and Space from scrolling the page
  if (event.key.startsWith("Arrow") || key === " ") {
    event.preventDefault();
  }

  // Space or Enter advances the dialogue (ignore keys held down)
  if (state === "cutscene" && (key === " " || key === "enter")) {
    event.preventDefault(); // stop it also "clicking" a focused button
    if (!event.repeat) {
      advanceDialogue();
    }
  }

  // Press H during gameplay to show/hide the controls panel
  if (state === "play" && key === "h") {
    controlsPanel.classList.toggle("hidden");
  }

  // E opens the tutorial at the monitor. E or Escape closes it.
  if (!event.repeat) {
    if (state === "play" && key === "e" && dogNearMonitor()) {
      openTutorial();
    } else if (state === "tutorial" && (key === "e" || key === "escape")) {
      closeTutorial();
    }
  }
});

window.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});

// ----- Buttons -----
startButton.addEventListener("click", function () {
  state = "menu";
  titleScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
  newGameButton.focus();
});

newGameButton.addEventListener("click", startNewGame);

dialogueNext.addEventListener("click", function () {
  advanceDialogue();
  dialogueNext.blur(); // so Space doesn't press the button a second time
});

tutorialClose.addEventListener("click", closeTutorial);

// =============================================
// GAME OBJECTS
// Placeholders are colored rectangles. Later you can swap them for
// your team's sprite sheets (see the draw functions below).
// =============================================

// Laika the dachshund - the player
const dog = {
  x: 120,
  y: 160,    // y is the position of her FEET (bottom of the sprite)
  width: 22, // body + head
  height: 9,
  speed: 60, // game pixels per second
  facing: 1  // 1 = facing right, -1 = facing left
};

// The crashed ship (outside view)
const ship = {
  x: 30,
  y: 140, // bottom of the ship
  width: 70,
  height: 30
};

// The ship's entrance (outside). Walk UP into it to go inside.
const shipDoor = {
  x: ship.x + 48,
  width: 10
};

// The exit door on the back wall (inside). Walk UP into it to go outside.
const exitDoor = {
  x: 30,
  width: 16
};

// The monitor on the back wall inside the ship
// (matches the control console drawn in drawInsideRoom)
const monitor = {
  x: 130,
  width: 80
};

// The bed inside the ship where the astronaut lies unconscious
const cot = {
  x: 180,
  y: 140, // bottom of the cot legs
  width: 70
};

// "Solid" areas the dog can't walk through, one list per scene.
// These are the parts of objects that touch the floor (their "footprint").
const solids = {
  outside: [
    { x: ship.x, y: ship.y - 8, width: ship.width, height: 10 }
  ],
  inside: [
    { x: cot.x, y: cot.y - 8, width: cot.width, height: 10 },
    { x: cot.x + cot.width + 2, y: cot.y - 8, width: 12, height: 10 } // heart monitor stand
  ]
};

// Stars: random positions created once at the start.
// Each star has its own speed so space looks deep when it scrolls.
const stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * GAME_WIDTH,
    y: Math.floor(Math.random() * GAME_HEIGHT),
    speed: 0.3 + Math.random(),
    twinkle: Math.random() * Math.PI * 2
  });
}

// =============================================
// STATE CHANGES
// =============================================

function startNewGame() {
  state = "cutscene";
  menuScreen.classList.add("hidden");

  cutscene.time = 0;
  cutscene.lineIndex = -1;
  cutscene.ending = false;
  startPhase("space");
  screenFade = 0;
}

function startGameplay() {
  state = "play";
  currentScene = "outside";
  dialogueBox.classList.add("hidden");
  controlsPanel.classList.remove("hidden");

  // Laika starts in front of the ship's hatch
  dog.x = shipDoor.x + shipDoor.width / 2 - dog.width / 2;
  dog.y = ship.y + 14;
  dog.facing = 1;

  playTime = 0;
  screenFade = 1; // fade in from black
}

// =============================================
// CUTSCENE LOGIC
// =============================================

function startPhase(phase) {
  cutscene.phase = phase;
  cutscene.phaseTime = 0;

  // Put Laika where she needs to be for the phases that show her
  if (phase === "laika") {
    dog.x = shipDoor.x + shipDoor.width / 2 - dog.width / 2;
    dog.y = ship.y + 10;
    dog.facing = 1;
  }
  if (phase === "inside") {
    dog.x = cot.x - 30;
    dog.y = cot.y + 8;
    dog.facing = 1;
  }
}

function showLine(index) {
  const line = CUTSCENE_LINES[index];
  cutscene.lineIndex = index;
  cutscene.lineTime = 0;
  cutscene.typed = 0;

  dialogueSpeaker.textContent = line.speaker;
  dialogueSpeaker.style.color = SPEAKER_COLORS[line.speaker] || "#ffffff";
  dialogueText.textContent = "";
  dialogueText.style.fontStyle = line.speaker === "Narration" ? "italic" : "normal";

  // Show the speaker's face, or hide the face box if they don't have one
  const drawPortrait = PORTRAITS[line.speaker];
  if (drawPortrait) {
    dialoguePortrait.classList.remove("hidden");
    drawPortrait();
  } else {
    dialoguePortrait.classList.add("hidden");
  }

  const isLastLine = index === CUTSCENE_LINES.length - 1;
  dialogueNext.innerHTML = isLastLine ? "Continue &#9654;" : "Next &#9654;";
  dialogueBox.classList.remove("hidden");

  if (line.phase !== cutscene.phase) {
    startPhase(line.phase);
  }
}

// Called by the Next button, Space, or Enter
function advanceDialogue() {
  if (state !== "cutscene" || cutscene.ending || cutscene.lineIndex === -1) {
    return;
  }

  const line = CUTSCENE_LINES[cutscene.lineIndex];

  // If the text is still typing, the first press shows the whole line
  if (cutscene.typed < line.text.length) {
    cutscene.typed = line.text.length;
    dialogueText.textContent = line.text;
    return;
  }

  // Give the player time to read before moving on
  if (cutscene.lineTime < MIN_LINE_TIME) {
    return;
  }

  if (cutscene.lineIndex < CUTSCENE_LINES.length - 1) {
    showLine(cutscene.lineIndex + 1);
  } else {
    // Last line finished: fade out, then gameplay starts
    cutscene.ending = true;
    dialogueBox.classList.add("hidden");
  }
}

function updateCutscene(deltaTime) {
  cutscene.time += deltaTime;
  cutscene.phaseTime += deltaTime;

  // Fading out at the end
  if (cutscene.ending) {
    screenFade = Math.min(1, screenFade + deltaTime);
    if (screenFade >= 1) {
      startGameplay();
    }
    return;
  }

  // Show the first line after the ship has flown for a bit
  if (cutscene.lineIndex === -1) {
    if (cutscene.time >= INTRO_TIME) {
      showLine(0);
    }
    return;
  }

  // Typing effect: reveal more letters every frame
  cutscene.lineTime += deltaTime;
  const line = CUTSCENE_LINES[cutscene.lineIndex];
  if (cutscene.typed < line.text.length) {
    cutscene.typed = Math.min(line.text.length, cutscene.typed + TYPE_SPEED * deltaTime);
    dialogueText.textContent = line.text.slice(0, Math.floor(cutscene.typed));
  }
}

// =============================================
// GAMEPLAY LOGIC (movement, collisions, doors)
// =============================================

// Returns true if two rectangles overlap
function overlaps(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// The small strip under the dog's feet, used for collisions
function dogFootprint() {
  return { x: dog.x, y: dog.y - 3, width: dog.width, height: 3 };
}

// Returns true if the dog is standing inside any solid object
function dogHitsSolid() {
  for (const solid of solids[currentScene]) {
    if (overlaps(dogFootprint(), solid)) {
      return true;
    }
  }
  return false;
}

// Returns true if the middle of the dog is lined up with a door
function dogLinedUpWith(door) {
  const dogMiddle = dog.x + dog.width / 2;
  return dogMiddle >= door.x - 2 && dogMiddle <= door.x + door.width + 2;
}

// Keep a number between a min and a max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updatePlay(deltaTime) {
  playTime += deltaTime;
  screenFade = Math.max(0, screenFade - deltaTime); // finish the fade-in

  let moveX = 0;
  let moveY = 0;

  if (keys["arrowleft"] || keys["a"]) moveX -= 1;
  if (keys["arrowright"] || keys["d"]) moveX += 1;
  if (keys["arrowup"] || keys["w"]) moveY -= 1;
  if (keys["arrowdown"] || keys["s"]) moveY += 1;

  if (moveX !== 0) {
    dog.facing = moveX;
  }

  // The floor area the dog can walk on depends on the scene
  const floorTop = currentScene === "outside" ? GROUND_TOP : INSIDE_FLOOR_TOP;
  const minY = floorTop + 4;
  const maxY = GAME_HEIGHT - 4;

  // Move left/right first. If that walks into something solid, undo it.
  const oldX = dog.x;
  dog.x = clamp(dog.x + moveX * dog.speed * deltaTime, 0, GAME_WIDTH - dog.width);
  if (dogHitsSolid()) {
    dog.x = oldX;
  }

  // Then move up/down the same way
  const oldY = dog.y;
  dog.y = clamp(dog.y + moveY * dog.speed * 0.6 * deltaTime, minY, maxY);
  if (dogHitsSolid()) {
    dog.y = oldY;
  }

  // Doors: walking UP while lined up with a door changes the scene
  if (moveY < 0) {
    if (currentScene === "outside" && dogLinedUpWith(shipDoor) && dog.y <= ship.y + 6) {
      // Enter the ship. Start just in front of the exit door.
      currentScene = "inside";
      dog.x = exitDoor.x + exitDoor.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    } else if (currentScene === "inside" && dogLinedUpWith(exitDoor) && dog.y <= minY + 1) {
      // Leave the ship. Start just in front of the outside door.
      currentScene = "outside";
      dog.x = shipDoor.x + shipDoor.width / 2 - dog.width / 2;
      dog.y = ship.y + 14;
    }
  }
}

// =============================================
// SHIP MONITOR TUTORIAL
// =============================================

// True when Laika is inside the ship, standing in front of the monitor
function dogNearMonitor() {
  return currentScene === "inside" &&
         dog.x + dog.width > monitor.x &&
         dog.x < monitor.x + monitor.width &&
         dog.y <= INSIDE_FLOOR_TOP + 20;
}

function openTutorial() {
  state = "tutorial"; // updatePlay stops running, so Laika can't move
  tutorialTime = 0;
  tutorialPanel.classList.remove("hidden");
}

function closeTutorial() {
  state = "play";
  tutorialPanel.classList.add("hidden");
  tutorialClose.blur();
}

// ----- Picture instructions -----
// Each step is a small picture (96x48 pixels) that a dog can understand.
// The pictures play one after another and blink before changing.
const TUTORIAL_STEP_TIME = 2.2; // seconds each picture stays on screen

// Draws a rectangle on the tutorial canvas
function tRect(x, y, w, h, color) {
  tutorialCtx.fillStyle = color;
  tutorialCtx.fillRect(x, y, w, h);
}

function tArrow(x, y) {
  tRect(x, y + 2, 8, 2, "#ffd84d");
  tRect(x + 6, y, 2, 6, "#ffd84d");
  tRect(x + 8, y + 1, 1, 4, "#ffd84d");
  tRect(x + 9, y + 2, 1, 2, "#ffd84d");
}

// Laika facing right. suit = true draws her in a white space suit.
function tDog(x, y, suit) {
  tRect(x, y + 3, 2, 1, "#8b4a1f");                          // tail
  tRect(x + 2, y + 3, 16, 4, suit ? "#e0e0e0" : "#8b4a1f");  // body
  if (suit) tRect(x + 9, y + 3, 2, 4, "#ff6fd8");            // suit stripe
  tRect(x + 16, y, 6, 4, "#8b4a1f");                         // head
  tRect(x + 16, y, 2, 4, "#5c2e10");                         // ear
  tRect(x + 20, y + 1, 1, 1, "#000000");                     // eye
  tRect(x + 21, y + 2, 1, 1, "#000000");                     // nose
  tRect(x + 3, y + 7, 2, 2, "#5c2e10");                      // legs
  tRect(x + 14, y + 7, 2, 2, "#5c2e10");
}

function tDoor(x, y) {
  tRect(x, y, 14, 22, "#6b7380");
  tRect(x + 2, y + 2, 10, 20, "#1c1f26");
  tRect(x + 6, y - 4, 3, 3, "#5fd39a");
}

function tTank(x, y) {
  tRect(x + 2, y, 4, 2, "#d6dce4");  // valve
  tRect(x, y + 2, 8, 14, "#3fa7ff"); // tank
  tRect(x + 1, y + 3, 2, 10, "#9fd3ff");
  tRect(x, y + 8, 8, 2, "#ffffff");  // white band
}

function tAstronaut(x, y) {
  tRect(x, y, 10, 8, "#e0e0e0");          // helmet
  tRect(x + 2, y + 2, 4, 4, "#ffb347");   // visor
  tRect(x + 10, y + 1, 34, 7, "#f2f2f2"); // suit
  tRect(x + 20, y + 1, 2, 7, "#ff6fd8");  // stripe
  tRect(x + 44, y, 5, 8, "#9aa3ad");      // boots
}

function tDevice(x, y, time) {
  tRect(x + 6, y, 1, 6, "#8a919c");       // antenna
  tRect(x + 5, y, 3, 1, "#d6dce4");
  tRect(x, y + 6, 12, 8, "#4c566a");      // box
  tRect(x + 2, y + 8, 5, 3, "#5fd39a");   // screen
  const blinkOn = Math.floor(time * 3) % 2 === 0;
  tRect(x + 9, y + 8, 2, 2, blinkOn ? "#ff3b3b" : "#5a1111");
}

function tTreat(x, y) {
  // A bone-shaped dog treat (20x8)
  const color = "#f2d3a0";
  tRect(x, y, 4, 3, color);
  tRect(x, y + 5, 4, 3, color);
  tRect(x + 1, y + 2, 3, 4, color);
  tRect(x + 3, y + 2, 14, 4, color);
  tRect(x + 16, y, 4, 3, color);
  tRect(x + 16, y + 5, 4, 3, color);
  tRect(x + 16, y + 2, 3, 4, color);
}

function tSparkle(x, y, time) {
  if (Math.floor(time * 4) % 2 === 0) {
    tRect(x, y - 1, 1, 3, "#ffffff");
    tRect(x - 1, y, 3, 1, "#ffffff");
  }
}

function tOutsideBackground() {
  tRect(0, 0, 96, 39, "#2e1457");
  tRect(0, 39, 96, 9, "#2f6b4f");
  tRect(0, 39, 96, 1, "#5fd39a");
  tRect(80, 5, 6, 6, "#f2a65a"); // moon
  tRect(12, 6, 1, 1, "#ffffff");
  tRect(40, 12, 1, 1, "#ffffff");
}

// The steps, in order. Edit the captions or pictures here.
const TUTORIAL_STEPS = [
  {
    caption: "Go to the other room in the ship",
    draw: function (time) {
      tDog(10, 30);
      tArrow(38, 32);
      tDoor(58, 17);
    }
  },
  {
    caption: "Find the oxygen tank",
    draw: function (time) {
      tDog(18, 30);
      tTank(58, 23);
      tSparkle(70, 22, time);
      tSparkle(55, 30, time + 0.25);
    }
  },
  {
    caption: "Bring the oxygen back to your human",
    draw: function (time) {
      tDog(2, 30);
      tRect(7, 27, 10, 4, "#3fa7ff"); // tank carried on her back
      tArrow(28, 32);
      tAstronaut(42, 31);
    }
  },
  {
    caption: "Go outside the ship",
    draw: function (time) {
      tDog(10, 30);
      tArrow(38, 32);
      tRect(58, 17, 26, 22, "#2e1457"); // little picture of outside
      tRect(58, 33, 26, 6, "#2f6b4f");
      tRect(74, 20, 5, 5, "#f2a65a");
    }
  },
  {
    caption: "Find the lost communication device",
    draw: function (time) {
      tOutsideBackground();
      tDog(14, 30);
      tDevice(60, 25, time);
      tSparkle(76, 26, time);
    }
  },
  {
    caption: "Attach it to your space suit",
    draw: function (time) {
      tDog(36, 30, true);
      tRect(42, 26, 6, 4, "#4c566a"); // device on her back
      tRect(44, 22, 1, 4, "#8a919c"); // its antenna
      tSparkle(32, 24, time);
      tSparkle(62, 26, time + 0.25);
    }
  },
  {
    caption: "Get a Treat!",
    draw: function (time) {
      // Draw the treat twice as big
      tutorialCtx.save();
      tutorialCtx.translate(24, 12);
      tutorialCtx.scale(2, 2);
      tTreat(0, 0);
      tutorialCtx.restore();
      tutorialCtx.font = "bold 10px 'Courier New', monospace";
      tutorialCtx.textAlign = "center";
      tutorialCtx.fillStyle = "#ffd84d";
      tutorialCtx.fillText("+1", 78, 24);
      tSparkle(20, 10, time);
      tSparkle(68, 34, time + 0.25);
    }
  }
];

function drawTutorialPictures(time) {
  const stepIndex = Math.floor(tutorialTime / TUTORIAL_STEP_TIME) % TUTORIAL_STEPS.length;
  const stepTime = tutorialTime % TUTORIAL_STEP_TIME;
  const step = TUTORIAL_STEPS[stepIndex];

  // Dark monitor screen with a floor line
  tRect(0, 0, 96, 48, "#111418");
  tRect(0, 39, 96, 1, "#3b4252");

  // The picture stays on, then blinks just before the next one
  const blinkingOut = stepTime > TUTORIAL_STEP_TIME - 0.6;
  if (!blinkingOut || Math.floor(stepTime * 8) % 2 === 0) {
    step.draw(time);
  }

  // Progress dots along the top
  for (let i = 0; i < TUTORIAL_STEPS.length; i++) {
    tRect(30 + i * 6, 2, 3, 3, i === stepIndex ? "#ffd84d" : "#3b4252");
  }

  const caption = "Step " + (stepIndex + 1) + " of " + TUTORIAL_STEPS.length + ": " + step.caption;
  if (tutorialCaption.textContent !== caption) {
    tutorialCaption.textContent = caption;
  }
}

// "Press E" hint above the monitor when Laika is close enough
function drawMonitorPrompt(time) {
  if (state === "play" && dogNearMonitor()) {
    const bob = Math.sin(time * 5) * 1.5;
    label("Press E", monitor.x + monitor.width / 2, 55 + bob, "#ffd84d");
  }
}

// Treat counter in the top-right corner during gameplay
function drawTreatCounter() {
  const x = 282;
  const y = 6;
  rect(x, y, 3, 2, "#f2d3a0");
  rect(x, y + 3, 3, 2, "#f2d3a0");
  rect(x + 2, y + 1, 8, 3, "#f2d3a0");
  rect(x + 9, y, 3, 2, "#f2d3a0");
  rect(x + 9, y + 3, 3, 2, "#f2d3a0");
  label("x " + treats, x + 24, y + 5, "#f2d3a0");
}

// Only the current state gets updated, so Laika can't move
// on the title screen, the menu, during the cutscene, or in the tutorial.
function update(deltaTime) {
  if (state === "cutscene") {
    updateCutscene(deltaTime);
  } else if (state === "play") {
    updatePlay(deltaTime);
  } else if (state === "tutorial") {
    tutorialTime += deltaTime;
  }
}

// =============================================
// DRAWING HELPERS
// =============================================

// Draws a rectangle with whole-number positions so pixels stay sharp
function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function circle(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawShadow(x, y, width) {
  rect(x, y - 1, width, 2, "rgba(0,0,0,0.3)");
}

// Small text drawn on the canvas (used for labels)
function label(text, x, y, color) {
  ctx.font = "bold 6px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.fillText(text, x + 1, y + 1); // shadow
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// Blend between a and b. amount 0 = a, 1 = b
function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

// =============================================
// SPACE (title screen and the start of the cutscene)
// =============================================

// Black space with stars scrolling to the left at "speed" pixels per second
function drawSpace(time, speed) {
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "#0b0620");
  for (const star of stars) {
    const x = ((star.x - time * speed * star.speed) % GAME_WIDTH + GAME_WIDTH) % GAME_WIDTH;
    const color = star.speed > 1 ? "#ffffff" : "#8877aa";
    // Fast stars look like streaks
    const length = speed > 40 && star.speed > 1 ? 3 : 1;
    rect(x, star.y, length, 1, color);
  }
}

// The alien planet seen from space
function drawPlanet(x, y, radius) {
  circle(x, y, radius + 3, "rgba(157,245,196,0.25)"); // glowing atmosphere
  circle(x, y, radius, "#4b2178");
  circle(x - radius * 0.3, y - radius * 0.3, radius * 0.25, "#3a1960");
  circle(x + radius * 0.35, y + radius * 0.1, radius * 0.18, "#2f6b4f");
}

// The ship while it is still flying. (x, y) is its center.
// angle tilts it (0 = flat). onFire adds a trail of flames.
function drawFlyingShip(x, y, angle, time, onFire) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(angle);

  // Engine flame (flickers)
  const flicker = Math.floor(time * 12) % 2;
  rect(-26 - flicker * 3, -3, 6 + flicker * 3, 6, "#ffb347");
  rect(-23, -2, 3, 4, "#fff3b0");

  // Fire trail when the ship is falling
  if (onFire) {
    const fireColors = ["#ff3b3b", "#ffb347", "#ffd84d"];
    for (let i = 0; i < 6; i++) {
      const offset = (time * 40 + i * 7) % 40;
      rect(-10 - offset, -9 + (i % 3) * 3, 5, 5, fireColors[i % 3]);
    }
  }

  // Body
  rect(-20, -6, 36, 12, "#b8c0cc");
  rect(-12, -10, 20, 5, "#d6dce4"); // cabin
  rect(16, -4, 6, 8, "#d6dce4");    // nose
  rect(22, -2, 3, 4, "#d6dce4");
  rect(0, -9, 6, 3, "#3fa7ff");     // window
  rect(-20, -10, 6, 4, "#8a919c");  // top fin
  rect(-20, 6, 6, 4, "#8a919c");    // bottom fin

  ctx.restore();
}

function drawTitleBackground(time) {
  drawSpace(time, 8);
  drawPlanet(260, 190, 90);
  drawFlyingShip(80, 60 + Math.sin(time * 2) * 3, 0, time, false);
}

// =============================================
// OUTSIDE SCENE (alien planet)
// =============================================

function drawSky(time) {
  // Purple alien sky in three bands
  rect(0, 0, GAME_WIDTH, 50, "#1a0b33");
  rect(0, 50, GAME_WIDTH, 40, "#2e1457");
  rect(0, 90, GAME_WIDTH, GROUND_TOP - 90, "#4b2178");

  // Twinkling stars (only high up in the sky)
  for (const star of stars) {
    if (star.y < GROUND_TOP - 40) {
      const bright = Math.sin(time * 2 + star.twinkle) > 0;
      rect(star.x, star.y, 1, 1, bright ? "#ffffff" : "#8877aa");
    }
  }

  // Two alien moons
  circle(250, 30, 14, "#f2a65a");
  circle(285, 55, 6, "#7fe0d0");
}

function drawMountains() {
  // Simple pointy hills on the horizon
  ctx.fillStyle = "#3a1960";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_TOP);
  ctx.lineTo(40, 95);
  ctx.lineTo(80, GROUND_TOP);
  ctx.lineTo(130, 85);
  ctx.lineTo(190, GROUND_TOP);
  ctx.lineTo(240, 100);
  ctx.lineTo(290, GROUND_TOP);
  ctx.lineTo(320, 105);
  ctx.lineTo(320, GROUND_TOP);
  ctx.closePath();
  ctx.fill();
}

function drawGround() {
  // Alien ground with a lighter top edge
  rect(0, GROUND_TOP, GAME_WIDTH, GAME_HEIGHT - GROUND_TOP, "#2f6b4f");
  rect(0, GROUND_TOP, GAME_WIDTH, 3, "#5fd39a");

  // A few rocks and glowing alien plants for decoration
  rect(200, 150, 8, 4, "#1f4a37");
  rect(270, 165, 10, 5, "#1f4a37");
  rect(60, 168, 6, 3, "#1f4a37");

  rect(230, 124, 2, 8, "#9df5c4");
  rect(228, 122, 6, 3, "#ff6fd8");
  rect(300, 126, 2, 6, "#9df5c4");
  rect(298, 124, 6, 3, "#ffd84d");
}

function drawOutsideBackground(time) {
  drawSky(time);
  drawMountains();
  drawGround();
}

// The ship after it has crashed
function drawShip(time) {
  const left = ship.x;
  const top = ship.y - ship.height;

  // Body
  rect(left, top + 10, ship.width, ship.height - 10, "#b8c0cc");
  rect(left + 10, top, ship.width - 25, 12, "#d6dce4");
  // Window
  rect(left + 18, top + 3, 10, 6, "#3fa7ff");
  // Broken fin
  rect(left + ship.width - 8, top + 4, 10, 6, "#8a919c");
  // Scorch marks
  rect(left + 28, top + 18, 12, 3, "#555b66");
  rect(left + 12, top + 24, 8, 2, "#555b66");

  // Entrance: an open hatch with a frame
  rect(shipDoor.x - 1, top + 15, shipDoor.width + 2, 15, "#6b7380");
  rect(shipDoor.x, top + 16, shipDoor.width, 14, "#1c1f26");
  // Little ramp in front of the door
  rect(shipDoor.x - 1, ship.y, shipDoor.width + 2, 2, "#8a919c");

  // Blinking red warning light (life support is offline)
  const blinkOn = Math.floor(time * 2) % 2 === 0;
  rect(left + 5, top + 12, 3, 3, blinkOn ? "#ff3b3b" : "#5a1111");

  // Smoke puffs rising from the damage
  for (let i = 0; i < 3; i++) {
    const rise = (time * 10 + i * 8) % 24;
    rect(left + 50 + i * 2, top + 8 - rise, 3, 3, "rgba(200,200,200,0.5)");
  }
}

function drawOutside(time) {
  drawOutsideBackground(time);

  drawShadow(ship.x, ship.y, ship.width);
  drawShadow(dog.x, dog.y, dog.width);

  // Whoever is lower on the screen is drawn last, so they appear in front
  if (dog.y < ship.y) {
    drawDog(time);
    drawShip(time);
  } else {
    drawShip(time);
    drawDog(time);
  }
}

// =============================================
// INSIDE SCENE (inside the ship)
// =============================================

function drawInsideRoom(time) {
  // Back wall with panel lines
  rect(0, 0, GAME_WIDTH, INSIDE_FLOOR_TOP, "#3b4252");
  for (let x = 0; x < GAME_WIDTH; x += 40) {
    rect(x, 0, 1, INSIDE_FLOOR_TOP, "#2e3440");
  }
  rect(0, 20, GAME_WIDTH, 1, "#2e3440");

  // Windows looking out at space
  for (const windowX of [90, 270]) {
    rect(windowX, 35, 24, 18, "#6b7380");
    rect(windowX + 2, 37, 20, 14, "#1a0b33");
    rect(windowX + 6, 40, 1, 1, "#ffffff");
    rect(windowX + 15, 46, 1, 1, "#ffffff");
  }

  // Control console with blinking lights (life support offline)
  rect(130, 60, 80, 50, "#4c566a");
  rect(134, 64, 72, 22, "#111418");
  const blinkOn = Math.floor(time * 2) % 2 === 0;
  rect(138, 68, 4, 4, blinkOn ? "#ff3b3b" : "#5a1111");
  rect(146, 68, 4, 4, "#5a1111");
  rect(154, 68, 4, 4, blinkOn ? "#5a1111" : "#ff3b3b");
  // Empty oxygen gauge
  rect(138, 78, 40, 4, "#2e3440");
  rect(138, 78, 3, 4, "#ff3b3b");
  // Buttons
  rect(140, 92, 6, 4, "#ffd84d");
  rect(152, 92, 6, 4, "#3fa7ff");
  rect(164, 92, 6, 4, "#9df5c4");

  // Exit door on the back wall
  rect(exitDoor.x - 2, INSIDE_FLOOR_TOP - 34, exitDoor.width + 4, 34, "#6b7380");
  rect(exitDoor.x, INSIDE_FLOOR_TOP - 32, exitDoor.width, 32, "#1c1f26");
  rect(exitDoor.x + exitDoor.width / 2 - 1, INSIDE_FLOOR_TOP - 40, 3, 3, "#5fd39a"); // green "exit" light

  // Metal floor with grating lines
  rect(0, INSIDE_FLOOR_TOP, GAME_WIDTH, GAME_HEIGHT - INSIDE_FLOOR_TOP, "#5b6375");
  rect(0, INSIDE_FLOOR_TOP, GAME_WIDTH, 2, "#7b8496");
  for (let y = INSIDE_FLOOR_TOP + 12; y < GAME_HEIGHT; y += 14) {
    rect(0, y, GAME_WIDTH, 1, "#4c5466");
  }
}

function drawCot(time) {
  const top = cot.y - 16;

  // Legs and mattress
  rect(cot.x + 2, top + 8, 3, 8, "#2e3440");
  rect(cot.x + cot.width - 5, top + 8, 3, 8, "#2e3440");
  rect(cot.x, top + 4, cot.width, 5, "#8a919c");
  rect(cot.x, top + 2, cot.width, 3, "#d8dee9");

  drawAstronaut();

  // Heart monitor next to the cot: a blip moves across a small screen
  const monitorX = cot.x + cot.width + 6;
  rect(monitorX + 6, top - 4, 2, 20, "#2e3440"); // stand
  rect(monitorX, top - 18, 16, 12, "#111418");
  rect(monitorX + 1, top - 12, 14, 1, "#1f5a3a");
  const blipX = Math.floor(time * 10) % 14;
  rect(monitorX + 1 + blipX, top - 14, 1, 3, "#5fd39a");

  // Label so it's clear she can't move
  label("UNCONSCIOUS", cot.x + 30, top - 10, "#ff8a8a");
}

function drawAstronaut() {
  // PLACEHOLDER: replace with your team's astronaut sprite later.
  // She is lying on the cot, unconscious, and never moves.
  const left = cot.x + 8;
  const top = cot.y - 22;

  rect(left, top, 10, 8, "#e0e0e0");          // helmet
  rect(left + 2, top + 2, 4, 4, "#ffb347");   // visor
  rect(left + 10, top + 1, 34, 7, "#f2f2f2"); // suit body and legs
  rect(left + 20, top + 1, 2, 7, "#ff6fd8");  // pink stripe
  rect(left + 44, top, 5, 8, "#9aa3ad");      // boots
}

function drawInside(time) {
  drawInsideRoom(time);

  drawShadow(cot.x, cot.y, cot.width);
  drawShadow(dog.x, dog.y, dog.width);

  // Whoever is lower on the screen is drawn last, so they appear in front
  if (dog.y < cot.y) {
    drawDog(time);
    drawCot(time);
  } else {
    drawCot(time);
    drawDog(time);
  }
}

// =============================================
// LAIKA
// =============================================

function drawDog(time) {
  // PLACEHOLDER: replace with your team's dachshund sprite later
  const top = dog.y - dog.height;

  // The body is drawn facing right. When she faces left we flip it.
  // "part" converts a position measured from her back end into a screen x.
  function part(fromBack, w) {
    if (dog.facing === 1) {
      return dog.x + fromBack;
    }
    return dog.x + dog.width - fromBack - w;
  }

  const wag = Math.floor(time * 6) % 2;
  const walking = state === "play" &&
    (keys["a"] || keys["d"] || keys["w"] || keys["s"] ||
     keys["arrowleft"] || keys["arrowright"] || keys["arrowup"] || keys["arrowdown"]);
  const step = walking ? Math.floor(time * 8) % 2 : 0;

  rect(part(0, 2), top + 3 + wag, 2, 1, "#8b4a1f");    // tail
  rect(part(2, 16), top + 3, 16, 4, "#8b4a1f");        // long body
  rect(part(16, 6), top, 6, 4, "#8b4a1f");             // head
  rect(part(20, 1), top + 1, 1, 1, "#000000");         // eye
  rect(part(16, 2), top, 2, 4, "#5c2e10");             // ear
  rect(part(21, 1), top + 2, 1, 1, "#000000");         // nose
  rect(part(3 + step, 2), top + 7, 2, 2, "#5c2e10");   // back legs
  rect(part(14 - step, 2), top + 7, 2, 2, "#5c2e10");  // front legs
}

// A bouncing "YOU" marker above Laika for the first seconds of gameplay
function drawPlayerMarker(time) {
  if (playTime > 6) {
    return;
  }
  const x = dog.x + dog.width / 2;
  const y = dog.y - dog.height - 6 + Math.sin(time * 6) * 1.5;
  rect(x - 2, y, 5, 1, "#ffd84d");
  rect(x - 1, y + 1, 3, 1, "#ffd84d");
  rect(x, y + 2, 1, 1, "#ffd84d");
  label("YOU", x, y - 2, "#ffd84d");
}

// =============================================
// CUTSCENE DRAWING (one block per phase)
// =============================================

function drawCutscene(time) {
  const phase = cutscene.phase;
  const t = cutscene.phaseTime;

  // How much the screen shakes in this phase
  let shake = 0;
  if (phase === "shaking") shake = 1.5;
  if (phase === "descending") shake = 1;
  if (phase === "impact" && t > IMPACT_FLY_TIME) {
    shake = Math.max(0, 4 * (1 - (t - IMPACT_FLY_TIME))); // big shake that dies down
  }

  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "#000000");
  ctx.save();
  ctx.translate(Math.round((Math.random() - 0.5) * 2 * shake), Math.round((Math.random() - 0.5) * 2 * shake));

  if (phase === "space") {
    // Flying calmly through space
    drawSpace(time, 60);
    drawPlanet(290, 150, 20);
    drawFlyingShip(120, 80 + Math.sin(time * 2) * 2, 0, time, false);

  } else if (phase === "shaking") {
    // Something goes wrong: ship wobbles, sparks fly
    drawSpace(time, 60);
    drawPlanet(290, 150, 24);
    drawFlyingShip(120, 80, Math.sin(time * 20) * 0.08, time, false);
    for (let i = 0; i < 4; i++) {
      rect(110 + Math.random() * 30, 72 + Math.random() * 16, 1, 1, "#ffd84d");
    }

  } else if (phase === "descending") {
    // Falling toward the planet, which gets bigger and bigger
    const fall = Math.min(t, 8); // stop growing after 8 seconds
    drawSpace(time, 80);
    drawPlanet(230, 210, 40 + fall * 18);
    drawFlyingShip(110 + fall * 4, 60 + fall * 3, 0.45, time, true);

  } else if (phase === "impact") {
    // On the planet surface: the ship falls from the sky and hits the ground
    drawOutsideBackground(time);
    if (t < IMPACT_FLY_TIME) {
      const amount = t / IMPACT_FLY_TIME;
      const x = lerp(-30, ship.x + 35, amount);
      const y = lerp(-10, ship.y - 15, amount);
      drawFlyingShip(x, y, 0.5, time, true);
    } else {
      drawShadow(ship.x, ship.y, ship.width);
      drawShip(time);
      // Dust clouds spreading out from the crash
      const dust = t - IMPACT_FLY_TIME;
      for (let i = 0; i < 6; i++) {
        const spread = Math.min(dust, 2) * 20;
        const alpha = Math.max(0, 0.6 - dust * 0.25);
        const side = i % 2 === 0 ? -1 : 1;
        rect(ship.x + 35 + side * (spread + i * 4), ship.y - 4 - i, 6, 4, "rgba(200,190,170," + alpha + ")");
      }
    }

  } else if (phase === "blackout") {
    // The crashed ship, slowly fading to black
    drawOutsideBackground(time);
    drawShadow(ship.x, ship.y, ship.width);
    drawShip(time);
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "rgba(0,0,0," + Math.min(t / 1.5, 0.95) + ")");

  } else if (phase === "laika") {
    // Fade back in: Laika has climbed out of the hatch
    drawOutside(time);
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "rgba(0,0,0," + Math.max(0, 0.95 - t) + ")");

  } else if (phase === "inside") {
    // Inside the ship: Laika next to the unconscious astronaut
    drawInside(time);
  }

  ctx.restore();

  // White flash at the moment of impact (drawn without the shake)
  if (phase === "impact" && t > IMPACT_FLY_TIME) {
    const flash = Math.max(0, 1 - (t - IMPACT_FLY_TIME) / 0.6);
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "rgba(255,255,255," + flash + ")");
  }

  // Red alarm light flashing while things go wrong
  if (phase === "shaking" || phase === "descending") {
    if (Math.floor(time * 3) % 2 === 0) {
      rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "rgba(255,0,0,0.15)");
    }
  }
}

// =============================================
// DRAW EVERYTHING
// =============================================

function draw(time) {
  if (state === "title" || state === "menu") {
    drawTitleBackground(time);
  } else if (state === "cutscene") {
    drawCutscene(time);
  } else {
    // "play" or "tutorial": the tutorial panel sits on top of the game
    if (currentScene === "outside") {
      drawOutside(time);
    } else {
      drawInside(time);
      drawMonitorPrompt(time);
    }
    drawPlayerMarker(time);
    drawTreatCounter();

    if (state === "tutorial") {
      drawTutorialPictures(time);
    }
  }

  // Black fade on top of everything (for transitions)
  if (screenFade > 0) {
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "rgba(0,0,0," + screenFade + ")");
  }
}

// ----- Game loop -----
let lastTime = performance.now();

function gameLoop(now) {
  // deltaTime = seconds since the last frame (capped to avoid big jumps)
  const deltaTime = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  update(deltaTime);
  draw(now / 1000);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
