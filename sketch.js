// logical file. p5.js relies on two foundation function: setup() runs once and draw() runs on loop.

const sketch = function(p) {
    let circleX =0;

    p.setup = function(){
        p.createCanvas(600,400);
    };

    p.draw = function(){
        p.background(0);
        p.fill(255,100,150);
        p.noStroke();
        p.circle(circleX, 200, 50);
        circleX += 2;

        if (circleX > p.width +25){
            circleX = -25;
        };
    };
};

new p5(sketch, document.getElementById('p5-container'));