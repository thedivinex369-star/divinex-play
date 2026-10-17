(() => {
  "use strict";
  const STORAGE_KEY = "divinex-play-demo-v1";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const initialState = { coins: 1000, lastDaily: "", scores: { "Fruit Spin": 0, "Memory Match": 0, "Star Rush": 0, "Number Guess": 0 }, gamesPlayed: 0 };
  let state = loadState();
  let activeCleanup = null;
  let toastTimer;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return saved ? { ...initialState, ...saved, scores: { ...initialState.scores, ...(saved.scores || {}) } } : structuredClone(initialState);
    } catch { return { ...initialState, scores: { ...initialState.scores } }; }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* local storage may be disabled */ }
    render();
  }
  function render() {
    $("#coinCount").textContent = state.coins.toLocaleString();
    $("#modalCoins").textContent = state.coins.toLocaleString();
    const today = new Date().toLocaleDateString("en-CA");
    const claimed = state.lastDaily === today;
    $("#claimBtn").disabled = claimed;
    $("#claimBtn").textContent = claimed ? "Bonus claimed today ✓" : "Claim daily bonus";
    $("#dailyMessage").textContent = claimed ? "Come back tomorrow for another bonus." : "Available once per calendar day on this device.";
    renderLeaderboard();
  }
  function renderLeaderboard() {
    const rows = Object.entries(state.scores).sort((a,b) => b[1]-a[1]);
    $("#leaderRows").innerHTML = rows.map(([name,score],i) => `<div class="leader-row"><span class="rank">${i+1}</span><span class="leader-name">${escapeHtml(name)}<span class="leader-sub">Your local demo score</span></span><span class="leader-score">${score.toLocaleString()} pts</span></div>`).join("");
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
  function toast(message) {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function addCoins(amount) { state.coins = Math.max(0, state.coins + amount); saveState(); }
  function record(name, points) { state.scores[name] = (state.scores[name] || 0) + points; state.gamesPlayed++; saveState(); }
  function setGame(title, description, html) {
    if (activeCleanup) { activeCleanup(); activeCleanup = null; }
    $("#modalTitle").textContent = title;
    $("#modalDescription").textContent = description;
    $("#gameArea").innerHTML = html;
    $("#gameModal").hidden = false;
    document.body.style.overflow = "hidden";
    render();
  }
  function closeGame() {
    if (activeCleanup) { activeCleanup(); activeCleanup = null; }
    $("#gameModal").hidden = true; document.body.style.overflow = "";
  }

  function playSpin() {
    setGame("Fruit Spin Demo", "A luck-style animation using virtual points only. No deposits, wagers or cash prizes.", `<div><div class="slot-reels"><div class="reel" id="reel0">🍒</div><div class="reel" id="reel1">🍋</div><div class="reel" id="reel2">🍇</div></div><button class="btn btn-primary game-action" id="spinBtn">Spin · 10 virtual coins</button><div class="game-result" id="spinResult">Match symbols for demo points.</div></div>`);
    const symbols = ["🍒","🍋","🍇","⭐","🍉","🔔"];
    $("#spinBtn").addEventListener("click", () => {
      if (state.coins < 10) { $("#spinResult").textContent = "Not enough virtual coins. Claim your daily bonus."; return; }
      state.coins -= 10;
      const reels = [$("#reel0"),$("#reel1"),$("#reel2")];
      reels.forEach(el => el.textContent = symbols[Math.floor(Math.random()*symbols.length)]);
      let points = 0;
      if (reels[0].textContent === reels[1].textContent && reels[1].textContent === reels[2].textContent) points = 30;
      else if (reels[0].textContent === reels[1].textContent || reels[1].textContent === reels[2].textContent || reels[0].textContent === reels[2].textContent) points = 8;
      state.coins += points; record("Fruit Spin", points);
      $("#spinResult").textContent = points ? `Nice! +${points} virtual coins.` : "No match this time. Try again for fun.";
      render();
    });
  }

  function playMemory() {
    const icons = ["🍋","⭐","🎮","🍒","💎","🪐","🎯","🦊"];
    const deck = [...icons,...icons].sort(() => Math.random()-.5);
    setGame("Memory Match", "Find all eight matching pairs. Faster matching earns a better local score.", `<div style="width:100%"><p class="muted" id="memoryStatus">Matches: 0 / 8</p><div class="memory-board" id="memoryBoard">${deck.map((_,i)=>`<button class="memory-tile" data-index="${i}" aria-label="Hidden card ${i+1}">?</button>`).join("")}</div><div class="game-result" id="memoryResult"></div><button class="btn btn-outline game-action" id="memoryAgain">New round</button></div>`);
    let first = null, lock = false, matches = 0, turns = 0, done = false, timeout;
    const board = $("#memoryBoard");
    function setup() {
      if (timeout) clearTimeout(timeout);
      const fresh = [...icons,...icons].sort(() => Math.random()-.5);
      first = null; lock = false; matches = 0; turns = 0; done = false;
      $("#memoryStatus").textContent = "Matches: 0 / 8"; $("#memoryResult").textContent = "";
      board.innerHTML = fresh.map((_,i)=>`<button class="memory-tile" data-index="${i}" aria-label="Hidden card ${i+1}">?</button>`).join("");
      board.querySelectorAll("button").forEach((btn,i) => btn.addEventListener("click", () => {
        if (lock || done || btn.classList.contains("matched") || btn.classList.contains("flipped")) return;
        btn.textContent = fresh[i]; btn.classList.add("flipped");
        if (first === null) { first = {btn,icon:fresh[i]}; return; }
        turns++;
        if (first.icon === fresh[i]) {
          btn.classList.add("matched"); first.btn.classList.add("matched"); first = null; matches++;
          $("#memoryStatus").textContent = `Matches: ${matches} / 8 · Turns: ${turns}`;
          if (matches === 8) { done = true; const points = Math.max(10, 100 - turns*3); addCoins(points); record("Memory Match", points); $("#memoryResult").textContent = `Completed! +${points} virtual coins.`; }
        } else {
          lock = true; const previous = first.btn; first = null;
          timeout = setTimeout(() => { btn.textContent="?"; previous.textContent="?"; btn.classList.remove("flipped"); previous.classList.remove("flipped"); lock=false; }, 650);
        }
      }));
    }
    $("#memoryAgain").addEventListener("click", setup); setup();
    activeCleanup = () => { if (timeout) clearTimeout(timeout); };
  }

  function playRush() {
    setGame("Star Rush", "Tap the star as many times as possible in 10 seconds. This is a simple reflex demo.", `<div><div class="muted">Time left: <b id="rushTime">10</b>s · Hits: <b id="rushHits">0</b></div><button class="rush-target" id="rushTarget" aria-label="Tap star">✦</button><div class="game-result" id="rushResult">Press Start, then tap the star!</div><button class="btn btn-primary game-action" id="rushStart">Start challenge</button></div>`);
    let timer = null, remaining = 10, hits = 0, started = false;
    $("#rushTarget").disabled = true;
    $("#rushStart").addEventListener("click", () => {
      if (started) return;
      started = true; $("#rushTarget").disabled = false; $("#rushStart").disabled = true;
      timer = setInterval(() => {
        remaining--; $("#rushTime").textContent = remaining;
        if (remaining <= 0) {
          clearInterval(timer); $("#rushTarget").disabled = true;
          const points = hits * 5; addCoins(points); record("Star Rush", points);
          $("#rushResult").textContent = `Time! ${hits} hits · +${points} virtual coins.`;
        }
      },1000);
    });
    $("#rushTarget").addEventListener("click", () => {
      if (!started || remaining <= 0) return;
      hits++; $("#rushHits").textContent = hits;
      $("#rushTarget").style.transform = `translate(${Math.floor(Math.random()*45)-22}px,${Math.floor(Math.random()*18)-9}px) scale(${.9+Math.random()*.25})`;
    });
    activeCleanup = () => { if (timer) clearInterval(timer); };
  }

  function playGuess() {
    setGame("Number Guess", "Guess the secret number between 1 and 20 in as few attempts as possible.", `<div><p class="muted">Secret number: 1–20</p><form class="guess-form" id="guessForm"><input type="number" id="guessInput" min="1" max="20" required placeholder="1 to 20" aria-label="Your guess"><button class="btn btn-primary">Guess</button></form><div class="game-result" id="guessResult">You have 5 attempts.</div><button class="btn btn-outline game-action" id="guessAgain">New number</button></div>`);
    let secret = Math.floor(Math.random()*20)+1, attempts = 5, done = false;
    $("#guessForm").addEventListener("submit", e => {
      e.preventDefault(); if (done) return;
      const input = $("#guessInput"), n = Number(input.value);
      if (!Number.isInteger(n) || n < 1 || n > 20) { $("#guessResult").textContent = "Enter a whole number from 1 to 20."; return; }
      attempts--;
      if (n === secret) {
        done = true; const points = 20 + attempts*10; addCoins(points); record("Number Guess", points);
        $("#guessResult").textContent = `Correct! +${points} virtual coins.`; $("#guessForm").querySelector("button").disabled = true;
      } else if (attempts <= 0) {
        done = true; $("#guessResult").textContent = `Round over. The number was ${secret}. Start a new round!`; $("#guessForm").querySelector("button").disabled = true;
      } else $("#guessResult").textContent = `${n < secret ? "Go higher!" : "Go lower!"} ${attempts} attempts left.`;
      input.value = "";
    });
    $("#guessAgain").addEventListener("click", () => { secret = Math.floor(Math.random()*20)+1; attempts=5; done=false; $("#guessResult").textContent="New number chosen. You have 5 attempts."; $("#guessForm").querySelector("button").disabled=false; });
  }

  const games = { spin: playSpin, memory: playMemory, rush: playRush, guess: playGuess };
  $$(".play-btn").forEach(btn => btn.addEventListener("click", () => games[btn.dataset.game]?.()));
  $("#closeModal").addEventListener("click", closeGame);
  $("#gameModal").addEventListener("click", e => { if (e.target === $("#gameModal")) closeGame(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#gameModal").hidden) closeGame(); });
  $("#claimBtn").addEventListener("click", () => {
    const today = new Date().toLocaleDateString("en-CA");
    if (state.lastDaily === today) return;
    state.lastDaily = today; state.coins += 100; saveState(); toast("+100 virtual coins added!");
  });
  $("#resetBtn").addEventListener("click", () => {
    if (!confirm("Reset your local DivineX Play demo coins and scores?")) return;
    state = { ...initialState, scores: { ...initialState.scores } }; saveState(); toast("Demo data reset.");
  });
  $("#premiumBtn").addEventListener("click", () => { $("#premiumMessage").textContent = "Thanks! This preview does not collect your email."; toast("Premium preview saved for this visit."); });
  $("#filters").addEventListener("click", e => {
    const btn = e.target.closest("[data-filter]"); if (!btn) return;
    $$(".filter").forEach(f => f.classList.toggle("active", f === btn));
    $$(".game-card").forEach(card => { card.hidden = btn.dataset.filter !== "all" && card.dataset.category !== btn.dataset.filter; });
  });
  $("#menuBtn").addEventListener("click", () => $(".nav").classList.toggle("open"));
  $$(".nav a").forEach(a => a.addEventListener("click", () => $(".nav").classList.remove("open")));
  $("#year").textContent = new Date().getFullYear();
  render();
})();