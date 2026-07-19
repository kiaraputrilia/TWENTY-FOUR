const {
  Engine,
  Bodies,
  Body,
  Composite,
  Runner
} = Matter;


// =======================================
// SETTINGS
// =======================================

const TOTAL_CIRCLES = 365;
const TARGET_NUMBER = 24;

const CIRCLE_RADIUS_DESKTOP = 25;
const CIRCLE_RADIUS_MOBILE = 17;

const GRAVITY = 1;
const BOUNCE = 0.65;
const FRICTION = 0.05;

const CURSOR_RADIUS = 250;
const CURSOR_FORCE = 0.010;

const NEXT_PAGE = "page-2.html";


// =======================================
// CAPTION TEXT
// =======================================

const CAPTION_DEFAULT =
  "Like The Pull of The Earth Beneath my Feet";

const CAPTION_FOUND =
  "Your Love Grounds Me";


// =======================================
// CANVAS
// =======================================

const canvas = document.getElementById("world");
const context = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
let pixelRatio = window.devicePixelRatio || 1;


// =======================================
// PHYSICS ENGINE
// =======================================

const engine = Engine.create();
const world = engine.world;

engine.gravity.y = GRAVITY;

const runner = Runner.create();

Runner.run(runner, engine);


// =======================================
// RESPONSIVE CIRCLE SIZE
// =======================================

function getCircleRadius() {

  if (window.innerWidth < 600) {
    return CIRCLE_RADIUS_MOBILE;
  }

  return CIRCLE_RADIUS_DESKTOP;
}

let radius = getCircleRadius();


// =======================================
// RESIZE CANVAS
// =======================================

function resizeCanvas() {

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
}

resizeCanvas();

let previousWidth = width;
let previousHeight = height;


// =======================================
// WALLS
// =======================================

let walls = [];

function createWalls() {

  walls.forEach(wall => {
    Composite.remove(world, wall);
  });

  const thickness = 110;

  const floor = Bodies.rectangle(
    width / 2,
    height + thickness / 2,
    width,
    thickness,
    {
      isStatic: true
    }
  );

  const leftWall = Bodies.rectangle(
    -thickness / 2,
    height / 2,
    thickness,
    height * 2,
    {
      isStatic: true
    }
  );

  const rightWall = Bodies.rectangle(
    width + thickness / 2,
    height / 2,
    thickness,
    height * 2,
    {
      isStatic: true
    }
  );

  walls = [
    floor,
    leftWall,
    rightWall
  ];

  Composite.add(world, walls);
}

createWalls();


// =======================================
// CREATE ALL 365 CIRCLES
// =======================================

const circles = [];

for (
  let number = 1;
  number <= TOTAL_CIRCLES;
  number++
) {

  // Random horizontal starting position

  const x =
    radius +
    Math.random() * (width - radius * 2);


  // Start above the screen

  const y =
    -radius -
    Math.random() * 1200;


  const circle = Bodies.circle(
    x,
    y,
    radius,
    {
      restitution: BOUNCE,
      friction: FRICTION,
      frictionAir: 0.015,
      density: 0.001
    }
  );


  // Store number on the physics body

  circle.number = number;

  circles.push(circle);
}

Composite.add(world, circles);


// =======================================
// TARGET: NUMBER 24
// =======================================

const targetCircle = circles.find(
  circle => circle.number === TARGET_NUMBER
);

let found = false;


// =======================================
// POINTER / CURSOR
// =======================================

const pointer = {

  x: -1000,
  y: -1000,

  previousX: -1000,
  previousY: -1000,

  active: false

};


function updatePointer(clientX, clientY) {

  const rect =
    canvas.getBoundingClientRect();


  pointer.previousX = pointer.x;
  pointer.previousY = pointer.y;


  pointer.x =
    clientX - rect.left;

  pointer.y =
    clientY - rect.top;


  pointer.active = true;

}


// =======================================
// DESKTOP MOUSE
// =======================================

canvas.addEventListener(
  "mousemove",
  event => {

    updatePointer(
      event.clientX,
      event.clientY
    );

  }
);


canvas.addEventListener(
  "mouseleave",
  () => {

    pointer.active = false;

  }
);


// =======================================
// MOBILE TOUCH
// =======================================

