# 💄 Beauty Blast: Pure Puzzle Edition

> **An ad-free, pure tap-to-blast puzzle game inspired by *Beauty Blast: Makeover & Story*.**
> Built with React 18, TypeScript, Tailwind CSS, Vite, and Web Audio API synthesis. Hosted on GitHub Pages.

🎮 **Live Web App**: [https://a-safwhigre.github.io/beauty-blast-puzzle/](https://a-safwhigre.github.io/beauty-blast-puzzle/)

---

## 🌟 Features & Highlights

- **Pure Puzzle Gameplay**: 100% focused on the collapse/blast puzzle engine. No ads, no paywalls, no energy wait timers, and no mandatory story cutscenes.
- **Dynamic Booster Crafting**:
  - **🚀 Rockets (5–6 Cubes)**: Clears entire rows or columns.
  - **💣 Bombs (7–8 Cubes)**: Clears a 3x3 surrounding zone.
  - **🪩 Magic Mirrors / Disco Balls (9+ Cubes)**: Clears all cubes of the target color on the board.
- **💥 Super Booster Combos**:
  - **Rocket + Rocket**: Cross blast (+ shape, clearing row & column).
  - **Rocket + Bomb**: Super blast clearing 3 rows and 3 columns.
  - **Bomb + Bomb**: Massive 5x5 explosion.
  - **Disco + Rocket / Disco + Bomb**: Converts all matching colored tiles into boosters and detonates them!
  - **Disco + Disco**: Ultimate board wipe!
- **📦 Obstacles & Objective Types**:
  - **Wooden Crates**: 1-hit standard and 2-hit reinforced crates broken by adjacent blasts.
  - **Drop-down Lipsticks**: Bring them to the bottom row through gravity to collect.
  - **Frosted Ice Cubes**: Trapped cubes that shatter with color matches.
- **🏆 20 Handcrafted Story Levels**: Carefully paced progression teaching each mechanic step-by-step.
- **✨ Infinite Procedural Generator**: Generate unlimited new puzzles on demand with customizable difficulty (*Easy*, *Medium*, *Hard*, *Insane*).
- **🎉 Blast Fever Mode**: Leftover moves at the end of a level turn into celebratory rockets for bonus points!
- **🔊 Tactile Web Audio**: Zero-lag synthesized sound effects (pops, launches, booms, chimes, crate cracks, fanfare).
- **📱 Fully Responsive**: Designed for both desktop clicks and mobile touch screens with prevention of pull-to-refresh or accidental zoom.

---

## 🕹️ Controls & How to Play

1. **Tap any group of 2+ matching colored cubes** to blast them.
2. Watch above tiles fall due to gravity and new tiles refill the board.
3. Keep an eye on your **Moves Left** and **Target Objectives** in the top bar.
4. If no valid moves exist, the board automatically shuffles so you are never stuck.

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/a-safwhigre/beauty-blast-puzzle.git
cd beauty-blast-puzzle

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🚀 Deployment

The project is configured with a GitHub Actions workflow in `.github/workflows/deploy.yml` that automatically builds and deploys to **GitHub Pages** whenever changes are pushed to `main`.
