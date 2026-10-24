# Wiener Dog in Space

A 2D pixel art browser game made for a 3-day student hackathon.

## Story

A female astronaut crash-lands on an alien planet with her dachshund, Laika.
The astronaut is left in a coma inside the ship. Laika must find oxygen and a
spaceship repair component, then return to the ship and restore life support.

## Current status

This is an early version.

- Title screen with a Start button, then a menu with a New Game button
- New Game plays a crash cutscene: the ship flies through space, loses
  control, falls toward the planet on fire and crashes, with dialogue
  shown in a box at the bottom of the screen
- During the crash, debris scatters across the planet and the communication
  device is thrown far from the ship. The wreckage and device stay on the
  ground during gameplay
- After the cutscene, gameplay starts inside the crashed ship, next to the
  unconscious astronaut
- You play as Laika the dachshund
- Outside: alien landscape with a purple sky, twinkling stars, two moons,
  hills, rocks and alien plants
- Crashed spaceship with a blinking warning light, smoke and an entrance hatch
- The ship is solid: Laika can't walk through it, only in through the door
- Inside: the ship's interior with a control console, empty oxygen gauge,
  windows, an exit door, and the astronaut lying in a coma on a cot next to a
  heart monitor
- Ship monitor tutorial: press E at the monitor inside the ship to see the
  story, the main objective, and blinking picture steps Laika can understand
  (other room → oxygen tank → put it on → go outside → find the
  communication device → attach it to her space suit → get a Treat)
- Storage room: a second room inside the ship, through the door with the blue
  O2 sign
- Mission 1 – Find the oxygen supply: the oxygen tank is hidden in the storage
  room. Press E next to it to collect it
- Mission 2 – Recover the communication device: find the beeping device among
  the debris outside, press E to pick it up, bring it back to the ship and
  press E to attach it to Laika. It stays attached for the rest of the game
- Objective tracker (top-right) with hints, plus pop-up messages
- Treats are the game's currency: +1 Treat for each finished mission
- Control instructions panel
- The game scales to fit the browser window

The ending (restoring life support) is not built yet.

## Controls

| Key                          | Action                        |
| ---------------------------- | ----------------------------- |
| Mouse click                  | Start / New Game buttons      |
| Space / Enter / Next button  | Next line of dialogue         |
| W A S D / Arrow keys         | Move Laika (gameplay only)    |
| Walk up into a door          | Enter / exit the ship         |
| E (at the ship monitor)      | Open / close the tutorial     |
| E (next to an item)          | Pick up the item              |
| E (at the ship with device)  | Attach the device to Laika    |
| Esc / Close button           | Close the tutorial            |
| H                            | Show / hide controls panel    |
| O / Hide button              | Hide / show objectives list   |

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
- `PORTRAITS` – the face shown in the dialogue box for each speaker
  (placeholder faces for the Astronaut and Laika).
- `INTRO_TIME`, `TYPE_SPEED`, `MIN_LINE_TIME` – timing of the intro and text.

The animation for each phase is drawn in the `drawCutscene()` function.

## How to run

1. Download or clone this folder.
2. Double-click `index.html` to open it in a web browser (Chrome, Firefox or Edge).
3. Click on the page and use the keys above.

No install, server, internet connection or build step is needed.

## Files

- `index.html` – the page: game canvas, title screen, menu, dialogue box and controls panel
- `style.css` – page layout, full-window canvas, buttons, dialogue box and panel styles
- `assets/` – the team's artwork (PNG images and sprite sheets)
- `game.js` – all game code: game states, crash cutscene and dialogue, drawing,
  keyboard input, movement, collisions and the game loop

## Technology

- HTML, CSS and vanilla JavaScript only
- HTML5 Canvas for drawing
- No game engine, no libraries, no external APIs

## Artwork

All artwork is permitted, non-AI artwork made by our team. No AI-generated
images or videos are used in this project. Anything that doesn't have an
image yet is drawn with simple colored shapes as a placeholder.

### Assets

