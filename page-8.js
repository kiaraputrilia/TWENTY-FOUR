// ======================================
// PAGE 8 — DRAG FOOD INTO THE BAG
// Items snap anywhere inside the bag's interior zone,
// not to fixed per-item positions
// ======================================

const bagContainer = document.getElementById("bagContainer");
const bagFront = document.getElementById("bagFront");

// bag's interior drop zone, as a percentage inset from
// each edge of bagContainer — tune these four numbers to
// match where the bag's actual opening/interior sits
const ZONE_INSET = {
    left: 10,
    right: 10,
    top: 12,
    bottom: 6
};

const ITEMS = [
    { src: "SPAGHETTI.png",   widthVw: 45 },
    { src: "TOMATO.png",      widthVw: 38 },
    { src: "ONION.png",       widthVw: 45 },
    { src: "GARLIC.png",      widthVw: 35 },
    { src: "ASPARAGUS-1.png", widthVw: 40 },
    { src: "ASPARAGUS-2.png", widthVw: 40 },
    { src: "PETE-1.png",      widthVw: 35 },
    { src: "PETE-2.png",      widthVw: 35 },
    { src: "PETE-3.png",      widthVw: 35 }
];

// on phones, vw is based on a much narrower screen, so the same
// widthVw value renders far smaller in px than on desktop —
// this multiplier compensates so food reads at a similar
// visual size relative to the (now bottom-anchored, larger) bag
const MOBILE_SIZE_MULTIPLIER = 1.6;
const MOBILE_EXTRA_PX = 25;

function isMobile() {
    return window.innerWidth < 600;
}

function getItemWidthValue(baseWidthVw) {

    if (isMobile()) {
        return `calc(${baseWidthVw * MOBILE_SIZE_MULTIPLIER}vw + ${MOBILE_EXTRA_PX}px)`;
    }

    return `${baseWidthVw}vw`;

}

let itemStates = [];


// ======================================
// ZONE HELPERS
// ======================================

function getZoneRect() {

    const bagRect = bagContainer.getBoundingClientRect();

    const left = bagRect.left + (ZONE_INSET.left / 100) * bagRect.width;
    const right = bagRect.left + bagRect.width - (ZONE_INSET.right / 100) * bagRect.width;
    const top = bagRect.top + (ZONE_INSET.top / 100) * bagRect.height;
    const bottom = bagRect.top + bagRect.height - (ZONE_INSET.bottom / 100) * bagRect.height;

    return { left, right, top, bottom, width: right - left, height: bottom - top };

}


// ======================================
// BUILD ITEM ELEMENTS
// ======================================

function createFoodItems() {

    ITEMS.forEach((def) => {

        const el = document.createElement("img");
        el.src = def.src;
        el.className = "foodItem";
        el.style.width = getItemWidthValue(def.widthVw);
        el.draggable = false;

        bagContainer.insertBefore(el, bagFront);

        const state = {
            el: el,
            placed: false,

            // for unplaced items: home position as % of viewport
            homeXPercent: 0,
            homeYPercent: 0,

            // for placed items: position as % WITHIN the drop zone
            // (0–100 relative to the zone's own box, not the bag)
            placedZoneXPercent: 50,
            placedZoneYPercent: 50,

            dragging: false,
            dragBagRect: null,
            pointerOffsetX: 0,
            pointerOffsetY: 0
        };

        assignRandomHome(state);
        itemStates.push(state);
        attachDragHandlers(state);

    });

    layoutAll();

}


// ======================================
// SCATTER LOOSE ITEMS, AVOIDING THE BAG
// ======================================

function assignRandomHome(state) {

    const bagRect = bagContainer.getBoundingClientRect();
    const margin = 6;

    const bagLeftPct = (bagRect.left / window.innerWidth) * 100 - margin;
    const bagRightPct = ((bagRect.left + bagRect.width) / window.innerWidth) * 100 + margin;
    const bagTopPct = (bagRect.top / window.innerHeight) * 100 - margin;
    const bagBottomPct = ((bagRect.top + bagRect.height) / window.innerHeight) * 100 + margin;

    let x, y, attempts = 0;

    do {
        x = 8 + Math.random() * 84;
        y = 8 + Math.random() * 84;
        attempts++;
    } while (
        x > bagLeftPct && x < bagRightPct &&
        y > bagTopPct && y < bagBottomPct &&
        attempts < 30
    );

    state.homeXPercent = x;
    state.homeYPercent = y;

}


