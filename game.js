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

// ----- Images (from the assets folder) -----
// Anything without an image here is still drawn with placeholder shapes.
// If an image is missing, the game keeps its placeholder and prints a
// warning in the browser console (F12).
function loadImage(path) {
  const image = new Image();
  image.onerror = function () {
    console.warn("Missing asset: " + path + " (using placeholder instead)");
  };
  image.src = path;
  return image;
}

// True once an image has loaded successfully
function imageReady(image) {
  return image.complete && image.naturalWidth > 0;
}

const images = {
  spaceBackground: loadImage("assets/Space Background.png"),
  planetBackground: loadImage("assets/Planet Background.png"),
  planetGround: loadImage("assets/Planet ground.png"),
  spaceship: loadImage("assets/Spaceship.png"),
  oxygenTank: loadImage("assets/Oxygen tank.png"),
  laika: loadImage("assets/Laika.png")
};

// The part of "Oxygen tank.png" that has the tank in it (the rest is empty)
const OXYGEN_TANK_CROP = { x: 196, y: 88, width: 108, height: 324 };

// Trees on the planet. The tree images are drawn 8x bigger than their pixel
// art, so we draw them at 1/8 size (64 game pixels wide).
// baseY = how far down the image the trunk meets the ground (game pixels).
// x = left edge. They stand along the horizon, behind everything else.
const TREES = [
  { image: loadImage("assets/Blue tree 2.png"), x: -6, width: 64, height: 96, baseY: 83 },
  { image: loadImage("assets/Purple tree.png"), x: 112, width: 64, height: 64, baseY: 59 },
  { image: loadImage("assets/Blue tree.png"), x: 160, width: 64, height: 96, baseY: 88 },
  { image: loadImage("assets/Cool blue tree.png"), x: 208, width: 64, height: 96, baseY: 90 },
  { image: loadImage("assets/Purple tree 2.png"), x: 262, width: 64, height: 64, baseY: 59 }
];

// ----- Animated GIFs -----
// Browsers only keep a GIF animating when it is shown as a real <img>,
// not when it is drawn on a canvas. So each GIF is an <img> in index.html,
// placed on top of the canvas. Draw code calls showGif() to say where it
// goes this frame; updateGifImages() then moves the <img> into place.
// If a GIF is missing, the canvas draws a placeholder instead.
const gifs = {
  world: { element: document.getElementById("title-world"), path: "assets/Title screen World.gif", view: null },
  monitor: { element: document.getElementById("monitor-gif"), path: "assets/Monitor.gif", view: null }
};
for (const name in gifs) {
  const gif = gifs[name];
  gif.element.addEventListener("error", function () {
    console.warn("Missing asset: " + gif.path + " (using placeholder instead)");
  });
}

// Shows a GIF this frame at (x, y) with the given size, in game pixels.
// Returns false if the GIF isn't loaded, so the caller can draw a placeholder.
function showGif(gif, x, y, width, height) {
  if (!imageReady(gif.element)) {
    return false;
  }
  gif.view = { x: x, y: y, width: width, height: height };
  return true;
}

// Moves each GIF <img> to line up with the canvas (called every frame,
// so it also follows the window when it is resized)
function updateGifImages() {
  const canvasLeft = (window.innerWidth - canvas.width) / 2;
  const canvasTop = (window.innerHeight - canvas.height) / 2;
  for (const name in gifs) {
    const gif = gifs[name];
    if (!gif.view) {
      gif.element.classList.add("hidden");
      continue;
    }
    gif.element.classList.remove("hidden");
    gif.element.style.left = (canvasLeft + gif.view.x * scale) + "px";
    gif.element.style.top = (canvasTop + gif.view.y * scale) + "px";
    gif.element.style.width = (gif.view.width * scale) + "px";
    gif.element.style.height = (gif.view.height * scale) + "px";
    gif.element.style.opacity = 1 - screenFade; // fades with the screen
  }
}

// Shows the spinning planet (the planet they crash on) with its center at
// (x, y) and the given radius. Uses the placeholder planet if the GIF is missing.
function drawWorld(x, y, radius) {
  if (!showGif(gifs.world, x - radius, y - radius, radius * 2, radius * 2)) {
    drawPlanet(x, y, radius);
  }
}

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
tutorialCtx.imageSmoothingEnabled = false; // keep images sharp in the tutorial pictures
const tutorialCaption = document.getElementById("tutorial-caption");
const tutorialClose = document.getElementById("tutorial-close");
const objectivesPanel = document.getElementById("objectives");
const objectiveOxygen = document.getElementById("objective-oxygen");
const objectiveDevice = document.getElementById("objective-device");
const objectiveAttach = document.getElementById("objective-attach");
const objectiveHint = document.getElementById("objective-hint");
const treatCount = document.getElementById("treat-count");
const messageBox = document.getElementById("message");

// ----- Game state -----
let state = "title";        // always start on the title screen
let currentScene = "outside"; // during play: "outside", "inside" or "storage"
let messageTimer = 0;       // seconds left to show the pop-up message
let attachEffectTime = 0;   // seconds left of the "device attached" sparkles
let waitForUpRelease = false; // true right after using a door (see updatePlay)
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
  // "wait" = seconds before this line can be skipped (so the crash can be seen)
  { speaker: "Computer", text: "Critical systems failure.", phase: "impact", wait: 2.5 },
  { speaker: "Computer", text: "Warning. Communication device lost.", phase: "impact" },
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
const DEBRIS_FLY_TIME = 0.8; // seconds for debris to land after the crash
const DEVICE_FLY_TIME = 1.4; // seconds for the communication device to land

