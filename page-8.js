// ======================================
// PAGE 8
// ======================================

const canvas = document.getElementById("poemCanvas");
const ctx = canvas.getContext("2d");

const poemGroups = document.querySelectorAll(".poem-group");

let letters = [];

const REVEAL_RADIUS = 50;

let pointer = {
    x: -9999,
    y: -9999,
    active: false
};


function getFontSize() {
    return window.innerWidth < 600 ? 34 : 36;
}


// ======================================
// CANVAS SIZE — covers the full scrollable page
// ======================================

function resizeCanvas() {
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight;
}


// ======================================
// BUILD LETTER DATA
// ======================================

function buildLetters() {

    letters = [];

    const fontSize = getFontSize();

    ctx.font = `${fontSize}px TimesDotRom`;
    ctx.textBaseline = "top";

    const lineHeight = fontSize * 0.9;

    const canvasRect = canvas.getBoundingClientRect();

    poemGroups.forEach(group => {

        const poemEl = group.querySelector(".poem");
        const poemRect = poemEl.getBoundingClientRect();

        // anchor each stanza to wherever its (invisible) poem
        // block actually lands in the page layout
        const groupStartX = poemRect.left - canvasRect.left;
        const groupStartY = poemRect.top - canvasRect.top;
        const maxWidth = poemRect.width;

        let y = groupStartY;

        const lineEls = poemEl.querySelectorAll(".line");

        lineEls.forEach(lineEl => {

            let x = groupStartX;

            const text = lineEl.textContent.trim();

            let lettersOnly = [];
            for (let char of text) {
                if (/[A-Za-z]/.test(char)) lettersOnly.push(char);
            }

            let shuffled = [...lettersOnly];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            let index = 0;

            const tokens = text.split(/(\s+)/);

            tokens.forEach(token => {

                if (token === "") return;

                const isSpace = /^\s+$/.test(token);

                if (isSpace) {

                    if (x === groupStartX) return;

                    for (let char of token) {
                        const width = ctx.measureText(char).width;
                        letters.push({
                            correct: char,
                            scrambled: char,
                            x, y, width,
                            centerX: x + width / 2,
                            centerY: y + fontSize / 2
                        });
                        x += width;
                    }

                } else {

                    let charWidths = [];
                    let wordWidth = 0;

                    for (let char of token) {
                        const w = ctx.measureText(char).width;
                        charWidths.push(w);
                        wordWidth += w;
                    }

                    if (x + wordWidth > groupStartX + maxWidth && x > groupStartX) {
                        x = groupStartX;
                        y += lineHeight;
                    }

                    for (let i = 0; i < token.length; i++) {

                        const char = token[i];
                        const width = charWidths[i];

                        let scrambled = char;

                        if (/[A-Za-z]/.test(char)) {
                            scrambled = shuffled[index];
                            index++;
                        }

                        letters.push({
                            correct: char,
                            scrambled,
                            x, y, width,
                            centerX: x + width / 2,
                            centerY: y + fontSize / 2
                        });

                        x += width;
                    }

                }

            });

            y += lineHeight;

        });

    });

}


// ======================================
// DRAW
// ======================================

function drawLetters() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.font = `${getFontSize()}px TimesDotRom`;
    ctx.textBaseline = "top";

    letters.forEach(letter => {

        let charToShow = letter.scrambled;

        if (pointer.active) {
            const dx = letter.centerX - pointer.x;
            const dy = letter.centerY - pointer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < REVEAL_RADIUS) charToShow = letter.correct;
        }

        ctx.fillText(charToShow, letter.x, letter.y);

    });

}


// ======================================
// POINTER INTERACTION
// ======================================

function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener("pointermove", (e) => {
    const pos = getPointerPos(e);
    pointer.x = pos.x;
    pointer.y = pos.y;
    pointer.active = true;
    drawLetters();
});

canvas.addEventListener("pointerdown", (e) => {
    const pos = getPointerPos(e);
    pointer.x = pos.x;
    pointer.y = pos.y;
    pointer.active = true;
    drawLetters();
});

canvas.addEventListener("pointerup", () => {
    pointer.active = false;
    drawLetters();
});

canvas.addEventListener("pointercancel", () => {
    pointer.active = false;
    drawLetters();
});

canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
    drawLetters();
});


// ======================================
// START
// ======================================

function init() {
    resizeCanvas();
    buildLetters();
    drawLetters();
}

window.addEventListener("load", init);
window.addEventListener("resize", init);