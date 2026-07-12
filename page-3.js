// =======================================
// 8 ENTRIES
// =======================================

const entries = [

  {
    type: "text",
    content: "'Even now, after all these years, I cannot describe the torrent that swept through me in that moment. I only remember standing, transfixed, before a portrait of a woman wearing a fur coat.'"
  },

  {
    type: "image",
    content: "IMG-1.jpg"
  },

  {
    type: "text",
    content: "'I had known that woman since I'd opened my first book at the age of seven — since I'd started, at the age of five, to dream. I saw in her echoes of Halit Ziya Uşaklıgil's Nihal, Vecihi Bey's Mehcure, and Cavalier Buridan's beloved. I saw the Cleopatra I had come to know in history books, and Muhammad's mother, Amine Hatun, of whom I had dreamed while listening to the Mevlit prayers.'"
  },

  {
    type: "image",
    content: "IMG-3.jpg"
  },

  {
    type: "text",
    content: "'To be consumed, body and soul, by desire is quite another. That’s what love is to me — desire that’s all-consuming. Desire that’s impossible to resist!'"
  },

  {
    type: "image",
    content: `IMG-4.jpg`
  },

  {
    type: "text",
    content: "'Just as warm sunlight can, by passing through a lens, turn to fire, so too can love. It’s wrong to see it as something that swoops in from outside. It’s because it arises from the feelings we carry inside us that it strikes us with such violence, at the moment we least expect.'"
  },

  {
    type: "image",
    content: `IMG-5.jpg`
  }

];


// =======================================
// ELEMENTS
// =======================================

const memoryField =
  document.getElementById("memoryField");

let currentEntry = 0;


// =======================================
// SHOW ENTRY
// =======================================

function showEntry(x, y) {

  // After all 8 entries have appeared,
  // the next click clears the page
  // and resets the sequence.

  if (currentEntry >= entries.length) {

    memoryField.innerHTML = "";

    currentEntry = 0;

    return;
  }


  const entry =
    entries[currentEntry];

  let element;


  // =====================================
  // CREATE TEXT
  // =====================================

  if (entry.type === "text") {

    element =
      document.createElement("div");

    element.className =
      "memory-text";

    element.textContent =
      entry.content;

  }


  // =====================================
  // CREATE IMAGE
  // =====================================

  if (entry.type === "image") {

    element =
      document.createElement("img");

    element.className =
      "memory-image";

    element.src =
      entry.content;

  }


  // =====================================
  // POSITION
  // =====================================

  // The exact point you click becomes
  // the TOP-LEFT corner of the element.

  element.style.left =
    `${x}px`;

  element.style.top =
    `${y}px`;


  // Add the element to the page

  memoryField.appendChild(
    element
  );


  // Move to the next entry

  currentEntry++;

}


// =======================================
// CLICK / TAP
// =======================================

memoryField.addEventListener(
  "pointerdown",
  event => {

    showEntry(
      event.clientX,
      event.clientY
    );

  }
);