// ======================================
// ELEMENTS
// ======================================

const guidePieces = [...document.querySelectorAll(".guidePiece")];

const piecesContainer = document.getElementById("piecesContainer");

const nextPageLink = document.getElementById("nextPageLink");

let placedCount = 0;

const SNAP_DISTANCE = 40;


// ======================================
// WAIT FOR FONTS
// ======================================

document.fonts.ready.then(() => {

    createPuzzle();

});


// ======================================
// CREATE THE PUZZLE
// ======================================

function createPuzzle() {

    guidePieces.forEach(piece => {

        // ---------------------------------
        // Measure final position
        // ---------------------------------

        const rect = piece.getBoundingClientRect();

        // ---------------------------------
        // Create grey placeholder
        // ---------------------------------

        const placeholder = document.createElement("div");

        placeholder.className = "placeholder";

        placeholder.style.left = rect.left + "px";
        placeholder.style.top = rect.top + "px";

        placeholder.style.width = rect.width + "px";
        placeholder.style.height = rect.height + "px";

        document.body.appendChild(placeholder);

        // Hide guide text

        piece.style.visibility = "hidden";

        // ---------------------------------
        // Create draggable word
        // ---------------------------------

        const word = document.createElement("div");

        word.className = "wordPiece";

        word.textContent = piece.textContent;

        piecesContainer.appendChild(word);

        // ---------------------------------
        // Wait for browser to know size
        // ---------------------------------

        requestAnimationFrame(() => {

            const wordWidth = word.offsetWidth;
            const wordHeight = word.offsetHeight;

            let x;
            let y;

            // Keep generating random positions
            // until it isn't close to the placeholder

            do {

                x = Math.random() * (window.innerWidth - wordWidth);

                y = Math.random() * (window.innerHeight - wordHeight);

            }

            while (

                x > rect.left - 120 &&
                x < rect.right + 120 &&
                y > rect.top - 120 &&
                y < rect.bottom + 120

            );

            word.style.left = x + "px";
            word.style.top = y + "px";

            // Store destination

            word.targetX = rect.left;
            word.targetY = rect.top;

            word.placeholder = placeholder;

            word.locked = false;

            // Make draggable
            makeDraggable(word);

        });

    });

}

// ======================================
// DRAGGING
// ======================================

function makeDraggable(word) {

    let startX = 0;
    let startY = 0;

    let offsetX = 0;
    let offsetY = 0;

    // -----------------------------
    // Mouse
    // -----------------------------

    word.addEventListener("mousedown", startDrag);

    // -----------------------------
    // Touch
    // -----------------------------

    word.addEventListener("touchstart", startDrag, {
        passive: false
    });

    function startDrag(e) {

        if (word.locked) return;

        e.preventDefault();

        word.style.cursor = "grabbing";
        word.style.zIndex = 100;

        const point = e.touches ? e.touches[0] : e;

        startX = point.clientX;
        startY = point.clientY;

        offsetX = startX - word.offsetLeft;
        offsetY = startY - word.offsetTop;

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", stopDrag);

        document.addEventListener("touchmove", drag, {
            passive: false
        });

        document.addEventListener("touchend", stopDrag);

    }

    function drag(e) {

        e.preventDefault();

        const point = e.touches ? e.touches[0] : e;

        word.style.left = (point.clientX - offsetX) + "px";
        word.style.top = (point.clientY - offsetY) + "px";

    }

    function stopDrag() {

        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", stopDrag);

        document.removeEventListener("touchmove", drag);
        document.removeEventListener("touchend", stopDrag);

        word.style.cursor = "grab";
        word.style.zIndex = 10;

        checkSnap();

    }

    // -----------------------------
    // Snap into place
    // -----------------------------

    function checkSnap() {

        if (word.locked) return;

        const currentX = word.offsetLeft;
        const currentY = word.offsetTop;

        const dx = currentX - word.targetX;
        const dy = currentY - word.targetY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < SNAP_DISTANCE) {

            word.locked = true;

            word.classList.add("locked");

            word.style.left = word.targetX + "px";
            word.style.top = word.targetY + "px";

            word.style.cursor = "default";

            // Remove placeholder

            if (word.placeholder) {

                word.placeholder.remove();

            }

            placedCount++;

            // -------------------------
            // Finished
            // -------------------------

            if (placedCount === guidePieces.length) {

                setTimeout(() => {

                    nextPageLink.classList.add("show");

                }, 500);

            }

        }

    }

}