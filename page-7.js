let bottomImg = new Image();
let topImg = new Image();

let canvas = document.getElementById("revealCanvas");
let ctx = canvas.getContext("2d");

let brushSize = 120;

let loaded = 0;



// ==============================
// CANVAS SIZE
// ==============================

function resizeCanvas() {

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

}



resizeCanvas();




// ==============================
// LOAD IMAGES
// ==============================


bottomImg.src = "IMG-6.png"; // COLOR IMAGE
topImg.src = "IMG-7.png";    // BLACK & WHITE IMAGE



function imageLoaded() {

  loaded++;

  if (loaded === 2) {

    drawImages();

  }

}



bottomImg.onload = imageLoaded;
topImg.onload = imageLoaded;





// ==============================
// DRAW INITIAL BLACK & WHITE IMAGE
// ==============================


function drawImages() {


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  drawCover(topImg);


}





// ==============================
// OBJECT-FIT: COVER
// ==============================


function drawCover(img) {


  let canvasRatio = canvas.width / canvas.height;

  let imageRatio = img.width / img.height;


  let width;
  let height;
  let x;
  let y;



  if (canvasRatio > imageRatio) {


    // Screen wider than image

    width = canvas.width;

    height = canvas.width / imageRatio;


    x = 0;

    y = (canvas.height - height) / 2;



  } else {


    // Screen taller than image

    height = canvas.height;

    width = canvas.height * imageRatio;


    x = (canvas.width - width) / 2;

    y = 0;


  }



  ctx.drawImage(
    img,
    x,
    y,
    width,
    height
  );


}





// ==============================
// REVEAL COLOR IMAGE
// ==============================


function reveal(x, y) {


  ctx.save();



  ctx.beginPath();


  ctx.arc(
    x,
    y,
    brushSize / 2,
    0,
    Math.PI * 2
  );


  ctx.clip();



  // Reveal color version

  drawCover(bottomImg);



  ctx.restore();


}






// ==============================
// DESKTOP DRAGGING
// ==============================


canvas.addEventListener(
  "mousemove",
  function(e) {


    if (e.buttons) {


      reveal(
        e.clientX,
        e.clientY
      );


    }


  }
);






// ==============================
// MOBILE DRAGGING
// ==============================


canvas.addEventListener(
  "touchmove",
  function(e) {


    e.preventDefault();



    let touch = e.touches[0];



    reveal(
      touch.clientX,
      touch.clientY
    );



  },

  {
    passive:false
  }

);






// ==============================
// RESIZE
// ==============================


window.addEventListener(
  "resize",
  function() {


    resizeCanvas();


    if (loaded === 2) {

      drawImages();

    }


  }
);