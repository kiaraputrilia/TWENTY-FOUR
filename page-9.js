// ======================================
// PAGE 9 — "TO KNOW OF LIFE"
// Randomized dropdown word choices;
// link unlocks once every choice matches
// the original lyric
// ======================================

const wordChoices = document.querySelectorAll(".wordChoice");
const nextPageLink = document.getElementById("nextPageLink");


// ======================================
// RANDOMIZE STARTING SELECTION
// ======================================

function randomizeInitialChoices() {

    wordChoices.forEach(select => {

        const optionCount = select.options.length;
        const randomIndex = Math.floor(Math.random() * optionCount);

        select.selectedIndex = randomIndex;

    });

}


// ======================================
// CHECK IF EVERY CHOICE IS CORRECT
// ======================================

function checkAnswers() {

    const allCorrect = Array.from(wordChoices).every(select => {
        return select.value === select.dataset.correct;
    });

    console.log("all correct:", allCorrect);

    if (allCorrect) {
        nextPageLink.classList.add("show");
    } else {
        nextPageLink.classList.remove("show");
    }

}


// ======================================
// INIT
// ======================================

randomizeInitialChoices();
checkAnswers();

wordChoices.forEach(select => {
    select.addEventListener("change", checkAnswers);
});