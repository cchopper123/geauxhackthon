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
//   "story"    -> a mission message is open, e.g. "Supplies Secured" (Laika can't move)
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
  laika: loadImage("assets/Laika.png"),
  laikaWalk: loadImage("assets/Laikia walking.png"),
  spaceHelmet: loadImage("assets/Space helmet.png"),
  rocks: loadImage("assets/rocks.png"),
  radio: loadImage("assets/Radio.png"),
  astronaut: loadImage("assets/Astronaut frames.png"),
  interiorFurniture: loadImage("assets/Interior (1).png"),
  heartMonitor: loadImage("assets/Heart rate monitor.png"),
  ivBag: loadImage("assets/IV bag.webp"),
  // Hospital pixel-art pack (16x16 / 16x32 sprites, drawn 2x in the recovery room)
  ivStand: loadImage("assets/room_iv_stand_w.png"),
  armchair: loadImage("assets/room_armchair.png"),
  bedsideTable: loadImage("assets/room_bedside_table.png"),
  flower: loadImage("assets/room_flower.png"),
  hospitalCabinet: loadImage("assets/room_cabinet.png"),
  pharmacyShelf: loadImage("assets/room_pharmacy_shelf.png"),
  anatomyPoster: loadImage("assets/room_anatomy_poster.png"),
  handSanitizer: loadImage("assets/room_hand_sanitizer.png"),
  trashBin: loadImage("assets/room_trash_bin.png"),
  interiorWalls: loadImage("assets/Interior (2).png"),
  alienFruits: loadImage("assets/Alien fruits.png"),
  seeds: loadImage("assets/seeds.png"),
  bucket: loadImage("assets/Bucket.png"),
  dogTreat: loadImage("assets/dog treat.png"),
  astronautFace: loadImage("assets/Astronaut face icon.png"),
  astronautCloseUp: loadImage("assets/Astronaut Close up.png"),
  bigTree: loadImage("assets/Big Tree.png"),
  lake: loadImage("assets/Lake.png")
};

// "Alien fruits.png" is a sheet of 16 fruits (4 rows of 4, loosely packed).
// These are the boxes around each fruit, in reading order (fruit 0 to 15).
const FRUIT_SPRITES = [
  { x: 74, y: 74, width: 71, height: 71 }, { x: 168, y: 74, width: 75, height: 75 },
  { x: 257, y: 78, width: 79, height: 67 }, { x: 351, y: 70, width: 79, height: 83 },
  { x: 78, y: 175, width: 63, height: 64 }, { x: 172, y: 164, width: 63, height: 79 },
  { x: 257, y: 175, width: 83, height: 64 }, { x: 351, y: 171, width: 79, height: 72 },
  { x: 74, y: 257, width: 71, height: 79 }, { x: 164, y: 257, width: 79, height: 79 },
  { x: 261, y: 257, width: 71, height: 83 }, { x: 355, y: 261, width: 71, height: 79 },
  { x: 78, y: 359, width: 71, height: 71 }, { x: 160, y: 347, width: 86, height: 87 },
  { x: 265, y: 351, width: 71, height: 83 }, { x: 351, y: 351, width: 83, height: 87 }
];

// "seeds.png" is a 4 x 4 grid of seeds, each in a 125 x 125 square.
// Seed number N grows fruit number N from "Alien fruits.png".
function seedSprite(type) {
  return { x: (type % 4) * 125, y: Math.floor(type / 4) * 125, width: 125, height: 125 };
}

const BUCKET_CROP = { x: 131, y: 138, width: 238, height: 224 };
const TREAT_CROP = { x: 16, y: 16, width: 224, height: 232 };
// Dialogue portraits: the astronaut's helmet and chest, and Laika's face
const ASTRONAUT_FACE_CROP = { x: 148, y: 69, width: 195, height: 195 };
const LAIKA_FACE_CROP = { x: 37, y: 20, width: 230, height: 230 }; // from Laika.png

// The part of "Radio.png" that has the radio in it
const RADIO_CROP = { x: 175, y: 64, width: 150, height: 372 };

// "Astronaut frames.png" is a sprite sheet: 30 columns x 5 rows of small
// astronaut frames. Row 1 is falling-down animations; this frame is the
// last one of a fall (lying on her back), used for the unconscious astronaut.
const ASTRONAUT_LYING = { x: 338, y: 38, width: 29, height: 25 };

// Pieces cut out of the interior tilesets (boxes in image pixels).
const INTERIOR = {
  // From "Interior (2).png" (walls and floors). Wall tiles are 128x64:
  // a white trim at the top, the wall itself, and a dark line at the bottom.
  wallMain: { x: 0, y: 544, width: 128, height: 64 },     // blue-gray panels
  wallStorage: { x: 0, y: 608, width: 128, height: 64 },  // beige panels
  floorMain: { x: 352, y: 352, width: 96, height: 64 },   // gray floor tiles
  floorStorage: { x: 352, y: 288, width: 96, height: 64 }, // teal round tiles
  wallOxygen: { x: 0, y: 288, width: 128, height: 64 },   // light teal panels
  floorOxygen: { x: 448, y: 160, width: 96, height: 64 }, // gray stone
  // From "Interior (1).png" (furniture)
  bed: { x: 256, y: 576, width: 64, height: 52 },
  window: { x: 26, y: 846, width: 76, height: 50 },
  doorway: { x: 258, y: 278, width: 28, height: 42 },
  plant: { x: 386, y: 1444, width: 28, height: 46 },
  plantSmall: { x: 4, y: 1580, width: 24, height: 28 },
  lockers: { x: 32, y: 506, width: 126, height: 56 },
  shelfWide: { x: 64, y: 592, width: 128, height: 64 },
  shelfTall: { x: 160, y: 448, width: 64, height: 128 },
  rack: { x: 204, y: 594, width: 42, height: 62 },
  cabinetWide: { x: 104, y: 1898, width: 50, height: 42 },
  cabinetTall: { x: 320, y: 1930, width: 32, height: 42 },
  cabinetSmall: { x: 0, y: 1898, width: 32, height: 40 }
};

// Draws one cut-out piece of an image on any canvas.
// Returns false if the image isn't loaded, so the caller can draw a placeholder.
function drawPart(context, image, crop, x, y, width, height) {
  if (!imageReady(image)) {
    return false;
  }
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height,
                    Math.round(x), Math.round(y), width, height);
  return true;
}

// The part of "Space helmet.png" that has the helmet in it.
// The visor faces RIGHT in the image.
const HELMET_CROP = { x: 78, y: 78, width: 354, height: 344 };

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

// ----- Sounds (from the assets/Audio folder) -----
// Browsers only allow sound after the player has clicked or pressed a key,
// so the first sounds are the button clicks on the title screen.
const SOUND_VOLUME = 0.6; // overall volume for all sounds (0 = silent, 1 = full)

function loadSound(path, volume) {
  const sound = new Audio(path);
  sound.volume = volume * SOUND_VOLUME;
  sound.preload = "auto";
  sound.addEventListener("error", function () {
    console.warn("Missing sound: " + path);
  });
  return sound;
}

const AUDIO = "assets/Audio/";

// Single sounds, each tied to one exact event or job
const sounds = {
  astronautVoice: loadSound(AUDIO + "Astronaut talking sound.mp3", 0.55), // astronaut + narrator babble
  runFootsteps: loadSound(AUDIO + "Laika running audio.mp3", 0.4),        // looped while running
  celebrate: loadSound(AUDIO + "congratulations audi.ogg", 0.6),           // tutorial / mission complete
  died: loadSound(AUDIO + "died audio.ogg", 0.6),                          // out of oxygen
  flight: loadSound(AUDIO + "space ship flying.wav", 0.35),               // cutscene: flying through space
  alarm: loadSound(AUDIO + "Secuirty alarm.mp3", 0.15),                   // cutscene: losing control
  explosion: loadSound(AUDIO + "Space ship explosion.ogg", 0.8),          // cutscene: the crash
  bark: loadSound(AUDIO + "Dachshund Dog Barking Outdoors.mp3", 0.6),     // Laika's "Bark!" dialogue lines
  whine: loadSound(AUDIO + "Dachshund Whining Sound Effect in HD Quality.mp3", 0.6), // Laika's "Whines"
  titleMusic: loadSound(AUDIO + "Title background music.mp3", 0.35),     // title screen + menu
  planetMusic: loadSound(AUDIO + "Planet background music.ogg", 0.3),     // outdoors on the planet
  heartBeep: loadSound(AUDIO + "Monitor beep.ogg", 0.2)                   // heart monitor, once per heartbeat
};
sounds.runFootsteps.loop = true;
sounds.flight.loop = true;
sounds.alarm.loop = true;
sounds.titleMusic.loop = true;
sounds.planetMusic.loop = true;

// Groups of similar sounds: one is picked at random each time (never the
// same one twice in a row), so repeated actions don't sound robotic.
function loadGroup(names, volume) {
  return names.map(function (name) { return loadSound(AUDIO + name, volume); });
}
function numbered(prefix, from, to, suffix) {
  const names = [];
  for (let i = from; i <= to; i++) names.push(prefix + i + suffix);
  return names;
}
const soundGroups = {
  interact: loadGroup(numbered("click", 1, 5, ".ogg"), 0.5),              // E works
  footstep: loadGroup(numbered("footstep0", 0, 9, ".ogg"), 0.18),         // soft paw steps
  computerVoice: loadGroup(numbered("switch", 1, 12, ".ogg"), 0.4),       // robotic chirps
  monitor: loadGroup(["Monitor beep.ogg"], 0.5),                          // the ship monitor
  bucket: loadGroup(["metalPot1.ogg", "metalPot2.ogg", "metalPot3.ogg"], 0.35), // bucket clanks
  dig: loadGroup(["chop.ogg"], 0.5),                                      // digging / planting
  seeds: loadGroup(["handleSmallLeather.ogg", "handleSmallLeather2.ogg"], 0.5), // seed pouch
  attach: loadGroup(["metalClick.ogg"], 0.6),                             // radio clicks onto Laika
  door: loadGroup(["doorOpen_1.ogg", "doorOpen_2.ogg"], 0.4)              // ship doors
};
const lastPicked = {}; // the last sound picked from each group

// Plays a sound from the start (any earlier play of the same sound stops)
function playSound(sound, speed) {
  sound.currentTime = 0;
  sound.preservesPitch = false;  // a faster speed also makes it higher
  sound.playbackRate = speed || 1;
  sound.play().catch(function () {
    // the browser blocked it, or the file is missing: just stay quiet
  });
  return sound;
}

// Plays a random sound from a group, avoiding the one played last time
function playFrom(groupName, speed) {
  const group = soundGroups[groupName];
  if (!group || group.length === 0) {
    return null;
  }
  let index = Math.floor(Math.random() * group.length);
  if (group.length > 1 && index === lastPicked[groupName]) {
    index = (index + 1) % group.length;
  }
  lastPicked[groupName] = index;
  return playSound(group[index], speed);
}

// Starts a looping sound if it should be on, pauses it if not.
// (Only calls play() when it's actually paused, so not every frame.)
function setLoop(sound, on, speed) {
  if (on) {
    if (speed) {
      sound.preservesPitch = false;
      sound.playbackRate = speed;
    }
    if (sound.paused) {
      sound.play().catch(function () {});
    }
  } else if (!sound.paused) {
    sound.pause();
  }
}

// ----- Footsteps -----
// Walking: a soft paw step every WALK_STEP_TIME seconds, picked from the
// footstep group. Running: the running sound loops instead. Only one of
// the two plays at a time, so they never overlap.
const WALK_STEP_TIME = 0.32; // seconds between walking steps
let nextStepAt = 0;

function updateFootsteps(moving, running, now) {
  if (!moving) {
    stopFootsteps();
    return;
  }
  if (running) {
    setLoop(sounds.runFootsteps, true, 1.2);
    nextStepAt = 0;
  } else {
    setLoop(sounds.runFootsteps, false);
    if (now >= nextStepAt) {
      playFrom("footstep", 1.3 + Math.random() * 0.15); // a bit higher: light little paws
      nextStepAt = now + WALK_STEP_TIME + Math.random() * 0.04;
    }
  }
}

function stopFootsteps() {
  setLoop(sounds.runFootsteps, false);
  nextStepAt = 0; // the next walk starts with a step right away
}

// ----- Planet music -----
// Plays while Laika is outdoors on the planet (and pauses inside the ship,
// in menus and when the game is paused). Called every frame.
function updatePlanetMusic() {
  const onPlanet = (state === "play" || state === "story") && isOutdoors(currentScene);
  setLoop(sounds.planetMusic, onPlanet);
}

// ----- Crash cutscene sounds -----
// The engine plays while the ship flies, speeding up as it falls. The
// alarm starts when the ship loses control. Both stop at the moment of
// impact, when the explosion plays (once per crash).
let explosionPlayed = false;

function updateCutsceneAudio() {
  const phase = cutscene.phase;
  const t = cutscene.phaseTime;
  const flyingPhase = phase === "space" || phase === "shaking" || phase === "descending";
  const falling = phase === "impact" && t < IMPACT_FLY_TIME;
  const landed = phase === "impact" && t >= IMPACT_FLY_TIME;

  // Engine: steady in space, straining faster and faster while falling
  let engineSpeed = 1;
  if (phase === "descending") engineSpeed = 1 + Math.min(t, 8) * 0.03;
  if (falling) engineSpeed = 1.3;
  setLoop(sounds.flight, !cutscene.ending && (flyingPhase || falling), engineSpeed);

  // Alarm: from "losing control" until the impact (quiet, so dialogue stays clear)
  setLoop(sounds.alarm, !cutscene.ending && (phase === "shaking" || phase === "descending" || falling));

  // Explosion: exactly once, the moment the ship hits the planet
  if (landed && !explosionPlayed) {
    explosionPlayed = true;
    playSound(sounds.explosion);
  }
}

function stopCutsceneAudio() {
  setLoop(sounds.flight, false);
  setLoop(sounds.alarm, false);
}

// ----- Title screen music -----
// Plays on the title screen and the menu. Browsers block music until the
// player clicks or presses a key, so it starts on the first one.
function updateTitleMusic() {
  const music = sounds.titleMusic;
  if (state === "title" || state === "menu") {
    if (music.paused) {
      music.play().catch(function () {});
    }
  } else if (!music.paused) {
    music.pause();
  }
}
document.addEventListener("pointerdown", updateTitleMusic);
document.addEventListener("keydown", updateTitleMusic);

// Plays the button click once. (Starting it again from the beginning means a
// fast double-click never stacks two clicks on top of each other.)
const buttonClick = loadSound(AUDIO + "Clicking.wav", 0.5);
function playClick() {
  buttonClick.currentTime = 0;
  buttonClick.play().catch(function () {
    // the browser blocked it, or the file is missing: just stay quiet
  });
}

// ----- Laika barks when the player presses B (gameplay only) -----
// Six single barks from the bark recording (start and end in seconds).
// Each press picks one at random, never the same one twice in a row.
// There's no cooldown: every press barks. Two copies of the sound take
// turns, so at most two barks ever sound at the same time.
const PLAYER_BARKS = [
  { start: 0.84, end: 1.14 },
  { start: 9.42, end: 9.70 },
  { start: 15.32, end: 15.60 },
  { start: 16.20, end: 16.50 },
  { start: 31.42, end: 31.70 },
  { start: 32.28, end: 32.56 }
];
const barkPlayers = [
  { sound: loadSound(AUDIO + "Dachshund Dog Barking Outdoors.mp3", 0.7), timer: null },
  { sound: loadSound(AUDIO + "Dachshund Dog Barking Outdoors.mp3", 0.7), timer: null }
];
let nextBarkPlayer = 0;  // which copy plays the next bark
let lastBark = -1;       // which bark played last time
let barkBubbleTime = 0;  // seconds left to show "Bark!" above Laika

function playerBark() {
  let pick = Math.floor(Math.random() * PLAYER_BARKS.length);
  if (pick === lastBark) {
    pick = (pick + 1) % PLAYER_BARKS.length; // don't repeat the last bark
  }
  lastBark = pick;
  const bark = PLAYER_BARKS[pick];
  const player = barkPlayers[nextBarkPlayer];
  nextBarkPlayer = (nextBarkPlayer + 1) % barkPlayers.length;

  clearTimeout(player.timer);
  player.sound.currentTime = bark.start;
  player.sound.play().catch(function () {
    // the browser blocked it, or the file is missing: just stay quiet
  });
  player.timer = setTimeout(function () {
    player.sound.pause(); // stop at the end of this bark
  }, (bark.end - bark.start) * 1000);
  barkBubbleTime = 0.5;
}

// Every button in the game (Start, Quit, New Game, Next, the menus...)
// clicks once when it's pressed. (Laika only barks when the player presses B.)
document.addEventListener("click", function (event) {
  if (event.target.closest && event.target.closest("button")) {
    playClick();
  }
});

// ----- Dialogue voices -----
// While a line's text is typing out, short "syllables" play one after
// another (never on top of each other), so characters "talk" without words.
//  - Astronaut: random bits of her voice clip, sped up (high and cute)
//  - Narration: the same clip slowed down, so it's deeper and slower.
//    (Slower playback also makes each bit last longer, so the syllables
//    and gaps are longer to match.)
//  - Computer: short electronic chirps from the computerVoice group
// Laika doesn't babble: her lines play one dog sound instead (see DOG_SOUNDS).
const VOICES = {
  Astronaut: { sound: sounds.astronautVoice, volume: 0.55, speed: 1.3, urgentSpeed: 1.6, syllable: 0.06, gap: 0.03 },
  Narration: { sound: sounds.astronautVoice, volume: 0.45, speed: 0.72, urgentSpeed: 0.8, syllable: 0.11, gap: 0.07 },
  Computer: { group: "computerVoice", speed: 1.0, urgentSpeed: 1.25, gap: 0.06 }
};

// Laika's dog sounds: one clean section of each recording.
// (start / end are in seconds inside the file)
const DOG_SOUNDS = {
  bark: { sound: sounds.bark, start: 37.45, end: 38.3 },   // a happy double "arf arf"
  whine: { sound: sounds.whine, start: 2.15, end: 3.8 }    // a high, sad whine
};

const voice = {
  playing: null,   // the voice sound playing right now (or null)
  stopAt: 0,       // when the current syllable ends (cutscene time)
  nextAt: 0,       // when the next syllable starts (cutscene time)
  dog: null        // the dog sound playing right now (or null)
};

// Urgent lines (with "!" or "Warning") get a higher, faster voice
function isUrgent(text) {
  return text.includes("!") || text.toLowerCase().includes("warning");
}

// Stops the babble (but lets a dog sound finish)
function stopBabble() {
  if (voice.playing) {
    voice.playing.pause();
    voice.playing = null;
  }
  voice.nextAt = 0;
}

// Stops every voice sound, including Laika's dog sound
function stopVoice() {
  stopBabble();
  if (voice.dog) {
    voice.dog.sound.pause();
    voice.dog = null;
  }
}

// Plays one of Laika's dog sounds (for a whole line)
function playDogSound(name) {
  const dogSound = DOG_SOUNDS[name];
  if (!dogSound) {
    return;
  }
  dogSound.sound.currentTime = dogSound.start;
  dogSound.sound.play().catch(function () {});
  voice.dog = dogSound;
}

// Called every frame during the cutscene: stops the dog sound at the end
// of its section
function updateDogSound() {
  if (voice.dog && voice.dog.sound.currentTime >= voice.dog.end) {
    voice.dog.sound.pause();
    voice.dog = null;
  }
}

