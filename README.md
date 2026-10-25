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

**Original assets:** Laika (`Laika.png`) is original artwork created by our
team. Every other asset is credited below to its source and creator where
that could be verified.

**How the sources were checked:** the team gave the source links. Each
source page was opened (in October 2026) to record the creator, the license
or usage terms, whether credit is required, and anything the page says
about generative AI. Each source was matched to a file by what the file
looks like, its size and how it's used in the game. Where a source page
couldn't be opened, or a file doesn't clearly match its source, the entry
says **needs verification** – those must be checked by hand before
submitting. No license was assumed just because a download was free.

### Images

| File | Used for | Source / license |
| ---- | -------- | ---------------- |
| `assets/Laika.png` | Laika, the playable dachshund (2 frames); her dialogue portrait; the tutorial pictures | **Original artwork created by our team** |
| `assets/Laikia walking.png` | Laika's walking animation (3 frames, played 1-2-3-2) | Laika's walking animation; the team's Laika artwork. **Needs verification:** confirm the team also drew this walking sheet |
| `assets/Space Background.png` | Space behind the title screen and the cutscene's flight through space | [Space Background Generator](https://deep-fold.itch.io/space-background-generator) by **Deep-Fold**. Generated images may be used "in your games or other projects"; they may not be distributed "on their own, or in an asset pack". Credit "appreciated, but not required" (generator code: MIT License). Page: "No generative AI was used" |
| `assets/Planet Background.png` | Sky on the alien planet (gameplay and crash scene) | [Space Background Generator](https://deep-fold.itch.io/space-background-generator) by **Deep-Fold** – same terms as above |
| `assets/Title screen World.gif` | The spinning planet: title screen, menu, and the cutscene's flight toward it (animated GIF, 100x100 px, 60 frames) | Either the [Pixel Planet Generator](https://deep-fold.itch.io/pixel-planet-generator) by **Deep-Fold** ("completely free, use it however you want", credit appreciated but not required, code MIT) or [Animated Pixel Art Planets (30px)](https://helianthus-games.itch.io/animated-pixel-art-planets-30px) by **Helianthus Games** (personal and commercial use allowed, "Credit is not required"). Both pages say no generative AI was used. **Needs verification:** which of the two this file came from (the Helianthus pack is described as 30px planets; this file is 100x100). No other file in the project uses a spinning planet |
| `assets/Planet ground.png` | Ground texture on the planet | [Planet Texture Pack 1](https://screamingbrainstudios.com/dl-planet-texture-pack-1/) by **Screaming Brain Studios** – **CC0 / Public Domain**, "free to use in any project, commercial or non-commercial"; no attribution required. Textures were "procedurally generated" with "hand-painted elevation colorizers" (the file is a 1024x512 planet texture, matching the pack) |
| `assets/Monitor.gif` | The ship monitor in the main room (animated GIF, shown 2x) | [Four Retro Computer Sprites](https://nightspore.itch.io/four-retro-computer-sprites) by **Nightspore** (32x32 animated GIF, matching the pack). "Commercial and non-commercial use OK"; "Credit not required but appreciated"; "Not for use in NFT, Crypto, AI"; "Do not resell as part of an asset pack". Page: "No generative AI was used" |
| `assets/Interior (1).png` | Furniture inside the ship: the astronaut's bed, doorways, windows, plants, shelves, rack, cabinets, lockers | [Interior Tileset Asset Pack 16x16](https://rcpstd.itch.io/interior-tileset-asset-pack-16x16) by **Rcp Studios**. May "Edit and/or use the assets in commercial or non-commercial projects"; may not "Resell or redistribute the assets to others, even if it is modified"; "Credits are not mandatory but much appreciated". No standard license named. The page doesn't mention AI |
| `assets/Interior (2).png` | Walls and floors inside the ship (all rooms) | [Interior Tileset Asset Pack 16x16](https://rcpstd.itch.io/interior-tileset-asset-pack-16x16) by **Rcp Studios** – same terms as above |
| `assets/room_*.png` (hospital pack) | The recovery room's furniture – see [Hospital assets](#hospital-assets) | [Top-Down Hospital](https://soppycraft.itch.io/top-down-hospital) by **Soppycraft**. Allowed in personal and commercial projects, game jams and educational games; may be modified; may NOT be redistributed or sold as-is, claimed as your own work, or put in another asset pack. "Credit is not required but always appreciated". AI: the page has a "No AI" tag but its AI Disclosure says "AI Assisted – Text" – see [Competition compliance](#competition-compliance-sase--gdsc) |
| `assets/IV bag.webp` | The feeding bag on the IV stand (room and bedside scene) | Source given by the team: [Top-Down Hospital](https://soppycraft.itch.io/top-down-hospital) by **Soppycraft** (terms above). **Needs verification:** this file (350x350 WebP, larger pixels) doesn't look like the pack's 16x16 sprites, and the pack's download isn't itemized on its page, so confirm it really came from this pack |
| `assets/Big Tree.png` | The giant tree in the jungle (black background, drawn with "lighten") | [Pixel Art Tree Pack – 250 different trees](https://batareya.itch.io/pixel-art-tree-pack-250-different-trees) by **Batareya**. Commercial and non-commercial use allowed; credit appreciated. ⚠️ **AI-generated:** the page says the trees were "created using artificial intelligence" ("All illustrations are created using Stable Diffusion") – see [Competition compliance](#competition-compliance-sase--gdsc) |
| `assets/Blue tree.png`, `Blue tree 2.png`, `Cool blue tree.png`, `Purple tree.png`, `Purple tree 2.png` | Trees along the horizon (black backgrounds, drawn with "lighten") | [Pixel Art Tree Pack – 250 different trees](https://batareya.itch.io/pixel-art-tree-pack-250-different-trees) by **Batareya** – same terms. ⚠️ **AI-generated** (Stable Diffusion) – see [Competition compliance](#competition-compliance-sase--gdsc) |
| `assets/Space helmet.png` | Laika's space helmet | [Pixel art illustration Astronaut helmet](https://www.vecteezy.com/vector-art/26136781) by **Collaborapix Studio** on Vecteezy. Listed as **Pro** content under the Vecteezy Pro Standard License ("No Attribution Required" with Pro). **License needs verification:** confirm it was downloaded with a Vecteezy Pro subscription or Pro credits. Under Vecteezy's Free License, attribution is required and content may not be used on products for resale. The page doesn't mark it as AI-generated |
| `assets/Oxygen tank.png` | Oxygen tank in the storage room, on Laika's back, the filling station's big tanks, the oxygen meter icon, the tutorial pictures | [oxygen tank pixel art](https://www.vecteezy.com/vector-art/54749638) by **Helixter** on Vecteezy. Listed as **Pro** content under the Pro Standard License ("No Attribution Required" with Pro). **License needs verification** – same as the helmet. The page doesn't mark it as AI-generated |
| `assets/Radio.png` | The communication device | The team's Bing link leads to a **Freepik Premium** vector, "Walkie pixel art for dynamic digital projects and designs" (`freepik.com/premium-vector/walkie-pixel-art-dynamic-digital-projects-designs_1032646-197.htm`). **Creator and license need verification:** Freepik blocked automated access, so the author and terms couldn't be read. Freepik Premium content normally needs a Premium subscription |
| `assets/Alien fruits.png` | Alien fruit on the ground, on farm plants, and the HUD icon (sheet of 16) | [ArtStation artwork ob0KDL](https://www.artstation.com/artwork/ob0KDL). **Creator and license need verification:** ArtStation blocked automated access, so the artist, terms and any AI tags couldn't be read. ArtStation posts are the artist's work; unless the post gives a license, get the artist's permission |
| `assets/Astronaut face icon.png` | The astronaut's dialogue portrait | Source given by the team: [Astronaut Portrait Pack](https://captainskolot.itch.io/astronaut-portrait-pack-asset-pixelart-pixel-art-sprite-badass-bust-pack-cowb) by **CaptainSkolot**. The page lists **Creative Commons Attribution 4.0** (CC BY 4.0 requires credit, even though the page also says "credit is not required"), allows commercial use and changes, and forbids reselling the assets on their own. ⚠️ AI Disclosure: "AI Assisted – Graphics" ("a local generative tool for rough concepts, then refined by hand") – see [Competition compliance](#competition-compliance-sase--gdsc). **Needs verification:** this file shows a full-body astronaut, while the pack is described as bust portraits |
| `assets/Astronaut Close up.png` | The sleeping astronaut in bed and in the bedside scene (the game paints her eyes closed; the file isn't changed) | **Source and license need verification.** No source was provided. It's a helmet bust portrait, so check whether it came from the same CaptainSkolot pack (if so, the pack's AI-assisted note applies to it too) |
| `assets/Astronaut frames.png` | Backup picture of the astronaut lying down (used only if the close-up is missing) | **Source and license need verification** |
| `assets/seeds.png` | Alien seeds on the ground and the HUD icon (4 x 4 grid) | **Source and license need verification.** The team listed [Wild Plants – Pixel Asset Pack](https://pop-shop-packs.itch.io/wild-plants-pixel-asset-pack) by **Pop Shop Packs** as a possible plant source (commercial use allowed, credit "not necessary but appreciated", no resale, no uploading to generative AI, "No generative AI was used"). That pack has seeds for 8 plants, while this file has 16 seeds in a different layout, so no file in the project is confirmed to come from it |
| `assets/Spaceship.png` | The ship: flying (title screen and cutscene) and crashed on the planet | **Source and license need verification** |
| `assets/Bucket.png` | The water bucket | **Source and license need verification** |
| `assets/Lake.png` | The lake in the Lake area | **Source and license need verification** |
| `assets/dog treat.png` | The treat (HUD, tutorial pictures, on the astronaut's pillow) | **Source and license need verification** |
| `assets/rocks.png` | Rocks scattered by the crash | **Source and license need verification** |
| `assets/Heart rate monitor.png` | The heart rate monitor in the recovery room, and the big view when you press E (the game covers its "72" with the live heart rate; the file isn't changed) | **Source and license need verification.** Not part of the Top-Down Hospital pack's 16x16 style |

#### Hospital assets

The [Top-Down Hospital](https://soppycraft.itch.io/top-down-hospital)
pixel-art pack by **Soppycraft** (16x16 and 16x32 sprites with transparent
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
`Iv pole.jpg` was the [intravenous IV stand isometric icon](https://www.vecteezy.com/vector-art/45872464-intravenous-iv-stand-isometric-icon-illustration)
by **Muhamad Ulum** on Vecteezy (Pro Standard License); it is no longer in
the game.

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

No source links were provided for the sounds.

| File(s) in `assets/Audio` | Used for | Source / license |
| ------------------------- | -------- | ---------------- |
| `footstep00.ogg` … `footstep09.ogg`, `doorOpen_1.ogg`, `doorOpen_2.ogg`, `metalPot1.ogg` … `metalPot3.ogg`, `metalClick.ogg`, `chop.ogg`, `handleSmallLeather.ogg`, `handleSmallLeather2.ogg` | Footsteps, doors, bucket, radio, digging, seeds | Very likely [RPG Audio](https://kenney.nl/assets/rpg-audio) by **Kenney** – **CC0** (public domain; credit not required). The file names and dates match this 50-file pack, but the page doesn't list file names. **Needs verification:** confirm the download |
| `click1.ogg` … `click5.ogg`, `switch1.ogg` … `switch12.ogg` | Interacting with E; the computer's robotic voice | Very likely [UI Audio](https://kenney.nl/assets/ui-audio) by **Kenney** – **CC0**. Same match and same check as above |
| `congratulations audi.ogg`, `died audio.ogg` | Tutorial / mission complete; out of oxygen | **Source and license need verification** (dated 2014, possibly from a Kenney pack) |
| `Dachshund Dog Barking Outdoors.mp3`, `Dachshund Whining Sound Effect in HD Quality.mp3` | Laika's barks and whine | **Source and license need verification.** The names look like titles of online videos; check that the license allows use in a game |
| `space ship flying.wav`, `Secuirty alarm.mp3`, `Space ship explosion.ogg` | Crash cutscene | **Source and license need verification** |
| `Astronaut talking sound.mp3` | Astronaut and narrator voices | **Source and license need verification** |
| `Laika running audio.mp3` | Running | **Source and license need verification** |
| `Monitor beep.ogg` | Monitors and the heart monitor | **Source and license need verification** |
| `Clicking.wav` | Button clicks | **Source and license need verification** |
| `Title background music.mp3`, `Planet background music.ogg` | Music | **Source and license need verification** |

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

## Competition compliance (SASE × GDSC)

| Rule | Status |
| ---- | ------ |
| Maximum of two external APIs | ✅ **0 used** (see [External APIs](#external-apis)) |
| No AI-generated images or videos | ⚠️ **Not met yet** – the tree images are AI-generated (see below). Other images still need checking |
| Document asset sources and licenses | ⚠️ Every asset is listed with its source where known; entries marked **needs verification** must be completed before submitting |
| Playable without unnecessary external dependencies | ✅ Runs by opening `index.html`; no internet, server, install, libraries or engine |

### ⚠️ AI-generated images (problem for the no-AI rule)

These files came from the
[Pixel Art Tree Pack – 250 different trees](https://batareya.itch.io/pixel-art-tree-pack-250-different-trees)
by Batareya. Its page says the trees were "created using artificial
intelligence" and "All illustrations are created using Stable Diffusion",
and it is tagged "AI Generated":

- `assets/Big Tree.png` – the giant tree in the jungle
- `assets/Blue tree.png`, `assets/Blue tree 2.png`, `assets/Cool blue tree.png`,
  `assets/Purple tree.png`, `assets/Purple tree 2.png` – the trees along the horizon

They are **not** hand-drawn or original. They have not been deleted or
changed. **Recommendation:** replace them with trees drawn by the team, or
with a tree pack whose page states no generative AI was used, before
submitting. A creator allowing commercial use doesn't make an asset allowed
in the competition.

### Other AI concerns to check

- `assets/Astronaut face icon.png` – the source given
  ([Astronaut Portrait Pack](https://captainskolot.itch.io/astronaut-portrait-pack-asset-pixelart-pixel-art-sprite-badass-bust-pack-cowb)
  by CaptainSkolot) says "AI Assisted – Graphics": a "local generative tool
  for rough concepts, then refined by hand". This may break the no-AI rule.
  Ask the organizers or replace it. `Astronaut Close up.png` needs the same
  check if it came from this pack.
- The hospital pack ([Top-Down Hospital](https://soppycraft.itch.io/top-down-hospital)
  by Soppycraft) is tagged "No AI", but its AI Disclosure says "AI Assisted –
  Text". That suggests only the page text, not the art, was AI-assisted.
  Lower concern, but confirm.
- Files whose source is unknown can't be confirmed as non-AI: `Spaceship.png`,
  `Bucket.png`, `Lake.png`, `dog treat.png`, `rocks.png`, `seeds.png`,
  `Heart rate monitor.png`, `Astronaut Close up.png`, `Astronaut frames.png`,
  `IV bag.webp`. Also `Alien fruits.png` (ArtStation page couldn't be read)
  and `Radio.png` (Freepik page couldn't be read).
- The Vecteezy pages for `Space helmet.png` and `Oxygen tank.png` don't
  mark them as AI-generated, but they are paid **Pro** content – confirm the
  team has the right license.
- Sources whose pages say no generative AI was used: Deep-Fold (both
  generators), Helianthus Games, Nightspore and Pop Shop Packs. Screaming
  Brain Studios describes its textures as procedurally generated and
  hand-painted. Rcp Studios doesn't mention AI.

### Licenses that may need a purchase

- `Space helmet.png`, `Oxygen tank.png` – Vecteezy **Pro** content
- `Radio.png` – Freepik **Premium** content
- `Alien fruits.png` – ArtStation artwork; permission or a stated license is needed

## Original assets, tools and AI disclosure

- **Original artwork:** Laika (`Laika.png`) was drawn by our team. All
  other assets are credited to their creators in [Assets](#assets).
- **Tools:** HTML, CSS and JavaScript, written in **Visual Studio Code**
  with the **Claude Code** extension.
- **AI-assisted coding is not AI-generated art.** Claude Code helped write
  the code. It did not create any images, videos or sounds. Some
  downloaded image assets were made with AI by their creators – those are
  listed in [Competition compliance](#competition-compliance-sase--gdsc).
- Follow the competition's rules for disclosing AI use when submitting.

### Claude Code

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
