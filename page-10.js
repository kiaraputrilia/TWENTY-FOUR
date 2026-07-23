// ======================================
// EMOJIS
// ======================================

const emojiSet = ["🥐","🥖","🥯","🥞","🍔","🧀","🍝","🍜","🍚","🍣","☕"];

const emojis = [];

for (let i = 0; i < 20; i++) {
    emojis.push(...emojiSet);
}

const container = document.getElementById("emojiContainer");
const emojiObjects = [];
let coffeePlaced = false;

function randomPosition(size = 60) {
    return {
        x: Math.random() * (window.innerWidth - size),
        y: Math.random() * (window.innerHeight - size)
    };
}

emojis.forEach(emoji => {

    const div = document.createElement("div");
    div.className = "emoji";
    div.textContent = emoji;

    // absolute positioning is fixed at 0,0 — movement happens via transform
    div.style.left = "0px";
    div.style.top = "0px";
    div.style.willChange = "transform";

    let pos = randomPosition();
    let stationary = false;

    if (emoji === "☕" && !coffeePlaced) {

        stationary = true;
        coffeePlaced = true;
        pos = randomPosition(100);

        div.classList.add("target");
        // guarantee it's always on top and tappable
        div.style.zIndex = "9999";
        div.style.pointerEvents = "auto";
        div.style.touchAction = "manipulation";

        div.addEventListener("click", () => {
            window.location.href = "page-11.html";
        });

        div.addEventListener("touchstart", e => {
            e.preventDefault();
            window.location.href = "page-11.html";
        }, { passive: false });

    }

    div.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    container.appendChild(div);

    emojiObjects.push({
        element: div,
        x: pos.x,
        y: pos.y,
        dx: stationary ? 0 : (Math.random() * 1.8 + 0.5) * (Math.random() < 0.5 ? -1 : 1),
        dy: stationary ? 0 : (Math.random() * 1.8 + 0.5) * (Math.random() < 0.5 ? -1 : 1),
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

        if (obj.x <= 0 || obj.x >= window.innerWidth - size) obj.dx *= -1;
        if (obj.y <= 0 || obj.y >= window.innerHeight - size) obj.dy *= -1;

        obj.element.style.transform = `translate(${obj.x}px, ${obj.y}px)`;

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
        obj.element.style.transform = `translate(${obj.x}px, ${obj.y}px)`;

    });

});