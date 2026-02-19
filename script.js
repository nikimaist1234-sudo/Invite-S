const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");

const neonContainer = document.getElementById("neonContainer");
const neonProgress = document.getElementById("neonProgress");

const correctSequence = ["S","T","A","R","B","O","Y"];
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

  // scramble letters so it’s a real puzzle
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

    // tiny “success thump”
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
