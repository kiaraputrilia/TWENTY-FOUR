// ======================================
// PAGE 10 — CLICK IMAGE TO CYCLE THROUGH VIDEOS
// ======================================

const screenContainer = document.getElementById("screenContainer");
const screenImage = document.getElementById("screenImage");
const bgVideo = document.getElementById("bgVideo");
const bgVideoSource = document.getElementById("bgVideoSource");

// list your 5 video filenames here, in the order they should cycle
const videoSources = [
    "VIDEO-1.mov",
    "VIDEO-2.MOV",
    "VIDEO-3.MP4",
    "VIDEO-4.MOV",
    "VIDEO-5.mov"
];

// 0 = hidden (showing IMG-11, no video)
// 1..5 = showing IMG-12 with videoSources[index - 1] playing
let state = 0;

const TOTAL_STATES = videoSources.length + 1; // 6 total: hidden + 5 videos


function updateScreen() {

    if (state === 0) {

        screenImage.src = "IMG-11.png";

    } else {

        screenImage.src = "IMG-12.png";

        const newSrc = videoSources[state - 1];

        // only reload the video if the source actually changed,
        // to avoid an unnecessary restart/flicker
        if (bgVideoSource.getAttribute("src") !== newSrc) {

            bgVideoSource.setAttribute("src", newSrc);
            bgVideo.load();
            bgVideo.play();

        }

    }

}

screenContainer.addEventListener("click", () => {

    state = (state + 1) % TOTAL_STATES;

    updateScreen();

});

// set initial state on load
updateScreen();