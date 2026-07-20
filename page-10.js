// ======================================
// EMOJIS
// ======================================

const emojiSet = [
    "🥐",
    "🥖",
    "🥯",
    "🥞",
    "🍔",
    "🧀",
    "🍝",
    "🍜",
    "🍚",
    "🍣",
    "☕"
];

const emojis = [];

// ======================================
// SIX COPIES OF EACH EMOJI
// ======================================

for (let i = 0; i < 20; i++) {

    emojis.push(...emojiSet);

}

const container = document.getElementById("emojiContainer");

const emojiObjects = [];

let coffeePlaced = false;


// ======================================
// RANDOM POSITION
// ======================================

function randomPosition(size = 60) {

    return {

        x: Math.random() * (window.innerWidth - size),

        y: Math.random() * (window.innerHeight - size)

    };

}



// ======================================
// CREATE EMOJIS
// ======================================

emojis.forEach(emoji => {

    const div = document.createElement("div");

    div.className = "emoji";
    // const size = 22 + Math.random() * 24;

    // div.style.fontSize = size + "px";

    div.textContent = emoji;

    let pos = randomPosition();

    let stationary = false;


    // ----------------------------------
    // ONLY THE FIRST COFFEE IS STILL
    // ----------------------------------

    if (emoji === "☕" && !coffeePlaced) {

        stationary = true;

        coffeePlaced = true;

        // Completely random location every refresh
        pos = randomPosition(100);

        div.classList.add("target");

        div.addEventListener("click", () => {

            window.location.href = "page-11.html";

        });

        div.addEventListener("touchstart", e => {

            e.preventDefault();

            window.location.href = "page-11.html";

        });

    }

    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";

    container.appendChild(div);

    emojiObjects.push({

        element: div,

        x: pos.x,

        y: pos.y,

        dx: stationary
            ? 0
            : (Math.random() * 1.8 + 0.5) *
              (Math.random() < 0.5 ? -1 : 1),

        dy: stationary
            ? 0
            : (Math.random() * 1.8 + 0.5) *
              (Math.random() < 0.5 ? -1 : 1),

        stationary

    });

});



// ======================================
// ANIMATION
// ======================================

function animate() {

    emojiObjects.forEach(obj => {

        if (obj.stationary) return;

        obj.x += obj.dx;
        obj.y += obj.dy;

        const size = 48;

        if (obj.x <= 0 || obj.x >= window.innerWidth - size) {

            obj.dx *= -1;

        }

        if (obj.y <= 0 || obj.y >= window.innerHeight - size) {

            obj.dy *= -1;

        }

        obj.element.style.left = obj.x + "px";
        obj.element.style.top = obj.y + "px";

    });

    requestAnimationFrame(animate);

}

animate();



// ======================================
// KEEP EMOJIS INSIDE AFTER RESIZE
// ======================================

window.addEventListener("resize", () => {

    emojiObjects.forEach(obj => {

        obj.x = Math.min(obj.x, window.innerWidth - 60);

        obj.y = Math.min(obj.y, window.innerHeight - 60);

        obj.element.style.left = obj.x + "px";

        obj.element.style.top = obj.y + "px";

    });

});