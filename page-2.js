// =======================================
// SETTINGS
// =======================================

const REVEAL_RADIUS_DESKTOP = 100;
const REVEAL_RADIUS_MOBILE = 70;


// =======================================
// CANVAS
// =======================================

const canvas = document.getElementById("revealCanvas");
const context = canvas.getContext("2d");

let width;
let height;
let pixelRatio;


// =======================================
// SET UP WHITE COVER
// =======================================

function setupCanvas() {

  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = window.devicePixelRatio || 1;

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  context.setTransform(
    pixelRatio,
    0,
    0,
    pixelRatio,
    0,
    0
  );

  // Completely cover the video with white
  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
}

setupCanvas();


// =======================================
// REVEAL SIZE
// =======================================

function getRevealRadius() {

  return width < 600
    ? REVEAL_RADIUS_MOBILE
    : REVEAL_RADIUS_DESKTOP;
}


// =======================================
// REVEAL VIDEO
// =======================================

function reveal(x, y) {

  const radius = getRevealRadius();

  // Erase the white canvas to reveal
  // the video underneath

  context.save();

  context.globalCompositeOperation =
    "destination-out";

  context.beginPath();

  context.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  context.fill();

  context.restore();
}


// =======================================
// DESKTOP
// =======================================

canvas.addEventListener(
  "mousemove",
  event => {

    reveal(
      event.clientX,
      event.clientY
    );

  }
);


// =======================================
// MOBILE
// =======================================

canvas.addEventListener(
  "touchstart",
  event => {

    event.preventDefault();

    const touch =
      event.touches[0];

    reveal(
      touch.clientX,
      touch.clientY
    );

  },
  {
    passive: false
  }
);


canvas.addEventListener(
  "touchmove",
  event => {

    event.preventDefault();

    const touch =
      event.touches[0];

    reveal(
      touch.clientX,
      touch.clientY
    );

  },
  {
    passive: false
  }
);


// =======================================
// RESIZE
// =======================================

window.addEventListener(
  "resize",
  setupCanvas
);

