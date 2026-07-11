// logical file. p5.js relies on two foundation function: setup() runs once and draw() runs on loop.

const sketch = function(p) {
    let circleSize =0;
    let phase = 'growing';
    let waitTimer = 0;

    p.setup = function(){
        p.createCanvas(600,400);
    };

    p.draw = function(){
        p.background(0);
        p.fill(255,100,150);
        p.noStroke();

        p.circle(p.width / 2, p.height / 2, circleSize);
        
        if(phase === 'growing'){
            circleSize += 2;
            //condition of transition for next phase
            if(circleSize >= 200){
                phase = 'waiting';
                waitTimer = 0;
            }
        }
        else if (phase === 'waiting'){
            waitTimer++;
            //~60 framer per second, 60frames = 1 sec
            if(waitTimer >=60){
                phase = 'shrinking';
            }            
        }
        else if (phase === 'shrinking') {
        circleSize = circleSize - 2;
        
        // Condition to loop back to the beginning
            if (circleSize <= 0) {
                phase = 'growing';
            }
        }
    };
};

new p5(sketch, document.getElementById('p5-container'));