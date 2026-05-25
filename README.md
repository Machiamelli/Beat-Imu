# 🏴‍☠️ Beat Imu ⚔️

A web recreation of the viral 📸 Instagram Imu filter, built for 💻 desktop and 📱 mobile browsers.

You build a One Piece character across 5 stats (🧠 IQ / 💪 Body / 🍎 Fruit / ⚓ Crew / 👁️ Haki), then fight Imu. 👑 The outcome depends on the total tier power of your locked picks.

## 🎮 Play

1. Open `index.html` — five slots auto-spin a roster of characters.
2. After they settle, **tap one** slot to lock that pick for that stat.
3. The remaining unlocked slots spin again. Repeat until all 5 are locked.
4. Imu shakes — the result reveals based on your power total.

## 🎯 Outcomes

Five possible endings, decided purely by score:

| Outcome            | Total score | Image               |
| ------------------ | ----------- | ------------------- |
| 👑 IMU Defeated    | ≥ 144       | imu_defeated.jpg    |
| 🩸 IMU Injured     | 128–143     | imu_injured.jpg     |
| ☠️ IMU Killed You  | 113–127     | imu_killed_you.jpg  |
| 👊 IMU One Hit You | 97–112      | imu_one_hit_you.jpg |
| 😂 IMU Laughed     | < 97        | imu_laughed.jpg     |

## 🏆 Tier scoring

Each character has a tier. Each tier is worth double the one below — so 2 picks of any tier ≈ 1 pick of the next tier up.

| Tier | Score |
| ---- | ----- |
| SS   | 32    |
| S    | 16    |
| A    | 8     |
| B    | 4     |
| C    | 2     |
| D    | 1     |

Max total: 5 × SS = 160.

📊 Under optimal play (always lock the highest-tier roll each round), rough odds:

- 😂 Laughed ~16%
- 👊 One Hit You ~25%
- ☠️ Killed You ~20%
- 🩸 Injured ~23%
- 👑 Defeated ~16%

## 📁 Project structure

```
.
├── index.html         # markup
├── styles.css         # all styling
├── app.js             # game logic + state machine
├── README.md
└── assets/
    ├── imu.png        # main Imu silhouette
    ├── chars/         # 32 character portraits (jpg/jpeg/webp)
    └── outcomes/      # 5 result-screen images
```

## 🚀 Run

No build step. Just open `index.html` in any modern browser:

Or serve it (e.g. `python3 -m http.server`) and visit `http://localhost:8000`.

## ⚙️ Customize

### 🔄 Swap characters / tiers

Edit the `POOL` object near the top of `app.js`:

```js
const POOL = {
  IQ: [
    { name: "Dragon", tier: "S", img: "dragon.jpg" },
    // ...
  ],
  // Body, Fruit, Crew, Haki...
};
```

Drop the matching image into `assets/chars/` and reference its filename in `img`.

### 🎚️ Tune outcome thresholds

In `computeOutcome()` inside `app.js`:

```js
if (total >= 144) key = "legendary";
else if (total >= 128) key = "win";
else if (total >= 113) key = "draw";
else if (total >= 97) key = "lose";
else key = "flop";
```

### 🖼️ Swap outcome images

Replace files in `assets/outcomes/` (keep filenames) or edit the `OUTCOME_IMG` map in `app.js`.

## 🛠️ Tech

- ⚡ Vanilla JS.
- 🎞️ Single `requestAnimationFrame` loop drives the slot spin animation.
- 📐 CSS Grid for the slot row, `aspect-ratio` + `object-fit` for image fit.
- 🔁 State machine: `idle → spinning → awaitingPick → battle → result`.

## 🙏 Credits

Inspired by the "Beat Imu" 📸 Instagram filter trend. One Piece character images belong to their respective owners — used here for non-commercial fan content. 🏴‍☠️

## 📄 License

MIT License. See [LICENSE](LICENSE).
