const sketch = function(p) {
  
  let ringRadius = 0;
  let phase = 'growing';
  
  // How many petals do we want in our ring?
  const numPetals = 12;

  p.setup = function() {
    p.createCanvas(600, 400);
    // Angles in p5 are calculated in radians by default, not degrees.
    // TWO_PI is a built-in variable equal to a full 360-degree circle.
  };

  p.draw = function() {
    p.background(0); 
    p.fill(255, 100, 150); 
    p.noStroke();

    const centerX = p.width / 2;
    const centerY = p.height / 2;

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
      p.circle(x, y, 30);
    }

    // --- THE STATE MACHINE (from Stage 3) ---
    
    if (phase === 'growing') {
      ringRadius += 2;
      if (ringRadius >= 150) {
        phase = 'shrinking'; 
      }
    } 
    else if (phase === 'shrinking') {
      ringRadius -= 2;
      if (ringRadius <= 0) {
        phase = 'growing';
      }
    }

  };
};

new p5(sketch, document.getElementById('p5-container'));``