// Pieces of wreckage thrown from the ship. They fly out during the crash
// and stay on the ground for the rest of the game. (x, y) = where they land.
const CRASH_DEBRIS = [
  { x: 8, y: 140, width: 10, height: 4, color: "#6b7380" },
  { x: 15, y: 156, width: 7, height: 3, color: "#555b66" },
  { x: 110, y: 145, width: 8, height: 3, color: "#8a919c" },
  { x: 125, y: 161, width: 5, height: 4, color: "#b8c0cc" },
  { x: 150, y: 150, width: 10, height: 4, color: "#6b7380" },
  { x: 182, y: 170, width: 4, height: 3, color: "#b8c0cc" },
  { x: 215, y: 158, width: 9, height: 3, color: "#8a919c" },
  { x: 248, y: 169, width: 6, height: 4, color: "#555b66" },
  { x: 262, y: 150, width: 12, height: 3, color: "#6b7380" },
  { x: 296, y: 167, width: 6, height: 3, color: "#b8c0cc" }
];

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

  // E interacts with whatever Laika is next to. E or Escape closes the tutorial.
  if (!event.repeat) {
    if (state === "play" && key === "e") {
      const interaction = getInteraction();
      if (interaction) {
        interaction.action();
      }
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
  width: 26, // size of the Laika sprite on screen (nose to tail)
  height: 18,
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
  x: ship.x + 28, // on the belly of the crashed ship
  width: 10
};

// The exit door on the back wall (inside). Walk UP into it to go outside.
const exitDoor = {
  x: 30,
  width: 16
};

// The monitor on the back wall inside the ship
// (matches Monitor.gif drawn in drawInsideRoom: 64 pixels wide)
const monitor = {
  x: 116,
  width: 64
};

// The bed inside the ship where the astronaut lies unconscious
const cot = {
  x: 180,
  y: 140, // bottom of the cot legs
  width: 70
};

// Door on the main room's back wall (right side) that leads to the storage room
const storageDoor = {
  x: 296,
  width: 16
};

// Door on the storage room's back wall that leads back to the main room
const storageExit = {
  x: 30,
  width: 16
};

// Crates in the storage room. y = bottom of the crate.
const crates = [
  { x: 110, y: 150, width: 30, height: 22 },
  { x: 170, y: 128, width: 24, height: 18 },
  { x: 225, y: 165, width: 26, height: 16 }
];

// ----- Mission items -----
// Mission 1: the oxygen tank, hidden in the storage room
const oxygenTank = {
  scene: "storage",
  x: 270,  // center
  y: 140,  // bottom
  collected: false
};

// Mission 2: the communication device, thrown out of the ship during the crash.
// (x, y) is where it lands on the planet.
const commDevice = {
  scene: "outside",
  x: 282, // center
  y: 160, // bottom
  collected: false, // Laika picked it up
  attached: false   // attached to Laika at the ship
};

// "Solid" areas the dog can't walk through, one list per scene.
// These are the parts of objects that touch the floor (their "footprint").
const solids = {
  outside: [
    { x: ship.x, y: ship.y - 8, width: ship.width, height: 10 }
  ],
  inside: [
    { x: cot.x, y: cot.y - 8, width: cot.width, height: 10 },
    { x: cot.x + cot.width + 2, y: cot.y - 8, width: 12, height: 10 }, // heart monitor stand
    // The ship monitor: Laika stops in front of it (so her head doesn't go behind the GIF)
    { x: monitor.x, y: INSIDE_FLOOR_TOP, width: monitor.width, height: 17 }
  ],
  storage: []
};
for (const crate of crates) {
  solids.storage.push({ x: crate.x, y: crate.y - 8, width: crate.width, height: 10 });
}

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
  currentScene = "inside";
  dialogueBox.classList.add("hidden");
  controlsPanel.classList.remove("hidden");
  objectivesPanel.classList.remove("hidden");
  updateObjectives();

  // Laika starts inside the ship, next to the unconscious astronaut
  // (the same spot where the cutscene ends)
  dog.x = cot.x - 30;
  dog.y = cot.y + 8;
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
  if (cutscene.lineTime < (line.wait || MIN_LINE_TIME)) {
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

  // After going through a door, the player must let go of UP before
  // another door works. Otherwise holding W would bounce straight back.
  if (moveY >= 0) {
    waitForUpRelease = false;
  }

  // Doors: walking UP while lined up with a door changes the scene
  if (moveY < 0 && !waitForUpRelease) {
    const sceneBefore = currentScene;
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
    } else if (currentScene === "inside" && dogLinedUpWith(storageDoor) && dog.y <= minY + 1) {
      // Go into the storage room. Start just in front of its door.
      currentScene = "storage";
      dog.x = storageExit.x + storageExit.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    } else if (currentScene === "storage" && dogLinedUpWith(storageExit) && dog.y <= minY + 1) {
      // Back to the main room. Start just in front of the storage door.
      currentScene = "inside";
      dog.x = storageDoor.x + storageDoor.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    }

    if (currentScene !== sceneBefore) {
      waitForUpRelease = true;
    }
  }

  attachEffectTime = Math.max(0, attachEffectTime - deltaTime);
}

