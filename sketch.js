const sketch = function(p) {
  
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

 p.draw = function() {
    p.background(0); 

    //drawing to the hidden buffer
    buffer.background(0); //dark gray
    buffer.fill(255, 100, 150); 
    buffer.noStroke();

    //center is now relative to the 400x400 buffer
    const centerX = buffer.width / 2;
    const centerY = buffer.height / 2;

    // --- THE GENERATIVE LOOP ---
    
    // A 'for' loop runs a specific block of code multiple times in one frame.
    for (let i = 0; i < numPetals; i++) {
      // 1. Calculate the angle for this specific petal
      // We divide a full circle (TWO_PI) by the number of petals, then multiply by 'i'
      let angle = (p.TWO_PI / numPetals) * i;
      // 2. Apply Trig to find the exact X and Y on the ring
      let x = centerX + (ringRadius * p.cos(angle));
      let y = centerY + (ringRadius * p.sin(angle));
      // 3. Draw the petal at that location
      buffer.circle(x, y, 30);
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
            const g = buffer.pixels[index+1];
            const b = buffer.pixels[index+2];

            //cal avg brightness (0 to 255)
            const brightness = (r+g+b)/3;

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
      ringRadius += 2;
      if (ringRadius >= 150) phase = 'shrinking'; 
    }else if (phase === 'shrinking') {
      ringRadius -= 2;
      if (ringRadius <= 0) phase = 'growing';
    }

  };
};

new p5(sketch, document.getElementById('p5-container'));