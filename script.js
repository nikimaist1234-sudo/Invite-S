const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");

const neonContainer = document.getElementById("neonContainer");
const neonProgress = document.getElementById("neonProgress");

const correctSequence = ["M","O","N","S","T","E","R"];
let currentIndex = 0;
let gameFinished = false;

/* ---------------- PAGE NAV ---------------- */
function showOnlyPage(pageNumber){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById("page" + pageNumber);
  if(el) el.classList.add("active");
}

startBtn?.addEventListener("click", () => {
  showOnlyPage(1);
  music.play().catch(()=>{});

  // build game only when page opens
  initNeonPuzzle();
});

/* ---------------- NEON PUZZLE INIT ---------------- */
function initNeonPuzzle(){
  if(!neonContainer) return;

  gameFinished = false;
  currentIndex = 0;

  // clear existing bars (if any)
  neonContainer.innerHTML = "";

  // scramble letters so it's a real puzzle
  const letters = [...correctSequence].sort(() => Math.random() - 0.5);

  letters.forEach(letter => {
    const bar = document.createElement("button");
    bar.className = "neon-bar";
    bar.type = "button";
    bar.dataset.letter = letter;
    bar.textContent = letter;

    flickerRandomly(bar);

    bar.addEventListener("click", () => handleTap(bar));
    neonContainer.appendChild(bar);
  });

  updateProgress();
}

function updateProgress(){
  if(!neonProgress) return;

  const filled = correctSequence.map((l, i) => (i < currentIndex ? l : "_"));
  neonProgress.textContent = filled.join(" ");
}

/* ---------------- TAP HANDLER ---------------- */
function handleTap(bar){
  if(gameFinished) return;

  const letter = bar.dataset.letter;

  if(letter === correctSequence[currentIndex]){
    bar.classList.add("correct");
    currentIndex++;
    updateProgress();

    // tiny "success thump"
    neonContainer.classList.add("good");
    setTimeout(()=>neonContainer.classList.remove("good"), 120);

    if(currentIndex === correctSequence.length){
      triggerWin();
    }
  } else {
    wrongPulse();
    resetPuzzle();
  }
}

/* Random flicker */
function flickerRandomly(bar){
  setInterval(() => {
    if(gameFinished) return;
    bar.classList.add("flicker");
    setTimeout(() => bar.classList.remove("flicker"), 120);
  }, 900 + Math.random()*1400);
}

/* Wrong feedback */
function wrongPulse(){
  neonContainer.classList.add("shake", "wrong");
  setTimeout(()=> neonContainer.classList.remove("shake", "wrong"), 320);
}

/* Reset on wrong */
function resetPuzzle(){
  currentIndex = 0;
  updateProgress();

  neonContainer.querySelectorAll(".neon-bar").forEach(b => {
    b.classList.remove("correct");
  });
}

/* ---------------- WIN ---------------- */
function triggerWin(){
  gameFinished = true;

  const bars = neonContainer.querySelectorAll(".neon-bar");

  // Lock in + turn everything GOLD
  bars.forEach(b => {
    b.classList.add("final-gold");
    b.disabled = true;
  });

  // Start spark rain immediately
  startSparkRain(2000); // rain for 2 seconds

  // Transition into the invite after rain
  setTimeout(() => finishGame(), 2100);
}

function startSparkRain(durationMs){
  const interval = setInterval(() => spawnRainSpark(10), 110);
  setTimeout(() => clearInterval(interval), durationMs);
}

function spawnRainSpark(count){
  for(let i=0;i<count;i++){
    const spark = document.createElement("div");
    spark.className = "spark";

    spark.style.left = `${Math.random() * 100}vw`;
    spark.style.top = `-20px`;

    const size = 4 + Math.random() * 7;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;

    // Gold + Blue + Red mix
    const r = Math.random();
    spark.dataset.c = (r < 0.34) ? "gold" : (r < 0.67) ? "blue" : "red";

    spark.style.animation = `rainFall 1.6s linear forwards`;

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1700);
  }
}

/* ---------------- FINISH ---------------- */
function finishGame(){
  document.body.classList.remove("locked");
  document.body.classList.add("scroll-mode");
  document.body.classList.remove("gold-wash");

  document.getElementById("page2")
    .scrollIntoView({behavior:"smooth"});
}

/* ===========================
   QUIZ (STARBOY)
   =========================== */

const openQuizBtn = document.getElementById("openQuizBtn");
const quizBackBtn = document.getElementById("quizBackBtn");
const quizCloseBtn = document.getElementById("quizCloseBtn");
const quizFinishBtn = document.getElementById("quizFinishBtn");
const quizRetryBtn = document.getElementById("quizRetryBtn");

const quizScreen = document.getElementById("pageQuiz");
const quizForm = document.getElementById("quizForm");
const quizResult = document.getElementById("quizResult");
const quizResultInner = document.getElementById("quizResultInner");
const quizOverlay = document.getElementById("quizOverlay");
const resultCover = document.getElementById("resultCover");
const resultBlurb = document.getElementById("resultBlurb");
const guestNameInput = document.getElementById("guestName");

const resultAudio = document.getElementById("resultAudio");

const SONG_KEYS = [
  "a-lonely-night",
  "die-for-you",
  "i-feel-it-coming",
  "party-monster",
  "reminder"
];

const SONG_PRETTY = {
  "a-lonely-night": "A Lonely Night",
  "die-for-you": "Die For You",
  "i-feel-it-coming": "I Feel It Coming",
  "party-monster": "Party Monster",
  "reminder": "Reminder"
};

