(() => {
  "use strict";

  const canvas = document.getElementById("letterCanvas");
  const ctx = canvas.getContext("2d");
  const holdHint = document.getElementById("holdHint");

  const POEM_LINES = [
    "To think about you is blue, like wandering",
    "through a golden forest in the middle of the day:",
    "gardens are born from my words",
    "and with my clouds, I walk through your dreams."
  ];

  const INK = "#002FA7";

  // Tunables ---------------------------------------------------------
  const HOLD_DURATION_MS = 4200;   // how long a continuous hold takes to fully calm the storm
  const RELEASE_DECAY_PER_MS = 0.00035; // how fast the calm drains once you let go
  const LOCK_HOLD_MS = 700;        // must stay fully calm this long before it locks permanently
  const LINE_HEIGHT_RATIO = 0.98;
  const NEXT_PAGE_URL = "page-16.html";

  let W = 0, H = 0, DPR = 1;
  let fontSize = 36;
  let font = "";
  let letters = [];
  let calm = 0;            // 0 = full storm, 1 = fully settled
  let holdStart = null;
  let fullyCalmSince = null;
  let settled = false;
  let hintHidden = false;
  let fontsReady = false;
  let suppressNextClick = false; // swallow the release-click that caused settling
  let navigating = false;

  // ------------------------------------------------------------------
  // Setup
  // ------------------------------------------------------------------

  function computeFontSize() {
    if (W < 600) return Math.max(18, Math.min(26, W * 0.058));
    return Math.max(26, Math.min(46, W * 0.032));
  }

  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    fontSize = computeFontSize();
    font = `${fontSize}px TimesDotRom, serif`;
    layoutTargets();
    if (settled) {
      letters.forEach(L => { L.x = L.targetX; L.y = L.targetY; });
    }
  }

  function buildLetters() {
    letters = [];
    POEM_LINES.forEach((line, li) => {
      [...line].forEach(ch => {
        letters.push({ char: ch, line: li, seed: Math.random() * 1000 });
      });
    });
  }

  function layoutTargets() {
    ctx.font = font;

    const maxAllowedWidth = Math.min(W * 0.86, 1100);
    let widest = 0;
    const lineWidths = POEM_LINES.map(l => {
      const w = ctx.measureText(l).width;
      if (w > widest) widest = w;
      return w;
    });

    if (widest > maxAllowedWidth) {
      const scale = maxAllowedWidth / widest;
      fontSize = Math.max(14, fontSize * scale);
      font = `${fontSize}px TimesDotRom, serif`;
      ctx.font = font;
      widest = 0;
      for (let i = 0; i < POEM_LINES.length; i++) {
        lineWidths[i] = ctx.measureText(POEM_LINES[i]).width;
        if (lineWidths[i] > widest) widest = lineWidths[i];
      }
    }

    const lineHeight = fontSize * LINE_HEIGHT_RATIO;
    const blockHeight = POEM_LINES.length * lineHeight;
    const blockY = H / 2 - blockHeight / 2 + fontSize * 0.78;

    let idx = 0;
    POEM_LINES.forEach((line, li) => {
      const lineW = lineWidths[li];
      let cx = (W - lineW) / 2;
      const cy = blockY + li * lineHeight;
      [...line].forEach(ch => {
        const w = ctx.measureText(ch).width;
        letters[idx].targetX = cx + w / 2;
        letters[idx].targetY = cy;
        idx++;
        cx += w;
      });
    });
  }

  function scatterLetters() {
    letters.forEach(L => {
      L.x = Math.random() * W;
      L.y = Math.random() * H;
      L.vx = (Math.random() - 0.5) * 3;
      L.vy = (Math.random() - 0.5) * 3;
      L.angle = Math.random() * Math.PI * 2;
    });
  }

  // ------------------------------------------------------------------
  // Interaction
  // ------------------------------------------------------------------

  function beginHold() {
    if (settled) return;
    holdStart = performance.now();
    if (!hintHidden) {
      hintHidden = true;
      holdHint.classList.add("hidden");
    }
  }

  function endHold() {
    holdStart = null;
    fullyCalmSince = null;
  }

  function goToNextPage() {
    if (navigating) return;
    navigating = true;
    canvas.style.transition = "opacity 0.6s ease";
    canvas.style.opacity = "0";
    setTimeout(() => {
      window.location.href = NEXT_PAGE_URL;
    }, 600);
  }

  canvas.addEventListener("mousedown", beginHold);
  canvas.addEventListener("touchstart", beginHold, { passive: true });
  window.addEventListener("mouseup", endHold);
  window.addEventListener("touchend", endHold);
  window.addEventListener("touchcancel", endHold);
  window.addEventListener("blur", endHold);

  // Navigate once the poem has settled and the user clicks/taps —
  // but ignore the synthetic click fired by releasing the hold that
  // caused it to settle in the first place.
  canvas.addEventListener("click", () => {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    if (settled) {
      goToNextPage();
    }
  });

  // ------------------------------------------------------------------
  // Animation
  // ------------------------------------------------------------------

  let last = performance.now();

  function tick(now) {
    const dt = Math.min(now - last, 48);
    last = now;

    if (!settled) {
      if (holdStart !== null) {
        const held = now - holdStart;
        calm = Math.min(1, held / HOLD_DURATION_MS);
        if (calm >= 1) {
          if (fullyCalmSince === null) fullyCalmSince = now;
          if (now - fullyCalmSince >= LOCK_HOLD_MS) {
            settled = true;
            suppressNextClick = true; // this hold's release shouldn't trigger nav
            canvas.style.cursor = "pointer";
          }
        } else {
          fullyCalmSince = null;
        }
      } else {
        calm = Math.max(0, calm - dt * RELEASE_DECAY_PER_MS);
        fullyCalmSince = null;
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.font = font;
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const t = now * 0.001;

    for (let i = 0; i < letters.length; i++) {
      const L = letters[i];

      if (settled) {
        L.x = L.targetX;
        L.y = L.targetY;
        L.angle = 0;
      } else {
        const turb = (1 - calm);

        // cheap pseudo-curl-noise turbulence field
        const nx = Math.sin(L.y * 0.01 + t * 0.7 + L.seed) + Math.cos(L.x * 0.012 - t * 0.5 + L.seed * 0.3);
        const ny = Math.cos(L.x * 0.011 - t * 0.6 + L.seed) + Math.sin(L.y * 0.013 + t * 0.4 + L.seed * 0.7);

        L.vx += nx * turb * 0.55;
        L.vy += ny * turb * 0.55;

        // spring toward target grows sharply as calm approaches 1
        const spring = calm * calm * 0.055;
        L.vx += (L.targetX - L.x) * spring;
        L.vy += (L.targetY - L.y) * spring;

        const damp = 0.93 - calm * 0.18;
        L.vx *= damp;
        L.vy *= damp;

        L.x += L.vx * (dt / 16);
        L.y += L.vy * (dt / 16);

        const m = 60;
        if (L.x < -m) L.x = W + m;
        if (L.x > W + m) L.x = -m;
        if (L.y < -m) L.y = H + m;
        if (L.y > H + m) L.y = -m;

        L.angle = turb * Math.sin(t * 2.2 + L.seed) * 0.7;
      }

      if (L.char === " ") continue;

      ctx.save();
      ctx.translate(L.x, L.y);
      ctx.rotate(L.angle);
      ctx.fillText(L.char, 0, 0);
      ctx.restore();
    }

    requestAnimationFrame(tick);
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------

  buildLetters();
  resize();
  scatterLetters();
  window.addEventListener("resize", resize);

  const bootStorm = () => requestAnimationFrame(tick);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      fontsReady = true;
      resize(); // relayout targets now that TimesDotRom metrics are accurate
      bootStorm();
    }).catch(bootStorm);
  } else {
    bootStorm();
  }
})();