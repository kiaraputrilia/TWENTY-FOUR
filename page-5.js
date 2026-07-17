// ======================================
// PAGE 5
// LIVING RIBBON
// ======================================

const SENTENCE =
`And then, I looked around and life didn’t feel so serious anymore. The truth is, I would do anything for you, but you would never ask me to. And that is the most selfless and most gentle love I have the gift of receiving.`;

const playground =
document.getElementById("playground");


// ======================================
// SETTINGS
// ======================================

const WORD_SIZE =
window.innerWidth < 600
? 15
: 18;

// distance between collected words

const SEGMENT_DISTANCE = 34;

// how close cursor must be
// to collect next word

const ACTIVATE_RADIUS = 100;

// movement

const HEAD_EASE = 0.10;
const FOLLOW_EASE = 0.08;
const RETURN_EASE = 0.025;

// breathing

const JITTER_AMOUNT = 0.25;
const JITTER_SPEED = 0.0015;


// ======================================
// POINTER
// ======================================

const pointer = {

    x:window.innerWidth/2,
    y:window.innerHeight/2

};


// invisible leader

const head = {

    x:pointer.x,
    y:pointer.y

};


window.addEventListener("mousemove",e=>{

    pointer.x=e.clientX;
    pointer.y=e.clientY;

});


window.addEventListener("touchstart",e=>{

    pointer.x=e.touches[0].clientX;
    pointer.y=e.touches[0].clientY;

},{passive:true});


window.addEventListener("touchmove",e=>{

    pointer.x=e.touches[0].clientX;
    pointer.y=e.touches[0].clientY;

},{passive:true});


// ======================================
// WORDS
// ======================================

const words =
SENTENCE.split(/\s+/);

const objects=[];


// highest collected word

let collected = -1;


// ======================================
// CREATE HTML
// ======================================

words.forEach((text,index)=>{

    const div =
    document.createElement("div");

    div.className = "word";

    div.textContent = text;

    playground.appendChild(div);


    // random position

    const homeX =
    Math.random()*
    (window.innerWidth-240)+20;

    const homeY =
    Math.random()*
    (window.innerHeight-180)+40;


    objects.push({

        index,

        text,

        element:div,

        homeX,
        homeY,

        x:homeX,
        y:homeY,

        targetX:homeX,
        targetY:homeY,

        angle:
        Math.random()*
        Math.PI*2,

        collected:false

    });

});


// ======================================
// DRAW
// ======================================

function draw(){

    objects.forEach(word=>{

        word.element.style.left =
        word.x + "px";

        word.element.style.top =
        word.y + "px";

    });

}

draw();


// ======================================
// COLLECT NEXT WORD
// ======================================

function collectWords(){

    const next =
    collected + 1;

    if(next >= objects.length){

        return;

    }

    const word =
    objects[next];

    const dx = pointer.x - word.homeX;
    const dy = pointer.y - word.homeY;

    const distance =
    Math.sqrt(
        dx*dx +
        dy*dy
    );

    if(distance < ACTIVATE_RADIUS){

        word.collected = true;

        collected++;

    }

}

// ======================================
// ANIMATION
// ======================================

let time = 0;

function animate() {

    time += JITTER_SPEED;

    // ----------------------------------
    // Smooth invisible head
    // ----------------------------------

    head.x += (pointer.x - head.x) * HEAD_EASE;
    head.y += (pointer.y - head.y) * HEAD_EASE;

    // ----------------------------------
    // Check if we've collected
    // the next word
    // ----------------------------------

    collectWords();

    // ----------------------------------
    // Move every word
    // ----------------------------------

    objects.forEach((word, index) => {

        // ==============================
        // NOT COLLECTED
        // ==============================

        if (!word.collected) {

            word.angle += JITTER_SPEED;

            const breatheX =
                Math.cos(word.angle) *
                JITTER_AMOUNT;

            const breatheY =
                Math.sin(word.angle) *
                JITTER_AMOUNT;

            word.targetX =
                word.homeX + breatheX;

            word.targetY =
                word.homeY + breatheY;

        }

        // ==============================
        // FIRST COLLECTED WORD
        // ==============================

        else if (index === 0) {

            // stay slightly behind
            // the cursor

            const dx =
                pointer.x - head.x;

            const dy =
                pointer.y - head.y;

            const angle =
                Math.atan2(dy, dx);

            word.targetX =
                head.x -
                Math.cos(angle) * 40;

            word.targetY =
                head.y -
                Math.sin(angle) * 40;

        }

        // ==============================
        // FOLLOW PREVIOUS COLLECTED WORD
        // ==============================

        else {

            const previous =
                objects[index - 1];

            if (previous.collected) {

                const dx =
                    previous.x - word.x;

                const dy =
                    previous.y - word.y;

                const angle =
                    Math.atan2(dy, dx);

                word.targetX =
                    previous.x -
                    Math.cos(angle) *
                    SEGMENT_DISTANCE;

                word.targetY =
                    previous.y -
                    Math.sin(angle) *
                    SEGMENT_DISTANCE;

            }

            else {

                word.angle += JITTER_SPEED;

                word.targetX =
                    word.homeX +
                    Math.cos(word.angle) *
                    JITTER_AMOUNT;

                word.targetY =
                    word.homeY +
                    Math.sin(word.angle) *
                    JITTER_AMOUNT;

            }

        }

        // ==============================
        // Smooth interpolation
        // ==============================

        const ease =
            word.collected
                ? FOLLOW_EASE
                : RETURN_EASE;

        word.x +=
            (word.targetX - word.x) *
            ease;

        word.y +=
            (word.targetY - word.y) *
            ease;

    });

    draw();

    requestAnimationFrame(
        animate
    );

}

animate();

// ======================================
// RESIZE
// ======================================

window.addEventListener("resize", () => {

    const width = window.innerWidth;
    const height = window.innerHeight;

    pointer.x = width / 2;
    pointer.y = height / 2;

    head.x = pointer.x;
    head.y = pointer.y;

    objects.forEach(word => {

        // keep words inside screen

        word.homeX = Math.min(
            Math.max(word.homeX, 20),
            width - 120
        );

        word.homeY = Math.min(
            Math.max(word.homeY, 40),
            height - 40
        );

        // if the word hasn't been collected,
        // move it to its new home

        if (!word.collected) {

            word.x = word.homeX;
            word.y = word.homeY;

        }

    });

    draw();

});