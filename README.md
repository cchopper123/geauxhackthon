# Wiener Dog in Space

A 2D pixel art browser game made for the SASE × GDSC 3-day student hackathon.

You play as **Laika**, a dachshund whose spaceship crash-lands on an alien
planet. Her astronaut is unconscious in the ship's recovery room, and only
Laika can keep her alive. The space-survival objective: get your own oxygen
working, recover the ship's lost communication device, then bring your
human **water** and **food** from the planet, all without running out of
oxygen outside.

## Story

A female astronaut crash-lands on an alien planet with her dachshund, Laika.
The astronaut is left unconscious in the ship's recovery room, hooked up to
an IV and a feeding tube, with a heart monitor beeping beside her. Laika must
find an oxygen tank, fill it, recover the communication device thrown out
during the crash, and then gather water and alien fruit to keep her human
alive.

## How to play

1. Open `index.html` in a web browser (Chrome, Edge or Firefox). No install,
   server, build step or internet connection is needed.
2. Click **Start**, then **New Game** (or **Continue** if you have a save).
3. Watch the crash cutscene (Space / Enter for the next line).
4. Follow the controls walkthrough at the top of the screen.
5. Walk to the ship monitor in the main room and press **E**. It shows the
   tutorial tasks as pictures.
6. Tutorial: find the oxygen tank (storage room), fill it (oxygen room), go
   outside, find the beeping communication device, and attach it at the ship.
7. Main mission: find the bucket, fill it at the lake, collect 4 alien
   fruit, and bring the water and food to the astronaut's bed in the recovery
   room (the door with the red cross).
8. Watch your oxygen meter outside. If it runs out, Laika wakes up in the
   oxygen room.

## Controls

| Key / input                      | Action |
| -------------------------------- | ------ |
| Mouse click on a button          | Start, Quit, Continue, New Game, Next, menu buttons (plays a click) |
| Space / Enter / Next button      | Next line of dialogue |
| W A S D / Arrow keys             | Move Laika (gameplay only) |
| Hold Shift while moving          | Run |
| Walk off the screen edge         | Go to the next outdoor area (jungle / crash site / lake) |
| Walk up into a door              | Go through a door (ship entrance, recovery room, storage room, oxygen room) |
| E at the ship monitor            | Open / close the tutorial |
| E at the survival screen         | Open / close the survival screen |
| E at the heart monitor           | See the astronaut's heart rate |
| E at the astronaut's bed         | Check on her / give her the supplies |
| E next to an item                | Pick it up (oxygen tank, device, bucket, fruit, seeds) |
| E at the filling station         | Fill / refill oxygen |
| E at the ship with the device    | Attach the device to Laika |
| E at the lake / farm             | Fill the bucket, dig, plant, water, harvest |
| E at the big tree                | Inspect it |
| Q                                | Drop the bucket |
| B                                | Makes the currently controlled dog (Laika) bark – works any time during gameplay, even standing still. Not in menus, dialogue or cutscenes |
| H                                | Show / hide the controls panel |
| O / Hide button                  | Hide / show the objectives list |
| Esc                              | Pause menu (Resume / Options / Main Screen); also closes open panels |

All of these keys (except Esc, Space/Enter and the arrow keys) can be
changed in the pause menu under **Options** (saved in the browser).

## Features

This is an early version.

- Title screen with **Start** and **Quit** buttons. Quit tries to close the
  game's tab. Browsers only let a page close tabs that a script opened, so
  usually a "Thanks for playing!" screen appears instead, with a Back to
  Title button