// =============================================
// MISSIONS (oxygen tank and communication device)
// =============================================

// True when Laika is standing next to an item in the same scene
function dogNear(item) {
  const dogMiddle = dog.x + dog.width / 2;
  return currentScene === item.scene &&
         Math.abs(dogMiddle - item.x) < 18 &&
         Math.abs(dog.y - item.y) < 10;
}

// True when Laika is outside, right next to the crashed ship
function dogAtShip() {
  return currentScene === "outside" &&
         dog.x + dog.width > ship.x - 10 &&
         dog.x < ship.x + ship.width + 10 &&
         dog.y <= ship.y + 24;
}

// Works out what pressing E would do right now.
// Returns { text, x, y, action } or null if there is nothing to do.
// Each item checks "collected"/"attached" so it can only happen once.
function getInteraction() {
  if (dogNearMonitor()) {
    return { text: "Press E: monitor", x: monitor.x + monitor.width / 2, y: 42, action: openTutorial };
  }
  if (!oxygenTank.collected && dogNear(oxygenTank)) {
    return { text: "Press E: take oxygen", x: oxygenTank.x, y: oxygenTank.y - 30, action: collectOxygen };
  }
  if (!commDevice.collected && dogNear(commDevice)) {
    return { text: "Press E: pick up device", x: commDevice.x, y: commDevice.y - 18, action: collectDevice };
  }
  if (commDevice.collected && !commDevice.attached && dogAtShip()) {
    return { text: "Press E: attach device", x: dog.x + dog.width / 2, y: dog.y - dog.height - 8, action: attachDevice };
  }
  return null;
}

function collectOxygen() {
  oxygenTank.collected = true;
  treats += 1;
  showMessage("Oxygen tank collected! +1 Treat");
  updateObjectives();
}

function collectDevice() {
  commDevice.collected = true;
  showMessage("Communication device recovered!");
  updateObjectives();
}

function attachDevice() {
  commDevice.attached = true;
  attachEffectTime = 1.5;
  treats += 1;
  showMessage("Device attached to Laika! +1 Treat");
  updateObjectives();
}

// Shows a pop-up message for a few seconds
function showMessage(text) {
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
  messageTimer = 2.5;
}

function updateMessage(deltaTime) {
  if (messageTimer > 0) {
    messageTimer -= deltaTime;
    if (messageTimer <= 0) {
      messageBox.classList.add("hidden");
    }
  }
}

// Writes one line of the objective tracker: [x] when done, [ ] when not
function setObjective(element, done, text) {
  element.textContent = (done ? "[x] " : "[ ] ") + text;
  if (done) {
    element.classList.add("done");
  } else {
    element.classList.remove("done");
  }
}

// Refreshes the objective tracker and shows a hint for the next step
function updateObjectives() {
  setObjective(objectiveOxygen, oxygenTank.collected, "Find the oxygen tank");
  setObjective(objectiveDevice, commDevice.collected, "Recover the communication device");
  setObjective(objectiveAttach, commDevice.attached, "Attach the device at the ship");

  let hint = "All items found! More coming soon...";
  if (!oxygenTank.collected) {
    hint = "Hint: look for the blue O2 sign on a door inside the ship.";
  } else if (!commDevice.collected) {
    hint = "Hint: follow the beeping signal outside, among the crash debris.";
  } else if (!commDevice.attached) {
    hint = "Hint: bring the device back to the ship and press E.";
  }
  objectiveHint.textContent = hint;
  treatCount.textContent = treats;
}

// =============================================
// SHIP MONITOR TUTORIAL
// =============================================

// True when Laika is inside the ship, standing in front of the monitor
function dogNearMonitor() {
  return currentScene === "inside" &&
         dog.x + dog.width > monitor.x &&
         dog.x < monitor.x + monitor.width &&
         dog.y <= INSIDE_FLOOR_TOP + 26;
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
  if (imageReady(images.laika)) {
    // Team artwork: Laika.png frame 1, flipped to face right (feet at y + 9)
    const frame = LAIKA_FRAMES[0];
    tutorialCtx.save();
    tutorialCtx.translate(x + 22, y - 6);
    tutorialCtx.scale(-1, 1);
    tutorialCtx.drawImage(images.laika, frame.x, frame.y, frame.width, frame.height, 0, 0, 22, 15);
    tutorialCtx.restore();
    return;
  }
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
  if (drawOxygenImage(tutorialCtx, x + 1, y - 2, 6, 18)) {
    return; // team artwork
  }
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
      tRect(44, 33, 3, 3, "#4c566a"); // small device on her side
      tRect(45, 31, 1, 2, "#8a919c"); // its antenna
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

// "Press E: ..." hint when Laika is close enough to something
function drawInteractionPrompt(time) {
  if (state !== "play") {
    return;
  }
  const interaction = getInteraction();
  if (interaction) {
    const bob = Math.sin(time * 5) * 1.5;
    const x = clamp(interaction.x, 45, GAME_WIDTH - 45); // keep text on screen
    label(interaction.text, x, interaction.y + bob, "#ffd84d");
  }
}

// Sparkles around Laika right after the device is attached
function drawAttachEffect(time) {
  if (attachEffectTime <= 0) {
    return;
  }
  const centerX = dog.x + dog.width / 2;
  const centerY = dog.y - dog.height / 2;
  const radius = 6 + (1.5 - attachEffectTime) * 10;
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4 + time * 3;
    rect(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius * 0.6, 2, 2,
         i % 2 === 0 ? "#ffd84d" : "#5fd39a");
  }
}

