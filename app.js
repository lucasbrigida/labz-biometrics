// Constants
// ------------------------------------------------------------
const MAX_TIME_EVALUATION = 60 * 1000; // 60 seconds
const THROTTLE_TIME = 100; // 0.3 seconds

// Variables
// ------------------------------------------------------------
let movements = [];
let positions = [];
let distances = [];
let pressures = [];
let pressureAvg = 0;
let dS = 0;
let dT = 0;
let maxVelocity = 0;
let clickTimes = [];
let clickVelAvg = 0;
let pointerType = "";
var heatmap;
let intervals = [];
let session = {
  movements: [],
  clicks: [],
  velocities: []
};

// Custom functions
// ------------------------------------------------------------
function onPointerMove(event) {
  const x = event.x;
  const y = event.y;

  heatmap.addData({ x, y });
  movements.push(event);
}

function onPointerDown(event) {
  const x = event.x;
  const y = event.y;

  pressures.push(event.pressure);
  session.clicks.push([x, y]);
  clickTimes.push(event.timeStamp);

  heatmap.addData({ x, y });
}

function clearMeasures(type) {
  switch (type) {
    case "pointermove": {
      movements = [];
      positions = [];
      distances = [];
      dS = 0;
      dT = 0;
      break;
    }
    case "pointerdown": {
      pressures = [];
      break;
    }
    default: {
      clearMeasures('pointermove');
      clearMeasures('pointerdown');
      break;
    }
  }
}

function measureMovements() {
  distances = [];
  times = [];

  // Valida se ao menos dois movimentos
  if (!movements.length) {
    clearMeasures("pointermove");
    return;
  }

  if (movements.length === 1) {
    clearMeasures("pointermove");
    return;
  }

  // Determina o tipo de dispositivo
  if (!pointerType.length && movements[0].pointerType) {
    pointerType = movements[0].pointerType;
  }

  // Calcula as distâncias dos movimentos
  for (let i = 1; i < movements.length; i++) {
    const A = movements[i - 1];
    const B = movements[i];

    const [x1, y1] = [A.clientX, A.clientY];
    const [x2, y2] = [B.clientX, B.clientY];

    session.movements.push([x1, y1]);

    distances.push(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
  }

  // Calcula o tempo decorrido
  const timeStampA = movements[0].timeStamp;
  const timeStampB = movements[movements.length - 1].timeStamp;
  const duration = timeStampB - timeStampA;

  // Distância (px)
  dS = distances.reduce((a, b) => a + b);
  maxVelocity = Math.max(maxVelocity, dS);
  session.velocities.push(dS);

  // Tempo decorrido (s)
  dT = duration / 1000;

  movements = [];
}

function measurePressure() {
  pressureAvg = pressures.length
    ? pressures.reduce((a, b) => a + b) / pressures.length
    : pressureAvg;

  clearMeasures("pointerdown");
}

function measureClickVelocity() {
  const _times = clickTimes.map(time => Number((time/1000).toFixed(2)));

  if (!_times.length) {
    return;
  }

  const times = _times.reduce((a, b) => b - a);
  clickVelAvg = (times / _times.length).toFixed(2);
}

function showInfo() {
  document.querySelector("#velocity .value").innerText = (dS / 1).toFixed(2);
  document.querySelector("#pressure .value").innerText = pressureAvg;
  document.querySelector("#pointer-type .value").innerText = pointerType;
  document.querySelector("#max-velocity .value").innerText = maxVelocity.toFixed(2);
  document.querySelector("#movements .value").innerText = session.movements.length;
  document.querySelector("#clicks .value").innerText = session.clicks.length;
  document.querySelector("#clicks-velocity .value").innerText = clickVelAvg;
}

function onStop() {
  document.querySelector("#heatmap").style.visibility = 'hidden';
  document.querySelector("#stop-btn").style.display = 'none';
  document.querySelector("#start-btn").style.display = 'block';

  document.removeEventListener("pointerdown", onPointerDown, false);
  document.removeEventListener("pointermove", onPointerMove, false);

  clearMeasures();
  for (const interval of intervals) {
    clearInterval(interval);
  }
}

function onStart() {
  document.querySelector("#heatmap").style.visibility = 'visible';
  document.querySelector("#start-btn").style.display = 'none';
  document.querySelector("#stop-btn").style.display = 'block';

  document.addEventListener("pointerdown", onPointerDown, false);
  document.addEventListener("pointermove", onPointerMove, false);

  main();
}

// Setup
// ------------------------------------------------------------
function setup() {
  document.getElementById("start-btn").addEventListener("click", onStart, false);
  document.getElementById("stop-btn").addEventListener("click", onStop, false);

  heatmap = h337.create({
    container: document.querySelector("#heatmap"),
  });
}

// Main
// ------------------------------------------------------------
function main() {
  // Cálculo de movimentos
  intervals.push(setInterval(measureMovements, 1000));

  // Cálculo de pressão
  intervals.push(setInterval(measurePressure, 1000));

  // Exibe informações
  intervals.push(setInterval(showInfo, 1000));

  // Cálculo de intervalo de click
  intervals.push(setInterval(measureClickVelocity, 1000));
}

// Document Listeners
// ------------------------------------------------------------
document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "interactive") {
    setup();
  // } else if (event.target.readyState === "complete") {
  //   main();
  }
});