- Menu with **Continue** (only shown when there's a saved game) and
  **New Game**
- Saving: the game saves automatically every 3 seconds while playing, and
  when the page is closed or reloaded (in the browser's localStorage, on
  this computer only). It saves where Laika is, her oxygen and treats, the
  items she has, the bucket, fruit, seeds, the farm, and which missions are
  done. Continue puts everything back. New Game replaces the saved game
  once the crash scene ends. Clearing the browser's site data deletes the save
- New Game plays a crash cutscene: the ship flies through space, loses
  control, falls toward the planet on fire and crashes, with dialogue
  shown in a box at the bottom of the screen
- During the crash, debris scatters across the planet and the communication
  device is thrown far from the ship. The wreckage and device stay on the
  ground during gameplay
- After the cutscene, gameplay starts in the recovery room, next to the
  unconscious astronaut
- You play as Laika the dachshund
- Outside: alien landscape with a purple sky, twinkling stars, two moons,
  hills, rocks and alien plants
- Crashed spaceship with a blinking warning light, smoke and an entrance hatch
- The ship is solid: Laika can't walk through it, only in through the door
- Inside: the ship's main room with the monitor, the survival screen, a
  window, an exit door, the recovery room door (red cross) and the storage
  room door (blue O2 sign)
- **Recovery room** (see [Hospital assets](#hospital-assets)): the astronaut
  lies unconscious in a hospital-style room, tucked into bed up to her chin.
  She's hooked up to an IV stand at the head of her bed: an IV line goes
  under the blanket to her arm, and a feeding tube goes from the feeding bag
  to her nose (also shown in the bedside scene). Next to her bed is a heart
  rate monitor that beeps with every heartbeat while Laika is in the room.
  Press E at it to see her heart rate: slow (about 58 BPM) while she needs
  water and food, about 65 BPM after one of them, and steady at about 72 BPM
  after both. These heart rates are made-up GAME values, not real
  measurements
- Ship monitor tutorial: press E at the monitor inside the ship to see the
  story, the main objective, and blinking picture steps Laika can understand
  (other room → oxygen tank → put it on → fill it in the oxygen room → go
  outside → find the communication device → attach it to her space suit →
  get a Treat)
- Storage room: through the main room's door with the blue O2 sign
- Oxygen room: through the storage room's door with the green O2 FILL sign.
  The filling station fills (and later refills) Laika's oxygen
- Oxygen meter (bottom-right): it appears the first time Laika goes
  outside. Oxygen only runs out while Laika is outside (100 seconds from
  full); inside the ship it stays the same. If it runs out, a "Laika ran
  out of oxygen" screen appears (with a sound); after Continue she wakes up
  in the oxygen room with a full meter
- Treat counter (bottom-left); after the tutorial it also shows alien fruit
  and seeds. Treats are the game's currency: +1 Treat for each finished
  mission
- Controls walkthrough: when gameplay starts, a banner teaches the controls
  one step at a time ("Press W to walk forward", walk back, left, right,
  hold Shift to run, press E to interact). Each step finishes when the
  player does it. Doors and interacting open up once all steps are done.
  The steps are in `MOVE_TUTORIAL` in `game.js`
- Tutorial missions, in order:
  1. Find the oxygen tank in the storage room (press E)
  2. Fill it at the filling station in the oxygen room (press E).
     Laika can't leave the ship until her tank is filled
  3. Go outside and find the beeping communication device (press E)
  4. Bring it back to the ship and attach it to Laika (press E)
- When all four are done, a "!" blinks next to the ship monitor. Pressing E
  there shows "Tutorial Complete" and the next set of tasks
  (listed in `NEXT_TASKS` in `game.js`); after that the "!" goes away
- Pause menu (Esc): Resume, Options (change any control; saved in the
  browser) and Main Screen (saves, then goes back to the title screen)
- Exploring: outside, walk off the left edge of the crash site to reach the
  **Jungle**, or off the right edge to reach the **Lake**. Signs show the way.
  Hold **Shift** to run (faster, with a quicker run animation and dust)
- Objective tracker (top-right, can be hidden) with hints, plus pop-up messages
- Control instructions panel
- The game scales to fit the browser window and keeps the pixel art sharp

The ending (restoring life support / waking the astronaut) is not built yet.

### Mission: Keep the Astronaut Alive (after the tutorial)

The objective tracker switches to this mission once the tutorial is done.
The mission opens up in two steps after the tutorial: when Laika goes back
inside the ship, the bucket appears in the storage room; when she comes back
outside, the fruit, seeds, farm and signs appear and the jungle and lake
open. Until then they are hidden and can't be used.

Main mission (needed to finish):

1. **Find a bucket in the spaceship** – it's in the storage room (press E).
   Press **Q** to drop it anywhere, and E to pick it up again
2. **Fill the bucket at the lake** – walk to the lake shore and press E.
   The bucket shows water once it's full
3. **Collect alien fruit (4 needed)** – fruit grows in the jungle, by the
   lake and near the ship (press E). Farm fruit counts too
4. **Return to the astronaut with the supplies** – go through the red cross
   door to the recovery room and press E next to her bed to give her the
   water and the food (together or one at a time). Giving water uses it up:
   the empty bucket disappears and reappears somewhere in the ship. When
   both are given, a "Supplies Secured" message explains she is still
   unconscious and that more adventures are coming

Side objective: Start a Farm (optional):

1. **Find seeds** – seeds in the jungle and at the lake (2 seeds each)
2. **Dig a planting spot** – the farm is the three soil plots next to the ship
3. **Plant the seeds** – press E on a dug plot. Each kind of seed grows a
   different alien fruit
4. **Water the plants** – seeds and sprouts only grow after Laika waters
   them with a bucket of water (press E). A full bucket has 3 waterings;
   the water in it gets lower each time. Refill or top it up at the lake.
   A blinking water drop shows which plants are thirsty
5. **Grow and harvest alien fruit** – a watered seed sprouts after 15 s; the
   watered sprout becomes a mature plant with fruit after 25 s. After a
   harvest, new fruit grows back (30 s). Plants keep growing while Laika is
   elsewhere

The jungle has a giant alien tree Laika can inspect (press E).

**Visiting the astronaut:** pressing E at her bed plays a short scene with a
dialogue box (a close-up of the astronaut, eyes closed, and Laika without
her helmet). Without supplies, Laika barks ("Bark?") and the narrator says
what's still needed. With supplies, Laika barks ("Bark! Bark!"), gives her
the water and/or fruit, and leaves a treat next to her head. Only the treat
stays afterwards, on her pillow (the water and fruit don't stay in the room).

All collected items and farm progress are kept when Laika changes areas.
After the mission, Laika can keep exploring and farming.

Placeholder shapes are still used for the farm plants (stalks and sprouts)
and the jungle's glowing plants. Numbers like `FRUIT_NEEDED`, the farm
growth times and item positions are in the `MISSION: KEEP THE ASTRONAUT
ALIVE` section near the top of `game.js`.

### Survival screen

Next to the ship monitor is a smaller **survival screen** on the wall. It
always shows four little bars (water, food, Laika's oxygen, life support) and
a light that blinks red while the astronaut still needs water or food.
Walk under it and press E to open it (E or Esc closes it). It has two tabs:

**Status** (the simple view) – the astronaut's condition and four bars:
water, food, oxygen and life support (0–4 systems working).

**About** (all the details) – shows, and keeps updating while it's open:

- **Astronaut:** her status (unconscious – needs water/food, or stable) and
  the life-support systems Laika has restored (0–4): the oxygen filling
  station (filling the tank), communications (attaching the radio), and
  water and food (giving them to the astronaut).
- **Water supply:** the bucket's water (uses left) and whether the astronaut
  has been given water.
- **Food:** alien fruit carried, farm plants growing / ready / needing water,
  seeds, and whether the astronaut has been given food.
- **Oxygen & air:** Laika's oxygen and the filling station's status.
- **Environment:** the ship cabin and the planet.

Every number is labeled. **NASA** = a real reference value from a NASA
document. **GAME** = made up for this game's fictional planet. All other
readings (oxygen %, bucket uses, fruit counts, systems restored) are game
values that come from what the player has done. The game has no
live data and doesn't use the internet; the values are stored in
`survival-data.js`.

**Real values used (all stored in `survival-data.js`):**

From the NASA *Life Support Baseline Values and Assumptions Document*
(BVAD), NASA/TP-2015-218570/REV1, M. S. Anderson, M. K. Ewert and
J. F. Keener, January 2018 (NASA Technical Reports Server, record
20180001338):

| Value | Meaning | Where in the BVAD |
| ----- | ------- | ----------------- |
| 0.816 kg/day | Oxygen one crew member uses per day (nominal) | Table 3-33, Summary of Nominal Human Metabolic Interface Values |
| 1.04 kg/day | Carbon dioxide one crew member produces per day | Table 3-33 |
| 2.5 kg/day | Drinking (potable) water one crew member consumes per day | Table 3-33 |
| 1.51 kg/day | Food one crew member eats per day (without packaging) | Table 3-33 |
| 12.59 MJ/day | Energy in that food per day | Table 3-33 |
| 101 kPa | Typical total cabin pressure in a spacecraft (nominal) | Table 4-1, Typical Steady-State Values for Vehicle Atmospheres |
| 21.2 kPa | Oxygen partial pressure in the cabin (nominal, no impairment) | Table 4-1 |
| 296 K (about 23 °C) | Cabin temperature (nominal) | Table 4-1 |
| 40 % | Cabin relative humidity (nominal) | Table 4-1 |

From the NASA *Mars Fact Sheet* (NASA Space Science Data Coordinated
Archive, nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html), shown as a
real comparison for an alien world:

| Value | Meaning |
| ----- | ------- |
| 6.36 mb | Surface pressure at the mean radius (varies about 4.0–8.7 mb by season) |
| ~214 K (about -59 °C) | Average temperature |
| 95.1 % CO₂ | Carbon dioxide in the atmosphere |
| 0.16 % O₂ | Oxygen in the atmosphere |
| 3.73 m/s² | Mean surface gravity |

**Fictional (GAME) values:** the planet's air ("not breathable"), its
temperature (-18 °C), its gravity (about 0.8 × Earth), its lake water, the
ship cabin being breathable, and the astronaut's heart rate are invented for
the game and are **not** real measurements.

To add more verified data later, add an entry to `SURVIVAL_REAL_DATA` in
`survival-data.js` with its value, unit, source and table, then add a line
for it in `renderSurvivalMonitor()` in `game.js` (it fills the About tab).
Don't put invented numbers in `SURVIVAL_REAL_DATA`.

## Editing the cutscene

The crash cutscene settings are at the top of `game.js`, in the
`CRASH CUTSCENE SETTINGS` section:

- `CUTSCENE_LINES` – the dialogue. Each line has a `speaker`, the `text`, and
  the animation `phase` that plays behind it.
- `SPEAKER_COLORS` – the name color for each speaker.
- `wait` (optional, on a line) – seconds before that line can be skipped.
- `CRASH_DEBRIS` – where each piece of wreckage lands.
- `DEBRIS_FLY_TIME`, `DEVICE_FLY_TIME` – how long the debris and the device fly.
- Where the device lands is set by `commDevice.x` / `commDevice.y`.
- `PORTRAITS` – the face shown in the dialogue box for each speaker.
- `INTRO_TIME`, `TYPE_SPEED`, `MIN_LINE_TIME` – timing of the intro and text.

The animation for each phase is drawn in the `drawCutscene()` function.

## Files

- `index.html` – the page: game canvas, title screen, menu, dialogue box,
  controls panel and all the pop-up panels (monitor, survival screen, heart
  monitor, pause menu)
- `style.css` – page layout, full-window canvas, buttons, dialogue box and panel styles
- `game.js` – all game code: game states, crash cutscene and dialogue,
  drawing, keyboard input, movement, collisions, sounds, saving and the game loop
- `survival-data.js` – the survival screen's data: real NASA reference values
  (with sources) and the game's made-up planet values
- `assets/` – images
- `assets/Audio/` – sounds and music

## Technologies used

- **HTML** (`index.html`), **CSS** (`style.css`) and **vanilla JavaScript**
  (`game.js`, `survival-data.js`)
- Built-in browser features only: the HTML5 Canvas (drawing), `<img>` tags
  (animated GIFs), `Audio` (sounds and music) and `localStorage` (the saved
  game and the control settings)
- No game engine, no libraries or frameworks, no build step

### External APIs

**None.** The code was checked: it makes no network requests (no `fetch`,
`XMLHttpRequest` or WebSocket), loads no scripts, fonts or data from other
websites, and only loads its own local files (`style.css`,
`survival-data.js`, `game.js` and the `assets` folder). The NASA reference
values are typed into `survival-data.js`; they are not downloaded while
playing. The game works offline.

## Assets

Images live in the `assets` folder and are loaded in the `images` list near
the top of `game.js`. Sounds live in `assets/Audio` and are loaded in the
`sounds` and `soundGroups` lists. If an image is missing, the game keeps a
placeholder shape and shows a "Missing asset" warning in the browser
console (F12).

**Original assets:** assets our team created ourselves are original assets.
When a file is confirmed as ours, change its "Source / license" entry to
"Original asset by <name>".

**Verification status:** Claude Code did not create, download or edit any
image or sound file, and could not check where they came from. Every source
and license below that says **Needs verification** must be checked and
filled in by the team. Some file dates are from before the hackathon, which
suggests those files came from an asset pack or another website. Their
original source and license still need to be found and written down.

### Images

| File | Used for | Source / license |
| ---- | -------- | ---------------- |
| `assets/Space Background.png` | Space behind the title screen and the cutscene's flight through space | Needs verification (team original?) |
| `assets/Planet Background.png` | Sky on the alien planet (gameplay and crash scene) | Needs verification (team original?) |
| `assets/Title screen World.gif` | The spinning planet: title screen, menu, and the cutscene's flight toward it (animated GIF) | Needs verification (team original?) |
| `assets/Spaceship.png` | The ship: flying (title screen and cutscene) and crashed on the planet | Needs verification (team original?) |
| `assets/Planet ground.png` | Ground texture on the planet | Needs verification (file dated 2023, before the hackathon) |
| `assets/Oxygen tank.png` | Oxygen tank in the storage room, on Laika's back, the filling station's big tanks, the oxygen meter icon, the tutorial pictures | Needs verification (team original?) |
| `assets/Monitor.gif` | The ship monitor in the main room (animated GIF, shown 2x) | Needs verification (file dated 2023, before the hackathon) |
| `assets/Laika.png` | Laika, the playable dachshund (2 frames); her dialogue portrait; the tutorial pictures | Needs verification (team original?) |
| `assets/Laikia walking.png` | Laika's walking animation (3 frames, played 1-2-3-2) | Needs verification (team original?) |
| `assets/Space helmet.png` | Laika's space helmet | Needs verification (team original?) |
| `assets/Astronaut Close up.png` | The sleeping astronaut in bed and in the bedside scene (the game paints her eyes closed; the file isn't changed) | Needs verification (team original?) |
| `assets/Astronaut face icon.png` | The astronaut's dialogue portrait | Needs verification (team original?) |
| `assets/Astronaut frames.png` | Backup picture of the astronaut lying down (used only if the close-up is missing) | Needs verification (team original?) |
| `assets/Alien fruits.png` | Alien fruit on the ground, on farm plants, and the HUD icon (sheet of 16) | Needs verification (team original?) |
| `assets/seeds.png` | Alien seeds on the ground and the HUD icon (4 x 4 grid) | Needs verification (team original?) |
| `assets/Bucket.png` | The water bucket | Needs verification (team original?) |
| `assets/Lake.png` | The lake in the Lake area | Needs verification (team original?) |
| `assets/dog treat.png` | The treat (HUD, tutorial pictures, on the astronaut's pillow) | Needs verification (team original?) |
| `assets/Radio.png` | The communication device | Needs verification (team original?) |
| `assets/rocks.png` | Rocks scattered by the crash | Needs verification (team original?) |
| `assets/Big Tree.png` | The giant tree in the jungle (black background, drawn with "lighten") | Needs verification (file dated 2024, before the hackathon) |
| `assets/Blue tree.png`, `Blue tree 2.png`, `Cool blue tree.png`, `Purple tree.png`, `Purple tree 2.png` | Trees along the horizon (black backgrounds, drawn with "lighten") | Needs verification (files dated 2024, before the hackathon) |
| `assets/Interior (2).png` | Walls and floors inside the ship (all rooms) | Needs verification (file dated 2021, before the hackathon – likely an asset pack) |
| `assets/Interior (1).png` | Furniture inside the ship: the astronaut's bed, doorways, windows, plants, shelves, rack, cabinets, lockers | Needs verification (file dated 2021, before the hackathon – likely an asset pack) |
| `assets/Heart rate monitor.png` | The heart rate monitor in the recovery room, and the big view when you press E (the game covers its "72" with the live heart rate; the file isn't changed) | Needs verification |
| `assets/IV bag.webp` | The feeding bag on the IV stand (room and bedside scene) | Needs verification |
| `assets/room_*.png` (hospital pack) | The recovery room's furniture – see [Hospital assets](#hospital-assets) | Needs verification (files dated September 2025, before the hackathon – likely a downloaded asset pack) |

#### Hospital assets

The hospital pixel-art pack (16x16 and 16x32 sprites with transparent
backgrounds) is used to make the recovery room look like a hospital room.
Each sprite is drawn at 2x (4x for the IV stand in the bedside scene) so it
stays sharp.

| File | Where it's used |
| ---- | --------------- |
| `room_iv_stand_w.png` | The IV stand at the head of the astronaut's bed (with its IV bag; the IV line goes from it to her arm), and the big IV stand in the bedside scene |
| `IV bag.webp` | The feeding bag on the IV stand's left hook; the feeding tube goes from it to her nose (room and bedside scene) |
| `Heart rate monitor.png` | The heart rate monitor on a rolling stand next to her bed, and the big heart monitor view |
| `room_armchair.png` | Visitor armchair against the wall |
| `room_bedside_table.png` | Small table against the wall |
| `room_flower.png` | Flower on that table |
| `room_cabinet.png` | Medical cabinet against the wall |
| `room_pharmacy_shelf.png` | Medicine box on the wall |
| `room_anatomy_poster.png` | Anatomy poster on the wall |
| `room_hand_sanitizer.png` | Hand sanitizer on the wall by the door |
| `room_trash_bin.png` | Trash bin by the door |

Only the hospital pack sprites listed above are kept in the project. The
pack's other sprites (other beds and IV stands, meal trays, pills, ECG cart,
biohazard bins, the operating room, lab and maternity sprites, the sprite
sheets and an `.aseprite` file) and `Iv pole.jpg` (replaced by
`room_iv_stand_w.png`) were removed because the game doesn't use them.

Notes:

- The GIFs are shown as `<img>` tags in `index.html` (not drawn on the
  canvas), because browsers only keep a GIF animating when it is shown as a
  real image. `showGif()` in `game.js` says where each GIF goes every frame.
- The tree images have solid black backgrounds instead of transparent ones.
  The game draws them with the "lighten" blend mode so the black disappears.

### Sounds

In `game.js` the sounds are organized in one place: the `sounds` list
(single sounds tied to one exact event) and the `soundGroups` list (groups
of similar sounds; one is picked at random each time, never the same one
twice in a row).

| Purpose | File(s) in `assets/Audio` | When it plays |
| ------- | ------------------------- | ------------- |
| Buttons | `Clicking.wav` | Any button click (Start, Quit, Continue, New Game, Next, menus, Options, Close buttons, tabs) |
| Laika's bark | `Dachshund Dog Barking Outdoors.mp3` (short sections) | When the player presses B, and on her "Bark!" dialogue lines – see [Dog barking](#dog-barking) |
| Laika's whine | `Dachshund Whining Sound Effect in HD Quality.mp3` (2.15–3.8 s) | Her "Whines" line at the end of the crash cutscene |
| Title music | `Title background music.mp3` | Loops on the title screen and menu; stops when the game starts |
| Planet music | `Planet background music.ogg` | Loops while Laika is outdoors (crash site, jungle, lake) |
| Spaceflight | `space ship flying.wav` | Cutscene: starts the moment you click New Game, loops while the ship flies, speeds up while it falls, stops at the impact. (Continue skips the cutscene, so it doesn't play then) |
| Alarm | `Secuirty alarm.mp3` | Cutscene: loops quietly from "losing control" until the impact |
| Crash | `Space ship explosion.ogg` | Cutscene: once, when the ship hits the planet |
| Astronaut voice | `Astronaut talking sound.mp3` | High babble while her lines type out |
| Narrator voice | `Astronaut talking sound.mp3` | The same clip played slower and deeper |
| Computer voice | `switch1.ogg` … `switch12.ogg` | Robotic chirps while the computer's lines type out |
| Walking | `footstep00.ogg` … `footstep09.ogg` | A soft paw step about every 0.32 s while she walks |
| Running | `Laika running audio.mp3` | Loops while she runs |
| Interactions | `click1.ogg` … `click5.ogg` | When pressing E does something |
| Monitor | `Monitor beep.ogg` | Opening the ship monitor or survival screen; also the heart monitor's beep (quieter, once per heartbeat, only in the recovery room) |
| Bucket | `metalPot1.ogg` … `metalPot3.ogg` | Taking, dropping, filling and watering with the bucket |
| Digging / planting | `chop.ogg` | Digging a planting spot and planting seeds |
| Seeds | `handleSmallLeather.ogg`, `handleSmallLeather2.ogg` | Picking up seeds |
| Radio | `metalClick.ogg` | Attaching the communication device |
| Doors | `doorOpen_1.ogg`, `doorOpen_2.ogg` | Going through a ship door |
| Celebration | `congratulations audi.ogg` | Tutorial complete (first monitor visit after it) and mission complete |
| Out of oxygen | `died audio.ogg` | When oxygen runs out |

Every file in `assets` and `assets/Audio` is used by the game. Unused
sounds from the sound packs (book, cloth, knife, coins, creak, belt,
leather, `metalLatch`, `doorClose`, `rollover`, `mouseclick`,
`mouserelease` and `switch13`–`switch38`) were removed.

#### Dog barking

Laika barks in two situations only: when you **press B**, and on her
**bark lines in the dialogue**. Clicking buttons or pressing E never makes
her bark by itself.

Her dialogue barks (the happy "arf arf" from 37.45 s to 38.3 s of the
recording) play on:

- **"Bark!"** in the opening crash cutscene, after the astronaut asks if
  she's okay
- **"Bark?"** when she checks on the astronaut without supplies
- **"Bark! Bark!"** when she gives the astronaut water or food (the scene
  where she leaves a treat by her head)

These are set with `dogSound: "bark"` on the lines in `game.js`, and the
timing is `DOG_SOUNDS.bark`. They use their own copy of the sound, separate
from the B bark.

All barking comes from one audio file: `assets/Audio/Dachshund Dog
Barking Outdoors.mp3` (a 40-second recording with many barks in it). Its
source and license are unknown (**needs verification**, see
[Sound sources and licenses](#sound-sources-and-licenses)). The game plays
short sections of it:

- **Pressing B** (the Bark control) makes Laika, the dog you control, bark.
  - Works any time during normal gameplay, even when she's standing still
    and not next to anything. It doesn't work in menus, the pause menu, open
    panels, dialogue or cutscenes (when Laika can't move).
  - One bark per key press: holding B down doesn't repeat it.
  - No cooldown: you can bark as many times as you want.
  - Each press picks one of six single barks at random (0.84–1.14 s,
    9.42–9.70 s, 15.32–15.60 s, 16.20–16.50 s, 31.42–31.70 s and
    32.28–32.56 s of the recording), never the same one twice in a row.
  - Two copies of the sound take turns, so pressing B quickly never stacks
    up more than two barks at once.
  - "Bark!" pops up in front of her face for half a second.
  - The volume uses the game's `SOUND_VOLUME` like every other sound (the
    game has no mute setting).
  - The key can be changed in Esc > Options, and the controls panel shows it.
  - The barks are listed in `PLAYER_BARKS` in `game.js`.

#### Sound sources and licenses

- The 2014 files (`footstep00`–`09`, `door*`, `metalPot*`, `metalClick`,
  `chop`, `handleSmallLeather*`, …) and the 2017 files (`click1`–`5`,
  `switch*`, …) look like Kenney's free **"RPG Audio"** and **"UI Audio"**
  packs (kenney.nl), which are released under **CC0** (public domain).
  **Needs verification:** confirm this is where they came from.
- `congratulations audi.ogg` and `died audio.ogg` are also dated 2014 and
  may come from a Kenney pack. **Needs verification.**
- `Dachshund Dog Barking Outdoors.mp3`, `Dachshund Whining Sound Effect in
  HD Quality.mp3`, `space ship flying.wav`, `Secuirty alarm.mp3`,
  `Space ship explosion.ogg`, `Monitor beep.ogg`, `Astronaut talking
  sound.mp3`, `Laika running audio.mp3`, `Title background music.mp3`,
  `Planet background music.ogg` and `Clicking.wav`: source and license
  unknown. **Needs verification.** If a file was taken from a video site,
  check that its license allows use in a game, and credit the author if the
  license asks for it.

Sound notes:

- Browsers only allow sound after the player clicks or presses a key, so
  the title music starts on the first click.
- Voices: only one voice sound plays at a time. The babble stops when a
  line finishes typing, is skipped or changes, when the game is paused, and
  when the cutscene ends. Laika's bark/whine finish their short section.
- Cutscene: the engine and alarm stop at the impact; the explosion plays
  once per crash; the crash line waits 2.5 s so the explosion can finish.
- Footsteps only play while Laika is actually moving and the player is in
  control.
- The overall volume is `SOUND_VOLUME` near the top of `game.js`; each
  sound also has its own volume in the `sounds` / `soundGroups` lists.

## Competition requirements (SASE × GDSC)

| Rule | Status |
| ---- | ------ |
| Maximum of two external APIs | **0 used** (see [External APIs](#external-apis)) |
| No AI-generated images or videos | No images, videos or sounds were made with AI by Claude Code. The team must confirm that every downloaded image (especially `Heart rate monitor.png`, `IV bag.webp` and the hospital pack) is not AI-generated |
| Document asset sources and licenses | Every asset is listed above; entries marked **Needs verification** must be filled in by the team before submitting |
| Playable without unnecessary external dependencies | Runs by opening `index.html`; no internet, server, install, libraries or engine |

## AI disclosure

Parts of this project were made with help from **Claude Code**, an AI
coding assistant made by Anthropic.

What Claude Code did:

- Wrote and edited the code in `index.html`, `style.css`, `game.js` and
  `survival-data.js`, including:
  - the canvas setup, window scaling, keyboard movement and collisions
  - the title screen, menu, Quit screen, saving and Continue
  - the crash cutscene animation and the dialogue system
  - the ship rooms (main room, recovery room, storage room, oxygen room) and
    the outdoor areas
  - the ship monitor tutorial, the treat counter and the objective tracker
  - the oxygen, communication device, water, food and farm missions
  - the survival screen, the heart rate monitor and the bedside scenes
  - the sound system (music, voices, footsteps, button clicks, the B bark)
  - the pause menu with key rebinding, and the game loop
  - placeholder shapes for anything without an image
- Positioned the team's images in the game, including the hospital assets in
  the recovery room. It also wrote code that changes how some images look at
  runtime (painting the astronaut's eyes closed, writing the live heart rate
  over the heart monitor picture, blending away black backgrounds); the
  image files themselves were not changed
- Looked up the NASA reference values in the published NASA documents
  listed above and typed them into `survival-data.js`
- Wrote and updated this `README.md`
- Added comments to explain the code for beginners
- Tested the game with automated scripts run on its own computer (they are
  not part of the project)

What Claude Code did **not** do: it did not create, generate, download or
edit any images, videos or sounds, and it did not add any external APIs or
libraries.

Our team is responsible for the game design and the art choices, for
reviewing and testing the code, and for verifying the asset sources and
licenses.
