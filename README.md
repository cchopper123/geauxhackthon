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
- After the cutscene, gameplay starts on the alien planet
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
  (other room → oxygen tank → bring it to her human → go outside → find the
  communication device → attach it to her space suit → get a Treat)
- Treats are the game's currency; a treat counter shows in the top-right corner
- Control instructions panel
- The game scales to fit the browser window

The tutorial, missions and ending are not built yet.

## Controls

| Key                          | Action                        |
| ---------------------------- | ----------------------------- |
| Mouse click                  | Start / New Game buttons      |
| Space / Enter / Next button  | Next line of dialogue         |
| W A S D / Arrow keys         | Move Laika (gameplay only)    |
| Walk up into a door          | Enter / exit the ship         |
| E (at the ship monitor)      | Open / close the tutorial     |
| Esc / Close button           | Close the tutorial            |
| H                            | Show / hide controls panel    |

## Editing the cutscene

The crash cutscene settings are at the top of `game.js`, in the
`CRASH CUTSCENE SETTINGS` section:

- `CUTSCENE_LINES` – the dialogue. Each line has a `speaker`, the `text`, and
  the animation `phase` that plays behind it.
- `SPEAKER_COLORS` – the name color for each speaker.
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
- `game.js` – all game code: game states, crash cutscene and dialogue, drawing,
  keyboard input, movement, collisions and the game loop

## Technology

- HTML, CSS and vanilla JavaScript only
- HTML5 Canvas for drawing
- No game engine, no libraries, no external APIs

## Artwork

All characters and objects are currently simple colored shapes used as
placeholders. They will be replaced with permitted, non-AI sprite sheets or
artwork created by our team. No AI-generated images or videos are used in
this project.

## AI disclosure

Parts of the code in this project were written with help from
**Claude Code** (an AI coding assistant made by Anthropic).

Claude Code's role:

- Created the starting files: `index.html`, `style.css`, `game.js` and this `README.md`
- Wrote the code for the canvas setup, window scaling, keyboard movement,
  collisions, the ship door and inside/outside scenes, the title screen and
  menu, the crash cutscene animation and dialogue system, the ship monitor
  tutorial and treat counter, the game loop, and
  the placeholder shapes for the scenes and characters
- Added comments to explain the code for beginners

Claude Code did **not** create any artwork. Our team is responsible for
reviewing, testing and changing the code, and for all game design and art.
