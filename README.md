# 🍄 Super Mario Bros - Web Edition

A classic retro platformer recreation built with **pure HTML5 Canvas and Web Audio API** (zero external dependencies, runs offline and in any modern web browser).

---

## 📁 Project Structure

```text
/kaggle/working/mario-game/
├── index.html     # Main HTML game container & HUD
├── style.css      # Retro arcade styling, HUD layout & mobile touch controls
├── game.js        # Game engine (physics, collision, procedural pixel art & audio synthesis)
└── README.md      # Game documentation and instructions
```

---

## 🎮 How to Play

### Option 1: Direct Browser Launch
Simply open [`index.html`](file:///kaggle/working/mario-game/index.html) in any web browser (Google Chrome, Firefox, Safari, Edge).

### Option 2: Local HTTP Server (Python)
If you want to serve it locally:
```bash
cd /kaggle/working/mario-game
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Left** | ⬅️ or `A` | `◀` Button |
| **Move Right** | ➡️ or `D` | `▶` Button |
| **Jump** (Hold for higher jump) | ⬆️, `W`, or `Spacebar` | `A` Button |
| **Run / Sprint** | `Shift` or `X` | `B` Button |
| **Toggle Mute / Music** | `M` | - |
| **Restart Game** | Click **TRY AGAIN** button | Tap button |

---

## ✨ Features Included

- **Accurate Platformer Physics**: Variable jump height, gravity, horizontal momentum, friction, and solid tile collision detection.
- **Classic Enemies (Goombas)**: Patrol obstacles; stomp them from above to defeat them and bounce upward.
- **Interactive Question Blocks & Bricks**:
  - `?` Blocks pop out coins or Super Mushrooms.
  - Super Mushrooms turn Mario into Super Mario (tall Mario).
  - Super Mario can smash Brick blocks into crumbling debris.
- **Dynamic Camera**: Smooth horizontal scrolling camera following Mario.
- **8-Bit Web Audio Engine**: Procedural retro chiptune sound effects (jump, coin chime, stomp, bump, power-up, death) and background theme synthesized on the fly via the Web Audio API without requiring any external audio files.
- **Mobile Touch Support**: On-screen D-Pad and action buttons for touch devices.
- **World 1-1 Layout**: Floating platforms, pipes of varied heights, pit hazards, brick pyramids, flagpole, and castle finish!
