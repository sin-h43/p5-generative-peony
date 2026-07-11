// logical file. p5.js relies on two foundation function: setup() runs once and draw() runs on loop.

function setup() {
    //creates a drawing canvas 600 pixels wide and 400 pixels tall
    createCanvas(600,400);
}    

function draw(){
    //redraw the bg every frame to erase the prev circpe
    background(0);

    //sets the inside color of the shapes drawn after it (RGB)
    fill(255,100,150);

    //removes the outline of the shape drawn after it
    noStroke();

    //draws a circle at (x,y,diameter)
    circle(circleX,200,50);

    //updates the position for the next frame to create movement
    circleX += 2;

    //resets the posi if it goes off the right edge
    if(circleX > width+25){
        circleX = -25;
    }
}