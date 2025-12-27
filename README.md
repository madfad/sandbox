# ⚡ CIRCUITRY - Device Evolution Game

**Circuitry** is a 2D puzzle game where you play as an electronic device that evolves and gains new abilities as you collect gears and solve puzzles.



## 🎮 Play the Game
**[Click here to play the game!](https://madfad.github.io/sandbox/)**
*(Replace `YOUR_USERNAME` with your GitHub username after creating the repository)*

## 🕹️ Controls
*   **WASD / Arrow Keys**: Move around
*   **E / F**: Switch between unlocked devices
*   **Space**: Interact (depending on device)
*   **Esc**: Pause / Menu

## 🔋 Devices & Abilities
As you collect gears ⚙️, you will unlock new forms:

1.  **Light Switch** (Start): Connect wires to power doors.
2.  **Flashlight** (5 Gears): Reflect light beams off mirrors.
3.  **Magnet** (10 Gears): Pull metal crates onto pressure plates.
4.  **Fan** (15 Gears): Blow wind-light objects like feathers.
5.  **Heater** (20 Gears): Melt ice blocks.
6.  **Speaker** (25 Gears): Shatter glass walls with sound resonance.
7.  **Vacuum** (30 Gears): Pull objects towards you.
8.  **Antenna** (35 Gears): Transmit signals through walls.
9.  **Spring** (40 Gears): Bounce over obstacles.
10. **Laser** (45 Gears): Activate precision sensors.
11. **Drill** (50 Gears): Break through weak walls.
12. **Battery** (55 Gears): Power platforms temporarily.
13. **Stopwatch** (60 Gears): Slow down fast-moving hazards.
14. **Master Circuit** (65 Gears): Combine all abilities to solve the final challenge.

## 🛠️ Development
This game is built with vanilla **HTML5 Canvas**, **JavaScript**, and **CSS**. No external texture assets are used; all graphics are programmatically generated using the Canvas API.

### Project Structure
*   `index.html`: Main game entry point.
*   `css/`: Stylesheets.
*   `js/`: Game logic.
    *   `engine/`: Core systems (Renderer, Input, Collision, Particles).
    *   `entities/`: Game objects (Player, Door, Puzzles).
    *   `levels/`: Level designs (1-14).
    *   `systems/`: Game managers (Evolution, Puzzle state).
