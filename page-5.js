// =======================================
// MAGNETIC SENTENCE
// PAGE 5
// =======================================

const SENTENCE =
`And then, I looked around and life didn’t feel so serious anymore. The truth is, I would do anything for you, but you would never ask me to. And that is the most selfless and most gentle love I have the gift of receiving.`;

const playground =
document.getElementById("playground");


// =======================================
// SETTINGS
// =======================================

// How close each word wants to stay
// to the previous word

const WORD_SPACING = 38;


// Pull of cursor on FIRST word

const CURSOR_FORCE = 0.00035;


// Pull between neighbouring words

const CHAIN_FORCE = 0.015;


// Slow everything down

const FRICTION = 0.90;


// Tiny breathing movement

const JITTER = 0.02;


// Cursor influence

const CURSOR_RADIUS = 220;


// =======================================
// POINTER
// =======================================

const pointer = {

    x: window.innerWidth / 2,

    y: window.innerHeight / 2,

    active: false

};


// =======================================
// POINTER EVENTS
// =======================================

function updatePointer(x,y){

    pointer.x = x;
    pointer.y = y;

    pointer.active = true;

}


window.addEventListener("mousemove",(e)=>{

    updatePointer(
        e.clientX,
        e.clientY
    );

});


window.addEventListener(

    "touchstart",

    e=>{

        const t =
        e.touches[0];

        updatePointer(
            t.clientX,
            t.clientY
        );

    },

    {passive:true}

);


window.addEventListener(

    "touchmove",

    e=>{

        const t =
        e.touches[0];

        updatePointer(
            t.clientX,
            t.clientY
        );

    },

    {passive:true}

);


// =======================================
// CREATE WORD OBJECTS
// =======================================

const words =
SENTENCE.split(/\s+/);

const objects = [];


words.forEach(word=>{

    const div =
    document.createElement("div");

    div.className = "word";

    div.textContent = word;

    playground.appendChild(div);


    objects.push({

        element: div,

        text: word,

        // Random starting position

        x:
        Math.random() *
        (window.innerWidth - 200),

        y:
        Math.random() *
        (window.innerHeight - 200),

        vx:
        (Math.random()-0.5) * 0.3,

        vy:
        (Math.random()-0.5) * 0.3

    });

});


// =======================================
// POSITION WORDS
// =======================================

function drawWords(){

    objects.forEach(word=>{

        word.element.style.left =
        word.x + "px";

        word.element.style.top =
        word.y + "px";

    });

}

drawWords();

// =======================================
// ANIMATION
// =======================================

function animate() {

    // -----------------------------------
    // FIRST WORD FOLLOWS CURSOR
    // -----------------------------------

    const first = objects[0];

    if (pointer.active) {

        const dx = pointer.x - first.x;
        const dy = pointer.y - first.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CURSOR_RADIUS) {

            first.vx += dx * CURSOR_FORCE;
            first.vy += dy * CURSOR_FORCE;

        }

    }


    // -----------------------------------
    // EVERY OTHER WORD FOLLOWS
    // THE PREVIOUS WORD
    // -----------------------------------

    for (let i = 1; i < objects.length; i++) {

        const previous = objects[i - 1];
        const current = objects[i];

        const dx = previous.x - current.x;
        const dy = previous.y - current.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {

            // desired spacing

            const stretch =
                distance - WORD_SPACING;

            current.vx +=
                (dx / distance) *
                stretch *
                CHAIN_FORCE;

            current.vy +=
                (dy / distance) *
                stretch *
                CHAIN_FORCE;

        }

    }


    // -----------------------------------
    // UPDATE ALL WORDS
    // -----------------------------------

    objects.forEach(word => {

        // friction

        word.vx *= FRICTION;
        word.vy *= FRICTION;


        // tiny breathing

        word.vx +=
            (Math.random() - 0.5) *
            JITTER;

        word.vy +=
            (Math.random() - 0.5) *
            JITTER;


        word.x += word.vx;
        word.y += word.vy;


        // keep on screen

        word.x = Math.max(
            0,
            Math.min(
                window.innerWidth - 120,
                word.x
            )
        );

        word.y = Math.max(
            0,
            Math.min(
                window.innerHeight - 40,
                word.y
            )
        );

    });


    drawWords();

    requestAnimationFrame(
        animate
    );

}

animate();


// =======================================
// RESIZE
// =======================================

window.addEventListener(
    "resize",
    () => {

        location.reload();

    }
);