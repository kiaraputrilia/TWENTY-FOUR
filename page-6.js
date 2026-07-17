// ======================================
// SETTINGS
// ======================================

let paddleWidth = 12;
let paddleHeight = 90;

let playerX;
let playerY;

let aiX;
let aiY;

let ballX;
let ballY;

let ballSize = 14;

let ballSpeedX;
let ballSpeedY;

let exchanges = 0;


// ======================================
// TUNING
// ======================================

const paddleEase = 0.22;
const aiEase = 0.14;

const maxBallSpeed = 10;

let bounceCooldown = 0;


// ======================================
// GAME STATE
// ======================================

// playing
// flash
// overlay

let gameState = "playing";

let flashStart = 0;

let overlayOpacity = 0;


// ======================================
// SETUP
// ======================================

function setup() {

    let canvasWidth;
    let canvasHeight;

    if (windowWidth < 700) {

        const margin = 16;

        canvasWidth =
            document.documentElement.clientWidth
            - margin * 2;

        canvasHeight =
            window.innerHeight * 0.70;

    }

    else {

        canvasWidth =
            min(windowWidth * 0.75, 900);

        canvasHeight =
            canvasWidth * 0.58;

    }

    const canvas = createCanvas(
        canvasWidth,
        canvasHeight
    );

    canvas.parent("gameContainer");

    canvas.style("display", "block");
    canvas.style("max-width", "100%");
    canvas.style("height", "auto");

    rectMode(CENTER);

    noStroke();

    textAlign(CENTER, CENTER);

    playerX = width * 0.06;
    playerY = height / 2;

    aiX = width * 0.94;
    aiY = height / 2;

    resetBall();

}


// ======================================
// RESET
// ======================================

function resetBall() {

    ballX = width / 2;
    ballY = height / 2;

    ballSpeedX = random([-5, 5]);
    ballSpeedY = random(-2, 2);

    exchanges = 0;

    bounceCooldown = 0;

    document
        .getElementById("counter")
        .textContent = "0";

}


// ======================================
// FINISH
// ======================================

function finishGame() {

    if (gameState !== "playing") return;

    exchanges = 24;

    ballSpeedX = 0;
    ballSpeedY = 0;

    gameState = "flash";

    flashStart = millis();

}

// ======================================
// DRAW
// ======================================

