(() => {
  "use strict";

  const captionEl = document.getElementById("caption");
  const keyboardEl = document.getElementById("keyboard");

  // ------------------------------------------------------------------
  // Poem content
  // ------------------------------------------------------------------
  // Split into paragraphs so line breaks render correctly.
  const POEM_PARAGRAPHS = [
    "And most of all, I want to do nothing with you. I want to spend a Sunday at home, me in my corner, you in yours, reading or working or writing, silently in our spaces. I want to be so together that we don\u2019t have to say anything at all, that we can just watch it rain and drink our tea and occasionally look at one another and smile. I will wonder why I ever thought that Sunday was for running errands and cleaning and getting things done one after the other, when it is so clear that spending them silently across from you is so much better.",
    "I want to have every bit of Sunday with you, every Sunday, because you are simply too good to end on a Saturday night."
  ];

  const KEYBOARD_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"]
  ];

  // ------------------------------------------------------------------
  // Letter -> color + chord mapping
  // ------------------------------------------------------------------

  const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
  const LETTER_MAP = {}; // { a: { color, freqs: [f1,f2,f3] } }

  const C4 = 261.63;
  function noteFreq(semitonesFromC4) {
    return C4 * Math.pow(2, semitonesFromC4 / 12);
  }

  ALPHABET.forEach((ch, i) => {
    const hue = Math.round((360 / ALPHABET.length) * i);
    const color = `hsl(${hue}, 72%, 44%)`;

    // spread letters across two octaves, build a major triad per letter
    const root = i; // 0..25 semitones above C4
    const freqs = [
      noteFreq(root),
      noteFreq(root + 4),
      noteFreq(root + 7)
    ];

    LETTER_MAP[ch] = { color, freqs };
  });

  // ------------------------------------------------------------------
  // Build the poem DOM: wrap every letter in its own span
  // ------------------------------------------------------------------

  function buildPoem() {
    const frag = document.createDocumentFragment();

    POEM_PARAGRAPHS.forEach(paragraph => {
      const p = document.createElement("p");

      [...paragraph].forEach(ch => {
        const lower = ch.toLowerCase();

        if (/[a-z]/.test(lower)) {
          const span = document.createElement("span");
          span.className = "letter";
          span.dataset.char = lower;
          span.textContent = ch;
          p.appendChild(span);
        } else {
          p.appendChild(document.createTextNode(ch));
        }
      });

      frag.appendChild(p);
    });

    captionEl.appendChild(frag);
  }

  // ------------------------------------------------------------------
  // Build the on-screen keyboard
  // ------------------------------------------------------------------

  function buildKeyboard() {
    KEYBOARD_ROWS.forEach(row => {
      const rowEl = document.createElement("div");
      rowEl.className = "kbRow";

      row.forEach(letter => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "key";
        btn.dataset.key = letter;
        btn.textContent = letter;
        btn.style.color = LETTER_MAP[letter].color;

        rowEl.appendChild(btn);
      });

      keyboardEl.appendChild(rowEl);
    });
  }

  // ------------------------------------------------------------------
  // Audio
  // ------------------------------------------------------------------

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playChord(freqs) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.9;

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      // slight stagger + softer volume on upper notes of the triad
      const peak = i === 0 ? 0.22 : 0.12;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  }

  // ------------------------------------------------------------------
  // Trigger: highlight every occurrence of a letter + play its chord
  // ------------------------------------------------------------------

  const activeTimeouts = {};

  // ------------------------------------------------------------------
  // Completion tracking: once every unique letter used in the poem
  // has been revealed at least once, the poem is "whole" — tapping
  // it then advances to the next page.
  // ------------------------------------------------------------------

  const NEXT_PAGE_URL = "page-13.html";

  const uniqueLettersInPoem = new Set(
    POEM_PARAGRAPHS.join("").toLowerCase().split("").filter(ch => /[a-z]/.test(ch))
  );
  const revealedLetters = new Set();
  let complete = false;
  let navigating = false;

  function checkCompletion() {
    if (complete) return;
    if (revealedLetters.size >= uniqueLettersInPoem.size) {
      complete = true;
      document.body.classList.add("complete");
    }
  }

  function goToNextPage() {
    if (navigating) return;
    navigating = true;
    document.body.style.opacity = "0";
    setTimeout(() => {
      window.location.href = NEXT_PAGE_URL;
    }, 600);
  }

  captionEl.addEventListener("click", () => {
    if (complete) goToNextPage();
  });

  // ------------------------------------------------------------------
  // Idle fade-out: if nothing is pressed for a while, the poem
  // slowly dissolves back to invisible and has to be typed again.
  // ------------------------------------------------------------------

  const IDLE_TIMEOUT_MS = 20000;
  const FADE_DURATION_MS = 2500;

  let lastActivityTime = Date.now();
  let idleFaded = false;

  function markActivity() {
    lastActivityTime = Date.now();
    idleFaded = false;
  }

  function fadeOutPoem() {
    const spans = captionEl.querySelectorAll(".letter.revealed");
    if (!spans.length) return;

    spans.forEach(span => {
      span.classList.add("slow-fade");
      span.classList.remove("active");
      span.style.color = ""; // let CSS (not an inline flash color) drive the fade
    });

    // wait a frame so the class swap is picked up before removing "revealed"
    requestAnimationFrame(() => {
      spans.forEach(span => span.classList.remove("revealed"));
    });

    // once the slow fade finishes, drop the modifier so the next
    // reveal uses the normal quick transition again
    setTimeout(() => {
      spans.forEach(span => span.classList.remove("slow-fade"));
    }, FADE_DURATION_MS + 100);
  }

  function checkIdle() {
    if (idleFaded || complete) return;
    if (Date.now() - lastActivityTime >= IDLE_TIMEOUT_MS) {
      fadeOutPoem();
      idleFaded = true;
    }
  }

  setInterval(checkIdle, 1000);

  function triggerLetter(letter) {
    const entry = LETTER_MAP[letter];
    if (!entry) return;

    markActivity();

    playChord(entry.freqs);
    flashKeyboardKey(letter);

    const spans = captionEl.querySelectorAll(`.letter[data-char="${letter}"]`);
    if (!spans.length) return;

    spans.forEach(span => {
      span.style.color = entry.color;
      span.classList.add("active");
      span.classList.add("revealed"); // stays visible from now on
    });

    revealedLetters.add(letter);
    checkCompletion();

    if (activeTimeouts[letter]) clearTimeout(activeTimeouts[letter]);
    activeTimeouts[letter] = setTimeout(() => {
      spans.forEach(span => {
        span.style.color = ""; // falls back to .revealed's black, not transparent
        span.classList.remove("active");
      });
    }, 1100);
  }

  function flashKeyboardKey(letter) {
    const btn = keyboardEl.querySelector(`.key[data-key="${letter}"]`);
    if (!btn) return;
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 180);
  }

  // ------------------------------------------------------------------
  // Input wiring
  // ------------------------------------------------------------------

  // On-screen keyboard: click (desktop) + touch (mobile)
  keyboardEl.addEventListener("click", e => {
    const btn = e.target.closest(".key");
    if (!btn) return;
    triggerLetter(btn.dataset.key);
  });

  // Physical keyboard
  const pressedPhysicalKeys = new Set();

  window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    if (!/^[a-z]$/.test(key)) return;
    if (pressedPhysicalKeys.has(key)) return; // ignore key-repeat while held

    pressedPhysicalKeys.add(key);
    triggerLetter(key);
  });

  window.addEventListener("keyup", e => {
    const key = e.key.toLowerCase();
    pressedPhysicalKeys.delete(key);
  });

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------

  buildPoem();
  buildKeyboard();
})();