// Called every frame while a line is typing out
function updateVoice(line, now) {
  const profile = VOICES[line.speaker];
  if (!profile) {
    return; // no babble for this speaker
  }
  // End the current syllable when its time is up
  if (voice.playing && now >= voice.stopAt) {
    voice.playing.pause();
    voice.playing = null;
  }
  if (now < voice.nextAt) {
    return;
  }
  const urgent = isUrgent(line.text);
  const speed = (urgent ? profile.urgentSpeed : profile.speed) + (Math.random() - 0.5) * 0.15;

  if (profile.group) {
    // Computer: a short electronic chirp, a different one each time
    if (voice.playing) {
      voice.playing.pause();
    }
    voice.playing = playFrom(profile.group, speed);
    voice.stopAt = now + 0.12;
    voice.nextAt = now + (urgent ? 0.07 : 0.09) + Math.random() * profile.gap;
    return;
  }

  // Astronaut / narrator: a random piece of the voice clip
  const sound = profile.sound;
  if (!(sound.duration > 0)) {
    return; // the file hasn't loaded (or is missing)
  }
  const length = (urgent ? profile.syllable * 0.85 : profile.syllable) + Math.random() * 0.04; // seconds
  sound.currentTime = Math.random() * Math.max(0, sound.duration - 0.4);
  sound.preservesPitch = false; // the speed also changes the pitch
  sound.playbackRate = speed;
  sound.volume = profile.volume * SOUND_VOLUME;
  sound.play().catch(function () {});
  voice.playing = sound;
  voice.stopAt = now + length;
  voice.nextAt = voice.stopAt + (urgent ? profile.gap * 0.5 : profile.gap) + Math.random() * 0.04; // short gap
}

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
const objectiveList = document.getElementById("objective-list");
const objectiveHint = document.getElementById("objective-hint");
const messageBox = document.getElementById("message");
const objectivesBody = document.getElementById("objectives-body");
const objectivesToggle = document.getElementById("objectives-toggle");

// ----- Game state -----
let state = "title";        // always start on the title screen
let currentScene = "outside"; // during play: "outside", "inside", "recovery", "storage", "oxygenRoom", "jungle" or "lake"
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
//   "laika"      fade back in on the crashed ship (Laika stays inside)
//   "inside"     inside the ship, Laika next to the astronaut
const CUTSCENE_LINES = [
  { speaker: "Astronaut", text: "Laika, are you okay?", phase: "space" },
  // dogSound = one of Laika's dog sounds from DOG_SOUNDS, played with the line
  { speaker: "Laika", text: "Bark!", phase: "space", dogSound: "bark" },
  { speaker: "Computer", text: "Warning! The ship is losing control!", phase: "shaking" },
  { speaker: "Computer", text: "Emergency landing sequence activated.", phase: "descending" },
  { speaker: "Computer", text: "Warning. Life-support systems damaged.", phase: "descending" },
  { speaker: "Astronaut", text: "I need to get us out of here...", phase: "descending" },
  // "wait" = seconds before this line can be skipped (so the crash can be seen)
  { speaker: "Computer", text: "Critical systems failure.", phase: "impact", wait: 2.5 },
  { speaker: "Computer", text: "Warning. Communication device lost.", phase: "impact" },
  { speaker: "Narration", text: "The astronaut loses consciousness after the crash.", phase: "blackout" },
  { speaker: "Narration", text: "Laika is okay, but her human needs help.", phase: "laika" },
  { speaker: "Narration", text: "... she seems unconscious?", phase: "inside" },
  { speaker: "Laika", text: "Whines", phase: "inside", dogSound: "whine" }
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

// Draws a face image to fill the 96x96 portrait. flip = mirror it.
// Returns false if the image isn't loaded (then the placeholder is drawn).
function drawPortraitImage(image, crop, flip) {
  if (!imageReady(image)) {
    return false;
  }
  portraitCtx.setTransform(1, 0, 0, 1, 0, 0);
  portraitCtx.imageSmoothingEnabled = false;
  portraitCtx.fillStyle = "#1a0b33";
  portraitCtx.fillRect(0, 0, 96, 96);
  portraitCtx.save();
  if (flip) {
    portraitCtx.translate(96, 0);
    portraitCtx.scale(-1, 1);
  }
  portraitCtx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 4, 4, 88, 88);
  portraitCtx.restore();
  return true;
}

function drawAstronautPortrait() {
  // Team artwork: Astronaut face icon.png (her helmet and chest)
  if (drawPortraitImage(images.astronautFace, ASTRONAUT_FACE_CROP, false)) {
    return;
  }
  portraitCtx.setTransform(3, 0, 0, 3, 0, 0); // placeholder is drawn at 32x32, shown 3x
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
  // Team artwork: Laika's face, cut from Laika.png and flipped to face the text
  if (drawPortraitImage(images.laika, LAIKA_FACE_CROP, true)) {
    return;
  }
  portraitCtx.setTransform(3, 0, 0, 3, 0, 0); // placeholder is drawn at 32x32, shown 3x
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

// Rocks in rocks.png (a sheet of loose rocks, not a grid).
// Each box is where one rock is inside the image, in image pixels.
// They are drawn at their real size: 1 image pixel = 1 game pixel.
const ROCK_SPRITES = [
  { x: 6, y: 7, width: 25, height: 14 },   // 0: wide rock
  { x: 56, y: 7, width: 17, height: 13 },  // 1: tall rock
  { x: 80, y: 10, width: 17, height: 9 },  // 2: flat rock
  { x: 37, y: 12, width: 17, height: 8 },  // 3: small flat rock
  { x: 99, y: 4, width: 22, height: 15 },  // 4: round rock
  { x: 4, y: 27, width: 25, height: 14 },  // 5: wide rock
  { x: 33, y: 26, width: 28, height: 17 }, // 6: big rock
  { x: 115, y: 36, width: 7, height: 5 },  // 7: pebble
  { x: 105, y: 37, width: 5, height: 4 }   // 8: tiny pebble
];

// Debris thrown from the ship during the crash: rocks knocked loose by the
// impact. They fly out and stay on the ground for the rest of the game.
// (x, y) = where they land (top-left), rock = which rock from ROCK_SPRITES.
// width/height/color are only used for the placeholder if rocks.png is missing.
const CRASH_DEBRIS = [
  { x: 8, y: 140, width: 10, height: 4, color: "#6b7380", rock: 7 },
  { x: 15, y: 156, width: 7, height: 3, color: "#555b66", rock: 3 },
  { x: 110, y: 145, width: 8, height: 3, color: "#8a919c", rock: 2 },
  { x: 100, y: 170, width: 5, height: 4, color: "#b8c0cc", rock: 8 },
  { x: 240, y: 138, width: 10, height: 4, color: "#6b7380", rock: 1 },
  { x: 204, y: 172, width: 4, height: 3, color: "#b8c0cc", rock: 7 },
  { x: 215, y: 158, width: 9, height: 3, color: "#8a919c", rock: 0 },
  { x: 248, y: 169, width: 6, height: 4, color: "#555b66", rock: 8 },
  { x: 252, y: 150, width: 12, height: 3, color: "#6b7380", rock: 3 },
  { x: 296, y: 167, width: 6, height: 3, color: "#b8c0cc", rock: 2 }
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

// ----- Controls (can be changed in the pause menu: Esc > Options) -----
// Each action and the key it uses. The arrow keys always move too.
const DEFAULT_CONTROLS = {
  up: "w", down: "s", left: "a", right: "d",
  interact: "e", run: "shift", drop: "q", bark: "b",
  objectives: "o", help: "h"
};
const CONTROL_NAMES = {
  up: "Move up", down: "Move down", left: "Move left", right: "Move right",
  interact: "Interact", run: "Run (hold)", drop: "Drop bucket", bark: "Bark",
  objectives: "Hide objectives", help: "Hide controls panel"
};
let controls = Object.assign({}, DEFAULT_CONTROLS);
// Load the player's saved controls, if any (browsers can block this, so try/catch)
try {
  const saved = JSON.parse(localStorage.getItem("wienerDogControls"));
  if (saved) {
    controls = Object.assign(controls, saved);
  }
} catch (error) {
  // no saved controls; keep the defaults
}
function saveControls() {
  try {
    localStorage.setItem("wienerDogControls", JSON.stringify(controls));
  } catch (error) {
    // saving isn't allowed here; the new keys still work until the page reloads
  }
}
let waitingForKey = null; // the action being changed in the Options menu

// ----- Keyboard input -----
// keys["arrowleft"] is true while that key is held down
const keys = {};

window.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();

  // Options menu: the next key pressed becomes the new key for that action
  if (waitingForKey) {
    event.preventDefault();
    if (key !== "escape") {
      controls[waitingForKey] = key;
      saveControls();
      updateControlsText();
      if (!moveTutorialBox.classList.contains("hidden")) {
        showMoveTutorialStep(); // show the new key in the walkthrough too
      }
    }
    waitingForKey = null;
    buildControlsTable();
    return;
  }

  keys[key] = true;

  // Stop arrow keys and Space from scrolling the page
  if (event.key.startsWith("Arrow") || key === " ") {
    event.preventDefault();
  }

  // Escape opens / closes the pause menu (and still closes the monitor
  // and mission messages, as before)
  if (key === "escape" && !event.repeat) {
    if (state === "paused") {
      resumeGame();
      return;
    }
    if (state === "play" || state === "cutscene") {
      pauseGame();
      return;
    }
  }

  // Space or Enter advances the dialogue (ignore keys held down)
  if (state === "cutscene" && (key === " " || key === "enter")) {
    event.preventDefault(); // stop it also "clicking" a focused button
    if (!event.repeat) {
      advanceDialogue();
    }
  }

  // During gameplay: show/hide the controls panel, the objectives list,
  // and drop the bucket
  if (state === "play" && key === controls.help && !event.repeat) {
    controlsPanel.classList.toggle("hidden");
  }
  if (state === "play" && key === controls.objectives && !event.repeat) {
    toggleObjectives();
  }
  if (state === "play" && key === controls.drop && !event.repeat) {
    dropBucket();
  }
  // Bark: once per key press (holding the key down doesn't repeat it)
  if (state === "play" && key === controls.bark && !event.repeat) {
    playerBark();
  }

  // The interact key uses whatever Laika is next to. It (or Escape) also
  // closes the monitor and mission messages.
  if (!event.repeat) {
    if (state === "play" && key === controls.interact && !moveTutorialDone()) {
      // During the controls walkthrough, the interact key only finishes its step
      if (MOVE_TUTORIAL[moveTutorialIndex].action === "interact") {
        advanceMoveTutorial();
      }
    } else if (state === "play" && key === controls.interact) {
      const interaction = getInteraction();
      if (interaction) {
        jingleJustPlayed = false;
        interaction.action();
        // A blip when the interaction worked (not for hint-only messages,
        // and not when the tutorial jingle just started playing)
        // Each interaction can name its own sound group (e.g. "bucket");
        // the rest use the "interact" clicks
        if (!interaction.hint && !jingleJustPlayed) {
          playFrom(interaction.sound || "interact");
        }
        jingleJustPlayed = false;
      }
    } else if (state === "tutorial" && (key === controls.interact || key === "escape")) {
      closeTutorial();
    } else if (state === "story" && (key === controls.interact || key === "escape")) {
      closeMissionPanel();
    } else if (state === "died" && (key === controls.interact || key === "escape")) {
      closeDiedPanel();
    } else if (state === "survival" && (key === controls.interact || key === "escape")) {
      closeSurvivalScreen();
    } else if (state === "heart" && (key === controls.interact || key === "escape")) {
      closeHeartMonitor();
    }
  }
});

window.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});

// True while the key for an action is held (arrow keys also move)
function holding(action) {
  const arrows = { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" };
  return keys[controls[action]] === true || (arrows[action] !== undefined && keys[arrows[action]] === true);
}

// ----- Controls walkthrough (before the tutorial) -----
// At the start of gameplay, Laika learns the controls one step at a time.
// A step is done when the player does it: walks that way (or runs) for
// half a second, or presses the interact key. Doors and interacting are
// paused until all steps are done. Edit the steps here.
const MOVE_TUTORIAL = [
  { action: "up", text: function (k) { return "Press " + k("up") + " to walk forward"; } },
  { action: "down", text: function (k) { return "Press " + k("down") + " to walk back"; } },
  { action: "left", text: function (k) { return "Press " + k("left") + " to walk left"; } },
  { action: "right", text: function (k) { return "Press " + k("right") + " to walk right"; } },
  { action: "run", text: function (k) { return "Hold " + k("run") + " while walking to run"; } },
  { action: "interact", text: function (k) { return "Press " + k("interact") + " to interact with things"; } }
];
const MOVE_TUTORIAL_HOLD = 0.5; // seconds of walking needed for a movement step
let moveTutorialIndex = 0;      // which step is showing (MOVE_TUTORIAL.length = finished)
let moveTutorialTime = 0;       // how long the current step's action has been done
const moveTutorialBox = document.getElementById("move-tutorial");

function moveTutorialDone() {
  return moveTutorialIndex >= MOVE_TUTORIAL.length;
}

// Shows the current step in the banner at the top of the screen
function showMoveTutorialStep() {
  if (moveTutorialDone()) {
    moveTutorialBox.classList.add("hidden");
    return;
  }
  const k = function (action) { return "<kbd>" + keyName(controls[action]) + "</kbd>"; };
  const step = MOVE_TUTORIAL[moveTutorialIndex];
  moveTutorialBox.innerHTML =
    "<span class=\"step-count\">CONTROLS " + (moveTutorialIndex + 1) + " / " + MOVE_TUTORIAL.length + "</span>" +
    step.text(k);
  moveTutorialBox.classList.remove("hidden");
}

function advanceMoveTutorial() {
  moveTutorialIndex += 1;
  moveTutorialTime = 0;
  showMoveTutorialStep();
  if (moveTutorialDone()) {
    controlsPanel.classList.remove("hidden");
    showMessage("You're ready! Walk to the ship monitor and press " + keyName(controls.interact) + ".", 7);
  }
}

// Called every frame during gameplay: checks if the current step was done
function updateMoveTutorial(deltaTime) {
  if (moveTutorialDone()) {
    return;
  }
  const action = MOVE_TUTORIAL[moveTutorialIndex].action;
  if (action === "run" ? dog.running : (action !== "interact" && holding(action))) {
    moveTutorialTime += deltaTime;
    if (moveTutorialTime >= MOVE_TUTORIAL_HOLD) {
      advanceMoveTutorial();
    }
  }
}

// ----- Pause menu (Escape) -----
let stateBeforePause = "play";
const pauseMenu = document.getElementById("pause-menu");

function pauseGame() {
  stateBeforePause = state;
  state = "paused"; // update() stops, so everything freezes
  stopVoice();
  stopCutsceneAudio(); // the engine and alarm start again when the game resumes
  pauseMenu.classList.remove("hidden");
  showPausePage("main");
}

function resumeGame() {
  state = stateBeforePause;
  waitingForKey = null;
  pauseMenu.classList.add("hidden");
  // Forget held keys, so Laika doesn't keep walking by herself
  for (const name in keys) {
    keys[name] = false;
  }
}

// "main" = Resume / Options / Main Screen, "options" = change controls
function showPausePage(page) {
  document.getElementById("pause-main").classList.toggle("hidden", page !== "main");
  document.getElementById("pause-options").classList.toggle("hidden", page !== "options");
  if (page === "options") {
    buildControlsTable();
  }
}

// A readable name for a key, e.g. " " -> "Space", "e" -> "E"
function keyName(key) {
  if (key === " ") return "Space";
  if (key.startsWith("arrow")) return key.replace("arrow", "Arrow ");
  return key.length === 1 ? key.toUpperCase() : key.charAt(0).toUpperCase() + key.slice(1);
}

// The Options page: one row per action, with a button showing its key.
// Click a button, then press the new key.
function buildControlsTable() {
  const table = document.getElementById("controls-table");
  table.innerHTML = "";
  for (const action in DEFAULT_CONTROLS) {
    const row = document.createElement("div");
    row.className = "control-row";
    const name = document.createElement("span");
    name.textContent = CONTROL_NAMES[action];
    const button = document.createElement("button");
    button.className = "pixel-button small";
    button.textContent = waitingForKey === action ? "Press a key..." : keyName(controls[action]);
    button.addEventListener("click", function () {
      waitingForKey = action;
      button.blur();
      buildControlsTable();
    });
    row.appendChild(name);
    row.appendChild(button);
    table.appendChild(row);
  }
}

// Writes the current keys into the controls panel (top-left)
function updateControlsText() {
  const k = function (action) { return keyName(controls[action]); };
  controlsPanel.innerHTML =
    "<h1>Wiener Dog in Space</h1>" +
    "<p>You play as <b>Laika</b> the dachshund.</p>" +
    "<p>The astronaut is unconscious inside the ship and can't move.</p>" +
    "<p><b>Move:</b> " + k("up") + k("left") + k("down") + k("right") + " or Arrow Keys &nbsp; <b>Run:</b> hold " + k("run") + "</p>" +
    "<p><b>Explore:</b> walk off the left or right edge outside</p>" +
    "<p><b>Enter / exit ship:</b> walk up into the door</p>" +
    "<p><b>Interact:</b> " + k("interact") + " &nbsp; <b>Drop bucket:</b> " + k("drop") + " &nbsp; <b>Bark:</b> " + k("bark") + "</p>" +
    "<p><b>Hide this panel:</b> " + k("help") + " &nbsp; <b>Hide objectives:</b> " + k("objectives") + "</p>" +
    "<p><b>Pause menu:</b> Esc</p>";
}

document.getElementById("resume-button").addEventListener("click", resumeGame);
document.getElementById("options-button").addEventListener("click", function () { showPausePage("options"); });
document.getElementById("options-back").addEventListener("click", function () { showPausePage("main"); });
document.getElementById("reset-controls").addEventListener("click", function () {
  controls = Object.assign({}, DEFAULT_CONTROLS);
  saveControls();
  updateControlsText();
  buildControlsTable();
});
document.getElementById("main-menu-button").addEventListener("click", function () {
  // Going back to the title screen reloads the page, like opening the game
  // again. (The game is saved first, so Continue picks up from here.)
  // (Wait a moment so the button's click sound can play first.)
  setTimeout(function () { window.location.reload(); }, 150);
});
updateControlsText();

// ----- Buttons -----
const continueButton = document.getElementById("continue-button");

startButton.addEventListener("click", function () {
  state = "menu";
  titleScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
  // Continue only shows up when there's a saved game
  const hasSave = readSave() !== null;
  continueButton.classList.toggle("hidden", !hasSave);
  document.getElementById("new-game-note").classList.toggle("hidden", !hasSave);
  (hasSave ? continueButton : newGameButton).focus();
});

continueButton.addEventListener("click", continueGame);
newGameButton.addEventListener("click", startNewGame);

// Quit: try to close the game's tab. Browsers only allow that for tabs a
// script opened, so if the tab is still open, show a "Thanks for playing!"
// screen instead (with a button back to the title).
document.getElementById("quit-button").addEventListener("click", function () {
  state = "quit";
  updateTitleMusic(); // the music stops
  titleScreen.classList.add("hidden");
  document.getElementById("quit-screen").classList.remove("hidden");
  setTimeout(function () { window.close(); }, 150); // let the click sound play first
});

document.getElementById("quit-back-button").addEventListener("click", function () {
  state = "title";
  document.getElementById("quit-screen").classList.add("hidden");
  titleScreen.classList.remove("hidden");
  updateTitleMusic(); // the music starts again
  startButton.focus();
});

dialogueNext.addEventListener("click", function () {
  advanceDialogue();
  dialogueNext.blur(); // so Space doesn't press the button a second time
});

tutorialClose.addEventListener("click", closeTutorial);
document.getElementById("mission-close").addEventListener("click", closeMissionPanel);
document.getElementById("died-close").addEventListener("click", closeDiedPanel);

// Hides the objectives list (the small "Objectives" title stays so it can be reopened)
function toggleObjectives() {
  objectivesBody.classList.toggle("hidden");
  objectivesToggle.textContent = objectivesBody.classList.contains("hidden") ? "Show" : "Hide";
}

objectivesToggle.addEventListener("click", function () {
  toggleObjectives();
  objectivesToggle.blur(); // so Space/Enter don't press it again
});

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
  facing: 1, // 1 = facing right, -1 = facing left
  running: false // true while Shift is held and she is moving
};

