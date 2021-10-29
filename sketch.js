let wWidth; // the width of the window
let wHeight; // the height of the window

let xPoint; // c, r
let yPoint; // c, i
let zoomPerKlick = 2.0; // must be 2 by now
let zoom;
let xMin;
let yMin;
let xMax;
let yMax;

let xNew = 0; // z, r
let yNew = 0; // z, i
let xOld = 0;
let yOld = 0;

let iteration = 0;
let maxIterations = 2048;

let realRow = 0;
let rowsPerStep = 25;

let xMouse;
let yMouse;

let mandelbrot;

let drawMandelbrot = "Calculate&Draw";

function setup() {
  createCanvas(400, 400);
  wWidth = width;
  wHeight = height;

  pixelDensity(1);


  zoom = int(sqrt(wWidth * wHeight) / 6);

  xMin = -wWidth / zoom / 2;
  xMax = wWidth / zoom / 2;
  yMin = -wHeight / zoom / 2;
  yMax = wHeight / zoom / 2;

  mandelbrot = Array(wHeight);

  for (let i = 0; i < mandelbrot.length; i++) {
    mandelbrot[i] = Array(wWidth);
  }


  background(30);
  colorMode(HSB, 255);
}

function mousePressed() {
  xMouse = mouseX;
  yMouse = mouseY;
  if (drawMandelbrot == "WaitUntilClick") {
    drawMandelbrot = "DrawZoomed";
  } else if (drawMandelbrot == "Calculate&Draw") {
    drawMandelbrot = "WaitUntilFinished";
  }
}

function calculateColor(_colorVal) {
  /*
  if (_colorVal < maxIterations) {
    return color(_colorVal % 256, 32 + noise(0.1 * _colorVal + 100) * 223, 32 + noise(0.1 * _colorVal) * 223);
  } else {
    return color(0, 0, 0);
  }
  */
  
  
  colorMode(HSB, 255);
  let col;
  
  if (_colorVal < maxIterations) {
    
    col = color((_colorVal * 1.5) % 256, 32 + noise(0.1 * _colorVal) * 223, 32 + noise(0.1 * _colorVal + 10) * 223);
    //col = color((0.4 * _colorVal) % 256, 150 + cos(0.02 * _colorVal) * 100.0, 150 + sin(0.02 * _colorVal) * 100.0);
    
  } else {
    col = color(0, 0, 0);
  }
  
  return {
    red: red(col),
    green: green(col),
    blue: blue(col)
  };
  
}


function draw() {

  if (drawMandelbrot == "Calculate&Draw" || drawMandelbrot == "WaitUntilFinished") {

    loadPixels();
    for (let row = 0; row < rowsPerStep; row++) {
      if (realRow >= wHeight) {
        realRow = 0;
        if (drawMandelbrot == "Calculate&Draw") {
          drawMandelbrot = "WaitUntilClick";
        } else {
          drawMandelbrot = "DrawZoomed";
        }
      } else if (drawMandelbrot == "Calculate&Draw" || drawMandelbrot == "WaitUntilFinished") {

        for (let clm = 0; clm < wWidth; clm++) {

          xPoint = xMin + clm * (xMax - xMin) / wWidth;
          yPoint = yMin + realRow * (yMax - yMin) / wHeight;

          iteration = 0;

          xNew = 0;
          yNew = 0;

          while (iteration < maxIterations && xNew * xNew + yNew * yNew <= 4) {

            xOld = xNew;
            yOld = yNew;

            xNew = xOld * xOld - yOld * yOld + xPoint;
            yNew = 2 * xOld * yOld + yPoint;
            iteration++;
          }

          mandelbrot[realRow][clm] = iteration;
          let index = 4 * (realRow * wWidth + clm);
          
          let col = calculateColor(iteration);
          
          pixels[index] = col.red;
          pixels[index + 1] = col.green;
          pixels[index + 2] = col.blue;
          pixels[index + 3] = 255;
        }

        realRow++;

      }
    }

    updatePixels();

    if (drawMandelbrot == "Calculate&Draw" || drawMandelbrot == "WaitUntilFinished") {
      colorMode(RGB, 255);
      strokeWeight(2);
      stroke(0, 255, 0);
      line(0, realRow + 2, wWidth, realRow + 2);
    }


  } else if (drawMandelbrot == "DrawZoomed") {

    background(30);
    for (let row = 0; row < wHeight; row++) {
      for (let clm = 0; clm < wWidth; clm++) {

        noStroke();
        let col;
        col = calculateColor(mandelbrot[row][clm]);
        colorMode(RGB, 255);
        fill(col.red, col.green, col.blue);
        rect(
          map(clm, 0, wWidth, -xMouse, wWidth * 2.0 - xMouse) - 1.0, 
          map(row, 0, wHeight, -yMouse, wHeight * 2.0 - yMouse) - 1.0,
          3.0,
          3.0);
      }
    }
    zoom *= zoomPerKlick;

    xMin = map(float(xMouse), -wWidth / 2.0, 1.5 * float(wWidth) - 1.0, xMin, xMax) - float(wWidth) / zoom / 2.0;
    xMax = xMin + float(wWidth) / zoom;
    yMin = map(float(yMouse), -wHeight / 2.0, 1.5 * float(wHeight) - 1.0, yMin, yMax) - float(wHeight) / zoom / 2.0;
    yMax = yMin + float(wHeight) / zoom;

    drawMandelbrot = "Calculate&Draw";
  }
}