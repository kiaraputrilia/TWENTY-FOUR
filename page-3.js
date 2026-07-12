// =======================================
// YOUR CONTENT
// =======================================

// Paste your first quotation here:

const TEXT_ONE =
  `PASTE YOUR FIRST QUOTE HERE`;


// Image:

const IMAGE =
  "IMG-1.jpg";


// Paste your second quotation here:

const TEXT_TWO =
  `PASTE YOUR SECOND QUOTE HERE`;


// =======================================
// SETTINGS
// =======================================

// Lower number = fragments appear more often

const SPAWN_DISTANCE = 180;


// =======================================
// ELEMENTS
// =======================================

const memoryField =
  document.getElementById("memoryField");


// =======================================
// CONTENT ORDER
// =======================================

const memories = [

  {
    type: "text",
    content: "Even now, after all these years, I cannot describe the torrent that swept through me in that moment. I only remember standing, transfixed, before a portrait of a woman wearing a fur coat."
  },

  {
    type: "image",
    content: "IMG-1.jpg"
  },

  {
    type: "text",
    content: "I had known that woman since I'd opened my first book at the age of seven - since I'd started, at the age of five, to dream. I saw in her echoes of Halit Ziya Uşaklıgil's Nihal, Vecihi Bey's Mehcure, and Cavalier Buridan's beloved. I saw the Cleopatra I had come to know in history books, and Muhammad's mother, Amine Hatun, of whom I had dreamed while listening to the Mevlit prayers.'"
  }

];


let memoryIndex = 0;

let previousX = null;
let previousY = null;


// =======================================
// CREATE MEMORY
// =======================================

function createMemory(x, y) {

  const memory =
    memories[
      memoryIndex %
      memories.length
    ];


  let element;


  // ---------------------------------------
  // TEXT
  // ---------------------------------------

  if (
    memory.type === "text"
  ) {

    element =
      document.createElement("div");


    element.className =
      "memory-text";


    element.textContent =
      memory.content;

  }


  // ---------------------------------------
  // IMAGE
  // ---------------------------------------

  if (
    memory.type === "image"
  ) {

    element =
      document.createElement("img");


    element.className =
      "memory-image";


    element.src =
      memory.content;

  }


  // =======================================
  // POSITION
  // =======================================

  const randomX =
    (Math.random() - 0.5) * 100;


  const randomY =
    (Math.random() - 0.5) * 100;


  element.style.left =
    `${x + randomX}px`;


  element.style.top =
    `${y + randomY}px`;


  // Slight random rotation

  const rotation =
    (Math.random() - 0.5) * 8;


  element.style.rotate =
    `${rotation}deg`;


  memoryField.appendChild(
    element
  );


  memoryIndex++;

}


// =======================================
// TRACK MOVEMENT
// =======================================

function handleMovement(x, y) {

  // First movement

  if (
    previousX === null ||
    previousY === null
  ) {

    previousX = x;
    previousY = y;

    createMemory(x, y);

    return;
  }


  const dx =
    x - previousX;


  const dy =
    y - previousY;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  // Only create a new fragment
  // after travelling enough distance

  if (
    distance >= SPAWN_DISTANCE
  ) {

    createMemory(x, y);


    previousX = x;
    previousY = y;

  }

}


// =======================================
// DESKTOP
// =======================================

memoryField.addEventListener(
  "mousemove",
  event => {

    handleMovement(
      event.clientX,
      event.clientY
    );

  }
);


// =======================================
// MOBILE
// =======================================

memoryField.addEventListener(
  "touchstart",
  event => {

    event.preventDefault();


    const touch =
      event.touches[0];


    handleMovement(
      touch.clientX,
      touch.clientY
    );

  },

  {
    passive: false
  }
);


memoryField.addEventListener(
  "touchmove",
  event => {

    event.preventDefault();


    const touch =
      event.touches[0];


    handleMovement(
      touch.clientX,
      touch.clientY
    );

  },

  {
    passive: false
  }
);