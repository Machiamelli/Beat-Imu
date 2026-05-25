(() => {
  "use strict";

  const SLOTS = ["IQ", "Body", "Fruit", "Crew", "Haki"];
  const TIER_SCORE = { SS: 32, S: 16, A: 8, B: 4, C: 2, D: 1 };

  const POOL = {
    IQ: [
      { name: "Dragon",      tier: "S",  img: "dragon.jpg" },
      { name: "Blackbeard",  tier: "S",  img: "blackbeard.jpg" },
      { name: "Nami",        tier: "A",  img: "nami.jpg" },
      { name: "Vegapunk",    tier: "SS", img: "vegapunk.jpg" },
      { name: "Robin",       tier: "A",  img: "robin.jpg" },
      { name: "Crocus",      tier: "C",  img: "crocus.jpg" },
      { name: "Law",         tier: "A",  img: "law.jpg" },
      { name: "Judge",       tier: "B",  img: "judge.jpg" },
      { name: "Ben Beckman", tier: "SS", img: "ben_beckman.jpeg" },
      { name: "Sukiyaki",    tier: "C",  img: "sukiyaki.webp" },
    ],
    Body: [
      { name: "Kuma",    tier: "S",  img: "kuma.jpg" },
      { name: "Rocks",   tier: "SS", img: "rocks.jpg" },
      { name: "Big Mom", tier: "S",  img: "big_mom.jpg" },
      { name: "Chopper", tier: "C",  img: "chopper.jpg" },
      { name: "Oden",    tier: "S",  img: "oden.jpg" },
      { name: "Moria",   tier: "C",  img: "moria.jpg" },
      { name: "King",    tier: "SS", img: "king.jpg" },
      { name: "Sugar",   tier: "D",  img: "sugar.jpg" },
    ],
    Fruit: [
      { name: "Whitebeard",     tier: "S",  img: "whitebeard.jpg" },
      { name: "Luffy",          tier: "SS", img: "luffy.jpg" },
      { name: "Marco",          tier: "A",  img: "marco.jpg" },
      { name: "Magellan",       tier: "A",  img: "magellan.jpg" },
      { name: "Meteor Admiral", tier: "A",  img: "fujitora.jpg" },
      { name: "Blackbeard",     tier: "S",  img: "blackbeard.jpg" },
      { name: "Big Mom",        tier: "S",  img: "big_mom.jpg" },
      { name: "Sugar",          tier: "SS", img: "sugar.jpg" },
    ],
    Crew: [
      { name: "Law",    tier: "B",  img: "law.jpg" },
      { name: "Shanks", tier: "SS", img: "shanks.jpg" },
      { name: "Luffy",  tier: "A",  img: "luffy.jpg" },
      { name: "Roger",  tier: "SS", img: "roger.jpg" },
      { name: "Moria",  tier: "C",  img: "moria.jpg" },
      { name: "Kaido",  tier: "S",  img: "kaido.jpg" },
      { name: "Bonney", tier: "D",  img: "bonney.jpg" },
      { name: "Rocks",  tier: "SS", img: "rocks.jpg" },
    ],
    Haki: [
      { name: "Luffy",    tier: "S",  img: "luffy.jpg" },
      { name: "Zoro",     tier: "A",  img: "zoro.jpg" },
      { name: "Aokiji",   tier: "A",  img: "aokiji.jpg" },
      { name: "Garp",     tier: "SS", img: "garp.jpg" },
      { name: "Rayleigh", tier: "SS", img: "rayleigh.jpg" },
      { name: "Kaido",    tier: "S",  img: "kaido.jpg" },
      { name: "Mihawk",   tier: "A",  img: "mihawk.jpg" },
    ],
  };

  const OUTCOMES = {
    legendary: { title: "IMU Defeated" },
    win:       { title: "IMU Injured" },
    draw:      { title: "IMU Killed You" },
    lose:      { title: "IMU One Hit You" },
    flop:      { title: "IMU Laughed" },
  };

  const OUTCOME_IMG = {
    flop:      "imu_laughed.jpg",
    lose:      "imu_one_hit_you.jpg",
    draw:      "imu_killed_you.jpg",
    win:       "imu_injured.jpg",
    legendary: "imu_defeated.jpg",
  };

  const state = {
    phase: "spinning",
    locked: {},
    current: {},
  };

  const $slots = document.getElementById("slots");
  const $stage = document.getElementById("stage");
  const $result = document.getElementById("result");
  const $rTitle = document.getElementById("resultTitle");
  const $rImu = document.getElementById("resultImu");
  const $rImuFrame = document.getElementById("resultImuFrame");
  const $replay = document.getElementById("replayBtn");

  const tileEls = {};
  SLOTS.forEach((slot) => {
    const el = document.createElement("div");
    el.className = "slot";
    el.dataset.slot = slot;
    el.innerHTML = `
      <div class="card">
        <div class="face"><div class="txt">—</div></div>
      </div>
      <div class="label">${slot}</div>
    `;
    el.addEventListener("click", () => onSlotClick(slot));
    $slots.appendChild(el);
    tileEls[slot] = el;
  });

  function setFace(slot, entry) {
    const tile = tileEls[slot];
    const face = tile.querySelector(".face");
    let img = face.querySelector("img");
    if (!img) {
      face.innerHTML = "";
      img = new Image();
      img.onerror = () => {
        const div = document.createElement("div");
        div.className = "txt";
        div.textContent = entry.name;
        face.replaceChildren(div);
      };
      face.appendChild(img);
    }
    img.alt = entry.name;
    img.src = `assets/chars/${entry.img}`;
  }

  function clearFace(slot) {
    tileEls[slot].querySelector(".face").innerHTML = `<div class="txt">—</div>`;
  }

  function setTileClasses(slot, { spinning, pickable, locked }) {
    const tile = tileEls[slot];
    tile.classList.toggle("spinning", !!spinning);
    tile.classList.toggle("pickable", !!pickable);
    tile.classList.toggle("locked", !!locked);
  }

  function unlockedSlots() {
    return SLOTS.filter((s) => !state.locked[s]);
  }

  let spinHandle = null;
  const SPIN_DURATION = 1400;

  function startSpin() {
    state.phase = "spinning";
    const spinStart = performance.now();

    const unlocked = unlockedSlots();
    unlocked.forEach((s) => setTileClasses(s, { spinning: true }));

    const jitter = {};
    const nextTick = {};
    unlocked.forEach((s) => {
      jitter[s] = 60 + Math.random() * 50;
      nextTick[s] = 0;
    });

    function frame(t) {
      const elapsed = t - spinStart;
      const unlockedNow = unlockedSlots();

      unlockedNow.forEach((s) => {
        if (elapsed >= nextTick[s]) {
          const pool = POOL[s];
          const entry = pool[Math.floor(Math.random() * pool.length)];
          state.current[s] = entry;
          setFace(s, entry);
          nextTick[s] = elapsed + jitter[s];
        }
      });

      if (elapsed < SPIN_DURATION) {
        spinHandle = requestAnimationFrame(frame);
      } else {
        unlockedNow.forEach((s) => {
          const pool = POOL[s];
          const entry = pool[Math.floor(Math.random() * pool.length)];
          state.current[s] = entry;
          setFace(s, entry);
          setTileClasses(s, { spinning: false, pickable: true });
        });
        spinHandle = null;
        state.phase = "awaitingPick";
      }
    }
    spinHandle = requestAnimationFrame(frame);
  }

  function stopSpin() {
    if (spinHandle) {
      cancelAnimationFrame(spinHandle);
      spinHandle = null;
    }
  }

  function onSlotClick(slot) {
    if (state.phase !== "awaitingPick") return;
    if (state.locked[slot]) return;
    const entry = state.current[slot];
    if (!entry) return;
    state.locked[slot] = entry;

    unlockedSlots().forEach((s) => {
      setTileClasses(s, { pickable: false });
      clearFace(s);
      delete state.current[s];
    });
    SLOTS.forEach((s) => {
      if (state.locked[s]) setTileClasses(s, { locked: true });
    });

    if (Object.keys(state.locked).length === 5) {
      state.phase = "battle";
      runBattle();
    } else {
      startSpin();
    }
  }

  function runBattle() {
    $stage.classList.add("battle");
    setTimeout(() => {
      $stage.classList.remove("battle");
      showResult();
    }, 1600);
  }

  function computeOutcome() {
    const total = SLOTS.reduce(
      (sum, s) => sum + TIER_SCORE[state.locked[s].tier],
      0,
    );
    let key;
    if (total >= 144)      key = "legendary";
    else if (total >= 128) key = "win";
    else if (total >= 113) key = "draw";
    else if (total >= 97)  key = "lose";
    else                   key = "flop";
    return { key, total };
  }

  function showResult() {
    const { key } = computeOutcome();
    $result.className = `result show ${key}`;
    $rTitle.textContent = OUTCOMES[key].title;

    const imgFile = OUTCOME_IMG[key];
    if (imgFile) {
      $rImu.src = `assets/outcomes/${imgFile}`;
      $rImuFrame.classList.add("show");
    } else {
      $rImu.removeAttribute("src");
      $rImuFrame.classList.remove("show");
    }

    state.phase = "result";
  }

  function reset() {
    stopSpin();
    state.locked = {};
    state.current = {};
    SLOTS.forEach((s) => {
      setTileClasses(s, { spinning: false, pickable: false, locked: false });
      clearFace(s);
    });
    $result.className = "result";
    $rImuFrame.classList.remove("show");
    $rImu.removeAttribute("src");
    $stage.classList.remove("battle");
    startSpin();
  }

  $replay.addEventListener("click", reset);
  // Auto-start: kick off round 1 immediately.
  startSpin();
})();
