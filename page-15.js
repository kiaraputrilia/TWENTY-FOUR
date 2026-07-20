// =======================================================
// PAGE 15
// PART 1 - BUILD LETTERS
// =======================================================

const poem = document.getElementById("poemContainer");
const stormLayer = document.getElementById("stormLayer");

const letters = [];

// -------------------------------------------------------
// Create spans for every character
// -------------------------------------------------------

function buildPoem() {

    const lines = [...poem.querySelectorAll(".line")];

    lines.forEach(line => {

        const text = line.textContent;

        line.textContent = "";

        [...text].forEach(char => {

            const span = document.createElement("span");

            span.className = "measure";

            span.textContent =
                char === " "
                    ? "\u00A0"
                    : char;

            line.appendChild(span);

        });

    });

}

// -------------------------------------------------------
// Measure every letter
// -------------------------------------------------------

function measureLetters() {

    const measuredLetters =
        poem.querySelectorAll(".measure");

    measuredLetters.forEach(span => {

        const rect =
            span.getBoundingClientRect();

        letters.push({

            char: span.textContent,

            targetX:
                rect.left + rect.width / 2,

            targetY:
                rect.top + rect.height / 2,

            x:
                Math.random() * window.innerWidth,

            y:
                Math.random() * window.innerHeight,

            vx: 0,
            vy: 0,

            arrived: false,

            element: null

        });

    });

}

// -------------------------------------------------------
// Create flying copies
// -------------------------------------------------------

function createStormLetters() {

    letters.forEach(letter => {

        const el =
            document.createElement("span");

        el.className = "letter";

        el.textContent = letter.char;

        el.style.transform =
            `translate(${letter.x}px, ${letter.y}px)`;

        stormLayer.appendChild(el);

        letter.element = el;

    });

}

// -------------------------------------------------------
// Hide original poem
// -------------------------------------------------------

function hideOriginalPoem() {

    poem.style.visibility = "hidden";

}

// -------------------------------------------------------
// Build everything
// -------------------------------------------------------

buildPoem();

requestAnimationFrame(() => {

    measureLetters();

    createStormLetters();

    hideOriginalPoem();

    console.log(
        "Letters created:",
        letters.length
    );

});

