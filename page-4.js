// ======================================
// PAGE 4 — FLOATING BUBBLES, POP TO COUNT
// After 24 pops, background randomizes color on every click
// ======================================

const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
const counterEl = document.getElementById("counter");

let width, height;

let bubbles = [];
const BUBBLE_COUNT = 10;

let poppedCount = 0;
const COLOR_SHIFT_THRESHOLD = 24;

const POP_DURATION = 220;

const COLOR_PALETTE = [
    "#ffb3f0", "#ffa6d9", "#b08699", "#d1b0b3", "#ff4dc9",
    "#ff5ec4", "#ff616b", "#fa2b00", "#b85e00", "#c74300",
    "#e81900", "#f20000", "#3d0079", "#5c2c45", "#faed8f",
    "#ffb852", "#bcd382", "#c2975a", "#ffab00", "#718600",
    "#759243", "#505423", "#b5ffc2", "#65a98f", "#96bfe6",
    "#0d75ff", "#0024cc"
];

// current bubble outline color — starts black, may switch to
// white once the background starts randomizing
let bubbleColor = { r: 0, g: 0, b: 0 };


// ======================================
// COLOR HELPERS
// ======================================

function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return {
        r: parseInt(clean.substring(0, 2), 16),
        g: parseInt(clean.substring(2, 4), 16),
        b: parseInt(clean.substring(4, 6), 16)
    };
}

function relativeLuminance({ r, g, b }) {
    // standard perceived-brightness formula
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function pickRandomColor() {
    const hex = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    return hex;
}

function applyBackgroundColor(hex) {

    document.body.style.background = hex;

    const rgb = hexToRgb(hex);
    const luminance = relativeLuminance(rgb);

    // light background → dark bubbles, dark background → light bubbles
    bubbleColor = luminance > 0.55
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };

}


// ======================================
// SETUP
// ======================================

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
}

function createBubble(startBelowScreen) {

    const isBig = Math.random() < 0.2;
    const radius = isBig
        ? 90 + Math.random() * 40
        : 20 + Math.random() * 40;

    return {
        x: Math.random() * width,

        y: startBelowScreen
            ? height + radius + Math.random() * height
            : height + radius,

        radius: radius,
        baseRadius: radius,

        speedY: -(1.2 + Math.random() * 1.8),

        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.0012 + Math.random() * 0.0014,
        wobbleAmount: 0.8 + Math.random() * 1.2,

        opacity: 0.5 + Math.random() * 0.3,

        popping: false,
        popStart: 0
    };

}

function initBubbles() {

    bubbles = [];

    for (let i = 0; i < BUBBLE_COUNT; i++) {
        const bubble = createBubble(true);
        bubble.y = Math.random() * height;
        bubbles.push(bubble);
    }

}

resizeCanvas();
initBubbles();

window.addEventListener("resize", () => {
    resizeCanvas();
});


// ======================================
// UPDATE + DRAW
// ======================================

function drawBubble(bubble, time) {

    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, Math.max(bubble.radius, 0), 0, Math.PI * 2);

    ctx.strokeStyle = `rgba(${bubbleColor.r}, ${bubbleColor.g}, ${bubbleColor.b}, ${bubble.opacity})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = `rgba(${bubbleColor.r}, ${bubbleColor.g}, ${bubbleColor.b}, ${bubble.opacity * 0.08})`;
    ctx.fill();

}

function update(time) {

    ctx.clearRect(0, 0, width, height);

    for (let i = bubbles.length - 1; i >= 0; i--) {

        const bubble = bubbles[i];

        if (bubble.popping) {

            const elapsed = time - bubble.popStart;
            const progress = Math.min(elapsed / POP_DURATION, 1);

            const scale = progress < 0.4
                ? 1 + progress * 1.5
                : 1.6 * (1 - (progress - 0.4) / 0.6);

            bubble.radius = bubble.baseRadius * scale;
            bubble.opacity = (1 - progress) * 0.8;

            drawBubble(bubble, time);

            if (progress >= 1) {
                bubbles[i] = createBubble(false);
            }

            continue;

        }

        bubble.y += bubble.speedY;

        bubble.x += Math.sin(time * bubble.wobbleSpeed + bubble.wobblePhase) * bubble.wobbleAmount;

        if (bubble.y < -bubble.radius) {
            bubbles[i] = createBubble(false);
            continue;
        }

        if (bubble.x < -bubble.radius) bubble.x = width + bubble.radius;
        if (bubble.x > width + bubble.radius) bubble.x = -bubble.radius;

        drawBubble(bubble, time);

    }

    requestAnimationFrame(update);

}

requestAnimationFrame(update);


// ======================================
// CLICK / TAP TO POP
// ======================================

function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener("pointerdown", (e) => {

    const pos = getPointerPos(e);

    let poppedThisClick = false;

    for (const bubble of bubbles) {

        if (bubble.popping) continue;

        const dx = pos.x - bubble.x;
        const dy = pos.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= bubble.radius) {

            bubble.popping = true;
            bubble.popStart = performance.now();

            poppedCount++;
            counterEl.textContent = poppedCount;

            poppedThisClick = true;

            break;

        }

    }

    // once the threshold is passed, every click on the canvas —
    // whether or not it actually popped a bubble — shifts the
    // background to a new random color from the palette
    if (poppedCount >= COLOR_SHIFT_THRESHOLD) {
        applyBackgroundColor(pickRandomColor());
    }

});