Images live in the `assets` folder and are loaded in the `images` list near
the top of `game.js`.

| File                          | Used for                                         | Source / artist        |
| ----------------------------- | ------------------------------------------------ | ---------------------- |
| `assets/Space Background.png` | Space behind the title screen and the cutscene's flight through space | Our team (add artist name) |
| `assets/Planet Background.png` | Sky on the alien planet (gameplay and crash scene) | Our team (add artist name) |
| `assets/Title screen World.gif` | The spinning planet they crash on: title screen, menu, and the cutscene's flight toward it (animated GIF, loops forever) | Our team (add artist name) |
| `assets/Spaceship.png` | The ship: flying (title screen and cutscene) and crashed on the planet | Our team (add artist name) |
| `assets/Planet ground.png` | Ground texture on the planet | Our team (add artist name) |
| `assets/Oxygen tank.png` | Oxygen tank in the storage room, on Laika's back, and in the tutorial pictures | Our team (add artist name) |
| `assets/Monitor.gif` | The ship monitor inside the ship that opens the tutorial (animated GIF, shown 2x) | Our team (add artist name) |
| `assets/Laika.png` | Laika, the playable dachshund (sprite sheet: 1 column x 2 rows, both frames face left). Walking switches frames quickly; standing switches slowly for a tail wag. Also used in the tutorial pictures | Our team (add artist name) |
| `assets/Astronaut frames.png` | The unconscious astronaut lying on the bed (sprite sheet: 30 columns x 5 rows; one "lying on her back" frame from the falling-down row is used, because she can't move) | Our team (add artist name) |
| `assets/Radio.png` | The communication device: on the ground, in Laika's mouth, on her side, and in the tutorial pictures | Our team (add artist name) |
| `assets/Interior (2).png` | Walls and floors inside the ship (blue-gray panels and gray tiles in the main room, beige panels and teal tiles in the storage room) | Our team (add artist name) |
| `assets/Interior (1).png` | Furniture inside the ship: the astronaut's bed, doorways, windows, a plant, storage shelves and a rack, and the cabinets in the storage room | Our team (add artist name) |
| `assets/Space helmet.png` | Laika's space helmet (flips with her; also in the tutorial pictures) | Our team (add artist name) |
| `assets/rocks.png` | Rocks knocked loose by the crash, scattered around the planet (a sheet of loose rocks; the small and medium ones are used) | Our team (add artist name) |
| `assets/Blue tree.png`, `Blue tree 2.png`, `Cool blue tree.png`, `Purple tree.png`, `Purple tree 2.png` | Trees along the horizon on the planet | Our team (add artist name) |

Notes:

- The GIFs are shown as `<img>` tags in `index.html` (not drawn on the
  canvas), because browsers only keep a GIF animating when it is shown as a
  real image. `showGif()` in `game.js` says where each GIF goes every frame,
  and `updateGifImages()` lines them up with the canvas (this also follows the
  window when it is resized).
- The tree images have solid black backgrounds instead of transparent ones.
  The game draws them with the "lighten" blend mode so the black disappears.
  If they are re-exported with transparent backgrounds, that can be removed
  (see `drawTrees()`).

If an image is missing, the game keeps the placeholder and shows a
"Missing asset" warning in the browser console (F12).

## AI disclosure

Parts of the code in this project were written with help from
**Claude Code** (an AI coding assistant made by Anthropic).

Claude Code's role:

- Created the starting files: `index.html`, `style.css`, `game.js` and this `README.md`
- Wrote the code for the canvas setup, window scaling, keyboard movement,
  collisions, the ship door and inside/outside scenes, the title screen and
  menu, the crash cutscene animation and dialogue system, the ship monitor
  tutorial and treat counter, the storage room, the oxygen and communication
  device missions, crash debris, the objective tracker, the game loop, and
  the placeholder shapes for the scenes and characters
- Added comments to explain the code for beginners

- Wrote the code that loads the team's images from the `assets` folder

Claude Code did **not** create any artwork. Our team is responsible for
reviewing, testing and changing the code, and for all game design and art.