// Only the current state gets updated, so Laika can't move
// on the title screen, the menu, during the cutscene, or in the tutorial.
function update(deltaTime) {
  updateMessage(deltaTime);

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

// Draws an image side by side across the screen, scrolled left by "offset".
// Every second copy is flipped, so the edges always match up with no seams.
function drawScrollingImage(image, offset) {
  const w = image.naturalWidth;
  const y = Math.round((GAME_HEIGHT - image.naturalHeight) / 2); // center it vertically
  let x = -(Math.floor(offset) % (w * 2));
  let flipped = false;
  while (x < GAME_WIDTH) {
    if (flipped) {
      ctx.save();
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(image, x, y);
    }
    x += w;
    flipped = !flipped;
  }
}

// Space with stars scrolling to the left at "speed" pixels per second
function drawSpace(time, speed) {
  if (imageReady(images.spaceBackground)) {
    // Team artwork: Space Background.png, drifting slowly behind everything
    drawScrollingImage(images.spaceBackground, time * speed * 0.25);
    if (speed <= 40) {
      return; // the image already has stars, so only add streaks when flying fast
    }
  } else {
    // Placeholder if the image is missing
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "#0b0620");
  }
  for (const star of stars) {
    const x = ((star.x - time * speed * star.speed) % GAME_WIDTH + GAME_WIDTH) % GAME_WIDTH;
    const color = star.speed > 1 ? "#ffffff" : "#8877aa";
    // Fast stars look like streaks
    const length = speed > 40 && star.speed > 1 ? 3 : 1;
    if (imageReady(images.spaceBackground) && star.speed <= 1) {
      continue; // over the image, only draw the fast streaks
    }
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
// size = how big to draw it (1 = normal, bigger when seen close up)
function drawFlyingShip(x, y, angle, time, onFire, size) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(angle);
  if (size) {
    ctx.scale(size, size);
  }

  // Engine flame (flickers)
  const flicker = Math.floor(time * 12) % 2;
  rect(-24 - flicker * 3, -3, 6 + flicker * 3, 6, "#ffb347");
  rect(-21, -2, 3, 4, "#fff3b0");

  // Fire trail when the ship is falling
  if (onFire) {
    const fireColors = ["#ff3b3b", "#ffb347", "#ffd84d"];
    for (let i = 0; i < 6; i++) {
      const offset = (time * 40 + i * 7) % 40;
      rect(-10 - offset, -9 + (i % 3) * 3, 5, 5, fireColors[i % 3]);
    }
  }

  if (imageReady(images.spaceship)) {
    // Team artwork: Spaceship.png points up, so turn it a quarter turn
    // to point right (the way the ship flies)
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(images.spaceship, -18, -18, 36, 37);
  } else {
    // Placeholder body
    rect(-20, -6, 36, 12, "#b8c0cc");
    rect(-12, -10, 20, 5, "#d6dce4"); // cabin
    rect(16, -4, 6, 8, "#d6dce4");    // nose
    rect(22, -2, 3, 4, "#d6dce4");
    rect(0, -9, 6, 3, "#3fa7ff");     // window
    rect(-20, -10, 6, 4, "#8a919c");  // top fin
    rect(-20, 6, 6, 4, "#8a919c");    // bottom fin
  }

  ctx.restore();
}

function drawTitleBackground(time) {
  drawSpace(time, 8);
  drawWorld(260, 125, 50);
  drawFlyingShip(45, 60 + Math.sin(time * 2) * 3, 0, time, false);
}

// =============================================
// OUTSIDE SCENE (alien planet)
// =============================================

function drawSky(time) {
  if (imageReady(images.planetBackground)) {
    // Team artwork: Planet Background.png, stretched to the full width
    // and centered on the sky. The hills and ground cover the bottom of it.
    const image = images.planetBackground;
    const size = GAME_WIDTH / image.naturalWidth;
    const height = image.naturalHeight * size;
    ctx.drawImage(image, 0, Math.round((GROUND_TOP - height) / 2), GAME_WIDTH, height);
    return;
  }

  // Placeholder if the image is missing: purple alien sky in three bands
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
  if (imageReady(images.planetGround)) {
    // Team artwork: a strip of Planet ground.png stretched across the ground
    ctx.drawImage(images.planetGround, 0, 150, 1024, 160,
                  0, GROUND_TOP, GAME_WIDTH, GAME_HEIGHT - GROUND_TOP);
    rect(0, GROUND_TOP, GAME_WIDTH, 1, "rgba(255,255,255,0.25)"); // soft top edge
  } else {
    // Placeholder: alien ground with a lighter top edge
    rect(0, GROUND_TOP, GAME_WIDTH, GAME_HEIGHT - GROUND_TOP, "#2f6b4f");
    rect(0, GROUND_TOP, GAME_WIDTH, 3, "#5fd39a");
  }

  // A few rocks and glowing alien plants for decoration
  rect(200, 150, 8, 4, "#1f4a37");
  rect(270, 165, 10, 5, "#1f4a37");
  rect(60, 168, 6, 3, "#1f4a37");

  rect(230, 124, 2, 8, "#9df5c4");
  rect(228, 122, 6, 3, "#ff6fd8");
  rect(300, 126, 2, 6, "#9df5c4");
  rect(298, 124, 6, 3, "#ffd84d");
}

// The tree images have a solid black background instead of a transparent
// one. "lighten" keeps whichever is brighter, the tree or what's behind it,
// so the black background disappears. (If the trees get re-exported with
// transparent backgrounds, this line can be removed.)
function drawTrees() {
  ctx.save();
  ctx.globalCompositeOperation = "lighten";
  for (const tree of TREES) {
    if (imageReady(tree.image)) {
      ctx.drawImage(tree.image, tree.x, GROUND_TOP + 2 - tree.baseY, tree.width, tree.height);
    }
  }
  ctx.restore();
}

function drawOutsideBackground(time) {
  drawSky(time);
  drawMountains();
  drawTrees(); // drawn before the ground, so the ground hides the bottom of each image
  drawGround();
}

// Where Spaceship.png is drawn after the crash: center (x, y) and the size
// of the image before it is turned on its side. Its bottom touches the ground.
const CRASHED_SHIP = { x: ship.x + 35, y: ship.y - 29, width: 58, height: 60 };

// The open hatch built into the side of the ship, with a ramp down to the ground
function drawShipHatch(time) {
  const x = shipDoor.x;
  const w = shipDoor.width;
  const doorTop = ship.y - 22;
  const doorBottom = ship.y - 6;

  rect(x - 2, doorTop - 2, w + 4, doorBottom - doorTop + 2, "#4c566a");  // hull frame
  rect(x - 1, doorTop - 1, w + 2, doorBottom - doorTop + 1, "#9aa3ad");  // frame edge
  rect(x, doorTop, w, doorBottom - doorTop, "#1c1f26");                  // open doorway
  rect(x + 1, doorTop + 1, w - 2, 2, "#3b4252");                         // rounded top
  rect(x + 2, doorBottom - 3, w - 4, 3, "#ffb347");                      // warm light inside

  // Orange-and-gray striped ramp from the door down to the ground
  for (let i = 0; i < 3; i++) {
    const rampY = doorBottom + i * 2;
    rect(x - 1 - i, rampY, w + 2 + i * 2, 2, i % 2 === 0 ? "#ff9a1f" : "#8a919c");
  }

  // Blinking red warning light above the hatch (life support is offline)
  const lightOn = Math.floor(time * 2) % 2 === 0;
  rect(x + w / 2 - 1, doorTop - 5, 3, 2, lightOn ? "#ff3b3b" : "#5a1111");
}

// The ship after it has crashed
function drawShip(time) {
  const left = ship.x;
  const top = ship.y - ship.height;

  if (imageReady(images.spaceship)) {
    // Team artwork: Spaceship.png, lying level on its belly, nose to the right
    // (the same way it was flying when it came down)
    ctx.save();
    ctx.translate(CRASHED_SHIP.x, CRASHED_SHIP.y);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(images.spaceship, -CRASHED_SHIP.width / 2, -CRASHED_SHIP.height / 2,
                  CRASHED_SHIP.width, CRASHED_SHIP.height);
    ctx.restore();

    drawShipHatch(time);

    // Smoke rising from the top of the ship
    for (let i = 0; i < 3; i++) {
      const rise = (time * 10 + i * 8) % 24;
      rect(left + 40 + i * 2, ship.y - 52 - rise, 3, 3, "rgba(200,200,200,0.5)");
    }
    return;
  }

  // Placeholder body
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

// The communication device on the ground. (x, y) = bottom center.
// beeping = true shows signal rings, a clue to help find it.
function drawCommDevice(x, y, time, beeping) {
  rect(x - 1, y - 12, 1, 5, "#8a919c");   // antenna
  rect(x - 2, y - 12, 3, 1, "#d6dce4");
  rect(x - 5, y - 7, 10, 7, "#4c566a");   // box
  rect(x - 3, y - 5, 4, 3, "#5fd39a");    // screen
  const blinkOn = Math.floor(time * 3) % 2 === 0;
  rect(x + 2, y - 5, 2, 2, blinkOn ? "#ff3b3b" : "#5a1111");

  if (beeping) {
    // A ring grows out of the antenna and fades away, again and again
    const ring = (time % 1.5) / 1.5;
    ctx.strokeStyle = "rgba(95,211,154," + (1 - ring) + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y - 12, 4 + ring * 16, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Debris, scorch marks and the lost device around the crashed ship.
// timeSinceCrash makes the pieces fly out during the cutscene;
// a big number means everything has already landed.
function drawCrashSite(time, timeSinceCrash) {
  const startX = ship.x + 35; // pieces fly out from the middle of the ship
  const startY = ship.y - 15;

  // Scorch mark on the ground under the ship
  rect(ship.x - 6, ship.y + 1, ship.width + 12, 3, "rgba(20,10,10,0.5)");

  // Debris: each piece flies in an arc from the ship to where it lands
  const debrisAmount = clamp(timeSinceCrash / DEBRIS_FLY_TIME, 0, 1);
  for (const piece of CRASH_DEBRIS) {
    const x = lerp(startX, piece.x, debrisAmount);
    const y = lerp(startY, piece.y, debrisAmount) - Math.sin(debrisAmount * Math.PI) * 30;
    rect(x, y, piece.width, piece.height, piece.color);
  }

  // The communication device flies further and higher than the debris
  if (!commDevice.collected) {
    const deviceAmount = clamp(timeSinceCrash / DEVICE_FLY_TIME, 0, 1);
    const x = lerp(startX, commDevice.x, deviceAmount);
    const y = lerp(startY, commDevice.y, deviceAmount) - Math.sin(deviceAmount * Math.PI) * 70;
    const landed = deviceAmount >= 1;
    drawCommDevice(x, y, time, landed && state === "play");
  }
}

function drawOutside(time) {
  drawOutsideBackground(time);
  drawCrashSite(time, 999);

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

  // The ship monitor that opens the tutorial.
  // Team artwork: Monitor.gif, shown 2x (64x64) standing on the floor.
  // Its picture ends 1 pixel above the bottom of the image, so it sits at y = 48.
  if (!showGif(gifs.monitor, monitor.x, INSIDE_FLOOR_TOP - 62, monitor.width, monitor.width)) {
    // Placeholder console with blinking lights (if Monitor.gif is missing)
    rect(130, 60, 80, 50, "#4c566a");
    rect(134, 64, 72, 22, "#111418");
    const blinkOn = Math.floor(time * 2) % 2 === 0;
    rect(138, 68, 4, 4, blinkOn ? "#ff3b3b" : "#5a1111");
    rect(146, 68, 4, 4, "#5a1111");
    rect(154, 68, 4, 4, blinkOn ? "#5a1111" : "#ff3b3b");
    rect(138, 78, 40, 4, "#2e3440"); // empty oxygen gauge
    rect(138, 78, 3, 4, "#ff3b3b");
    rect(140, 92, 6, 4, "#ffd84d");  // buttons
    rect(152, 92, 6, 4, "#3fa7ff");
    rect(164, 92, 6, 4, "#9df5c4");
  }

  // Exit door on the back wall
  rect(exitDoor.x - 2, INSIDE_FLOOR_TOP - 34, exitDoor.width + 4, 34, "#6b7380");
  rect(exitDoor.x, INSIDE_FLOOR_TOP - 32, exitDoor.width, 32, "#1c1f26");
  rect(exitDoor.x + exitDoor.width / 2 - 1, INSIDE_FLOOR_TOP - 40, 3, 3, "#5fd39a"); // green "exit" light

  // Storage room door (right side) with a blue "O2" sign as a clue
  rect(storageDoor.x - 2, INSIDE_FLOOR_TOP - 34, storageDoor.width + 4, 34, "#6b7380");
  rect(storageDoor.x, INSIDE_FLOOR_TOP - 32, storageDoor.width, 32, "#1c1f26");
  rect(storageDoor.x - 2, 60, storageDoor.width + 4, 10, "#1c3a5a");
  label("O2", storageDoor.x + storageDoor.width / 2, 67, "#9fd3ff");
  if (!oxygenTank.collected && Math.floor(time * 2) % 2 === 0) {
    // Blinking arrow pointing down at the door
    rect(storageDoor.x + 5, 71, 6, 1, "#ffd84d");
    rect(storageDoor.x + 6, 72, 4, 1, "#ffd84d");
    rect(storageDoor.x + 7, 73, 2, 1, "#ffd84d");
  }

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
// STORAGE ROOM (where the oxygen tank is)
// =============================================

function drawStorageRoom(time) {
  // Back wall with panel lines
  rect(0, 0, GAME_WIDTH, INSIDE_FLOOR_TOP, "#353b48");
  for (let x = 0; x < GAME_WIDTH; x += 40) {
    rect(x, 0, 1, INSIDE_FLOOR_TOP, "#2e3440");
  }
  label("STORAGE", 160, 14, "#9aa3ad");

  // Shelves with boxes
  for (const shelfY of [45, 75]) {
    rect(80, shelfY, 150, 3, "#6b7380");
    rect(88, shelfY - 8, 12, 8, "#8b6b3e");
    rect(120, shelfY - 6, 10, 6, "#4c566a");
    rect(150, shelfY - 10, 14, 10, "#8b6b3e");
    rect(200, shelfY - 7, 16, 7, "#4c566a");
  }

  // Dim red emergency light
  const blinkOn = Math.floor(time * 2) % 2 === 0;
  rect(290, 22, 6, 3, blinkOn ? "#ff3b3b" : "#5a1111");

  // Door back to the main room
  rect(storageExit.x - 2, INSIDE_FLOOR_TOP - 34, storageExit.width + 4, 34, "#6b7380");
  rect(storageExit.x, INSIDE_FLOOR_TOP - 32, storageExit.width, 32, "#1c1f26");
  rect(storageExit.x + storageExit.width / 2 - 1, INSIDE_FLOOR_TOP - 40, 3, 3, "#5fd39a");

  // Metal floor with grating lines
  rect(0, INSIDE_FLOOR_TOP, GAME_WIDTH, GAME_HEIGHT - INSIDE_FLOOR_TOP, "#5b6375");
  rect(0, INSIDE_FLOOR_TOP, GAME_WIDTH, 2, "#7b8496");
  for (let y = INSIDE_FLOOR_TOP + 12; y < GAME_HEIGHT; y += 14) {
    rect(0, y, GAME_WIDTH, 1, "#4c5466");
  }
}

function drawCrate(crate) {
  const top = crate.y - crate.height;
  rect(crate.x, top, crate.width, crate.height, "#8b6b3e");
  rect(crate.x, top, crate.width, 2, "#a8844f");
  rect(crate.x, top + crate.height / 2, crate.width, 1, "#5c4426");
  rect(crate.x + 2, top + 2, 1, crate.height - 2, "#5c4426");
  rect(crate.x + crate.width - 3, top + 2, 1, crate.height - 2, "#5c4426");
}

// Draws Oxygen tank.png (just the tank part) on any canvas.
// Returns false if the image isn't loaded, so the caller can use a placeholder.
function drawOxygenImage(context, x, y, width, height) {
  if (!imageReady(images.oxygenTank)) {
    return false;
  }
  const crop = OXYGEN_TANK_CROP;
  context.drawImage(images.oxygenTank, crop.x, crop.y, crop.width, crop.height, x, y, width, height);
  return true;
}

// Oxygen tank in the storage room. (x, y) = bottom center. Sparkles as a clue.
function drawOxygenTank(time) {
  const x = oxygenTank.x;
  const y = oxygenTank.y;
  if (drawOxygenImage(ctx, x - 4, y - 24, 8, 24)) {
    if (Math.floor(time * 4) % 2 === 0) {
      rect(x + 7, y - 26, 1, 3, "#ffffff");
      rect(x + 6, y - 25, 3, 1, "#ffffff");
    }
    return;
  }
  // Placeholder tank
  rect(x - 2, y - 18, 4, 2, "#d6dce4");  // valve
  rect(x - 4, y - 16, 8, 16, "#3fa7ff"); // tank
  rect(x - 3, y - 15, 2, 12, "#9fd3ff"); // shine
  rect(x - 4, y - 10, 8, 2, "#ffffff");  // white band
  if (Math.floor(time * 4) % 2 === 0) {
    rect(x + 7, y - 20, 1, 3, "#ffffff");
    rect(x + 6, y - 19, 3, 1, "#ffffff");
  }
}

function drawStorage(time) {
  drawStorageRoom(time);

  // Everything standing on the floor, drawn from back (small y) to front
  const things = [];
  for (const crate of crates) {
    drawShadow(crate.x, crate.y, crate.width);
    things.push({ y: crate.y, draw: function () { drawCrate(crate); } });
  }
  if (!oxygenTank.collected) {
    drawShadow(oxygenTank.x - 5, oxygenTank.y, 10);
    things.push({ y: oxygenTank.y, draw: drawOxygenTank });
  }
  drawShadow(dog.x, dog.y, dog.width);
  things.push({ y: dog.y, draw: drawDog });

  things.sort(function (a, b) { return a.y - b.y; });
  for (const thing of things) {
    thing.draw(time);
  }
}

// =============================================
// LAIKA
// =============================================

// Laika.png is a sprite sheet with 1 column and 2 rows (2 frames).
// Both frames face LEFT; the legs and tail change between them.
// These are the boxes around each frame inside the image.
const LAIKA_FRAMES = [
  { x: 37, y: 30, width: 507, height: 346 },  // frame 1: tail down
  { x: 37, y: 461, width: 507, height: 346 }  // frame 2: tail up, legs moved
];

function drawDog(time) {
  const top = dog.y - dog.height;

  // "part" converts a position measured from her back end (tail = 0,
  // nose = dog.width) into a screen x, for whichever way she is facing.
  function part(fromBack, w) {
    if (dog.facing === 1) {
      return dog.x + fromBack;
    }
    return dog.x + dog.width - fromBack - w;
  }

  const walking = state === "play" &&
    (keys["a"] || keys["d"] || keys["w"] || keys["s"] ||
     keys["arrowleft"] || keys["arrowright"] || keys["arrowup"] || keys["arrowdown"]);

  // backY = the line of her back, sideY = the middle of her side.
  // Items she carries are drawn relative to these.
  let backY;
  let sideY;

  if (imageReady(images.laika)) {
    // Team artwork: switch frames quickly while walking, slowly (a tail wag) while standing
    const frame = LAIKA_FRAMES[walking ? Math.floor(time * 6) % 2 : Math.floor(time * 1.5) % 2];
    const x = Math.round(dog.x);
    const y = Math.round(top);
    ctx.save();
    if (dog.facing === 1) {
      // The sprite faces left, so flip it to face right
      ctx.translate(x + dog.width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(images.laika, frame.x, frame.y, frame.width, frame.height, 0, 0, dog.width, dog.height);
    } else {
      ctx.drawImage(images.laika, frame.x, frame.y, frame.width, frame.height, x, y, dog.width, dog.height);
    }
    ctx.restore();
    backY = dog.y - 11;
    sideY = dog.y - 7;
  } else {
    // Placeholder dachshund (if Laika.png is missing)
    const ptop = dog.y - 9;
    const wag = Math.floor(time * 6) % 2;
    const step = walking ? Math.floor(time * 8) % 2 : 0;
    rect(part(0, 2), ptop + 3 + wag, 2, 1, "#8b4a1f");    // tail
    rect(part(2, 16), ptop + 3, 16, 4, "#8b4a1f");        // long body
    rect(part(16, 6), ptop, 6, 4, "#8b4a1f");             // head
    rect(part(20, 1), ptop + 1, 1, 1, "#000000");         // eye
    rect(part(16, 2), ptop, 2, 4, "#5c2e10");             // ear
    rect(part(21, 1), ptop + 2, 1, 1, "#000000");         // nose
    rect(part(3 + step, 2), ptop + 7, 2, 2, "#5c2e10");   // back legs
    rect(part(14 - step, 2), ptop + 7, 2, 2, "#5c2e10");  // front legs
    backY = dog.y - 6;
    sideY = dog.y - 4;
  }

  // Oxygen tank lying flat across her back, valve pointing to her head
  if (oxygenTank.collected) {
    const length = 11;
    const thickness = 4;
    if (imageReady(images.oxygenTank)) {
      ctx.save();
      ctx.translate(part(4, length) + length / 2, backY - thickness / 2);
      ctx.rotate(dog.facing === 1 ? Math.PI / 2 : -Math.PI / 2); // top of the tank -> her head
      drawOxygenImage(ctx, -thickness / 2, -length / 2, thickness, length);
      ctx.restore();
    } else {
      rect(part(4, length), backY - thickness, length, thickness, "#3fa7ff"); // placeholder tank
      rect(part(8, 1), backY - thickness, 1, thickness, "#ffffff");
    }
  }

  // Communication device (radio): carried in her mouth, then strapped to her side for good
  if (commDevice.attached) {
    rect(part(7, 3), sideY - 1, 3, 3, "#4c566a");           // small box on her side
    rect(part(8, 1), sideY - 3, 1, 2, "#8a919c");           // tiny antenna
    const lightOn = Math.floor(time * 2) % 2 === 0;
    rect(part(9, 1), sideY, 1, 1, lightOn ? "#5fd39a" : "#1f5a3a"); // green = working
  } else if (commDevice.collected) {
    rect(part(dog.width - 1, 3), sideY - 2, 3, 3, "#4c566a"); // held in her mouth
  }
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
  const shakeX = Math.round((Math.random() - 0.5) * 2 * shake);
  const shakeY = Math.round((Math.random() - 0.5) * 2 * shake);
  ctx.translate(shakeX, shakeY);

  if (phase === "space") {
    // Flying calmly through space
    drawSpace(time, 60);
    // The planet they will crash on, far away (above the dialogue box).
    // The planet GIF isn't on the canvas, so it gets the shake added by hand.
    drawWorld(270 + shakeX, 60 + shakeY, 18);
    drawFlyingShip(120, 80 + Math.sin(time * 2) * 2, 0, time, false);

  } else if (phase === "shaking") {
    // Something goes wrong: ship wobbles, sparks fly
    drawSpace(time, 60);
    drawWorld(270 + shakeX, 60 + shakeY, 22);
    drawFlyingShip(120, 80, Math.sin(time * 20) * 0.08, time, false);
    for (let i = 0; i < 4; i++) {
      rect(110 + Math.random() * 30, 72 + Math.random() * 16, 1, 1, "#ffd84d");
    }

  } else if (phase === "descending") {
    // Falling toward the planet, which gets bigger and bigger
    const fall = Math.min(t, 8); // stop growing after 8 seconds
    drawSpace(time, 80);
    // (growth is capped so the planet never covers the falling ship)
    drawWorld(230 + shakeX, 210 + shakeY, 40 + fall * 10);
    drawFlyingShip(110 + fall * 4, 60 + fall * 3, 0.45, time, true);

  } else if (phase === "impact") {
    // On the planet surface: the ship falls from the sky and hits the ground
    drawOutsideBackground(time);
    if (t < IMPACT_FLY_TIME) {
      const amount = t / IMPACT_FLY_TIME;
      // Comes in nose-down, levels out, and lands flat where the crashed ship lies
      const x = lerp(-30, CRASHED_SHIP.x, amount);
      const y = lerp(-10, CRASHED_SHIP.y, amount);
      const angle = 0.5 * (1 - amount);
      drawFlyingShip(x, y, angle, time, true, CRASHED_SHIP.width / 36);
    } else {
      drawShadow(ship.x, ship.y, ship.width);
      drawShip(time);
      // Debris and the communication device fly out from the ship
      drawCrashSite(time, t - IMPACT_FLY_TIME);
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
    drawCrashSite(time, 999);
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
  // GIFs are hidden unless something calls showGif() this frame
  for (const name in gifs) {
    gifs[name].view = null;
  }

  if (state === "title" || state === "menu") {
    drawTitleBackground(time);
  } else if (state === "cutscene") {
    drawCutscene(time);
  } else {
    // "play" or "tutorial": the tutorial panel sits on top of the game
    if (currentScene === "outside") {
      drawOutside(time);
    } else if (currentScene === "inside") {
      drawInside(time);
    } else {
      drawStorage(time);
    }
    drawInteractionPrompt(time);
    drawAttachEffect(time);
    drawPlayerMarker(time);

    if (state === "tutorial") {
      drawTutorialPictures(time);
    }
  }

  // Black fade on top of everything (for transitions)
  if (screenFade > 0) {
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "rgba(0,0,0," + screenFade + ")");
  }

  updateGifImages();
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