// ======================================
// POSITIONING
// ======================================

function layoutItem(state) {

    if (state.dragging) return;

    const bagRect = bagContainer.getBoundingClientRect();
    const elRect = state.el.getBoundingClientRect();
    const halfW = elRect.width / 2;
    const halfH = elRect.height / 2;

    let viewportX, viewportY;

    if (state.placed) {

        const zone = getZoneRect();

        viewportX = zone.left + (state.placedZoneXPercent / 100) * zone.width;
        viewportY = zone.top + (state.placedZoneYPercent / 100) * zone.height;

    } else {

        viewportX = (state.homeXPercent / 100) * window.innerWidth;
        viewportY = (state.homeYPercent / 100) * window.innerHeight;

    }

    const relLeft = (viewportX - halfW) - bagRect.left;
    const relTop = (viewportY - halfH) - bagRect.top;

    state.el.style.left = relLeft + "px";
    state.el.style.top = relTop + "px";

}

function layoutAll() {
    itemStates.forEach(layoutItem);
}


// ======================================
// DRAG HANDLERS
// ======================================

function attachDragHandlers(state) {

    state.el.addEventListener("pointerdown", (e) => {

        state.el.setPointerCapture(e.pointerId);

        state.dragging = true;
        state.el.classList.add("dragging");
        state.dragBagRect = bagContainer.getBoundingClientRect();

        const elRect = state.el.getBoundingClientRect();
        state.pointerOffsetX = e.clientX - elRect.left;
        state.pointerOffsetY = e.clientY - elRect.top;

    });

    state.el.addEventListener("pointermove", (e) => {

        if (!state.dragging) return;

        const viewportX = e.clientX - state.pointerOffsetX;
        const viewportY = e.clientY - state.pointerOffsetY;

        const relLeft = viewportX - state.dragBagRect.left;
        const relTop = viewportY - state.dragBagRect.top;

        state.el.style.left = relLeft + "px";
        state.el.style.top = relTop + "px";

    });

    function endDrag() {

        if (!state.dragging) return;

        state.dragging = false;
        state.el.classList.remove("dragging");

        const elRect = state.el.getBoundingClientRect();
        const centerX = elRect.left + elRect.width / 2;
        const centerY = elRect.top + elRect.height / 2;

        const zone = getZoneRect();

        const inZone =
            centerX >= zone.left && centerX <= zone.right &&
            centerY >= zone.top && centerY <= zone.bottom;

        if (inZone) {

            state.placed = true;

            // convert the drop point into a % position WITHIN the
            // zone, clamped so the item doesn't hang past the zone
            // edges (accounting for the item's own half-width/height
            // in zone-relative percentage terms)
            const halfWPercent = (elRect.width / 2 / zone.width) * 100;
            const halfHPercent = (elRect.height / 2 / zone.height) * 100;

            let xPercent = ((centerX - zone.left) / zone.width) * 100;
            let yPercent = ((centerY - zone.top) / zone.height) * 100;

            xPercent = Math.min(Math.max(xPercent, halfWPercent), 100 - halfWPercent);
            yPercent = Math.min(Math.max(yPercent, halfHPercent), 100 - halfHPercent);

            state.placedZoneXPercent = xPercent;
            state.placedZoneYPercent = yPercent;

        } else {

            state.placed = false;

        }

        layoutItem(state);

    }

    state.el.addEventListener("pointerup", endDrag);
    state.el.addEventListener("pointercancel", endDrag);

}


// ======================================
// INIT
// ======================================

createFoodItems();

window.addEventListener("resize", () => {

  itemStates.forEach((state, index) => {
        state.el.style.width = getItemWidthValue(ITEMS[index].widthVw);
    });

    layoutAll();

});