const RUN_SPEED = 1.8; // running is this many times faster than walking

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
const MONITOR_TOP = 26; // the monitor hangs on the wall from here (bottom at y = 90)

// Door on the main room's back wall (right side) that leads to the recovery room
const recoveryDoor = {
  x: 232,
  width: 16
};

// Door on the recovery room's back wall that leads back to the main room
const recoveryExit = {
  x: 30,
  width: 16
};

// The heart rate monitor on a stand next to the astronaut's bed
// (Heart rate monitor.png, the part with the monitor in it)
const heartMonitor = {
  x: 272,
  width: 36
};
const HEART_MONITOR_CROP = { x: 0, y: 34, width: 500, height: 417 };

// The IV stand at the head of her bed (room_iv_stand_w.png from the hospital
// pack, 16x32, drawn 2x). Its IV bag is on the right hook; the feeding bag
// (IV bag.webp) hangs from the left hook.
// (x, y) = top left of the drawn stand. Its base is level with the head of the bed.
const ivStand = { x: 180, y: 80, width: 32, height: 64 };
const IV_BAG_CROP = { x: 100, y: 35, width: 140, height: 270 }; // the bag in IV bag.webp
const FULL_SPRITE = { x: 0, y: 0, width: 16, height: 16 };      // a whole 16x16 sprite
const TALL_SPRITE = { x: 0, y: 0, width: 16, height: 32 };      // a whole 16x32 sprite
// Where her nose is in "Astronaut Close up.png" (for the feeding tube)
const ASTRONAUT_NOSE = { x: 213, y: 275 };

// The bed in the recovery room where the astronaut lies unconscious
// (3/4 the size of the bed image, with room to walk around both sides)
const cot = {
  x: 210,
  y: 162, // bottom of the bed
  width: 48,
  height: 39
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

// Door on the storage room's back wall (right side) that leads to the oxygen room
const oxygenRoomDoor = {
  x: 290,
  width: 16
};

// Door on the oxygen room's back wall that leads back to the storage room
const oxygenRoomExit = {
  x: 30,
  width: 16
};

// The oxygen filling station against the oxygen room's back wall
const oxygenFiller = {
  x: 140,
  width: 84
};

// ----- Oxygen -----
// Laika's oxygen goes from 100 (full) to 0 (empty). It runs out slowly,
// faster outside the ship. Refill it at the filling station.
let oxygen = 100;
const OXYGEN_DRAIN_OUTSIDE = 1.0;  // per second outside (100 seconds from full); none inside the ship
let lowOxygenWarned = false;       // so the "oxygen low" message only shows once
let oxygenUnlocked = false;        // the meter appears (and oxygen starts running out) once Laika goes outside

// Crates in the storage room. y = bottom of the crate.
// sprite = which cabinet from INTERIOR is drawn (at 3/4 of its size)
const crates = [
  { x: 110, y: 150, width: 38, height: 32, sprite: "cabinetWide" },
  { x: 170, y: 128, width: 24, height: 32, sprite: "cabinetTall" },
  { x: 225, y: 165, width: 24, height: 30, sprite: "cabinetSmall" }
];

// ----- Mission items -----
// Mission 1: the oxygen tank, hidden in the storage room
const oxygenTank = {
  scene: "storage",
  x: 270,  // center
  y: 140,  // bottom
  collected: false, // Laika picked it up (it starts empty)
  filled: false     // filled at the oxygen room's filling station
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

// =============================================
// MISSION: KEEP THE ASTRONAUT ALIVE (after the tutorial)
// Edit this section to move items or change the numbers.
// =============================================

// The planet has three outdoor areas side by side. Walk off the left or
// right edge of the screen to go to the next one.
const OUTDOOR_LINKS = {
  jungle: { right: "outside" },
  outside: { left: "jungle", right: "lake" }, // "outside" = the crash site
  lake: { left: "outside" }
};

function isOutdoors(scene) {
  return scene === "outside" || scene === "jungle" || scene === "lake";
}

// Water: a bucket that starts in the storage room. Laika carries it in her
// mouth (collected = true), can drop it anywhere (Q), and pick it up again.
const bucket = {
  scene: "storage", x: 66, y: 162, // where it is when it's on the ground
  collected: false, // Laika is carrying it
  filled: false,    // it has water in it right now
  water: 0,         // how many waterings are left (a full bucket has BUCKET_USES)
  found: false,     // Laika has picked it up at least once
  filledOnce: false // Laika has filled it at the lake at least once
};
const BUCKET_USES = 3; // a full bucket can water plants this many times

// Places in the ship where the empty bucket can reappear after Laika
// gives the water to the astronaut
const BUCKET_SPAWNS = [
  { scene: "inside", x: 60, y: 150 },
  { scene: "storage", x: 66, y: 162 },
  { scene: "oxygenRoom", x: 110, y: 160 }
];
const lake = { x: 190, y: 154, radiusX: 70, radiusY: 15 }; // in the "lake" area
// Where Lake.png is drawn (it's flattened a little to fit the ground)
const LAKE_IMAGE = { x: 115, y: 128, width: 150, height: 44, crop: { x: 73, y: 132, width: 342, height: 236 } };

// Food: strange alien fruit around the planet. (x, y) = bottom center.
// type = which fruit from "Alien fruits.png" (0 to 15)
const FRUIT_NEEDED = 4;
let fruitCount = 0; // alien fruit Laika has (picked or harvested)
const alienFruits = [
  { scene: "outside", x: 195, y: 140, type: 0, collected: false },
  { scene: "jungle", x: 60, y: 150, type: 4, collected: false },
  { scene: "jungle", x: 150, y: 172, type: 9, collected: false },
  { scene: "jungle", x: 130, y: 160, type: 14, collected: false },
  { scene: "lake", x: 88, y: 152, type: 6, collected: false },
  { scene: "lake", x: 290, y: 156, type: 11, collected: false }
];

// Seeds for the farm. Each pod holds a few seeds of one kind; each kind
// of seed grows a different fruit (seed type N grows fruit type N).
let seedBag = [];       // the seed types Laika is carrying, e.g. [1, 1, 2]
let seedsFound = false; // has she ever found seeds?
const seedPods = [
  { scene: "jungle", x: 112, y: 142, type: 1, count: 2, collected: false },
  { scene: "lake", x: 300, y: 142, type: 2, count: 2, collected: false }
];

// The farm: three soil plots next to the crashed ship.
// stage: "empty" -> "dug" -> "seed" -> "sprout" -> "mature"
// Seeds and sprouts only grow after Laika waters them with a full bucket.
// timer counts seconds in the current stage, so plants keep growing
// wherever Laika goes.
const FARM_SPROUT_TIME = 15;  // seconds from watered seed to sprout
const FARM_MATURE_TIME = 25;  // seconds from watered sprout to mature plant
const FARM_REGROW_TIME = 30;  // seconds for new fruit after a harvest
const farmPlots = [
  { x: 128, y: 160, stage: "empty", timer: 0, watered: false, fruitType: 0, fruitReady: false },
  { x: 158, y: 160, stage: "empty", timer: 0, watered: false, fruitType: 0, fruitReady: false },
  { x: 188, y: 160, stage: "empty", timer: 0, watered: false, fruitType: 0, fruitReady: false }
];
let farmWatered = false;   // has she watered a plant at least once?
let farmHarvested = false; // has she harvested at least once?

// The big tree in the jungle (Big Tree.png). Laika can inspect it.
const bigTree = { x: 30, size: 128, trunkX: 92, inspected: false };

// The mission opens up in two steps after the tutorial:
// 1. Laika goes back inside the ship -> the bucket appears in the storage room
// 2. Laika comes back outside        -> fruit, seeds, farm, signs, jungle and lake appear
let wentInsideAfterTutorial = false;
let missionUnlocked = false;

let treatLeft = false;       // Laika left a treat next to the astronaut's head
let waterGiven = false;      // Laika gave the astronaut water
let foodGiven = false;       // Laika gave the astronaut food
let mainMissionDone = false; // both water and food were given

// "Solid" areas the dog can't walk through, one list per scene.
// These are the parts of objects that touch the floor (their "footprint").
const solids = {
  outside: [
    { x: ship.x, y: ship.y - 8, width: ship.width, height: 10 }
  ],
  // (The ship monitor hangs on the wall above Laika's head, so it isn't
  // solid: she can walk right past it.)
  inside: [],
  recovery: [
    { x: cot.x, y: cot.y - 28, width: cot.width, height: 28 }, // the bed (seen from above, so most of it is solid)
    // heart monitor stand: only its pole is solid, so Laika still fits
    // between it and the bed
    { x: heartMonitor.x + 14, y: cot.y - 7, width: 7, height: 5 }
  ],
  storage: [],
  oxygenRoom: [
    // The filling station: Laika stops in front of it
    { x: oxygenFiller.x, y: INSIDE_FLOOR_TOP, width: oxygenFiller.width, height: 14 }
  ],
  jungle: [
    // The big tree's trunk
    { x: bigTree.trunkX - 14, y: GROUND_TOP + 2, width: 28, height: 8 }
  ],
  lake: [
    // The water: Laika walks around the shore, not into the lake
    { x: lake.x - lake.radiusX + 6, y: lake.y - lake.radiusY + 1, width: lake.radiusX * 2 - 12, height: lake.radiusY * 2 - 2 }
  ]
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
  updateTitleMusic(); // the title music stops when the game begins
  explosionPlayed = false; // this crash gets its one explosion
  // Start the spaceship flying sound right away, during the New Game click
  // (browsers always allow sound to start inside a click)
  sounds.flight.currentTime = 0;
  setLoop(sounds.flight, true, 1);
}

function startGameplay() {
  state = "play";
  currentScene = "recovery";
  dialogueBox.classList.add("hidden");
  objectivesPanel.classList.remove("hidden");
  updateObjectives();

  // First, the controls walkthrough ("Press W to walk forward", ...).
  // The controls panel appears when it's finished.
  moveTutorialIndex = 0;
  moveTutorialTime = 0;
  controlsPanel.classList.add("hidden");
  showMoveTutorialStep();

  // Laika starts in the recovery room, next to the unconscious astronaut
  // (the same spot where the cutscene ends)
  dog.x = cot.x - 30;
  dog.y = cot.y + 8;
  dog.facing = 1;

  playTime = 0;
  screenFade = 1; // fade in from black
  saveGame(); // this new game replaces any older saved game
}

// =============================================
// SAVING AND LOADING
// The game saves itself every few seconds during gameplay (and when the
// page is closed) in the browser's localStorage, on this computer only.
// The menu's Continue button loads it.
// =============================================

const SAVE_KEY = "wienerDogSave";
const SAVE_EVERY = 3; // seconds between autosaves
let saveTimer = 0;

// Everything that changes while playing, as one plain object
function makeSaveData() {
  return {
    version: 1,
    scene: currentScene,
    dog: { x: dog.x, y: dog.y, facing: dog.facing },
    treats: treats,
    oxygen: oxygen,
    oxygenUnlocked: oxygenUnlocked,
    moveTutorialIndex: moveTutorialIndex,
    tutorialCompleteSeen: tutorialCompleteSeen,
    oxygenTank: { collected: oxygenTank.collected, filled: oxygenTank.filled },
    commDevice: { collected: commDevice.collected, attached: commDevice.attached },
    bucket: Object.assign({}, bucket),
    fruitCount: fruitCount,
    fruitsCollected: alienFruits.map(function (fruit) { return fruit.collected; }),
    seedBag: seedBag.slice(),
    seedsFound: seedsFound,
    seedPodsCollected: seedPods.map(function (pod) { return pod.collected; }),
    farmPlots: farmPlots.map(function (plot) { return Object.assign({}, plot); }),
    farmWatered: farmWatered,
    farmHarvested: farmHarvested,
    bigTreeInspected: bigTree.inspected,
    wentInsideAfterTutorial: wentInsideAfterTutorial,
    missionUnlocked: missionUnlocked,
    treatLeft: treatLeft,
    waterGiven: waterGiven,
    foodGiven: foodGiven,
    mainMissionDone: mainMissionDone
  };
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(makeSaveData()));
  } catch (error) {
    // saving isn't allowed in this browser: the game still works, it just won't save
  }
}

// Returns the saved game, or null if there isn't one (or it can't be read)
function readSave() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    return data && data.version === 1 ? data : null;
  } catch (error) {
    return null;
  }
}

// Saves every few seconds while playing (not during scenes or menus)
function updateAutosave(deltaTime) {
  saveTimer += deltaTime;
  if (saveTimer >= SAVE_EVERY) {
    saveTimer = 0;
    saveGame();
  }
}

// Closing or reloading the page while playing also saves
window.addEventListener("beforeunload", function () {
  if (state === "play" || state === "paused" || state === "tutorial" ||
      state === "survival" || state === "heart" || state === "story" || state === "died") {
    saveGame();
  }
});

// Continue: put everything back the way it was saved, then start playing
function continueGame() {
  const data = readSave();
  if (!data) {
    return;
  }
  currentScene = data.scene;
  dog.x = data.dog.x;
  dog.y = data.dog.y;
  dog.facing = data.dog.facing;
  treats = data.treats;
  oxygen = data.oxygen;
  oxygenUnlocked = data.oxygenUnlocked;
  moveTutorialIndex = data.moveTutorialIndex;
  tutorialCompleteSeen = data.tutorialCompleteSeen;
  Object.assign(oxygenTank, data.oxygenTank);
  Object.assign(commDevice, data.commDevice);
  Object.assign(bucket, data.bucket);
  fruitCount = data.fruitCount;
  alienFruits.forEach(function (fruit, i) { fruit.collected = data.fruitsCollected[i]; });
  seedBag = data.seedBag;
  seedsFound = data.seedsFound;
  seedPods.forEach(function (pod, i) { pod.collected = data.seedPodsCollected[i]; });
  farmPlots.forEach(function (plot, i) { Object.assign(plot, data.farmPlots[i]); });
  farmWatered = data.farmWatered;
  farmHarvested = data.farmHarvested;
  bigTree.inspected = data.bigTreeInspected;
  wentInsideAfterTutorial = data.wentInsideAfterTutorial;
  missionUnlocked = data.missionUnlocked;
  treatLeft = data.treatLeft;
  waterGiven = data.waterGiven;
  foodGiven = data.foodGiven;
  mainMissionDone = data.mainMissionDone;

  state = "play";
  menuScreen.classList.add("hidden");
  updateTitleMusic(); // the title music stops
  objectivesPanel.classList.remove("hidden");
  updateObjectives();
  moveTutorialTime = 0;
  showMoveTutorialStep(); // the controls walkthrough, if it wasn't finished
  controlsPanel.classList.toggle("hidden", !moveTutorialDone());
  playTime = 0;
  screenFade = 1; // fade in from black
  showMessage("Welcome back, Laika!");
}

// =============================================
// CUTSCENE LOGIC
// =============================================

function startPhase(phase) {
  cutscene.phase = phase;
  cutscene.phaseTime = 0;

  // In the bedside scene, the treat appears next to her head (and stays there)
  if (phase === "bedsideTreat") {
    treatLeft = true;
  }

  // Put Laika where she needs to be for the phases that show her
  if (phase === "inside") {
    dog.x = cot.x - 30;
    dog.y = cot.y + 8;
    dog.facing = 1;
  }
}

// The dialogue system plays one list of lines at a time: the crash
// cutscene, or a short scene like Laika visiting the astronaut's bed
let activeLines = CUTSCENE_LINES;
let sceneOnEnd = null; // what happens when a short scene finishes

// Plays a short dialogue scene during gameplay, then returns to playing
function startScene(lines, onEnd) {
  activeLines = lines;
  sceneOnEnd = onEnd;
  state = "cutscene";
  cutscene.time = INTRO_TIME; // no intro: the first line shows straight away
  cutscene.lineIndex = -1;
  cutscene.ending = false;
  startPhase(lines[0].phase);
}

function finishScene() {
  dialogueBox.classList.add("hidden");
  stopVoice();
  activeLines = CUTSCENE_LINES;
  state = "play";
  const onEnd = sceneOnEnd;
  sceneOnEnd = null;
  if (onEnd) {
    onEnd();
  }
}

function showLine(index) {
  const line = activeLines[index];
  stopVoice(); // a new line starts its own voice
  cutscene.lineIndex = index;
  if (line.dogSound) {
    playDogSound(line.dogSound); // Laika barks or whines with this line
  }
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

  const isLastLine = index === activeLines.length - 1;
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

  const line = activeLines[cutscene.lineIndex];

  // If the text is still typing, the first press shows the whole line
  if (cutscene.typed < line.text.length) {
    cutscene.typed = line.text.length;
    dialogueText.textContent = line.text;
    stopBabble(); // the whole line is showing, so the babble stops
    return;
  }

  // Give the player time to read before moving on
  if (cutscene.lineTime < (line.wait || MIN_LINE_TIME)) {
    return;
  }

  if (cutscene.lineIndex < activeLines.length - 1) {
    showLine(cutscene.lineIndex + 1);
  } else if (activeLines !== CUTSCENE_LINES) {
    finishScene(); // a short scene ends straight back in gameplay
  } else {
    // Last line finished: fade out, then gameplay starts
    cutscene.ending = true;
    dialogueBox.classList.add("hidden");
    stopVoice();
  }
}