const SONG_BLURB = {
  "a-lonely-night": "You're the smooth operator. Confident, cool, and always in control.",
  "die-for-you": "You're the romantic soul. Deep feelings, loyal heart, and emotional depth.",
  "i-feel-it-coming": "You're the optimist. Fun, fresh, and always bringing good vibes.",
  "party-monster": "You're the life of the party. Wild, unpredictable, and unforgettable.",
  "reminder": "You're the hustler. Focused, ambitious, and always on your grind."
};

let _inviteWasPlaying = false;
let _inviteTime = 0;
let _scrollYBeforeQuiz = 0;

function stopResultAudio() {
  if (!resultAudio) return;
  resultAudio.pause();
  resultAudio.currentTime = 0;
  resultAudio.removeAttribute("src");
}

function enterQuizAudioMode() {
  stopResultAudio();

  if (!music) return;
  _inviteWasPlaying = !music.paused;
  _inviteTime = music.currentTime || 0;
  music.pause();
}

function exitQuizAudioMode() {
  stopResultAudio();

  if (!music) return;
  if (_inviteWasPlaying) {
    try { music.currentTime = _inviteTime || 0; } catch (e) {}
    music.play().catch(() => {});
  }
}

function resetQuizUI() {
  quizForm?.reset();

  if (quizResult) quizResult.style.display = "none";
  if (quizResultInner) {
    quizResultInner.classList.remove("show");
    quizResultInner.innerHTML = "";
  }
  if (resultCover) {
    resultCover.classList.remove("show");
    resultCover.removeAttribute("src");
  }
  if (resultBlurb) resultBlurb.textContent = "";
  quizOverlay?.classList.remove("on");
}

function openQuiz() {
  _scrollYBeforeQuiz = window.scrollY || 0;
  enterQuizAudioMode();
  resetQuizUI();

  document.body.classList.add("quiz-open");
  quizScreen?.setAttribute("aria-hidden", "false");

  // snap to top (so the quiz always starts clean)
  setTimeout(() => {
    if (quizScreen) quizScreen.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, 0);
}

function closeQuiz() {
  document.body.classList.remove("quiz-open");
  quizScreen?.setAttribute("aria-hidden", "true");
  stopResultAudio();

  // go back to where they were on the invite
  setTimeout(() => {
    window.scrollTo({ top: _scrollYBeforeQuiz, behavior: "auto" });
  }, 0);

  exitQuizAudioMode();
}

function computeQuizResult() {
  if (!quizForm) return { error: "Quiz not found." };

  const guestName = (guestNameInput?.value || "").trim();
  if (!guestName) return { error: "Enter your name first." };

  const data = new FormData(quizForm);

  for (let i = 1; i <= 6; i++) {
    if (!data.get("q" + i)) return { error: "Answer all 6 questions first." };
  }

  const scores = Object.fromEntries(SONG_KEYS.map(k => [k, 0]));

  for (const [key, value] of data.entries()) {
    if (key === "guestName") continue;
    if (scores[value] !== undefined) scores[value] += 1;
  }

  const max = Math.max(...Object.values(scores));
  const top = Object.keys(scores).filter(k => scores[k] === max);
  const chosen = top[Math.floor(Math.random() * top.length)];

  return { chosen, guestName };
}

function playResultSong(songKey) {
  // Ensure invite music stays stopped while result plays
  music?.pause();

  if (resultCover) {
    resultCover.src = `${songKey}.jpg`;
    resultCover.classList.add("show");
  }

  if (resultAudio) {
    resultAudio.pause();
    resultAudio.currentTime = 0;
    resultAudio.src = `${songKey}.mp3`;
    resultAudio.load();
    resultAudio.play().catch(() => {});
  }
}

function revealQuizResult(songKey, guestName) {
  if (!quizResult || !quizResultInner) return;

  quizResult.style.display = "block";

  quizResultInner.classList.remove("show");
  quizResultInner.innerHTML = `
    <h2>${guestName}, you are <span>${SONG_PRETTY[songKey] || "a Mystery Track"}</span></h2>
  `;

  if (resultBlurb) resultBlurb.textContent = SONG_BLURB[songKey] || "";

  if (quizOverlay) {
    quizOverlay.classList.add("on");
    setTimeout(() => quizOverlay.classList.remove("on"), 900);
  }

  requestAnimationFrame(() => quizResultInner.classList.add("show"));

  playResultSong(songKey);

  // Auto-scroll so the FULL reveal is visible
  const scrollToFullResult = () => {
    quizResult.scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      window.scrollBy({ top: 140, left: 0, behavior: "smooth" });
    }, 350);

    setTimeout(() => {
      window.scrollBy({ top: 80, left: 0, behavior: "smooth" });
    }, 900);
  };

  setTimeout(scrollToFullResult, 180);

  if (resultCover) {
    resultCover.onload = () => setTimeout(scrollToFullResult, 80);
  }
}

openQuizBtn?.addEventListener("click", openQuiz);
quizBackBtn?.addEventListener("click", closeQuiz);
quizCloseBtn?.addEventListener("click", closeQuiz);

quizRetryBtn?.addEventListener("click", () => {
  resetQuizUI();
  stopResultAudio();
  if (quizScreen) quizScreen.scrollTop = 0;
});

quizFinishBtn?.addEventListener("click", () => {
  const res = computeQuizResult();

  if (res.error) {
    if (!quizResult || !quizResultInner) return;
    quizResult.style.display = "block";
    quizResultInner.classList.remove("show");
    quizResultInner.innerHTML = `<h2>Hold up</h2><p>${res.error}</p>`;
    if (resultBlurb) resultBlurb.textContent = "";
    requestAnimationFrame(() => quizResultInner.classList.add("show"));
    setTimeout(() => quizResult.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return;
  }

  revealQuizResult(res.chosen, res.guestName);
});
