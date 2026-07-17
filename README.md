# Generative 3D Peony

A complete, generative 3D flower animation built entirely from scratch using [p5.js](https://p5js.org/). This project explores and implements core creative coding concepts to construct a complex, mathematically-driven visual representation of a blooming peony.

## 🌸 Overview

Rather than relying on out-of-the-box 3D engines, this project deconstructs the rendering pipeline. It simulates 3D depth, manages complex animation states, and utilizes off-screen canvases to achieve a unique, stylized generative aesthetic. 

## ✨ Key Features & Techniques

*   **Custom 3D Projection:** Fakes 3D depth and rotation using custom trigonometry and mathematical projections, bypassing native WebGL for complete rendering control.
*   **Double Buffering (Hidden Canvas):** Utilizes off-screen graphics buffers to optimize rendering performance and layer complex visual effects smoothly.
*   **Instance Mode Architecture:** Encapsulates the p5.js sketch to prevent global namespace pollution, ensuring modular and scalable code.
*   **State Machine Lifecycle:** Employs a robust state machine to seamlessly manage the distinct phases of the flower's growth and animation loop.
*   **Pixel Manipulation:** Incorporates raw pixel reading techniques and ASCII art generation for advanced textural outputs.

## 🛠️ Tech Stack

*   **HTML & CSS:** Standard web structure and canvas containment.
*   **Vanilla JavaScript:** Core mathematical logic and state management.
*   **p5.js:** Canvas rendering and creative coding framework.

## 🚀 How to Run

No build tools or servers are required. 

1. Clone or download this repository to your local machine.
2. Open the `index.html` file in any modern web browser.
3. Enjoy the generative animation!