function updateCutscene(deltaTime) {
  cutscene.time += deltaTime;
  cutscene.phaseTime += deltaTime;

  // Engine, alarm and crash sounds follow the animation; dog sounds stop
  // at the end of their section
  updateCutsceneAudio();
  updateDogSound();

  // Fading out at the end
  if (cutscene.ending) {
    stopCutsceneAudio();
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
  const line = activeLines[cutscene.lineIndex];
  if (cutscene.typed < line.text.length) {
    cutscene.typed = Math.min(line.text.length, cutscene.typed + TYPE_SPEED * deltaTime);
    dialogueText.textContent = line.text.slice(0, Math.floor(cutscene.typed));
    updateVoice(line, cutscene.time); // babble while the text is appearing
  } else {
    stopBabble(); // the line has finished typing (a dog sound may still finish)
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
  updateAutosave(deltaTime);
  barkBubbleTime = Math.max(0, barkBubbleTime - deltaTime);
  screenFade = Math.max(0, screenFade - deltaTime); // finish the fade-in
  const startX = dog.x; // to tell later whether she actually moved
  const startY = dog.y;

  let moveX = 0;
  let moveY = 0;

  if (holding("left")) moveX -= 1;
  if (holding("right")) moveX += 1;
  if (holding("up")) moveY -= 1;
  if (holding("down")) moveY += 1;

  if (moveX !== 0) {
    dog.facing = moveX;
  }

  // The floor area the dog can walk on depends on the scene
  const floorTop = isOutdoors(currentScene) ? GROUND_TOP : INSIDE_FLOOR_TOP;
  const minY = floorTop + 4;
  const maxY = GAME_HEIGHT - 4;

  // Hold Shift to run
  dog.running = holding("run") && (moveX !== 0 || moveY !== 0);
  const speed = dog.speed * (dog.running ? RUN_SPEED : 1);

  // Move left/right first. If that walks into something solid, undo it.
  const oldX = dog.x;
  dog.x = clamp(dog.x + moveX * speed * deltaTime, 0, GAME_WIDTH - dog.width);
  if (dogHitsSolid()) {
    dog.x = oldX;
  }

  // Then move up/down the same way
  const oldY = dog.y;
  dog.y = clamp(dog.y + moveY * speed * 0.6 * deltaTime, minY, maxY);
  if (dogHitsSolid()) {
    dog.y = oldY;
  }

  // Outdoors: walking off the left or right edge goes to the next area
  const links = OUTDOOR_LINKS[currentScene];
  const atEdge = (moveX < 0 && dog.x <= 0 && links && links.left) ||
                 (moveX > 0 && dog.x >= GAME_WIDTH - dog.width && links && links.right);
  if (atEdge && !missionUnlocked) {
    // The jungle and the lake open up after the tutorial, once Laika has
    // been back inside the ship and come out again
    if (messageTimer <= 0) {
      showMessage(tutorialDone() ? "Laika should check on the ship first!" : "Finish the tutorial first!");
    }
  } else if (links) {
    if (moveX < 0 && dog.x <= 0 && links.left) {
      currentScene = links.left;
      dog.x = GAME_WIDTH - dog.width - 2; // come in from the right edge
    } else if (moveX > 0 && dog.x >= GAME_WIDTH - dog.width && links.right) {
      currentScene = links.right;
      dog.x = 2; // come in from the left edge
    }
  }

  // After going through a door, the player must let go of UP before
  // another door works. Otherwise holding W would bounce straight back.
  if (moveY >= 0) {
    waitForUpRelease = false;
  }

  // Doors: walking UP while lined up with a door changes the scene
  // (doors open once the controls walkthrough is finished)
  if (moveY < 0 && !waitForUpRelease && moveTutorialDone()) {
    const sceneBefore = currentScene;
    if (currentScene === "outside" && dogLinedUpWith(shipDoor) && dog.y <= ship.y + 6) {
      // Enter the ship. Start just in front of the exit door.
      currentScene = "inside";
      dog.x = exitDoor.x + exitDoor.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    } else if (currentScene === "inside" && dogLinedUpWith(exitDoor) && dog.y <= minY + 1) {
      if (!oxygenTank.filled) {
        // Laika can't go outside until her oxygen tank is filled
        if (messageTimer <= 0) {
          showMessage(oxygenTank.collected
            ? "Fill the oxygen tank in the oxygen room first!"
            : "Laika needs an oxygen tank before going outside!");
        }
      } else {
        // Leave the ship. Start just in front of the outside door.
        currentScene = "outside";
        dog.x = shipDoor.x + shipDoor.width / 2 - dog.width / 2;
        dog.y = ship.y + 14;
      }
    } else if (currentScene === "storage" && dogLinedUpWith(oxygenRoomDoor) && dog.y <= minY + 1) {
      // Go into the oxygen room. Start just in front of its door.
      currentScene = "oxygenRoom";
      dog.x = oxygenRoomExit.x + oxygenRoomExit.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    } else if (currentScene === "oxygenRoom" && dogLinedUpWith(oxygenRoomExit) && dog.y <= minY + 1) {
      // Back to the storage room. Start just in front of the oxygen room door.
      currentScene = "storage";
      dog.x = oxygenRoomDoor.x + oxygenRoomDoor.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    } else if (currentScene === "inside" && dogLinedUpWith(storageDoor) && dog.y <= minY + 1) {
      // Go into the storage room. Start just in front of its door.
      currentScene = "storage";
      dog.x = storageExit.x + storageExit.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    } else if (currentScene === "inside" && dogLinedUpWith(recoveryDoor) && dog.y <= minY + 1) {
      // Go into the recovery room. Start just in front of its door.
      currentScene = "recovery";
      dog.x = recoveryExit.x + recoveryExit.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    } else if (currentScene === "recovery" && dogLinedUpWith(recoveryExit) && dog.y <= minY + 1) {
      // Back to the main room. Start just in front of the recovery room door.
      currentScene = "inside";
      dog.x = recoveryDoor.x + recoveryDoor.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    } else if (currentScene === "storage" && dogLinedUpWith(storageExit) && dog.y <= minY + 1) {
      // Back to the main room. Start just in front of the storage door.
      currentScene = "inside";
      dog.x = storageDoor.x + storageDoor.width / 2 - dog.width / 2;
      dog.y = INSIDE_FLOOR_TOP + 16;
    }

    if (currentScene !== sceneBefore) {
      playFrom("door"); // went through a door
      waitForUpRelease = true;
    }
  }

  attachEffectTime = Math.max(0, attachEffectTime - deltaTime);

  updateOxygen(deltaTime);
  updateFarm(deltaTime);
  updateMissionUnlock();
  updateMoveTutorial(deltaTime);

  // Paw steps while she's actually moving (walking into a wall is silent)
  const moved = dog.x !== startX || dog.y !== startY;
  if (state === "play") {
    updateFootsteps(moved, dog.running, playTime);
  }
}

// After the tutorial: going back inside the ship, then coming back out,
// opens up the new mission
function updateMissionUnlock() {
  if (!tutorialDone() || missionUnlocked) {
    return;
  }
  if (!isOutdoors(currentScene)) {
    wentInsideAfterTutorial = true;
  } else if (wentInsideAfterTutorial) {
    missionUnlocked = true;
    showMessage("Something new is growing on the planet... Time to explore!");
  }
}

// Plants grow over time, even when Laika is somewhere else
function updateFarm(deltaTime) {
  for (const plot of farmPlots) {
    plot.timer += deltaTime;
    if ((plot.stage === "seed" || plot.stage === "sprout") && !plot.watered) {
      plot.timer = 0; // dry plants don't grow; they wait for water
    } else if (plot.stage === "seed" && plot.timer >= FARM_SPROUT_TIME) {
      plot.stage = "sprout";
      plot.timer = 0;
      plot.watered = false; // the sprout needs water again
    } else if (plot.stage === "sprout" && plot.timer >= FARM_MATURE_TIME) {
      plot.stage = "mature";
      plot.fruitReady = true;
      plot.timer = 0;
    } else if (plot.stage === "mature" && !plot.fruitReady && plot.timer >= FARM_REGROW_TIME) {
      plot.fruitReady = true; // new fruit grows back after a harvest
    }
  }
}

// Oxygen slowly runs out while Laika is outside (the ship has air, so it
// doesn't go down indoors). If it reaches 0, Laika faints and wakes up in
// the oxygen room with a full meter.
function updateOxygen(deltaTime) {
  if (!isOutdoors(currentScene)) {
    return; // inside the ship: no oxygen is used
  }
  oxygenUnlocked = true; // the first trip outside turns on the oxygen meter
  oxygen = Math.max(0, oxygen - OXYGEN_DRAIN_OUTSIDE * deltaTime);

  if (oxygen <= 25 && !lowOxygenWarned) {
    lowOxygenWarned = true;
    showMessage("Oxygen low! Refill it in the oxygen room.");
  }
  if (oxygen > 25) {
    lowOxygenWarned = false;
  }

  if (oxygen <= 0) {
    // Laika faints: play the "died" sound and show the "ran out of oxygen"
    // screen. She's moved to the oxygen room behind it, with a full meter.
    playSound(sounds.died);
    stopFootsteps();
    currentScene = "oxygenRoom";
    dog.x = oxygenFiller.x + oxygenFiller.width / 2 - dog.width / 2;
    dog.y = INSIDE_FLOOR_TOP + 34;
    oxygen = 100;
    screenFade = 1;
    state = "died"; // the game pauses until the player closes the screen
    messageBox.classList.add("hidden"); // hide "Oxygen low!" behind the screen
    messageTimer = 0;
    document.getElementById("died-panel").classList.remove("hidden");
  }
}

// Closing the "ran out of oxygen" screen: back to playing, in the oxygen room
function closeDiedPanel() {
  state = "play";
  document.getElementById("died-panel").classList.add("hidden");
  document.getElementById("died-close").blur();
  showMessage("Laika woke up in the oxygen room.");
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
  // (The survival screen is checked first: standing at the right end of the
  // monitor already counts as being at the survival screen)
  if (dogNearSurvivalScreen()) {
    return { text: "Press E: survival screen", x: survivalScreen.x + survivalScreen.width / 2, y: survivalScreen.y - 4, sound: "monitor", action: openSurvivalScreen };
  }
  if (dogNearMonitor()) {
    return { text: "Press E: monitor", x: monitor.x + monitor.width / 2, y: MONITOR_TOP - 4, sound: "monitor", action: openTutorial };
  }
  if (dogNearFiller()) {
    const x = oxygenFiller.x + oxygenFiller.width / 2;
    if (!oxygenTank.collected) {
      return { text: "Press E: oxygen filler", x: x, y: 50, hint: true, action: function () {
        showMessage("Laika needs an oxygen tank to fill! It's in the storage room.");
      } };
    }
    if (!oxygenTank.filled) {
      return { text: "Press E: fill oxygen tank", x: x, y: 50, action: fillOxygenTank };
    }
    if (oxygen < 99) {
      return { text: "Press E: refill oxygen", x: x, y: 50, action: refillOxygen };
    }
  }
  if (!oxygenTank.collected && dogNear(oxygenTank)) {
    return { text: "Press E: take oxygen", x: oxygenTank.x, y: oxygenTank.y - 30, action: collectOxygen };
  }
  if (!commDevice.collected && dogNear(commDevice)) {
    return { text: "Press E: pick up device", x: commDevice.x, y: commDevice.y - 18, action: collectDevice };
  }
  if (commDevice.collected && !commDevice.attached && dogAtShip()) {
    return { text: "Press E: attach device", x: dog.x + dog.width / 2, y: dog.y - dog.height - 8, sound: "attach", action: attachDevice };
  }
  if (dogNearHeartMonitor()) {
    return { text: "Press E: heart monitor", x: heartMonitor.x + heartMonitor.width / 2, y: cot.y - 62, sound: "none", action: openHeartMonitor };
  }

  // ----- Mission: Keep the Astronaut Alive -----
  // (the bucket can be used once Laika has gone back inside after the
  // tutorial; everything else once she has come back out again)
  if (!wentInsideAfterTutorial) {
    return null;
  }
  if (!bucket.collected && dogNear(bucket)) {
    const text = bucket.found ? "Press E: pick up bucket" : "Press E: take bucket";
    return { text: text, x: bucket.x, y: bucket.y - 14, sound: "bucket", action: collectBucket };
  }
  if (!missionUnlocked) {
    return null;
  }
  if (dogNearLake()) {
    const x = dog.x + dog.width / 2;
    const y = dog.y - dog.height - 8;
    if (!bucket.collected) {
      return { text: "Press E: lake", x: x, y: y, hint: true, action: function () {
        showMessage(bucket.found ? "Laika needs to carry the bucket to get water."
                                 : "Laika needs a bucket to carry water. Check the ship's storage room!");
      } };
    }
    if (bucket.water < BUCKET_USES) {
      // Fill an empty bucket, or top up one that's partly used
      return { text: bucket.filled ? "Press E: top up bucket" : "Press E: fill bucket", x: x, y: y, sound: "bucket", action: fillBucket };
    }
  }
  for (const fruit of alienFruits) {
    if (!fruit.collected && dogNear(fruit)) {
      return { text: "Press E: pick alien fruit", x: fruit.x, y: fruit.y - 14, action: function () { collectFruit(fruit); } };
    }
  }
  for (const pod of seedPods) {
    if (!pod.collected && dogNear(pod)) {
      return { text: "Press E: take seeds", x: pod.x, y: pod.y - 12, sound: "seeds", action: function () { collectSeeds(pod); } };
    }
  }
  if (dogNearBigTree()) {
    return { text: "Press E: inspect tree", x: bigTree.trunkX, y: GROUND_TOP - 20, action: inspectBigTree };
  }
  for (const plot of farmPlots) {
    if (dogNearPlot(plot)) {
      return farmInteraction(plot);
    }
  }
  if (dogNearBed() && tutorialDone() && !mainMissionDone) {
    const canGiveWater = bucket.collected && bucket.filled && !waterGiven;
    const canGiveFood = fruitCount >= FRUIT_NEEDED && !foodGiven;
    if (canGiveWater || canGiveFood) {
      return { text: "Press E: give supplies", x: cot.x + cot.width / 2, y: cot.y - 62, sound: "none", action: giveSupplies };
    }
    return { text: "Press E: check on her", x: cot.x + cot.width / 2, y: cot.y - 62, hint: true, action: checkOnAstronaut };
  }
  return null;
}

// What the astronaut still needs, as a sentence
function stillNeeded() {
  if (waterGiven && foodGiven) return "She has the water and food she needs for now.";
  if (!waterGiven && !foodGiven) return "Laika needs to bring her water and food.";
  if (!waterGiven) return "She still needs water.";
  return "She still needs food (" + Math.min(fruitCount, FRUIT_NEEDED) + "/" + FRUIT_NEEDED + " fruit).";
}

// True when Laika is standing at the foot of the big tree in the jungle
function dogNearBigTree() {
  return currentScene === "jungle" &&
         Math.abs(dog.x + dog.width / 2 - bigTree.trunkX) < 30 &&
         dog.y < GROUND_TOP + 22;
}

function inspectBigTree() {
  bigTree.inspected = true;
  showMessage("A giant alien tree! Its bark hums softly, and something rustles in the hollow...");
}

// Laika drops whatever bucket she is carrying where she stands (Q)
function dropBucket() {
  if (!bucket.collected) {
    return;
  }
  bucket.collected = false;
  bucket.scene = currentScene;
  bucket.x = dog.x + dog.width / 2;
  bucket.y = dog.y;
  showMessage(bucket.filled ? "Laika put down the bucket of water." : "Laika put down the empty bucket.");
  playFrom("bucket");
}

// True when Laika is on the shore of the lake
function dogNearLake() {
  const middle = dog.x + dog.width / 2;
  return currentScene === "lake" &&
         middle > lake.x - lake.radiusX - 16 && middle < lake.x + lake.radiusX + 16 &&
         dog.y > lake.y - lake.radiusY - 8 && dog.y < lake.y + lake.radiusY + 10;
}

// True when Laika is right next to the astronaut's bed
function dogNearBed() {
  return currentScene === "recovery" &&
         dog.x + dog.width > cot.x - 8 && dog.x < cot.x + cot.width + 8 &&
         dog.y > cot.y - 44 && dog.y < cot.y + 12;
}

// True when Laika is standing on a farm plot
function dogNearPlot(plot) {
  const middle = dog.x + dog.width / 2;
  return currentScene === "outside" && Math.abs(middle - plot.x) < 12 && Math.abs(dog.y - plot.y) < 7;
}

function collectBucket() {
  bucket.collected = true;
  if (!bucket.found) {
    bucket.found = true;
    showMessage("Laika found a bucket! Fill it with water at the lake. (Q drops it)");
  } else {
    showMessage(bucket.filled ? "Laika picked up the bucket of water." : "Laika picked up the bucket.");
  }
  updateObjectives();
}

function fillBucket() {
  bucket.filled = true;
  bucket.water = BUCKET_USES;
  if (!bucket.filledOnce) {
    bucket.filledOnce = true;
    treats += 1;
    showMessage("The bucket is full of water! +1 Treat");
  } else {
    showMessage("The bucket is full of water!");
  }
  updateObjectives();
}

function collectFruit(fruit) {
  fruit.collected = true;
  fruitCount += 1;
  if (fruitCount === FRUIT_NEEDED && !foodGiven) {
    treats += 1;
    showMessage("That's enough food for the astronaut! +1 Treat");
  } else {
    showMessage("Alien fruit! (" + Math.min(fruitCount, FRUIT_NEEDED) + "/" + FRUIT_NEEDED + ")");
  }
  updateObjectives();
}

function collectSeeds(pod) {
  pod.collected = true;
  for (let i = 0; i < pod.count; i++) {
    seedBag.push(pod.type);
  }
  seedsFound = true;
  showMessage("Laika found " + pod.count + " alien seeds! Plant them at the farm by the ship.");
  updateObjectives();
}

// What pressing E does on a farm plot, depending on how far it has grown
function farmInteraction(plot) {
  const x = plot.x;
  const y = plot.y - 22;
  if (plot.stage === "empty") {
    return { text: "Press E: dig", x: x, y: y, sound: "dig", action: function () {
      plot.stage = "dug";
      plot.timer = 0;
      showMessage("Laika dug a planting spot!");
      updateObjectives();
    } };
  }
  if (plot.stage === "dug") {
    return { text: "Press E: plant seeds", x: x, y: y, hint: seedBag.length === 0, sound: "dig", action: function () {
      if (seedBag.length === 0) {
        showMessage("Laika needs seeds to plant. Look around the planet!");
        return;
      }
      plot.fruitType = seedBag.shift(); // this kind of seed grows this kind of fruit
      plot.stage = "seed";
      plot.timer = 0;
      plot.watered = false;
      showMessage("Seed planted! Now water it with a full bucket.");
      updateObjectives();
    } };
  }
  if ((plot.stage === "seed" || plot.stage === "sprout") && !plot.watered) {
    // Plants need water to grow
    if (bucket.collected && bucket.filled) {
      return { text: "Press E: water plant (" + bucket.water + " left)", x: x, y: y, sound: "bucket", action: function () {
        plot.watered = true;
        plot.timer = 0;
        bucket.water -= 1; // each watering uses one of the bucket's 3 uses
        bucket.filled = bucket.water > 0;
        farmWatered = true;
        if (bucket.filled) {
          showMessage("Laika watered the plant! Water left in the bucket: " + bucket.water);
        } else {
          showMessage("Laika watered the plant! The bucket is empty - refill it at the lake.");
        }
        updateObjectives();
      } };
    }
    return { text: "Press E: check plant", x: x, y: y, hint: true, action: function () {
      showMessage("It needs water to grow! Bring a bucket of water from the lake.");
    } };
  }
  if (plot.stage === "mature" && plot.fruitReady) {
    return { text: "Press E: harvest", x: x, y: y, action: function () {
      plot.fruitReady = false;
      plot.timer = 0;
      fruitCount += 1;
      if (!farmHarvested) {
        farmHarvested = true;
        treats += 1;
        showMessage("Laika harvested farm fruit! It will grow more. +1 Treat");
      } else {
        showMessage("More alien fruit from the farm!");
      }
      updateObjectives();
    } };
  }
  return { text: "Press E: check plant", x: x, y: y, hint: true, action: function () {
    showMessage(plot.stage === "mature" ? "New fruit is still growing..." : "It's still growing. Come back later!");
  } };
}

// Laika gives the astronaut whatever she has: the bucket of water and/or
// enough fruit. When both have been given, the mission is complete.
function giveSupplies() {
  const gave = [];
  if (bucket.collected && bucket.filled && !waterGiven) {
    waterGiven = true;
    gave.push("water");
    // The water is used up. The empty bucket goes back somewhere in the ship.
    const spot = BUCKET_SPAWNS[Math.floor(Math.random() * BUCKET_SPAWNS.length)];
    bucket.collected = false;
    bucket.filled = false;
    bucket.water = 0;
    bucket.scene = spot.scene;
    bucket.x = spot.x;
    bucket.y = spot.y;
  }
  if (fruitCount >= FRUIT_NEEDED && !foodGiven) {
    foodGiven = true;
    fruitCount -= FRUIT_NEEDED;
    gave.push("food");
  }
  updateObjectives();

  // A short bedside scene: Laika barks, gives the supplies, and leaves a
  // treat next to her human's head. Then the game carries on.
  sceneGave = gave;
  const what = gave.length === 2 ? "water and alien fruit" : (gave[0] === "water" ? "some water" : "some alien fruit");
  startScene([
    { speaker: "Laika", text: "Bark! Bark!", phase: "bedside", dogSound: "bark" },
    { speaker: "Narration", text: "Laika gives her human " + what + ".", phase: "bedside" },
    { speaker: "Narration", text: "Then she leaves a treat next to her head. Get well soon!", phase: "bedsideTreat" }
  ], function () {
    sceneGave = [];
    if (waterGiven && foodGiven) {
      mainMissionDone = true;
      treats += 2;
      playJingle(); // mission complete!
      updateObjectives();
      state = "story"; // pause the game while the message is shown
      document.getElementById("mission-panel").classList.remove("hidden");
    } else {
      const bucketNote = gave.includes("water") ? " The empty bucket went back somewhere in the ship." : "";
      showMessage(stillNeeded() + bucketNote, 4);
    }
  });
}

// Checking on the astronaut without the supplies: a short bedside scene
function checkOnAstronaut() {
  sceneGave = [];
  startScene([
    { speaker: "Laika", text: "Bark?", phase: "bedside", dogSound: "bark" },
    { speaker: "Narration", text: "She's still unconscious. " + stillNeeded(), phase: "bedside" }
  ], null);
}

let sceneGave = []; // what Laika is giving in the bedside scene ("water", "food")

function closeMissionPanel() {
  state = "play";
  document.getElementById("mission-panel").classList.add("hidden");
  document.getElementById("mission-close").blur();
}

function collectOxygen() {
  oxygenTank.collected = true;
  treats += 1;
  showMessage("Oxygen tank collected! Now fill it in the oxygen room. +1 Treat");
  updateObjectives();
}

// True when Laika is in the oxygen room, standing in front of the filling station
function dogNearFiller() {
  return currentScene === "oxygenRoom" &&
         dog.x + dog.width > oxygenFiller.x &&
         dog.x < oxygenFiller.x + oxygenFiller.width &&
         dog.y <= INSIDE_FLOOR_TOP + 24;
}

function fillOxygenTank() {
  oxygenTank.filled = true;
  oxygen = 100;
  treats += 1;
  showMessage("Oxygen tank filled! +1 Treat");
  updateObjectives();
}

// The congratulations jingle plays exactly once for the tutorial: the
// first time Laika goes back to the monitor and sees "Tutorial Complete"
// (see openTutorial). It also plays when the supplies mission is done.
let jingleJustPlayed = false; // so the interact sound doesn't play over it
function playJingle() {
  jingleJustPlayed = true;
  playSound(sounds.celebrate);
}

function refillOxygen() {
  oxygen = 100;
  showMessage("Oxygen refilled!");
}

// The tutorial is finished when the tank is filled and the radio is attached
function tutorialDone() {
  return oxygenTank.filled && commDevice.attached;
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

// Shows a pop-up message for a few seconds (2.5 unless another time is given)
function showMessage(text, seconds) {
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
  messageTimer = seconds || 2.5;
}

function updateMessage(deltaTime) {
  if (messageTimer > 0) {
    messageTimer -= deltaTime;
    if (messageTimer <= 0) {
      messageBox.classList.add("hidden");
    }
  }
}

// Adds one line to the objective tracker.
// type: "heading" (a section title), "info" (extra info), or a task:
// tasks show [x] when done and [ ] when not.
function addObjectiveLine(text, done, type) {
  const line = document.createElement("p");
  if (type === "heading" || type === "info") {
    line.textContent = text;
    line.classList.add(type === "heading" ? "objective-heading" : "objective-info");
  } else {
    line.textContent = (done ? "[x] " : "[ ] ") + text;
    if (done) {
      line.classList.add("done");
    }
  }
  objectiveList.appendChild(line);
}

// Refreshes the objective tracker and shows a hint for the next step.
// The tutorial is shown first; after it, the main mission and side objective.
function updateObjectives() {
  objectiveList.innerHTML = "";
  let hint;

  if (!tutorialDone()) {
    addObjectiveLine("Tutorial", false, "heading");
    addObjectiveLine("Find the oxygen tank", oxygenTank.collected);
    addObjectiveLine("Fill it in the oxygen room", oxygenTank.filled);
    addObjectiveLine("Recover the communication device", commDevice.collected);
    addObjectiveLine("Attach the device at the ship", commDevice.attached);

    if (!oxygenTank.collected) {
      hint = "Hint: look for the blue O2 sign on a door inside the ship.";
    } else if (!oxygenTank.filled) {
      hint = "Hint: the oxygen room is through the green door in the storage room.";
    } else if (!commDevice.collected) {
      hint = "Hint: follow the beeping signal outside, among the crash debris.";
    } else {
      hint = "Hint: bring the device back to the ship and press E.";
    }
  } else {
    const enoughFruit = foodGiven || fruitCount >= FRUIT_NEEDED;
    const fruitShown = foodGiven ? FRUIT_NEEDED : Math.min(fruitCount, FRUIT_NEEDED);
    addObjectiveLine("Main Mission: Keep the Astronaut Alive", false, "heading");
    addObjectiveLine("Find a bucket in the spaceship", bucket.found);
    addObjectiveLine("Fill the bucket at the lake", bucket.filledOnce);
    addObjectiveLine("Collect alien fruit (" + fruitShown + "/" + FRUIT_NEEDED + ")", enoughFruit);
    addObjectiveLine("Return to the astronaut with the supplies", mainMissionDone);

    const planted = farmPlots.some(function (plot) { return plot.stage !== "empty" && plot.stage !== "dug"; });
    const dug = farmPlots.some(function (plot) { return plot.stage !== "empty"; });
    addObjectiveLine("Side Objective: Start a Farm", false, "heading");
    addObjectiveLine("Find seeds", seedsFound);
    addObjectiveLine("Dig a planting spot", dug);
    addObjectiveLine("Plant the seeds", planted);
    addObjectiveLine("Water the plants", farmWatered);
    addObjectiveLine("Grow and harvest alien fruit", farmHarvested);

    if (!bucket.found) {
      hint = "Hint: look for a bucket in the ship's storage room.";
    } else if (!waterGiven && !bucket.filledOnce) {
      hint = "Hint: the lake is past the right edge of the crash site (LAKE ->).";
    } else if (!enoughFruit) {
      hint = "Hint: alien fruit grows in the jungle (<- JUNGLE), by the lake and near the ship.";
    } else if (!mainMissionDone) {
      hint = "Hint: bring water and fruit to the astronaut's bed in the recovery room (red cross door). " + stillNeeded();
    } else if (!farmHarvested) {
      hint = "Side objective: find seeds and grow food at the farm next to the ship.";
    } else {
      hint = "Keep exploring! More adventures are coming...";
    }
  }
  objectiveHint.textContent = hint;
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

// The next set of tasks, shown on the monitor after the tutorial is complete.
// Add the new tasks here, for example: "Find the ship's engine part"
let tutorialCompleteSeen = false; // has the player seen "Tutorial Complete" yet?

const NEXT_TASKS = [
  "Main mission: Keep the astronaut alive - find water and food",
  "Side objective: Start a farm to grow food",
  "Explore the planet: the jungle is to the left, the lake to the right"
];

function openTutorial() {
  state = "tutorial"; // updatePlay stops running, so Laika can't move
  tutorialTime = 0;
  tutorialPanel.classList.remove("hidden");
  // Once the tutorial tasks are done, the monitor shows "Tutorial Complete"
  // and the next tasks instead of the picture instructions
  const done = tutorialDone();
  if (done) {
    if (!tutorialCompleteSeen) {
      playJingle(); // the first time "Tutorial Complete" is shown
    }
    tutorialCompleteSeen = true; // the "!" above the monitor goes away
  }
  document.getElementById("tutorial-steps").classList.toggle("hidden", done);
  document.getElementById("tutorial-complete").classList.toggle("hidden", !done);
  if (done) {
    const list = document.getElementById("next-tasks");
    list.innerHTML = "";
    const tasks = NEXT_TASKS.length > 0 ? NEXT_TASKS : ["More tasks coming soon..."];
    for (const task of tasks) {
      const item = document.createElement("li");
      item.textContent = "[ ] " + task;
      list.appendChild(item);
    }
  }
}

function closeTutorial() {
  state = "play";
  tutorialPanel.classList.add("hidden");
  tutorialClose.blur();
}

// =============================================
// SURVIVAL SCREEN (the small screen on the wall next to the ship monitor)
// "Status" tab: a few simple bars. "About" tab: all the details, with real
// reference numbers from survival-data.js (labeled NASA) and made-up planet
// values (labeled GAME).
// =============================================

// Where the survival screen hangs on the wall (between the monitor and the window)
const survivalScreen = { x: 186, y: 40, width: 32, height: 28 };

let survivalTab = "status"; // which tab is showing
let survivalRefreshTimer = 0;

// ----- Heart rate monitor (recovery room) -----
// The astronaut's heart rate is a GAME value (made up, not a real
// measurement). It's slow while she still needs water and food, and
// steady at about 72 BPM (like the picture) once she has both.
let heartRate = 58;      // beats per minute right now
let heartbeatTimer = 0;  // seconds until the next beat
let heartBeatFlash = 0;  // > 0 just after a beat (the light on the stand blinks)

function heartRateTarget() {
  if (waterGiven && foodGiven) return 72;
  if (waterGiven || foodGiven) return 65;
  return 58;
}

// Every beat: pick a heart rate close to the target, and beep if Laika is
// in the recovery room (or looking at the heart monitor)
function updateHeartbeat(deltaTime) {
  heartBeatFlash = Math.max(0, heartBeatFlash - deltaTime);
  heartbeatTimer -= deltaTime;
  if (heartbeatTimer > 0) {
    return;
  }
  heartRate = heartRateTarget() + Math.floor(Math.random() * 5) - 2;
  heartbeatTimer = 60 / heartRate;
  heartBeatFlash = 0.15;
  if (currentScene === "recovery" && (state === "play" || state === "heart")) {
    playSound(sounds.heartBeep);
  }
  if (state === "heart") {
    drawHeartMonitorScreen();
  }
}

// True when Laika is standing next to the heart monitor
function dogNearHeartMonitor() {
  const middle = dog.x + dog.width / 2;
  return currentScene === "recovery" &&
         middle > heartMonitor.x + 6 && middle < heartMonitor.x + heartMonitor.width + 8 &&
         dog.y > cot.y - 44 && dog.y < cot.y + 16;
}

function openHeartMonitor() {
  state = "heart"; // the game pauses while it's open
  document.getElementById("heart-panel").classList.remove("hidden");
  drawHeartMonitorScreen();
}

function closeHeartMonitor() {
  state = "play";
  document.getElementById("heart-panel").classList.add("hidden");
  document.getElementById("heart-close").blur();
}
document.getElementById("heart-close").addEventListener("click", closeHeartMonitor);

// Tiny 3x5 pixel digits, so the number matches the picture's pixel style.
// Each digit is 5 rows of 3 pixels ("1" = pixel on).
const PIXEL_DIGITS = {
  0: ["111", "101", "101", "101", "111"], 1: ["010", "110", "010", "010", "111"],
  2: ["111", "001", "111", "100", "111"], 3: ["111", "001", "111", "001", "111"],
  4: ["101", "101", "111", "001", "001"], 5: ["111", "100", "111", "001", "111"],
  6: ["111", "100", "111", "101", "111"], 7: ["111", "001", "010", "010", "010"],
  8: ["111", "101", "111", "101", "111"], 9: ["111", "101", "111", "001", "111"]
};
function drawPixelNumber(context, text, x, y, size, color) {
  context.fillStyle = color;
  for (let i = 0; i < text.length; i++) {
    const rows = PIXEL_DIGITS[text[i]];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (rows[row][col] === "1") {
          context.fillRect(x + i * size * 4 + col * size, y + row * size, size, size);
        }
      }
    }
  }
}

// The big heart monitor in the panel: the picture, with its "72" replaced
// by the live heart rate. (Called on every beat while the panel is open.)
function drawHeartMonitorScreen() {
  const canvas = document.getElementById("heart-canvas");
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  const crop = HEART_MONITOR_CROP;
  if (drawPart(context, images.heartMonitor, crop, 0, 0, canvas.width, canvas.height)) {
    context.fillStyle = "#000306";
    context.fillRect(118, 120 - crop.y, 30, 22); // cover the "72" in the picture
    drawPixelNumber(context, String(heartRate), 119, 122 - crop.y, 3, "#3be04a");
  } else {
    // Placeholder if Heart rate monitor.png is missing
    context.fillStyle = "#0b2a2a";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawPixelNumber(context, String(heartRate), 60, 60, 12, "#3be04a");
  }
  document.getElementById("heart-rate").textContent = heartRate + " BPM";
  // Restart the heart's "beat" animation (style.css)
  const heart = document.getElementById("heart-icon");
  heart.classList.remove("beat");
  void heart.offsetWidth; // makes the browser notice the class was removed
  heart.classList.add("beat");
  document.getElementById("heart-status").textContent = waterGiven && foodGiven
    ? "Steady. She has water and food, but she's still unconscious."
    : "Slow. She needs " + (waterGiven ? "food" : foodGiven ? "water" : "water and food") + ".";
}

// True when Laika is standing under the survival screen
function dogNearSurvivalScreen() {
  const middle = dog.x + dog.width / 2;
  return currentScene === "inside" &&
         middle > survivalScreen.x + 2 && middle < survivalScreen.x + survivalScreen.width + 6 &&
         dog.y <= INSIDE_FLOOR_TOP + 26;
}

function openSurvivalScreen() {
  state = "survival"; // the game pauses while it's open
  document.getElementById("survival-panel").classList.remove("hidden");
  showSurvivalTab("status");
}

function closeSurvivalScreen() {
  state = "play";
  document.getElementById("survival-panel").classList.add("hidden");
  document.getElementById("survival-close").blur();
}

function showSurvivalTab(tab) {
  survivalTab = tab;
  document.getElementById("survival-status").classList.toggle("hidden", tab !== "status");
  document.getElementById("survival-about").classList.toggle("hidden", tab !== "about");
  document.getElementById("tab-status").classList.toggle("active", tab === "status");
  document.getElementById("tab-about").classList.toggle("active", tab === "about");
  refreshSurvivalScreen();
}
document.getElementById("tab-status").addEventListener("click", function () { showSurvivalTab("status"); });
document.getElementById("tab-about").addEventListener("click", function () { showSurvivalTab("about"); });
document.getElementById("survival-close").addEventListener("click", closeSurvivalScreen);

function refreshSurvivalScreen() {
  if (survivalTab === "status") {
    renderSurvivalStatus();
  } else {
    renderSurvivalMonitor();
  }
}

// The Status tab: the astronaut, then one simple bar each for water,
// food, oxygen and life support
function renderSurvivalStatus() {
  const systems = lifeSupportSystems();
  const online = systems.filter(function (s) { return s.online; }).length;
  const bar = function (name, amount, total, color, note) {
    const percent = Math.round(100 * Math.max(0, Math.min(1, amount / total)));
    return "<div class=\"status-row\"><span>" + name + "</span>" +
           "<div class=\"meter\"><div class=\"meter-fill\" style=\"width:" + percent + "%;background:" + color + "\"></div></div>" +
           "<span class=\"status-note\">" + note + "</span></div>";
  };

  let astronaut = "Needs water and food";
  let mood = "bad";
  if (waterGiven && foodGiven) { astronaut = "Stable"; mood = "good"; }
  else if (waterGiven) { astronaut = "Needs food"; mood = "warn"; }
  else if (foodGiven) { astronaut = "Needs water"; mood = "warn"; }

  let html = "<p class=\"astronaut-line\">Astronaut: <span class=\"" + mood + "\">Unconscious &ndash; " + astronaut + "</span></p>";
  html += bar("Water", waterGiven ? 1 : bucket.water, waterGiven ? 1 : BUCKET_USES, "#3fc8ff",
              waterGiven ? "Given to the astronaut" : "Bucket: " + bucket.water + " / " + BUCKET_USES);
  html += bar("Food", foodGiven ? 1 : fruitCount, foodGiven ? 1 : FRUIT_NEEDED, "#b46cff",
              foodGiven ? "Given to the astronaut" : "Fruit: " + fruitCount + " / " + FRUIT_NEEDED);
  html += bar("Oxygen", oxygen, 100, oxygen > 25 ? "#5fd39a" : "#ff3b3b",
              "Laika: " + Math.round(oxygen) + "%");
  html += bar("Life support", online, systems.length, "#ffd84d",
              online + " / " + systems.length + " systems working");
  document.getElementById("survival-status").innerHTML = html;
}

// A small text bar like [######----]
function textBar(amount, total) {
  const filled = Math.round(10 * Math.max(0, Math.min(1, amount / total)));
  return "[" + "#".repeat(filled) + "-".repeat(10 - filled) + "]";
}

// The life-support systems Laika can restore. Each one turns on when
// Laika completes the matching task, so the readings follow the gameplay.
function lifeSupportSystems() {
  return [
    { name: "Oxygen supply (filling station)", online: oxygenTank.filled },
    { name: "Communications (radio)", online: commDevice.attached },
    { name: "Water for the astronaut", online: waterGiven },
    { name: "Food for the astronaut", online: foodGiven }
  ];
}

function renderSurvivalMonitor() {
  const box = document.getElementById("survival-about");
  const esc = function (text) { return String(text).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); };
  const row = function (label, value, mood) {
    return "<div class=\"reading\"><span>" + label + "</span><span class=\"value " + (mood || "") + "\">" + esc(value) + "</span></div>";
  };
  const hasRealData = typeof SURVIVAL_REAL_DATA !== "undefined";
  const real = function (key, label) {
    if (!hasRealData || !SURVIVAL_REAL_DATA[key]) {
      return row("<span class=\"tag real\">NASA</span>" + label, "no verified data loaded", "warn");
    }
    const d = SURVIVAL_REAL_DATA[key];
    return row("<span class=\"tag real\">NASA</span>" + label, d.value + " " + d.unit);
  };
  const game = function (key, label) {
    const value = typeof SURVIVAL_GAME_DATA !== "undefined" ? SURVIVAL_GAME_DATA[key] : "-";
    return row("<span class=\"tag game\">GAME</span>" + label, value);
  };

  // Astronaut
  const systems = lifeSupportSystems();
  const online = systems.filter(function (s) { return s.online; }).length;
  let astronaut = "UNCONSCIOUS - needs water and food";
  let astronautMood = "bad";
  if (waterGiven && foodGiven) { astronaut = "UNCONSCIOUS - stable"; astronautMood = "good"; }
  else if (waterGiven) { astronaut = "UNCONSCIOUS - needs food"; astronautMood = "warn"; }
  else if (foodGiven) { astronaut = "UNCONSCIOUS - needs water"; astronautMood = "warn"; }

  // Farm
  const growing = farmPlots.filter(function (p) { return p.stage === "seed" || p.stage === "sprout"; }).length;
  const ready = farmPlots.filter(function (p) { return p.stage === "mature" && p.fruitReady; }).length;
  const thirsty = farmPlots.filter(function (p) { return (p.stage === "seed" || p.stage === "sprout") && !p.watered; }).length;

  let html = "";
  html += "<h3>ASTRONAUT</h3>";
  html += row("Status", astronaut, astronautMood);
  html += row("Life support systems", online + " / " + systems.length + " restored " + textBar(online, systems.length), online === systems.length ? "good" : "warn");
  for (const s of systems) {
    html += row("&nbsp;&nbsp;" + s.name, s.online ? "ONLINE" : "OFFLINE", s.online ? "good" : "bad");
  }

  html += "<h3>WATER SUPPLY</h3>";
  html += row("Bucket", !bucket.found ? "not found yet" : (bucket.collected ? "carried" : "on the ground") + ", water " + bucket.water + " / " + BUCKET_USES + " " + textBar(bucket.water, BUCKET_USES), bucket.water > 0 ? "good" : "warn");
  html += row("Water given to astronaut", waterGiven ? "YES" : "NO", waterGiven ? "good" : "bad");
  html += real("waterPerDay", "A real astronaut drinks about");

  html += "<h3>FOOD</h3>";
  html += row("Alien fruit carried", fruitCount + (foodGiven ? "" : " / " + FRUIT_NEEDED + " needed"), fruitCount >= FRUIT_NEEDED || foodGiven ? "good" : "warn");
  html += row("Farm", growing + " growing, " + ready + " ready" + (thirsty ? ", " + thirsty + " need water" : ""), thirsty ? "warn" : "good");
  html += row("Seeds carried", seedBag.length);
  html += row("Food given to astronaut", foodGiven ? "YES" : "NO", foodGiven ? "good" : "bad");
  html += real("foodPerDay", "A real astronaut eats about");
  html += real("foodEnergyPerDay", "That food gives");

  html += "<h3>OXYGEN &amp; AIR</h3>";
  html += row("Laika's oxygen tank", oxygenUnlocked ? Math.round(oxygen) + "% " + textBar(oxygen, 100) : (oxygenTank.filled ? "full (not used inside)" : "no tank yet"), oxygen > 25 ? "good" : "bad");
  html += row("Filling station", oxygenTank.filled ? "ONLINE" : "WAITING FOR A TANK", oxygenTank.filled ? "good" : "warn");
  html += real("oxygenPerDay", "A real astronaut breathes in");
  html += real("carbonDioxidePerDay", "...and breathes out CO2");

  html += "<h3>ENVIRONMENT</h3>";
  html += game("shipCabin", "Ship cabin");
  html += real("cabinPressure", "Real cabin pressure");
  html += real("cabinOxygenPressure", "Real cabin oxygen");
  html += real("cabinTemperature", "Real cabin temperature");
  html += real("cabinHumidity", "Real cabin humidity");
  html += game("planetAir", "Planet air");
  html += game("planetTemperature", "Planet temperature");
  html += game("planetGravity", "Planet gravity");
  html += game("planetWater", "Planet water");
  html += real("marsPressure", "For comparison, Mars pressure");
  html += real("marsTemperature", "Mars temperature");
  html += real("marsCarbonDioxide", "Mars air");
  html += real("marsOxygen", "Mars oxygen");
  html += real("marsGravity", "Mars gravity");

  html += "<p class=\"note\"><span class=\"tag real\">NASA</span>real reference values (sources in the README and survival-data.js). " +
          "<span class=\"tag game\">GAME</span>made up for this game's fictional planet. All other readings are game values.</p>";
  box.innerHTML = html;
}

// While the monitor is open on the Survival tab, refresh it twice a second
function updateSurvivalScreen(deltaTime) {
  survivalRefreshTimer -= deltaTime;
  if (survivalRefreshTimer <= 0) {
    survivalRefreshTimer = 0.5;
    refreshSurvivalScreen();
  }
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
    drawHelmet(tutorialCtx, x + 11, y - 8, 12, true); // her space helmet
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

function tDevice(x, y, time) {
  if (drawPart(tutorialCtx, images.radio, RADIO_CROP, x + 3, y - 1, 6, 15)) {
    return; // team artwork: Radio.png
  }
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
    caption: "Put the oxygen tank on",
    draw: function (time) {
      tDog(36, 30);
      // The tank lying across her back, valve toward her head
      tutorialCtx.save();
      tutorialCtx.translate(44, 28);
      tutorialCtx.rotate(Math.PI / 2);
      if (!drawOxygenImage(tutorialCtx, -2, -6, 4, 12)) {
        tRect(-2, -6, 4, 12, "#3fa7ff");
      }
      tutorialCtx.restore();
      tSparkle(30, 24, time);
      tSparkle(64, 26, time + 0.25);
    }
  },
  {
    caption: "Fill it in the oxygen room",
    draw: function (time) {
      tDog(4, 30);
      // Her tank on her back
      tutorialCtx.save();
      tutorialCtx.translate(12, 28);
      tutorialCtx.rotate(Math.PI / 2);
      if (!drawOxygenImage(tutorialCtx, -2, -6, 4, 12)) {
        tRect(-2, -6, 4, 12, "#3fa7ff");
      }
      tutorialCtx.restore();
      tArrow(32, 32);
      // The filling station: big tanks and a pump
      for (let i = 0; i < 3; i++) {
        if (!drawOxygenImage(tutorialCtx, 50 + i * 8, 15, 7, 24)) {
          tRect(51 + i * 8, 17, 5, 22, "#3fa7ff");
        }
      }
      tRect(76, 23, 12, 16, "#4c566a");
      tRect(78, 25, 8, 5, "#111418");
      tRect(79, 33, 3, 3, Math.floor(time * 2) % 2 === 0 ? "#5fd39a" : "#1f5a3a");
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
      // Small radio on her side
      if (!drawPart(tutorialCtx, images.radio, RADIO_CROP, 44, 30, 3, 7)) {
        tRect(44, 33, 3, 3, "#4c566a");
        tRect(45, 31, 1, 2, "#8a919c");
      }
      tSparkle(32, 24, time);
      tSparkle(62, 26, time + 0.25);
    }
  },
  {
    caption: "Get a Treat!",
    draw: function (time) {
      // Team artwork: dog treat.png (placeholder: a bone drawn twice as big)
      if (!drawPart(tutorialCtx, images.dogTreat, TREAT_CROP, 30, 6, 30, 30)) {
        tutorialCtx.save();
        tutorialCtx.translate(24, 12);
        tutorialCtx.scale(2, 2);
        tTreat(0, 0);
        tutorialCtx.restore();
      }
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
  if (state !== "play" || !moveTutorialDone()) {
    return; // no "Press E" hints during the controls walkthrough
  }
  const interaction = getInteraction();
  if (interaction) {
    const bob = Math.sin(time * 5) * 1.5;
    const x = clamp(interaction.x, 45, GAME_WIDTH - 45); // keep text on screen
    // Show the player's own interact key, in case they changed it in Options
    const text = interaction.text.replace("Press E", "Press " + keyName(controls.interact));
    label(text, x, interaction.y + bob, "#ffd84d");
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
  updatePlanetMusic();

  if (state === "cutscene") {
    updateCutscene(deltaTime);
  } else if (state === "play") {
    updatePlay(deltaTime);
  } else if (state === "tutorial") {
    tutorialTime += deltaTime;
  } else if (state === "survival") {
    updateSurvivalScreen(deltaTime); // keep the readings fresh while it's open
  }
  updateHeartbeat(deltaTime);

  // No footsteps unless Laika is being controlled (cutscenes, menus,
  // the monitor, messages and the pause menu are all silent)
  if (state !== "play") {
    stopFootsteps();
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

// withoutTrees = true leaves the trees out (used by the lake area)
function drawOutsideBackground(time, withoutTrees) {
  drawSky(time);
  drawMountains();
  if (!withoutTrees) {
    drawTrees(); // drawn before the ground, so the ground hides the bottom of each image
  }
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
  // Team artwork: Radio.png (8x20 on the ground)
  if (!drawPart(ctx, images.radio, RADIO_CROP, x - 4, y - 20, 8, 20)) {
    // Placeholder device
    rect(x - 1, y - 12, 1, 5, "#8a919c");   // antenna
    rect(x - 2, y - 12, 3, 1, "#d6dce4");
    rect(x - 5, y - 7, 10, 7, "#4c566a");   // box
    rect(x - 3, y - 5, 4, 3, "#5fd39a");    // screen
    const blinkOn = Math.floor(time * 3) % 2 === 0;
    rect(x + 2, y - 5, 2, 2, blinkOn ? "#ff3b3b" : "#5a1111");
  }

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
    if (imageReady(images.rocks)) {
      // Team artwork: a rock from rocks.png, its bottom on the landing spot
      const r = ROCK_SPRITES[piece.rock];
      ctx.drawImage(images.rocks, r.x, r.y, r.width, r.height,
                    Math.round(x), Math.round(y + piece.height - r.height), r.width, r.height);
    } else {
      rect(x, y, piece.width, piece.height, piece.color); // placeholder
    }
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

  // Once the new mission is unlocked: the farm next to the ship and signs
  // to the other areas. (drawGroundItems checks by itself what to show.)
  if (missionUnlocked) {
    for (const plot of farmPlots) {
      drawFarmPlot(plot, time);
    }
    label("FARM", 158, 173, "#c8a26b"); // under the plots, so tall plants don't cover it
    drawSign(18, 162, "<- JUNGLE");
    drawSign(300, 142, "LAKE ->");
  }
  drawGroundItems("outside", time);

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
// PLANET AREAS: LAKE AND JUNGLE
// Everything here is placeholder shapes until the team's sprites are ready.
// =============================================

// A wooden sign on a post, e.g. "LAKE ->". (x, y) = bottom of the post.
function drawSign(x, y, text) {
  rect(x - 1, y - 10, 2, 10, "#5c4426");
  ctx.font = "bold 6px 'Courier New', monospace";
  const width = Math.ceil(ctx.measureText(text).width) + 6;
  rect(x - width / 2, y - 17, width, 8, "#8b6b3e");
  rect(x - width / 2, y - 17, width, 1, "#a8844f");
  label(text, x, y - 11, "#ffe9c4");
}

// Alien fruit. type = which fruit from "Alien fruits.png" (0 to 15).
// (x, y) = bottom center. noGlow = true for fruit that was already given.
function drawAlienFruit(x, y, time, type, noGlow) {
  x = Math.round(x);
  y = Math.round(y);
  const glow = !noGlow && Math.sin(time * 3 + x) > 0;
  if (glow) {
    rect(x - 5, y - 8, 11, 9, "rgba(229,156,255,0.25)"); // soft glow
  }
  // Team artwork (10x10)
  if (drawPart(ctx, images.alienFruits, FRUIT_SPRITES[type || 0], x - 5, y - 10, 10, 10)) {
    return;
  }
  // Placeholder: a spiky purple pod with teal spots on a curly stem
  rect(x, y - 10, 1, 3, "#5fd39a");        // stem
  rect(x + 1, y - 11, 2, 1, "#5fd39a");    // curl
  rect(x - 2, y - 7, 5, 1, "#9b3cff");     // top of the pod
  rect(x - 3, y - 6, 7, 5, "#9b3cff");     // body
  rect(x - 2, y - 1, 5, 1, "#7a24d6");     // bottom
  rect(x - 4, y - 4, 1, 1, "#ff6fd8");     // spikes
  rect(x + 4, y - 4, 1, 1, "#ff6fd8");
  rect(x, y - 8, 1, 1, "#ff6fd8");
  rect(x - 2, y - 5, 1, 1, "#5fe3d0");     // teal spots
  rect(x + 1, y - 3, 1, 1, "#5fe3d0");
  rect(x - 1, y - 2, 1, 1, "#5fe3d0");
  rect(x + 1, y - 6, 1, 1, "#f2c9ff");     // shine
}

// Alien seeds on the ground. type = which seed from "seeds.png".
// (x, y) = bottom center.
function drawSeedPod(x, y, time, type) {
  if (drawPart(ctx, images.seeds, seedSprite(type || 0), x - 4, y - 8, 8, 8)) {
    if (Math.floor(time * 3) % 2 === 0) {
      rect(x + 4, y - 9, 1, 1, "#ffffff"); // a little sparkle so they're easy to spot
    }
    return;
  }
  // Placeholder: a pouch of glowing seeds
  rect(x - 3, y - 5, 6, 5, "#8b6b3e");
  rect(x - 2, y - 6, 4, 1, "#a8844f");
  rect(x - 1, y - 7, 2, 1, "#5c4426"); // tie
  const blink = Math.floor(time * 3) % 2 === 0;
  rect(x - 2, y - 3, 1, 1, blink ? "#9df5c4" : "#5fd39a");
  rect(x, y - 2, 1, 1, blink ? "#5fd39a" : "#9df5c4");
  rect(x + 1, y - 4, 1, 1, "#ffd84d");
}

// A metal bucket, empty or full of water. (x, y) = top left, about 7x7.
function drawBucket(x, y, filled, time) {
  x = Math.round(x);
  y = Math.round(y);
  // Team artwork: Bucket.png, with water drawn in its opening.
  // The water gets lower as the bucket's 3 uses are used up.
  if (drawPart(ctx, images.bucket, BUCKET_CROP, x - 1, y - 1, 9, 8)) {
    if (filled) {
      if (bucket.water >= 3) {
        rect(x + 1, y, 6, 2, "#3fc8ff");     // full
      } else if (bucket.water === 2) {
        rect(x + 1, y + 1, 6, 1, "#3fc8ff"); // a bit lower
      } else {
        rect(x + 2, y + 1, 4, 1, "#3fc8ff"); // just a little left
      }
      if (Math.floor(time * 3) % 2 === 0) {
        rect(x + 2, y + (bucket.water >= 3 ? 0 : 1), 1, 1, "#d6f4ff"); // sparkle on the water
      }
    }
    return;
  }
  // Placeholder bucket
  rect(x + 1, y, 5, 1, "#6b7380");          // handle
  rect(x, y + 1, 1, 2, "#6b7380");
  rect(x + 6, y + 1, 1, 2, "#6b7380");
  rect(x, y + 2, 7, 5, "#b8c0cc");          // bucket
  rect(x + 1, y + 6, 5, 1, "#8a919c");
  if (filled) {
    rect(x + 1, y + 2, 5, 2, "#3fc8ff");    // water
    if (Math.floor(time * 3) % 2 === 0) {
      rect(x + 2, y + 2, 1, 1, "#d6f4ff");  // sparkle on the water
    }
  } else {
    rect(x + 1, y + 2, 5, 1, "#2e3440");    // empty inside
  }
}

// One farm plot. (plot.x, plot.y) = center. Shows how far the plant has grown.
function drawFarmPlot(plot, time) {
  const x = plot.x;
  const y = plot.y;
  if (plot.stage === "empty") {
    // Bare ground with a few stones: "dig here"
    rect(x - 10, y - 3, 20, 6, "rgba(92,62,38,0.55)");
    rect(x - 6, y - 1, 1, 1, "#5c4426");
    rect(x + 4, y, 1, 1, "#5c4426");
    return;
  }
  // Dug soil: dark and shiny when watered, lighter and dry when not
  const wet = plot.watered || plot.stage === "mature";
  rect(x - 10, y - 4, 20, 8, wet ? "#2a1a0f" : "#4a3220");
  rect(x - 10, y - 4, 20, 2, wet ? "#3d2817" : "#6b4a2e");
  if (wet && plot.stage !== "mature") {
    rect(x - 7, y + 1, 1, 1, "#3fc8ff"); // drops of water in the soil
    rect(x + 6, y - 1, 1, 1, "#3fc8ff");
  }
  // A blinking water drop above plants that need watering
  if ((plot.stage === "seed" || plot.stage === "sprout") && !plot.watered && Math.floor(time * 2) % 2 === 0) {
    rect(x + 5, y - 14, 3, 3, "#3fc8ff");
    rect(x + 6, y - 15, 1, 1, "#3fc8ff");
  }
  if (plot.stage === "dug") {
    rect(x - 1, y - 1, 3, 2, "#1a0f08"); // empty hole
  } else if (plot.stage === "seed") {
    rect(x - 1, y - 1, 3, 1, "#1a0f08");
    rect(x, y - 2, 1, 1, "#9df5c4");     // tiny glowing seed
  } else if (plot.stage === "sprout") {
    rect(x, y - 6, 1, 5, "#5fd39a");     // small sprout
    rect(x - 2, y - 6, 2, 1, "#7fe0a0");
    rect(x + 1, y - 7, 2, 1, "#7fe0a0");
  } else {
    // Mature alien plant: a tall twisty teal stalk with curly leaves
    rect(x, y - 18, 1, 17, "#3fb58a");
    rect(x - 3, y - 8, 3, 1, "#5fd39a");
    rect(x + 1, y - 11, 3, 1, "#5fd39a");
    rect(x - 3, y - 14, 3, 1, "#5fd39a");
    rect(x - 1, y - 20, 3, 2, "#ff6fd8"); // glowing bud on top
    if (plot.fruitReady) {
      // The plant grows the kind of fruit its seed was for
      drawAlienFruit(x - 5, y - 7, time, plot.fruitType);
      drawAlienFruit(x + 5, y - 11, time + 1, plot.fruitType);
    }
  }
}

// The bucket, if it's lying on the ground in this area
// (it appears once Laika goes back inside after the tutorial)
function drawLooseBucket(scene, time) {
  if (wentInsideAfterTutorial && !bucket.collected && bucket.scene === scene) {
    drawShadow(bucket.x - 4, bucket.y, 8);
    drawBucket(bucket.x - 3, bucket.y - 7, bucket.filled, time);
  }
}

// Fruit, seeds and the bucket lying around in one area
// (fruit and seeds appear once the new mission is unlocked)
function drawGroundItems(scene, time) {
  drawLooseBucket(scene, time);
  if (!missionUnlocked) {
    return;
  }
  for (const fruit of alienFruits) {
    if (fruit.scene === scene && !fruit.collected) {
      drawShadow(fruit.x - 3, fruit.y, 7);
      drawAlienFruit(fruit.x, fruit.y, time, fruit.type);
    }
  }
  for (const pod of seedPods) {
    if (pod.scene === scene && !pod.collected) {
      drawShadow(pod.x - 3, pod.y, 6);
      drawSeedPod(pod.x, pod.y, time, pod.type);
    }
  }
}

// The lake area
function drawLakeArea(time) {
  drawOutsideBackground(time, true);

  // Team artwork: Lake.png
  const img = LAKE_IMAGE;
  if (drawPart(ctx, images.lake, img.crop, img.x, img.y, img.width, img.height)) {
    drawSign(20, 150, "<- SHIP");
    drawGroundItems("lake", time);
    return;
  }

  // Placeholder lake: a dark rim, teal water, and moving ripples
  ctx.fillStyle = "#1f4a37";
  ctx.beginPath();
  ctx.ellipse(lake.x, lake.y + 1, lake.radiusX + 3, lake.radiusY + 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2fb5a8";
  ctx.beginPath();
  ctx.ellipse(lake.x, lake.y, lake.radiusX, lake.radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5fe3d0";
  ctx.beginPath();
  ctx.ellipse(lake.x - 8, lake.y - 3, lake.radiusX - 22, lake.radiusY - 7, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const rippleX = lake.x - 45 + i * 28 + Math.sin(time + i) * 4;
    rect(rippleX, lake.y - 6 + (i % 2) * 7, 8, 1, "#c8fff6");
  }

  // Strange reeds with glowing tips
  for (const reedX of [116, 130, 244, 258]) {
    rect(reedX, 136, 1, 10, "#3fb58a");
    rect(reedX - 1, 134, 3, 2, Math.sin(time * 2 + reedX) > 0 ? "#ffd84d" : "#ff6fd8");
  }
  drawSign(20, 150, "<- SHIP");
  drawGroundItems("lake", time);
}

// The jungle area: the big tree and tall glowing alien plants
function drawJungleArea(time) {
  drawOutsideBackground(time, true); // no background trees, so the big tree stands out

  // Team artwork: Big Tree.png, drawn 2x its pixel-art size (128x128).
  // Like the other trees it has a black background, so "lighten" hides it.
  if (imageReady(images.bigTree)) {
    ctx.save();
    ctx.globalCompositeOperation = "lighten";
    ctx.drawImage(images.bigTree, bigTree.x, GROUND_TOP + 6 - 120, bigTree.size, bigTree.size);
    ctx.restore();
  } else {
    // Placeholder big tree
    rect(bigTree.trunkX - 8, GROUND_TOP - 50, 16, 56, "#6b4a2e");
    rect(bigTree.trunkX - 40, GROUND_TOP - 100, 80, 55, "#3f8f3a");
  }
  if (bigTree.inspected === false && Math.floor(time * 2) % 2 === 0) {
    label("?", bigTree.trunkX, GROUND_TOP - 64, "#ffd84d"); // something to inspect
  }

  for (const plantX of [190, 285]) {
    rect(plantX, 112, 3, 22, "#2f6b4f");                 // stalk
    rect(plantX - 6, 108, 15, 5, "#3fd0c9");             // cap
    rect(plantX - 4, 106, 11, 2, "#7fe0d0");
    if (Math.sin(time * 2 + plantX) > 0) {
      rect(plantX - 3, 110, 2, 1, "#ffd84d");            // glowing spots
      rect(plantX + 4, 109, 2, 1, "#ffd84d");
    }
  }
  drawSign(300, 150, "SHIP ->");
  drawGroundItems("jungle", time);
}

// Draws an outdoor area (lake or jungle) with Laika
function drawOutdoorArea(time) {
  if (currentScene === "lake") {
    drawLakeArea(time);
  } else {
    drawJungleArea(time);
  }
  drawShadow(dog.x, dog.y, dog.width);
  drawDog(time);
}

// =============================================
// INSIDE SCENE (inside the ship)
// =============================================

// Team artwork: back wall and floor made from "Interior (2).png" tiles.
// Returns false if the image is missing (the room then uses placeholders).
function drawWallAndFloor(wall, floor) {
  const sheet = images.interiorWalls;
  if (!imageReady(sheet)) {
    return false;
  }
  rect(0, 0, GAME_WIDTH, 10, "#232733"); // dark ceiling edge
  for (let x = 0; x < GAME_WIDTH; x += wall.width) {
    // The wall tile is only 64 tall, so its middle part is stretched to fill the wall
    ctx.drawImage(sheet, wall.x, wall.y, wall.width, 16, x, 10, wall.width, 16);      // top trim
    ctx.drawImage(sheet, wall.x, wall.y + 16, wall.width, 44, x, 26, wall.width, 80); // wall
    ctx.drawImage(sheet, wall.x, wall.y + 60, wall.width, 4, x, 106, wall.width, 4);  // bottom edge
  }
  for (let y = INSIDE_FLOOR_TOP; y < GAME_HEIGHT; y += floor.height) {
    for (let x = 0; x < GAME_WIDTH; x += floor.width) {
      ctx.drawImage(sheet, floor.x, floor.y, floor.width, floor.height, x, y, floor.width, floor.height);
    }
  }
  return true;
}

// The little survival screen on the wall: four bars (water, food, oxygen,
// life support) and a light that blinks red while the astronaut needs something
function drawSurvivalWallScreen(time) {
  const s = survivalScreen;
  rect(s.x - 2, s.y - 2, s.width + 4, s.height + 4, "#4c566a");   // frame
  rect(s.x, s.y, s.width, s.height, "#111418");                     // screen
  const systems = lifeSupportSystems().filter(function (x) { return x.online; }).length;
  const levels = [
    { amount: waterGiven ? 1 : bucket.water / BUCKET_USES, color: "#3fc8ff" },
    { amount: foodGiven ? 1 : fruitCount / FRUIT_NEEDED, color: "#b46cff" },
    { amount: oxygen / 100, color: "#5fd39a" },
    { amount: systems / 4, color: "#ffd84d" }
  ];
  levels.forEach(function (level, i) {
    const barHeight = Math.round(16 * Math.max(0.06, Math.min(1, level.amount)));
    rect(s.x + 3 + i * 7, s.y + 4, 5, 16, "#2e3440");
    rect(s.x + 3 + i * 7, s.y + 20 - barHeight, 5, barHeight, level.color);
  });
  const needsHelp = !(waterGiven && foodGiven);
  const lightOn = Math.floor(time * 2) % 2 === 0;
  rect(s.x + 3, s.y + 23, 3, 2, needsHelp ? (lightOn ? "#ff3b3b" : "#5a1111") : "#5fd39a");
  rect(s.x + 9, s.y + 23, 20, 2, "#2e3440");
}

// Placeholder wall and floor (if "Interior (2).png" is missing)
function drawPlaceholderWallAndFloor(wallColor) {
  rect(0, 0, GAME_WIDTH, INSIDE_FLOOR_TOP, wallColor);
  for (let x = 0; x < GAME_WIDTH; x += 40) {
    rect(x, 0, 1, INSIDE_FLOOR_TOP, "#2e3440");
  }
  rect(0, INSIDE_FLOOR_TOP, GAME_WIDTH, GAME_HEIGHT - INSIDE_FLOOR_TOP, "#5b6375");
  rect(0, INSIDE_FLOOR_TOP, GAME_WIDTH, 2, "#7b8496");
  for (let y = INSIDE_FLOOR_TOP + 12; y < GAME_HEIGHT; y += 14) {
    rect(0, y, GAME_WIDTH, 1, "#4c5466");
  }
}

// A doorway on the back wall with a small green light above it
function drawDoorway(door) {
  const drewImage = drawPart(ctx, images.interiorFurniture, INTERIOR.doorway,
                             door.x + door.width / 2 - 12, INSIDE_FLOOR_TOP - 36, 24, 36);
  if (!drewImage) {
    rect(door.x - 2, INSIDE_FLOOR_TOP - 34, door.width + 4, 34, "#6b7380");
    rect(door.x, INSIDE_FLOOR_TOP - 32, door.width, 32, "#1c1f26");
  }
  rect(door.x + door.width / 2 - 1, INSIDE_FLOOR_TOP - 41, 3, 3, "#5fd39a");
}

function drawInsideRoom(time) {
  if (!drawWallAndFloor(INTERIOR.wallMain, INTERIOR.floorMain)) {
    drawPlaceholderWallAndFloor("#3b4252");
  }

  // Windows (metal shutters), shown at half size
  // (The right side of the wall has the recovery room door instead)
  for (const windowX of [62]) {
    if (!drawPart(ctx, images.interiorFurniture, INTERIOR.window, windowX, 30, 38, 25)) {
      rect(windowX, 35, 24, 18, "#6b7380");
      rect(windowX + 2, 37, 20, 14, "#1a0b33");
    }
  }

  // A potted plant beside the monitor
  drawPart(ctx, images.interiorFurniture, INTERIOR.plant, 94, INSIDE_FLOOR_TOP - 33, 21, 35);

  // The ship monitor that opens the tutorial.
  // Team artwork: Monitor.gif, shown 2x (64x64) on a shelf on the wall.
  // It's mounted high (bottom at y = 92), so Laika's helmet never goes
  // behind it, and it doesn't need to be solid.
  rect(monitor.x - 2, MONITOR_TOP + 62, monitor.width + 4, 3, "#6b7380"); // wall shelf
  rect(monitor.x + 6, MONITOR_TOP + 65, 3, 4, "#4c566a");                  // shelf brackets
  rect(monitor.x + monitor.width - 9, MONITOR_TOP + 65, 3, 4, "#4c566a");
  if (!showGif(gifs.monitor, monitor.x, MONITOR_TOP, monitor.width, monitor.width)) {
    // Placeholder screen with blinking lights (if Monitor.gif is missing)
    rect(monitor.x + 4, MONITOR_TOP + 10, 56, 50, "#4c566a");
    rect(monitor.x + 8, MONITOR_TOP + 14, 48, 22, "#111418");
    const blinkOn = Math.floor(time * 2) % 2 === 0;
    rect(monitor.x + 12, MONITOR_TOP + 18, 4, 4, blinkOn ? "#ff3b3b" : "#5a1111");
    rect(monitor.x + 20, MONITOR_TOP + 18, 4, 4, "#5a1111");
    rect(monitor.x + 12, MONITOR_TOP + 42, 6, 4, "#ffd84d");  // buttons
    rect(monitor.x + 24, MONITOR_TOP + 42, 6, 4, "#3fa7ff");
  }

  drawSurvivalWallScreen(time);

  // Blinking "!" next to the monitor once the tutorial tasks are done,
  // until the player has looked at the monitor
  if (tutorialDone() && !tutorialCompleteSeen && Math.floor(time * 3) % 2 === 0) {
    const ex = monitor.x - 12;
    rect(ex - 2, MONITOR_TOP + 14, 9, 17, "#000000");  // outline
    rect(ex, MONITOR_TOP + 16, 5, 9, "#ffd84d");       // the line of the "!"
    rect(ex, MONITOR_TOP + 27, 5, 3, "#ffd84d");       // the dot
  }

  // Exit door (left), recovery room door and storage room door (right)
  drawDoorway(exitDoor);
  drawDoorway(recoveryDoor);
  drawDoorway(storageDoor);

  // Red cross above the recovery room door (where the astronaut is)
  const crossX = recoveryDoor.x + recoveryDoor.width / 2;
  rect(crossX - 6, 49, 12, 12, "#e8fff2");
  rect(crossX - 1, 51, 3, 8, "#ff3b3b");
  rect(crossX - 4, 54, 9, 3, "#ff3b3b");

  // Blue "O2" sign above the storage door, as a clue
  rect(storageDoor.x - 2, 50, storageDoor.width + 4, 10, "#1c3a5a");
  label("O2", storageDoor.x + storageDoor.width / 2, 57, "#9fd3ff");
  if (!oxygenTank.collected && Math.floor(time * 2) % 2 === 0) {
    // Blinking arrow pointing down at the door
    rect(storageDoor.x + 5, 62, 6, 1, "#ffd84d");
    rect(storageDoor.x + 6, 63, 4, 1, "#ffd84d");
    rect(storageDoor.x + 7, 64, 2, 1, "#ffd84d");
  }
}

function drawCot(time) {
  const top = cot.y - 16;

  // Team artwork: a bed from "Interior (1).png", at 3/4 size
  if (!drawPart(ctx, images.interiorFurniture, INTERIOR.bed, cot.x, cot.y - cot.height, cot.width, cot.height)) {
    // Placeholder cot: legs and mattress
    rect(cot.x + 2, top + 8, 3, 8, "#2e3440");
    rect(cot.x + cot.width - 5, top + 8, 3, 8, "#2e3440");
    rect(cot.x, top + 4, cot.width, 5, "#8a919c");
    rect(cot.x, top + 2, cot.width, 3, "#d8dee9");
  }

  drawAstronaut();

  // The treat Laika left next to her head (on the pillow)
  if (treatLeft) {
    if (!drawPart(ctx, images.dogTreat, TREAT_CROP, cot.x + 35, cot.y - 34, 7, 7)) {
      rect(cot.x + 35, cot.y - 31, 7, 3, "#f2d3a0");
    }
  }

  // Label so it's clear she can't move
  label("UNCONSCIOUS", cot.x + cot.width / 2, cot.y - cot.height - 4, "#ff8a8a");
}

// The astronaut's close-up (Astronaut Close up.png) with her eyes closed.
// The image has her eyes open, so skin color is painted over each eye and a
// dark line is drawn for the closed eyelid. (x, y) = top left, size x size.
// Returns false if the image isn't loaded.
const ASTRONAUT_CLOSEUP_CROP = { x: 70, y: 40, width: 440, height: 440 };
const ASTRONAUT_EYES = [ // where her eyes are inside the image
  { x: 167, y: 230, width: 44, height: 34 },
  { x: 245, y: 233, width: 44, height: 34 }
];
function drawSleepingAstronautFace(context, x, y, size) {
  const crop = ASTRONAUT_CLOSEUP_CROP;
  if (!drawPart(context, images.astronautCloseUp, crop, x, y, size, size)) {
    return false;
  }
  const scale = size / crop.width;
  for (const eye of ASTRONAUT_EYES) {
    const ex = x + (eye.x - crop.x) * scale;
    const ey = y + (eye.y - crop.y) * scale;
    const ew = Math.max(1, eye.width * scale);
    const eh = Math.max(1, eye.height * scale);
    context.fillStyle = "#fddccc"; // skin
    context.fillRect(ex, ey, ew, eh);
    context.fillStyle = "#3a2630"; // closed eyelid / lashes
    context.fillRect(ex + ew * 0.1, ey + eh * 0.55, ew * 0.8, Math.max(1, eh * 0.14));
    context.fillRect(ex + ew * 0.05, ey + eh * 0.45, ew * 0.12, Math.max(1, eh * 0.12));
  }
  return true;
}

function drawAstronaut() {
  // She is lying on the bed, unconscious, and never moves.
  // Team artwork: her close-up with her eyes closed, head on a pillow,
  // tucked in up to her chin with a blanket
  const blanketX = cot.x + 3;
  const blanketWidth = cot.width - 6;
  rect(cot.x + 10, cot.y - 35, 28, 9, "#eceaf4");  // pillow
  rect(cot.x + 10, cot.y - 27, 28, 1, "#b8b4c8");  // pillow shadow
  if (drawSleepingAstronautFace(ctx, cot.x + 14, cot.y - 39, 20)) {
    rect(blanketX, cot.y - 24, blanketWidth, 18, "#5b7fd4");  // blanket
    rect(blanketX, cot.y - 24, blanketWidth, 3, "#f0eef6");   // folded-over sheet
    rect(blanketX, cot.y - 21, blanketWidth, 1, "#c8c4d8");
    rect(cot.x + 12, cot.y - 19, 24, 9, "#6d90e0");           // her body under the blanket
    rect(blanketX, cot.y - 19, 1, 13, "#3f5ea8");             // tucked-in sides
    rect(blanketX + blanketWidth - 1, cot.y - 19, 1, 13, "#3f5ea8");
    rect(blanketX, cot.y - 7, blanketWidth, 1, "#3f5ea8");    // tucked in at the foot

    // She's hooked up to the IV pole: the IV line goes under the blanket to
    // her arm, and the feeding tube from the feeding bag goes to her nose
    const s = ivStand;
    const noseX = cot.x + 14 + (ASTRONAUT_NOSE.x - ASTRONAUT_CLOSEUP_CROP.x) * 20 / ASTRONAUT_CLOSEUP_CROP.width;
    const noseY = cot.y - 39 + (ASTRONAUT_NOSE.y - ASTRONAUT_CLOSEUP_CROP.y) * 20 / ASTRONAUT_CLOSEUP_CROP.width;
    drawTube([[s.x + 25, s.y + 34], [s.x + 26, s.y + 50], [blanketX - 4, cot.y - 22], [blanketX + 2, cot.y - 20]], "#7a5cd6", 1);
    drawTube([[s.x - 1, s.y + 24], [s.x + 2, s.y + 40], [cot.x + 8, cot.y - 34], [noseX, noseY]], "#c9a66b", 1);
    rect(noseX - 3, noseY - 1, 2, 2, "#ffffff"); // tape holding the tube on her cheek
    return;
  }
  // Fallback: one frame from "Astronaut frames.png" (lying on her back)
  const frame = ASTRONAUT_LYING;
  if (drawPart(ctx, images.astronaut, frame, cot.x + cot.width / 2 - frame.width / 2,
               cot.y - 34, frame.width, frame.height)) {
    return;
  }
  // Placeholder astronaut
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
  drawLooseBucket("inside", time);
  drawShadow(dog.x, dog.y, dog.width);
  drawDog(time);
}

// =============================================
// RECOVERY ROOM (where the astronaut lies in bed)
// =============================================

function drawRecoveryRoom(time) {
  if (!drawWallAndFloor(INTERIOR.wallMain, INTERIOR.floorMain)) {
    drawPlaceholderWallAndFloor("#3b4252");
  }
  label("RECOVERY ROOM", 160, 20, "#ffffff");

  // A window above the bed (team artwork)
  if (!drawPart(ctx, images.interiorFurniture, INTERIOR.window, 215, 30, 38, 25)) {
    rect(222, 35, 24, 18, "#6b7380");
    rect(224, 37, 20, 14, "#1a0b33");
  }

  // Red cross on the wall
  rect(120, 40, 16, 16, "#e8fff2");
  rect(126, 42, 4, 12, "#ff3b3b");
  rect(122, 46, 12, 4, "#ff3b3b");

  // Hospital furniture (hospital pixel-art pack, all drawn 2x).
  // Things on the wall first, then things standing against the wall.
  const floor = INSIDE_FLOOR_TOP;
  drawHospitalSprite(images.handSanitizer, FULL_SPRITE, 46, 52);       // on the wall
  drawHospitalSprite(images.anatomyPoster, FULL_SPRITE, 76, 28);
  drawHospitalSprite(images.pharmacyShelf, FULL_SPRITE, 176, 40);
  drawHospitalSprite(images.trashBin, FULL_SPRITE, 46, floor - 30);    // against the wall
  drawHospitalSprite(images.armchair, TALL_SPRITE, 80, floor - 62);
  drawHospitalSprite(images.bedsideTable, FULL_SPRITE, 108, floor - 24);
  drawHospitalSprite(images.flower, FULL_SPRITE, 108, floor - 48);     // on the table
  drawHospitalSprite(images.hospitalCabinet, TALL_SPRITE, 140, floor - 62);

  // Door back to the main room
  drawDoorway(recoveryExit);
}

// A thin tube (the IV line or the feeding tube) through a list of points
function drawTube(points, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();
}

// The IV stand at the head of the bed, with the feeding bag on its left hook
function drawIvStand() {
  const s = ivStand;
  if (!drawPart(ctx, images.ivStand, TALL_SPRITE, s.x, s.y, s.width, s.height)) {
    // Placeholder stand with a clear IV bag
    rect(s.x + 9, s.y + 2, 4, 54, "#6b7380");
    rect(s.x + 2, s.y + 2, 26, 2, "#6b7380");
    rect(s.x + 2, s.y + 44, 20, 4, "#4c566a");
    rect(s.x + 19, s.y + 8, 12, 16, "#d8f0ff");
  }
  // The feeding bag (IV bag.webp) hanging from the left hook
  if (!drawPart(ctx, images.ivBag, IV_BAG_CROP, s.x - 6, s.y + 5, 10, 19)) {
    rect(s.x - 5, s.y + 6, 8, 13, "#e8d9b0"); // placeholder bag
  }
}

// Draws one hospital-pack sprite at 2x. (x, y) = top left.
function drawHospitalSprite(image, crop, x, y) {
  drawPart(ctx, image, crop, x, y, crop.width * 2, crop.height * 2);
}

// The heart rate monitor on a rolling stand (Heart rate monitor.png).
// The light on the stand blinks with every heartbeat.
function drawHeartMonitorStand() {
  const x = heartMonitor.x;
  const bottom = cot.y - 2;
  rect(x + 16, bottom - 30, 3, 26, "#4c566a");  // pole
  rect(x + 8, bottom - 5, 20, 3, "#4c566a");    // base
  rect(x + 8, bottom - 2, 3, 2, "#2e3440");     // wheels
  rect(x + 25, bottom - 2, 3, 2, "#2e3440");
  if (!drawPart(ctx, images.heartMonitor, HEART_MONITOR_CROP, x, bottom - 58, heartMonitor.width, 30)) {
    rect(x, bottom - 58, heartMonitor.width, 30, "#0b2a2a"); // placeholder screen
    rect(x + 3, bottom - 44, heartMonitor.width - 6, 1, "#3be04a");
  }
  rect(x + 15, bottom - 27, 5, 2, heartBeatFlash > 0 ? "#5fff6a" : "#1f5a3a");
}

function drawRecovery(time) {
  drawRecoveryRoom(time);

  // Everything standing on the floor, drawn from back (small y) to front
  const things = [
    { y: ivStand.y + 56, draw: drawIvStand }, // the bottom of its pole
    { y: cot.y, draw: drawCot },
    { y: cot.y - 2, draw: drawHeartMonitorStand },
    { y: dog.y, draw: drawDog }
  ];
  drawShadow(cot.x, cot.y, cot.width);
  drawShadow(heartMonitor.x + 6, cot.y - 2, 24);
  drawShadow(dog.x, dog.y, dog.width);
  things.sort(function (a, b) { return a.y - b.y; });
  for (const thing of things) {
    thing.draw(time);
  }
}

// =============================================
// STORAGE ROOM (where the oxygen tank is)
// =============================================

function drawStorageRoom(time) {
  const furniture = images.interiorFurniture;
  if (!drawWallAndFloor(INTERIOR.wallStorage, INTERIOR.floorStorage)) {
    drawPlaceholderWallAndFloor("#353b48");
  }

  // Shelves full of supplies against the back wall (team artwork)
  const wide = drawPart(ctx, furniture, INTERIOR.shelfWide, 88, INSIDE_FLOOR_TOP - 64, 128, 64);
  drawPart(ctx, furniture, INTERIOR.rack, 222, INSIDE_FLOOR_TOP - 62, 42, 62);

  // Door to the oxygen room, with a green "O2 FILL" sign
  drawDoorway(oxygenRoomDoor);
  rect(oxygenRoomDoor.x - 8, 50, oxygenRoomDoor.width + 16, 10, "#1f5a3a");
  label("O2 FILL", oxygenRoomDoor.x + oxygenRoomDoor.width / 2, 57, "#9df5c4");
  if (oxygenTank.collected && !oxygenTank.filled && Math.floor(time * 2) % 2 === 0) {
    // Blinking arrow pointing down at the door once Laika has the tank
    rect(oxygenRoomDoor.x + 5, 62, 6, 1, "#ffd84d");
    rect(oxygenRoomDoor.x + 6, 63, 4, 1, "#ffd84d");
    rect(oxygenRoomDoor.x + 7, 64, 2, 1, "#ffd84d");
  }
  if (!wide) {
    // Placeholder shelves with boxes
    for (const shelfY of [45, 75]) {
      rect(80, shelfY, 150, 3, "#6b7380");
      rect(88, shelfY - 8, 12, 8, "#8b6b3e");
      rect(120, shelfY - 6, 10, 6, "#4c566a");
      rect(150, shelfY - 10, 14, 10, "#8b6b3e");
      rect(200, shelfY - 7, 16, 7, "#4c566a");
    }
  }
  label("STORAGE", 152, 20, "#ffffff");

  // Dim red emergency light
  const blinkOn = Math.floor(time * 2) % 2 === 0;
  rect(66, 22, 6, 3, blinkOn ? "#ff3b3b" : "#5a1111");

  // Door back to the main room
  drawDoorway(storageExit);
}

function drawCrate(crate) {
  // Team artwork: a cabinet from "Interior (1).png"
  if (drawPart(ctx, images.interiorFurniture, INTERIOR[crate.sprite],
               crate.x, crate.y - crate.height, crate.width, crate.height)) {
    return;
  }
  // Placeholder wooden crate
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
  if (!bucket.collected && bucket.scene === "storage") {
    things.push({ y: bucket.y, draw: function () { drawLooseBucket("storage", time); } });
  }
  drawShadow(dog.x, dog.y, dog.width);
  things.push({ y: dog.y, draw: drawDog });

  things.sort(function (a, b) { return a.y - b.y; });
  for (const thing of things) {
    thing.draw(time);
  }
}

// =============================================
// OXYGEN ROOM (where Laika fills and refills her oxygen)
// =============================================

function drawOxygenRoom(time) {
  const furniture = images.interiorFurniture;
  if (!drawWallAndFloor(INTERIOR.wallOxygen, INTERIOR.floorOxygen)) {
    drawPlaceholderWallAndFloor("#2f4a52");
  }
  label("OXYGEN ROOM", 160, 20, "#ffffff");

  // Lockers and a small plant (team artwork)
  drawPart(ctx, furniture, INTERIOR.lockers, 234, INSIDE_FLOOR_TOP - 37, 84, 37);
  drawPart(ctx, furniture, INTERIOR.plantSmall, 70, INSIDE_FLOOR_TOP - 26, 24, 28);

  drawOxygenFiller(time);

  // Door back to the storage room
  drawDoorway(oxygenRoomExit);
}

// The filling station: three big oxygen tanks joined by a hose to a pump
// with a screen. The tanks use Oxygen tank.png; the pump is placeholder shapes.
function drawOxygenFiller(time) {
  const left = oxygenFiller.x;
  const floor = INSIDE_FLOOR_TOP;

  // Big oxygen tanks standing against the wall
  for (let i = 0; i < 3; i++) {
    const tankX = left + 4 + i * 16;
    if (!drawOxygenImage(ctx, tankX, floor - 48, 14, 48)) {
      rect(tankX + 2, floor - 44, 10, 44, "#3fa7ff"); // placeholder tank
    }
  }

  // Hose from the tanks to the pump
  rect(left + 50, floor - 30, 6, 2, "#2e3440");

  // The pump: a gray machine with a screen and a nozzle
  const pumpX = left + 56;
  rect(pumpX, floor - 40, 28, 40, "#4c566a");
  rect(pumpX, floor - 40, 28, 2, "#7b8496");
  rect(pumpX + 4, floor - 35, 20, 12, "#111418");             // screen
  label("O2", pumpX + 14, floor - 26, "#5fd39a");
  const lightOn = Math.floor(time * 2) % 2 === 0;
  rect(pumpX + 4, floor - 18, 4, 4, lightOn ? "#5fd39a" : "#1f5a3a"); // ready light
  rect(pumpX + 12, floor - 18, 12, 3, "#2e3440");             // nozzle
  rect(pumpX + 22, floor - 16, 2, 6, "#2e3440");
}

function drawOxygenRoomScene(time) {
  drawOxygenRoom(time);
  drawLooseBucket("oxygenRoom", time);
  drawShadow(dog.x, dog.y, dog.width);
  drawDog(time);
}

// =============================================
// HUD: treat counter (bottom left) and oxygen meter (bottom right)
// =============================================

function drawHud(time) {
  // Treat counter: a bone-shaped treat and how many Laika has.
  // After the tutorial it also shows her alien fruit and seeds.
  const tx = 6;
  const ty = 168;
  const showFood = tutorialDone();
  rect(tx - 2, ty - 3, showFood ? 104 : 40, 11, "rgba(10,5,30,0.7)");
  // Team artwork: dog treat.png (placeholder: a bone shape)
  if (!drawPart(ctx, images.dogTreat, TREAT_CROP, tx, ty - 2, 9, 9)) {
    rect(tx, ty, 3, 2, "#f2d3a0");
    rect(tx, ty + 3, 3, 2, "#f2d3a0");
    rect(tx + 2, ty + 1, 8, 3, "#f2d3a0");
    rect(tx + 9, ty, 3, 2, "#f2d3a0");
    rect(tx + 9, ty + 3, 3, 2, "#f2d3a0");
  }
  ctx.font = "bold 7px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#f2d3a0";
  ctx.fillText("x " + treats, tx + 15, ty + 5);
  if (showFood) {
    // Alien fruit (team artwork: fruit 0; placeholder: a purple pod)
    if (!drawPart(ctx, images.alienFruits, FRUIT_SPRITES[0], tx + 38, ty - 2, 9, 9)) {
      rect(tx + 40, ty - 1, 5, 6, "#9b3cff");
      rect(tx + 41, ty + 1, 1, 1, "#5fe3d0");
    }
    ctx.fillStyle = "#e59cff";
    ctx.fillText("x " + fruitCount, tx + 48, ty + 5);
    // Seeds (team artwork: seed 1; placeholder: a pouch)
    if (!drawPart(ctx, images.seeds, seedSprite(1), tx + 70, ty - 1, 7, 7)) {
      rect(tx + 72, ty, 4, 4, "#8b6b3e");
      rect(tx + 73, ty + 1, 1, 1, "#9df5c4");
    }
    ctx.fillStyle = "#9df5c4";
    ctx.fillText("x " + seedBag.length, tx + 79, ty + 5);
  }

  // The oxygen meter only appears once Laika has been outside
  if (!oxygenUnlocked) {
    return;
  }

  // Oxygen meter: green when full, yellow when half, red (blinking) when low
  const mx = 248;
  const my = 165;
  rect(mx, my, 68, 12, "rgba(10,5,30,0.7)");
  if (!drawOxygenImage(ctx, mx + 2, my + 1, 4, 10)) {
    rect(mx + 2, my + 2, 4, 8, "#3fa7ff");
  }
  ctx.fillStyle = "#e8fff2";
  ctx.fillText("O2", mx + 8, my + 8);
  const barX = mx + 20;
  const barWidth = 44;
  rect(barX, my + 3, barWidth, 6, "#2e3440");
  let color = "#5fd39a";
  if (oxygen <= 50) color = "#ffd84d";
  if (oxygen <= 25) color = Math.floor(time * 4) % 2 === 0 ? "#ff3b3b" : "#7a1a1a";
  rect(barX, my + 3, Math.ceil(barWidth * oxygen / 100), 6, color);
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

// "Laikia walking.png" is a sprite sheet with 1 column and 3 rows (3 frames),
// also facing LEFT. Frame 2 is mid-step with her legs stretched out.
// All frames use the same box so her body doesn't jump between frames.
const LAIKA_WALK_FRAMES = [
  { x: 37, y: 30, width: 507, height: 346 },  // frame 1: legs together, tail down
  { x: 37, y: 461, width: 507, height: 346 }, // frame 2: mid-step, legs stretched
  { x: 37, y: 893, width: 507, height: 346 }  // frame 3: legs together, tail up
];
const LAIKA_WALK_ORDER = [0, 1, 2, 1]; // play the frames 1-2-3-2, over and over

// Little puffs of dust behind Laika's feet while she runs.
// x = the spot just behind her tail.
function drawRunDust(time, x) {
  for (let i = 0; i < 3; i++) {
    const age = (time * 4 + i / 3) % 1;              // 0 = new puff, 1 = gone
    const size = 1 + Math.floor(age * 3);
    const drift = dog.facing === 1 ? -age * 6 : age * 6; // drifts away behind her
    rect(x + 2 + drift, dog.y - 2 - age * 3, size, size,
         "rgba(200,190,170," + (0.7 - age * 0.7) + ")");
  }
}

// Draws Space helmet.png (size x size) on any canvas at (x, y).
// The visor faces right in the image, so it is flipped when facing left.
// If the image is missing, nothing is drawn.
function drawHelmet(context, x, y, size, facingRight) {
  if (!imageReady(images.spaceHelmet)) {
    return;
  }
  const crop = HELMET_CROP;
  context.save();
  if (facingRight) {
    context.drawImage(images.spaceHelmet, crop.x, crop.y, crop.width, crop.height,
                      Math.round(x), Math.round(y), size, size);
  } else {
    context.translate(Math.round(x) + size, Math.round(y));
    context.scale(-1, 1);
    context.drawImage(images.spaceHelmet, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);
  }
  context.restore();
}

function drawDog(time) {
  const top = dog.y - dog.height;

  // "part" converts a position measured from her back end (tail = 0,
  // nose = dog.width) into a screen x, for whichever way she is facing.
  // (Uses whole pixels, like the sprite, so items line up with her exactly.)
  function part(fromBack, w) {
    const left = Math.round(dog.x);
    if (dog.facing === 1) {
      return left + fromBack;
    }
    return left + dog.width - fromBack - w;
  }

  const walking = state === "play" &&
    (holding("left") || holding("right") || holding("up") || holding("down"));

  // backY = the line of her back, sideY = the middle of her side.
  // Items she carries are drawn relative to these.
  let backY;
  let sideY;

  if (imageReady(images.laika)) {
    // Team artwork: switch frames quickly while walking, slowly (a tail wag) while standing
    // Walking uses "Laikia walking.png" (3 frames, played 1-2-3-2) if it's loaded;
    // standing uses Laika.png's 2 frames slowly, like a tail wag.
    // Running (Shift) plays the walking frames twice as fast, adds a little
    // bounce, and kicks up dust behind her.
    const running = walking && dog.running;
    const step = Math.floor(time * (running ? 16 : 8));
    let sheet = images.laika;
    let frame = LAIKA_FRAMES[Math.floor(time * 1.5) % 2];
    if (walking && imageReady(images.laikaWalk)) {
      sheet = images.laikaWalk;
      frame = LAIKA_WALK_FRAMES[LAIKA_WALK_ORDER[step % LAIKA_WALK_ORDER.length]];
    } else if (walking) {
      frame = LAIKA_FRAMES[step % 2];
    }
    const bounce = running && step % 2 === 1 ? 1 : 0; // lifts her 1 pixel every other frame
    const x = Math.round(dog.x);
    const y = Math.round(top) - bounce;
    if (running) {
      drawRunDust(time, part(-4, 4));
    }
    ctx.save();
    if (dog.facing === 1) {
      // The sprite faces left, so flip it to face right
      ctx.translate(x + dog.width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, frame.x, frame.y, frame.width, frame.height, 0, 0, dog.width, dog.height);
    } else {
      ctx.drawImage(sheet, frame.x, frame.y, frame.width, frame.height, x, y, dog.width, dog.height);
    }
    ctx.restore();
    // Her back is 7.5 pixels below the top of the sprite in every frame.
    // backY is 1 pixel lower, so the tank sits down on her back, not above it.
    backY = y + 9;
    sideY = y + 11;

    // The bucket hangs just under her helmet (from her mouth). It's drawn
    // before the helmet, so the helmet covers the top of its handle.
    if (bucket.collected) {
      drawBucket(part(18, 7), y + 10, bucket.filled, time);
    }

    // Space helmet over her head (her head is at the nose end of the sprite)
    drawHelmet(ctx, part(13, 14), y - 3, 14, dog.facing === 1);
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
    drawHelmet(ctx, part(15, 8), ptop - 2, 8, dog.facing === 1);
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
      // A dark strap around her middle holds the tank on
      rect(part(9, 1), backY - thickness, 1, thickness + 5, "#3b2a1a");
    } else {
      rect(part(4, length), backY - thickness, length, thickness, "#3fa7ff"); // placeholder tank
      rect(part(8, 1), backY - thickness, 1, thickness, "#ffffff");
    }
  }

  // Communication device (radio): carried in her mouth, then strapped to her side for good
  if (commDevice.attached) {
    if (!drawPart(ctx, images.radio, RADIO_CROP, part(7, 3), sideY - 4, 3, 7)) { // small radio on her side
      rect(part(7, 3), sideY - 1, 3, 3, "#4c566a");
      rect(part(8, 1), sideY - 3, 1, 2, "#8a919c");
    }
    const lightOn = Math.floor(time * 2) % 2 === 0;
    rect(part(10, 1), sideY, 1, 1, lightOn ? "#5fd39a" : "#1f5a3a"); // green = working
  } else if (commDevice.collected) {
    if (!drawPart(ctx, images.radio, RADIO_CROP, part(dog.width - 1, 3), sideY - 6, 3, 7)) { // held in her mouth
      rect(part(dog.width - 1, 3), sideY - 2, 3, 3, "#4c566a");
    }
  }

  // Placeholder Laika only: the bucket hangs from her mouth by its handle
  // (with the real sprite it's drawn above, under her helmet)
  if (bucket.collected && !imageReady(images.laika)) {
    drawBucket(part(dog.width - 3, 7), sideY - 4, bucket.filled, time);
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

// "Bark!" above Laika's head for a moment after she barks (B)
function drawBarkBubble() {
  if (barkBubbleTime <= 0) {
    return;
  }
  const x = dog.facing > 0 ? dog.x + dog.width + 12 : dog.x - 12; // in front of her face
  const rise = (0.5 - barkBubbleTime) * 12;                        // floats up a little
  label("Bark!", x, dog.y - dog.height - rise, "#ffffff");
}

// =============================================
// CUTSCENE DRAWING (one block per phase)
// =============================================

// Close-up of Laika at the astronaut's bed (used when checking on her and
// when giving supplies). Laika has her helmet off inside the ship.
function drawBedsideScene(time, showTreat) {
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "#1b1d26");             // dim room
  rect(0, 0, GAME_WIDTH, 6, "#2e3440");
  rect(52, 18, 136, 80, "#e8e4f0");                            // pillow
  rect(52, 18, 136, 3, "#ffffff");

  // The astronaut, eyes closed (Astronaut Close up.png)
  if (!drawSleepingAstronautFace(ctx, 70, 12, 100)) {
    const frame = ASTRONAUT_LYING; // fallback: the lying-down frame, made bigger
    drawPart(ctx, images.astronaut, frame, 80, 30, frame.width * 3, frame.height * 3);
  }

  // The IV stand (room_iv_stand_w.png, 4x) and the feeding bag (IV bag.webp)
  if (!drawPart(ctx, images.ivStand, TALL_SPRITE, 12, 8, 64, 128)) {
    rect(28, 8, 8, 110, "#9aa3ad");                            // placeholder stand
    rect(48, 24, 24, 30, "#d8f0ff");                           // and IV bag
  }
  if (!drawPart(ctx, images.ivBag, IV_BAG_CROP, 2, 14, 20, 39)) {
    rect(4, 16, 16, 28, "#e8d9b0");                            // placeholder feeding bag
  }
  // The IV line goes under the blanket to her arm...
  drawTube([[62, 76], [64, 90], [70, 100]], "#7a5cd6", 2);
  rect(36, 96, 180, 44, "#d4606a");                            // blanket
  rect(36, 96, 180, 4, "#e88a8f");

  // ...and the feeding tube goes from the feeding bag to her nose
  const noseX = 70 + (ASTRONAUT_NOSE.x - ASTRONAUT_CLOSEUP_CROP.x) * 100 / ASTRONAUT_CLOSEUP_CROP.width;
  const noseY = 12 + (ASTRONAUT_NOSE.y - ASTRONAUT_CLOSEUP_CROP.y) * 100 / ASTRONAUT_CLOSEUP_CROP.width;
  drawTube([[12, 52], [18, 74], [60, 80], [noseX - 12, noseY + 4], [noseX, noseY]], "#c9a66b", 2);
  rect(noseX - 16, noseY + 1, 6, 4, "#ffffff");                // tape on her cheek

  // Soft "z"s so it's clear she's asleep / unconscious
  const zRise = (time * 6) % 12;
  label("z", 176, 30 - zRise, "rgba(200,200,255,0.8)");

  // The supplies Laika brings
  if (sceneGave.includes("water")) {
    ctx.save();
    ctx.translate(176, 100);
    ctx.scale(3, 3);
    drawBucket(0, 0, true, time);
    ctx.restore();
  }
  if (sceneGave.includes("food")) {
    for (let i = 0; i < FRUIT_NEEDED; i++) {
      drawAlienFruit(150 + i * 12, 132, time + i, alienFruits[i % alienFruits.length].type, true);
    }
  }

  // The treat she leaves next to her head
  if (showTreat) {
    if (!drawPart(ctx, images.dogTreat, TREAT_CROP, 168, 52, 22, 22)) {
      rect(168, 60, 22, 7, "#f2d3a0");
    }
    if (Math.floor(time * 4) % 2 === 0) {
      rect(192, 50, 2, 2, "#ffffff"); // sparkle
      rect(164, 72, 2, 2, "#ffffff");
    }
  }

  // Laika (Laika.png, no helmet), 3x size, facing the astronaut
  const frame = LAIKA_FRAMES[Math.floor(time * 1.5) % 2];
  if (!drawPart(ctx, images.laika, frame, 210, 72, 78, 54)) {
    rect(214, 100, 60, 16, "#8b4a1f"); // placeholder dog body
    rect(206, 90, 20, 14, "#8b4a1f");
  }
}

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
    // Fade back in on the crashed ship (Laika is still inside, so she isn't shown)
    drawOutsideBackground(time);
    drawCrashSite(time, 999);
    drawShadow(ship.x, ship.y, ship.width);
    drawShip(time);
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "rgba(0,0,0," + Math.max(0, 0.95 - t) + ")");

  } else if (phase === "inside") {
    // Inside the ship's recovery room: Laika next to the unconscious astronaut
    drawRecovery(time);

  } else if (phase === "bedside" || phase === "bedsideTreat") {
    drawBedsideScene(time, phase === "bedsideTreat");
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

  if (state === "title" || state === "menu" || state === "quit") {
    drawTitleBackground(time);
  } else if (state === "cutscene" || (state === "paused" && stateBeforePause === "cutscene")) {
    drawCutscene(time);
  } else {
    // "play" or "tutorial": the tutorial panel sits on top of the game
    if (currentScene === "outside") {
      drawOutside(time);
    } else if (currentScene === "inside") {
      drawInside(time);
    } else if (currentScene === "recovery") {
      drawRecovery(time);
    } else if (currentScene === "storage") {
      drawStorage(time);
    } else if (currentScene === "lake" || currentScene === "jungle") {
      drawOutdoorArea(time);
    } else {
      drawOxygenRoomScene(time);
    }
    drawInteractionPrompt(time);
    drawAttachEffect(time);
    drawPlayerMarker(time);
    drawBarkBubble();
    drawHud(time);

    if (state === "tutorial" && !tutorialDone()) {
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