canvas.addEventListener(
  "touchstart",
  event => {

    event.preventDefault();

    const touch =
      event.touches[0];


    updatePointer(
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


    updatePointer(
      touch.clientX,
      touch.clientY
    );

  },
  {
    passive: false
  }
);


canvas.addEventListener(
  "touchend",
  () => {

    pointer.active = false;

  }
);


// =======================================
// PUSH CIRCLES WITH CURSOR
// =======================================

function pushCircles() {

  if (!pointer.active || found) {
    return;
  }


  circles.forEach(circle => {

    const dx =
      circle.position.x -
      pointer.x;

    const dy =
      circle.position.y -
      pointer.y;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    const interactionDistance =
      CURSOR_RADIUS + radius;


    if (
      distance < interactionDistance &&
      distance > 0
    ) {

      // Stronger force when closer
      // to the cursor

      const strength =
        1 -
        distance /
        interactionDistance;


      Body.applyForce(
        circle,
        circle.position,
        {

          x:
            (dx / distance) *
            CURSOR_FORCE *
            strength,

          y:
            (dy / distance) *
            CURSOR_FORCE *
            strength

        }
      );

    }

  });

}


// =======================================
// CHECK IF CURSOR TOUCHES 24
// =======================================

function checkTarget() {

  if (
    !pointer.active ||
    found
  ) {
    return;
  }


  const dx =
    pointer.x -
    targetCircle.position.x;

  const dy =
    pointer.y -
    targetCircle.position.y;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  if (distance <= radius) {

    activateTarget();

  }

}


// =======================================
// FREEZE EVERYTHING
// =======================================

function activateTarget() {

  found = true;

  // Stop the physics simulation

  runner.enabled = false;

}


// =======================================
// CLICK / TAP NUMBER 24
// =======================================

function openTarget(clientX, clientY) {

  if (!found) {
    return;
  }


  const rect =
    canvas.getBoundingClientRect();


  const x =
    clientX - rect.left;

  const y =
    clientY - rect.top;


  const dx =
    x -
    targetCircle.position.x;

  const dy =
    y -
    targetCircle.position.y;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  if (distance <= radius) {

    window.location.href =
      NEXT_PAGE;

  }

}


// Desktop click

canvas.addEventListener(
  "click",
  event => {

    openTarget(
      event.clientX,
      event.clientY
    );

  }
);


// Mobile tap

canvas.addEventListener(
  "touchend",
  event => {

    if (!found) {
      return;
    }


    const touch =
      event.changedTouches[0];


    openTarget(
      touch.clientX,
      touch.clientY
    );

  }
);


// =======================================
// WRAPPED TEXT FUNCTION
// =======================================

function drawWrappedText(
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {

  const words =
    text.split(" ");

  let line = "";
  let currentY = y;


  for (
    let i = 0;
    i < words.length;
    i++
  ) {

    const testLine =
      line +
      words[i] +
      " ";


    const testWidth =
      context.measureText(
        testLine
      ).width;


    if (
      testWidth > maxWidth &&
      i > 0
    ) {

      context.fillText(
        line,
        x,
        currentY
      );


      line =
        words[i] +
        " ";


      currentY +=
        lineHeight;

    } else {

      line =
        testLine;

    }

  }


  context.fillText(
    line,
    x,
    currentY
  );

}


// =======================================
// DRAW
// =======================================

function draw() {

  // Cursor interaction

  pushCircles();


  // Check whether cursor touches 24

  checkTarget();


  // =====================================
  // BACKGROUND
  // =====================================

  context.fillStyle =
    "#ffffff";


  context.fillRect(
    0,
    0,
    width,
    height
  );


  // =====================================
  // CAPTION
  // =====================================

  const caption =
    found
      ? CAPTION_FOUND
      : CAPTION_DEFAULT;


  // Caption size

  const captionFontSize =
    width < 600
      ? 36
      : 36;


  // Caption margin

  const captionMargin =
    width < 600
      ? 16
      : 24;


  // Maximum width of caption

  const captionMaxWidth =
    width < 600
      ? width -
        (captionMargin * 2)

      : Math.min(
          width * 0.5,
          700
        );


  // Caption color

  context.fillStyle =
    "#000000";


  // Caption font

  context.font =
    `${captionFontSize}px "TimesDotRom"`;


  context.textAlign =
    "left";

  context.textBaseline =
    "top";


  // Draw caption

  drawWrappedText(
    caption,
    captionMargin,
    captionMargin,
    captionMaxWidth,

    // Line spacing
    captionFontSize * 0.9
  );


  // =====================================
  // DRAW ALL 365 CIRCLES
  // =====================================

  circles.forEach(circle => {

    const x =
      circle.position.x;

    const y =
      circle.position.y;


    const isTarget =
      found &&
      circle.number ===
        TARGET_NUMBER;


    // -----------------------------------
    // CIRCLE
    // -----------------------------------

    context.beginPath();


    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );


    if (isTarget) {

      // 24 becomes black

      context.fillStyle =
        "#000000";

      context.fill();


      context.strokeStyle =
        "#000000";

    } else {

      // All other circles stay white

      context.fillStyle =
        "#ffffff";

      context.fill();


      context.strokeStyle =
        "#000000";

    }


    context.lineWidth =
      1.5;


    context.stroke();


    // -----------------------------------
    // NUMBER
    // -----------------------------------

    context.fillStyle =
      isTarget
        ? "#ffffff"
        : "#000000";


    context.font =
      `${radius * 0.8}px "HAL Timezone Mono"`;


    context.textAlign =
      "center";

    context.textBaseline =
      "middle";


    context.fillText(
      circle.number,
      x,
      y + 1
    );

  });


  requestAnimationFrame(
    draw
  );

}

draw();


// =======================================
// RESPONSIVE WINDOW RESIZE
// =======================================

function handleResize() {

  const oldWidth =
    previousWidth;

  const oldHeight =
    previousHeight;

  const oldRadius =
    radius;


  // Resize canvas

  resizeCanvas();


  // Get new responsive radius

  radius =
    getCircleRadius();


  // Scale circle positions
  // relative to the new screen

  circles.forEach(circle => {

    let newX =
      circle.position.x *
      (width / oldWidth);


    let newY =
      circle.position.y *
      (height / oldHeight);


    // Keep circles inside
    // horizontal boundaries

    newX =
      Math.max(
        radius,
        Math.min(
          width - radius,
          newX
        )
      );


    // Keep settled circles
    // above the floor

    if (
      newY >
      height - radius
    ) {

      newY =
        height - radius;

    }


    Body.setPosition(
      circle,
      {
        x: newX,
        y: newY
      }
    );


    // Resize physical circle bodies
    // when switching between
    // desktop and mobile

    if (
      oldRadius !== radius
    ) {

      const scale =
        radius /
        oldRadius;


      Body.scale(
        circle,
        scale,
        scale
      );

    }

  });


  // Rebuild screen boundaries

  createWalls();


  // Save current dimensions

  previousWidth =
    width;

  previousHeight =
    height;

}


// Listen for browser resize

window.addEventListener(
  "resize",
  handleResize
);