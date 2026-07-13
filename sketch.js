const sketch = function(p) {
  
  
  let bloom = 0.1;
  let phase = 'growing';
  
  //variable to hold hidden canvas
  let buffer;

  //variable to track our current visual style
  let renderMode =0;
  //string of characters from darkest to brightest
  const density = ' .:-=+*#%@'

  p.setup = function() {
    p.createCanvas(600, 600);
    // Angles in p5 are calculated in radians by default, not degrees.
    // TWO_PI is a built-in variable equal to a full 360-degree circle.

    // 1. First, we CREATE the buffer
    buffer = p.createGraphics(600, 600);
    
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
    buffer.noStroke();

    //center is now relative to the 400x400 buffer
    const centerX = buffer.width / 2;
    const centerY = buffer.height / 2;
    const focal = 420; //simulates camera lens distance

    // Map mouse position to a rotation angle (-1 to 1 radians)
    let mouseRotX = p.map(p.mouseY, 0, p.height, 1.2, -1.2);
    let mouseRotY = p.map(p.mouseX, 0, p.width, -1.8, 1.8);

    //flower parameters
    const layers = 14;
    const maxRadius = 150;
    const ruffleAmt = 12;
    let items = []; //array to hold all our petals bfr drawing
    
    //Generating the layers
    for (let layer = layers; layer >=0;layer--){
      //lr  goes from 0(center) to 1(outer edge)
      const lr = layer/layers;
      //cal how many petals this specific layer needs
      const np = 9 + p.floor(layer * 1.5);
      //inner petals are smaller, outer petals are layer
      const baseR = p.lerp(10, maxRadius, lr);
      //cal the "bowl" shape title of the layer
      let tiltAngle = p.lerp(p.PI * .42, p.PI*0.04, bloom);

      for (let i = 0; i<np; i++){
        //offset the angle so petals overlap organically
        let angle = (p.TWO_PI / np)*i + layer*0.42;

        //1. calculate base 3D coordinates based on tilt and bloom
        let x3 = p.cos(angle) * (baseR * bloom) * p.cos(tiltAngle);
        let z3 = p.sin(angle) * (baseR * bloom) * p.cos(tiltAngle);
        let y3 = -p.sin(tiltAngle) * (baseR * bloom);

        // 2. Apply camera rotation matrix
        let [rx, ry, rz] = rot3D(x3, y3, z3, mouseRotX, mouseRotY);
        
        // 3. Calculate perspective scale
        let scale = focal / (focal + rz);
        let sx = rx * scale;
        let sy = ry * scale;

        // 4. Calculate dynamic lighting based on Z depth and layer position
        let lightAngle = p.sin(angle + layer*0.05);
        let depthDarken = p.map(layer, 0, layers, 0.3, 1.0);
        let lightMod = p.map(lightAngle, -1, 1, 0.4, 1.3)*depthDarken;
        let rCol = p.constrain(p.lerp(230, 255, lr) * lightMod, 0, 255);
        let gCol = p.constrain(p.lerp(130, 210, lr) * lightMod, 0, 255);
        let bCol = p.constrain(p.lerp(170, 235, lr) * lightMod, 0, 255);

        // 5. Calculate specific petal shape parameters
        let pLength = baseR * scale * 1.15;
        let pWidth = baseR * scale * 0.55;
        let rPhase = i * 1.7 + layer * 0.9;
        let pAngle = p.atan2(ry, rx); // Angle to point the petal outwards

        //push all this data to our array instead of drawing imm
        items.push({ 
          z: rz, x: sx, y: sy, angle: pAngle, 
          pl: pLength, pw: pWidth, phase: rPhase, 
          r: rCol, g: gCol, b: bCol 
        });
      }
    }

    //DEPT SORTING (Painter's Algo)
    //sort array so items furthest away (highest Z)are at the beginning
    items.sort((a,b)=>b.z-a.z);

    //Drawing petals
    buffer.push();
    buffer.translate(centerX, centerY+48); //move center slightly downward

    for (let it of items){
      buffer.push();
      buffer.translate(it.x, it.y);
      buffer.rotate(it.angle);

      buffer.fill(it.r,it.g,it.b);
      buffer.stroke(0,0,0,60);
      buffer.strokeWeight(1.5);

      //draw the custom ruffled petal shape using vetices
      buffer.beginShape();
      //draw top half of the petal curve
      for (let tt = 0; tt <= 1; tt += 0.1) {
        let px = tt * it.pl;
        let bW = p.sin(tt * p.PI) * it.pw;
        let ruf = p.sin(tt * 8 + it.phase) * ruffleAmt * 1* tt;
        buffer.vertex(px, bW + ruf);
      }
      // Draw bottom half of the petal curve
      for (let tt = 1; tt >= 0; tt -= 0.1) {
        let px = tt * it.pl;
        let bW = p.sin(tt * p.PI) * it.pw;
        let ruf = p.sin(tt * 8 + it.phase + p.PI) * ruffleAmt * 1 * tt;
        buffer.vertex(px, -bW + ruf);
      }
      buffer.endShape(p.CLOSE);
      buffer.pop();
    }
    buffer.pop();

    // --- THE GENERATIVE LOOP ---
    // A 'for' loop runs a specific block of code multiple times in one frame.
    // for (let i = 0; i < numPetals; i++) {
    //   // Calculate the angle for this specific petal
    //   // We divide a full circle (TWO_PI) by the number of petals, then multiply by 'i'
    //   let angle = (p.TWO_PI / numPetals) * i;

    //   //calculate flat 3D circle (y=0)
    //   let x3D = p.cos(angle)*(maxRadius*bloom);
    //   let y3D = 0;
    //   let z3D = p.sin(angle)*(maxRadius*bloom);

    //   //applying the rotation matrix to our coordinates
    //   let [rx,ry,rz] = rot3D(x3D, y3D, z3D, mouseRotX, mouseRotY);

    //   //perspective projection: shrink coordinates based on Z dept
    //   let scale = focal / (focal +rz);

    //   //map 3D points back to 2D screen coordinates
    //   let screenX = centerX + (rx*scale);
    //   let screenY = centerY + (ry*scale);

    //   //dynamic lighting
    //   //map Z-dept to brightness. Closer (negative rz) = brighter
    //   let lightMod = p.map(rz, -100, 100, 1.4,0.2);

    //   let r = p.constrain(255 * lightMod, 0, 255);
    //   let g = p.constrain(100 * lightMod, 0, 255);
    //   let b = p.constrain(150 * lightMod, 0, 255);

    //   buffer.fill(r,g,b);
    //   buffer.circle(screenX, screenY, 40*scale);
    // }

    //pixel reading & ASCII Rendering
    //cmd p5 to load the current fram's pixel data iinto memory
    buffer.loadPixels();

    //multi- model rendering engine
    const gridSize = 8;

    // Calculate dynamic offsets to perfectly center the buffer on any screen size
    const offsetX = (p.width - buffer.width) / 2; 
    const offsetY = (p.height - buffer.height) / 2;

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
              p.fill(r,g,b);
              if(renderMode === 0){
                //map 0-255 brightness to a number btwn 0and the len of our string
                const charIndex = p.floor(p.map(brightness, 0, 255, 0, density.length -1));
                const asciiChar = density.charAt(charIndex);

                //color the txt to match the pixel and draw it
                p.text(asciiChar, x + offsetX, y);
              }else if (renderMode === 1){
                // MODE 1: DOTS
                // Size is influenced by brightness so lighter areas have bigger dots
                const d = gridSize * (0.2 + brightness * 0.0035);
                p.noStroke();
                p.ellipse(x + offsetX, y, d, d);
              } else if (renderMode === 2){
                // MODE 2: SOLID BLOCKS
                p.rectMode(p.CENTER);
                p.noStroke();
                // Draw a square slightly smaller than the grid size to create a mosaic
                p.rect(x + offsetX, y, gridSize * 0.9, gridSize * 0.9);
              }
            }
        }
    }

    // //display the buffer
    // //hidden buffer onto the main canvas like photograph
    // p.image(buffer, 100,0); //(imageobj, xPosition, yPosition)

    // --- THE STATE MACHINE (from Stage 3) ---
    if (phase === 'growing') {
      bloom += 0.005;
      if (bloom >= 1) phase = 'shrinking'; 
    }else if (phase === 'shrinking') {
      bloom -= 0.005;
      if (bloom <= 0.1) phase = 'growing';
    }
  };
  
  //keyboard interactivity
  //built-in p5 function fires whenever a key is pressed
  p.keyPressed = function(){
    if(p.key === 'm' || p.key === 'M'){
      //renderMode++. the %3 ensure it loops back to 0 after hitting 2
      renderMode = (renderMode + 1)% 3;
    }
  };

  p.windowResized = function () {
    p.resizeCanvas (p.windowWidth, p.windowHeight);
  }
};

new p5(sketch, document.getElementById('p5-container'));