function draw() {

    background(255);

    // --------------------------
    // Bounce cooldown
    // --------------------------

    if (bounceCooldown > 0) {
        bounceCooldown--;
    }

    // ======================================
    // PLAYING
    // ======================================

    if (gameState === "playing") {

        // --------------------------
        // PLAYER
        // --------------------------

        let targetY =
            touches.length > 0
            ? touches[0].y
            : mouseY;

        targetY = constrain(
            targetY,
            paddleHeight / 2,
            height - paddleHeight / 2
        );

        playerY +=
            (targetY - playerY) *
            paddleEase;


        // --------------------------
        // AI
        // --------------------------

        if (ballSpeedX > 0) {

            aiY +=
                (ballY - aiY) *
                aiEase;

        }

        aiY = constrain(
            aiY,
            paddleHeight / 2,
            height - paddleHeight / 2
        );


        // --------------------------
        // MOVE BALL
        // --------------------------

        ballX += ballSpeedX;
        ballY += ballSpeedY;


        // --------------------------
        // TOP / BOTTOM
        // --------------------------

        if (
            ballY < ballSize / 2 ||
            ballY > height - ballSize / 2
        ) {

            ballSpeedY *= -1;

        }


        // --------------------------
        // PLAYER COLLISION
        // --------------------------

        let playerLeft = playerX - paddleWidth / 2;
        let playerRight = playerX + paddleWidth / 2;
        let playerTop = playerY - paddleHeight / 2;
        let playerBottom = playerY + paddleHeight / 2;

        if (

            bounceCooldown === 0 &&

            ballSpeedX < 0 &&

            ballX - ballSize / 2 <= playerRight &&

            ballY >= playerTop &&
            ballY <= playerBottom

        ) {

            bounceCooldown = 5;

            ballX = playerRight + ballSize / 2 + 1;

            ballSpeedX = abs(ballSpeedX);

            ballSpeedY +=
                (ballY - playerY) * 0.08;

            ballSpeedY =
                constrain(ballSpeedY, -6, 6);

            exchanges++;

            if (exchanges % 4 === 0) {

                ballSpeedX =
                    min(
                        ballSpeedX * 1.12,
                        maxBallSpeed
                    );

            }

        }


        // --------------------------
        // AI COLLISION
        // (AI never loses)
        // --------------------------

        if (

            ballSpeedX > 0 &&

            ballX >= aiX - 20

        ) {

            ballX =
                aiX -
                paddleWidth -
                ballSize;

            ballSpeedX =
                -abs(ballSpeedX);

            ballSpeedY +=
                random(-0.4, 0.4);

            ballSpeedY =
                constrain(ballSpeedY, -6, 6);

            exchanges++;

            if (exchanges % 4 === 0) {

                ballSpeedX =
                    -min(
                        abs(ballSpeedX) * 1.08,
                        maxBallSpeed
                    );

            }

        }


        // --------------------------
        // PLAYER MISSES
        // --------------------------

        if (ballX < -ballSize) {

            resetBall();
            return;

        }


        // --------------------------
        // REACHED 24
        // --------------------------

        if (exchanges >= 24) {

            finishGame();

        }

    }


    // ======================================
    // DRAW GAME
    // ======================================

    fill(0);

    rect(
        playerX,
        playerY,
        paddleWidth,
        paddleHeight
    );

    rect(
        aiX,
        aiY,
        paddleWidth,
        paddleHeight
    );

    circle(
        ballX,
        ballY,
        ballSize
    );

    document
        .getElementById("counter")
        .textContent = exchanges;


    // ======================================
    // FLASH
    // ======================================

   if (gameState === "flash") {

    const elapsed =
        millis() - flashStart;

    // Flash every 100ms

    if (
        floor(elapsed / 100) % 2 === 0
    ) {

        push();

        blendMode(DIFFERENCE);

        fill(255);

        rect(
            width / 2,
            height / 2,
            width,
            height
        );

        pop();

    }

    // 5 flashes
    if (elapsed > 1000) {

        gameState = "overlay";

    }

}

    // ======================================
    // OVERLAY
    // ======================================

    if (gameState === "overlay") {

        drawOverlay();

    }

}

// ======================================
// DRAW OVERLAY
// ======================================

function drawOverlay() {

    // Fade in background
    overlayOpacity = min(
        overlayOpacity + 6,
        255
    );

    noStroke();

    fill(255, overlayOpacity);

    rect(
        width / 2,
        height / 2,
        width,
        height
    );


    // --------------------------
    // TEXT
    // --------------------------

    // --------------------------
// TEXT
// --------------------------

fill(0, overlayOpacity);

textFont("HAL Timezone Mono");

textAlign(CENTER, CENTER);

textSize(26);

text(
    "CONGRATULATIONS",
    width / 2,
    height / 2 - 90
);

textSize(20);

text(
    "A YEAR AROUND THE SUN TOGETHER",
    width / 2,
    height / 2 - 45
);


    // --------------------------
    // BUTTON
    // --------------------------

   // --------------------------
// BUTTON
// --------------------------

let buttonWidth = 220;
let buttonHeight = 54;

let buttonX = width / 2;
let buttonY = height / 2 + 70;

// Blink the border
let borderVisible =
    floor(frameCount / 30) % 2 === 0;

if (borderVisible) {

    stroke(0, overlayOpacity);

    strokeWeight(1);

    noFill();

    rect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        6
    );

}

noStroke();

fill(0, overlayOpacity);

textFont("HAL Timezone Mono");

textSize(26);

text(
    "CONTINUE",
    buttonX,
    buttonY + 1
);

}

// ======================================
// MOUSE
// ======================================

function mousePressed() {

    if (gameState !== "overlay") return;

    let buttonWidth = 210;
    let buttonHeight = 52;

    let buttonX = width / 2;
    let buttonY = height / 2 + 70;

    if (

        mouseX >
            buttonX - buttonWidth / 2 &&

        mouseX <
            buttonX + buttonWidth / 2 &&

        mouseY >
            buttonY - buttonHeight / 2 &&

        mouseY <
            buttonY + buttonHeight / 2

    ) {

        window.location.href = "page-7.html";

    }

}


// ======================================
// TOUCH
// ======================================

function touchStarted() {

    mousePressed();

    return false;

}