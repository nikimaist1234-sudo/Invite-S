const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");

const neonBars = document.querySelectorAll(".neon-bar");
const neonContainer = document.getElementById("neonContainer");

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
});

/* ---------------- NEON PUZZLE ---------------- */
neonBars.forEach(bar => {
    flickerRandomly(bar);

    bar.addEventListener("click", () => {
        if(gameFinished) return;

        const letter = bar.dataset.letter;

        if(letter === correctSequence[currentIndex]){
            bar.classList.add("correct");
            currentIndex++;

            if(currentIndex === correctSequence.length){
                triggerWin();
            }
        } else {
            resetPuzzle();
        }
    });
});

/* Random flicker */
function flickerRandomly(bar){
    setInterval(() => {
        bar.classList.add("flicker");
        setTimeout(() => bar.classList.remove("flicker"), 120);
    }, 1200 + Math.random()*1500);
}

/* Reset if wrong */
function resetPuzzle(){
    currentIndex = 0;
    neonBars.forEach(b => b.classList.remove("correct"));
    neonContainer.classList.add("shake");
    setTimeout(()=> neonContainer.classList.remove("shake"), 300);
}

/* WIN */
function triggerWin(){
    gameFinished = true;

    neonBars.forEach(b => {
        b.classList.add("final-glow");
    });

    setTimeout(() => {
        neonContainer.classList.add("zoom-fill");
    }, 600);

    setTimeout(() => {
        finishGame();
    }, 2200);
}

/* ---------------- FINISH ---------------- */
function finishGame(){
    document.body.classList.remove("locked");
    document.body.classList.add("scroll-mode");

    document.getElementById("page2")
        .scrollIntoView({behavior:"smooth"});
}

