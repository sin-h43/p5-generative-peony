const sketch = function(p) {
  
  
  let bloom = 0;
  let ringRadius = 0;
  let phase = 'growing';
  
  const numPetals = 12;
  //variable to hold hidden canvas
  let buffer;
  //string of characters from darkest to brightest
  const density = ' .:-=+*#%@'

  p.setup = function() {
    p.createCanvas(600, 400);
    // Angles in p5 are calculated in radians by default, not degrees.
    // TWO_PI is a built-in variable equal to a full 360-degree circle.

    // 1. First, we CREATE the buffer
    buffer = p.createGraphics(400, 400);
    
    // 2. ONLY THEN can we modify the buffer's canvas settings
    buffer.canvas.getContext('2d', { willReadFrequently: true });

    //set up text formatting for the main canvas
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.textFont('Courier New');
  };

  //custom 3d math engine
  //cal new x,y,z coordinates based on cam rotation
  function rot3D(x, y, z, rotX, rotY) {
    // 1. Rotate around X-axis (Pitch)
    let ry = y * p.cos(rotX) - z * p.sin(rotX);
    let rz = y * p.sin(rotX) + z * p.cos(rotX);
    
    // 2. Rotate around Y-axis (Yaw)
    let rx = x * p.cos(rotY) + rz * p.sin(rotY);
    let finalZ = -x * p.sin(rotY) + rz * p.cos(rotY);
    
    return [rx, ry, finalZ];
  }

 p.draw = function() {
    p.background(0); 

    //drawing to the hidden buffer
    buffer.background(0); //dark gray
    buffer.fill(255, 100, 150); 
    buffer.noStroke();

    //center is now relative to the 400x400 buffer
    const centerX = buffer.width / 2;
    const centerY = buffer.height / 2;
    const focal = 300; //simulates camera lens distance
    const maxRadius = 120; //max size of the flower

    // Map mouse position to a rotation angle (-1 to 1 radians)
    let mouseRotX = p.map(p.mouseY, 0, p.height, 1, -1);
    let mouseRotY = p.map(p.mouseX, 0, p.width, -1, 1);
    
    // --- THE GENERATIVE LOOP ---
    // A 'for' loop runs a specific block of code multiple times in one frame.
    for (let i = 0; i < numPetals; i++) {
      // Calculate the angle for this specific petal
      // We divide a full circle (TWO_PI) by the number of petals, then multiply by 'i'
      let angle = (p.TWO_PI / numPetals) * i;

      //calculate flat 3D circle (y=0)
      let x3D = p.cos(angle)*(maxRadius*bloom);
      let y3D = 0;
      let z3D = p.sin(angle)*(maxRadius*bloom);

      //applying the rotation matrix to our coordinates
      let [rx,ry,rz] = rot3D(x3D, y3D, z3D, mouseRotX, mouseRotY);

      //perspective projection: shrink coordinates based on Z dept
      let scale = focal / (focal +rz);

      //map 3D points back to 2D screen coordinates
      let screenX = centerX + (rx*scale);
      let screenY = centerY + (ry*scale);

      //dynamic lighting
      //map Z-dept to brightness. Closer (negative rz) = brighter
      let lightMod = p.map(rz, -100, 100, 1.4,0.2);

      let r = p.constrain(255 * lightMod, 0, 255);
      let g = p.constrain(100 * lightMod, 0, 255);
      let b = p.constrain(150 * lightMod, 0, 255);

      buffer.fill(r,g,b);
      buffer.circle(screenX, screenY, 40*scale);
    }

    //pixel reading & ASCII Rendering
    //cmd p5 to load the current fram's pixel data iinto memory
    buffer.loadPixels();

    //spacing for our ASCII characters
    const gridSize = 12;
    const offsetX = 100;

    //scan the buffer in a grid (y first, then x)
    for(let y=0; y<buffer.height; y+=gridSize){
        for(let x=0; x<buffer.width; x+=gridSize){
            //formula to find the starting index of a specific pixel in the 1D array
            const index = (x + y * buffer.width)*4;

            //extract the RGB values
            const r = buffer.pixels[index];
            const g = buffer.pixels[index + 1];
            const b = buffer.pixels[index + 2];

            //cal avg brightness (0 to 255)
            const brightness = (r + g + b) / 3;

            //only draw a char if the pixel isn't part of the black  bg
            if (brightness > 10) {
                //map 0-255 brightness to a number btwn 0and the len of our string
                const charIndex = p.floor(p.map(brightness, 0, 255, 0, density.length -1));
                const asciiChar = density.charAt(charIndex);

                //color the txt to match the pixel and draw it
                p.fill(r,g,b);
                p.text(asciiChar, x + offsetX, y);
            }
        }
    }

    // //display the buffer
    // //hidden buffer onto the main canvas like photograph
    // p.image(buffer, 100,0); //(imageobj, xPosition, yPosition)

    // --- THE STATE MACHINE (from Stage 3) ---
    if (phase === 'growing') {
      bloom += 0.02;
      if (bloom >= 1) phase = 'shrinking'; 
    }else if (phase === 'shrinking') {
      bloom -= 0.02;
      if (bloom <= 0) phase = 'growing';
    }

  };
};

new p5(sketch, document.getElementById('p5-container'));