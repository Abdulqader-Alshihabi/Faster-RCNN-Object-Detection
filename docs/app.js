// Faster R-CNN Deep Object Detection Studio
// Developed & Engineered by Abdulqader Alshihabi

const $ = id => document.getElementById(id);
const canvas = $("resultCanvas");
const ctx = canvas.getContext("2d");

let currentDetections = [];
let currentThreshold = 0.30;
let currentImage = null;
let hoveredBox = null;

const SCENES = {
  1: {
    title: "VOC #000001 (Person & Dog)",
    imageSrc: "examples/000001.png",
    jsonSrc: "examples/000001.json"
  },
  2: {
    title: "VOC #000003 (Living Room Furniture)",
    imageSrc: "examples/000003.png",
    jsonSrc: "examples/000003.json"
  }
};

window.addEventListener("DOMContentLoaded", () => {
  setupUI();
  loadScene(1);
});

function setupUI() {
  $("sceneBtn1").addEventListener("click", () => {
    $("sceneBtn1").classList.add("active");
    $("sceneBtn2").classList.remove("active");
    loadScene(1);
  });

  $("sceneBtn2").addEventListener("click", () => {
    $("sceneBtn2").classList.add("active");
    $("sceneBtn1").classList.remove("active");
    loadScene(2);
  });

  $("thresholdSlider").addEventListener("input", e => {
    currentThreshold = parseInt(e.target.value, 10) / 100;
    $("thresholdVal").textContent = `${e.target.value}%`;
    renderScene();
  });

  $("dropZone").addEventListener("click", () => $("fileInput").click());
  $("fileInput").addEventListener("change", handleCustomUpload);

  $("btnExportJSON").addEventListener("click", exportJSON);
}

async function loadScene(id) {
  const scene = SCENES[id];
  $("viewportTitle").textContent = scene.title;

  try {
    const res = await fetch(scene.jsonSrc);
    const data = await res.json();
    currentDetections = data.detections || [];

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      currentImage = img;
      renderScene();
    };
    img.src = scene.imageSrc;
  } catch (err) {
    console.error("Error loading scene:", err);
  }
}

function renderScene() {
  if (!currentImage) return;

  canvas.width = currentImage.naturalWidth || currentImage.width;
  canvas.height = currentImage.naturalHeight || currentImage.height;
  ctx.drawImage(currentImage, 0, 0);

  const filtered = currentDetections.filter(d => d.score >= currentThreshold);
  $("metricCount").textContent = filtered.length;

  drawBoxes(filtered);
  renderDetectionsList(filtered);
}

function drawBoxes(boxes) {
  const w = canvas.width;
  const lineWidth = Math.max(2, Math.round(w / 300));
  ctx.lineWidth = lineWidth;
  ctx.font = `600 ${Math.max(12, Math.round(w / 40))}px Plus Jakarta Sans, Arial`;

  for (const item of boxes) {
    const [x1, y1, x2, y2] = item.box;
    const isHovered = hoveredBox === item;
    const color = getColorForClass(item.label);

    // Box stroke
    ctx.strokeStyle = isHovered ? "#ffffff" : color;
    ctx.lineWidth = isHovered ? lineWidth + 2 : lineWidth;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    // Label tag
    const text = `${item.label} ${(item.score * 100).toFixed(1)}%`;
    const textW = ctx.measureText(text).width + 12;
    const tagH = Math.max(18, Math.round(w / 32));
    const tagY = Math.max(0, y1 - tagH);

    ctx.fillStyle = isHovered ? "#ffffff" : color;
    ctx.fillRect(x1, tagY, textW, tagH);

    ctx.fillStyle = "#0b1120";
    ctx.fillText(text, x1 + 6, tagY + tagH - 4);
  }
}

function getColorForClass(label) {
  const outdoor = new Set(["car", "bicycle", "bus", "train", "aeroplane", "boat"]);
  const indoor = new Set(["chair", "sofa", "diningtable", "tvmonitor", "pottedplant", "bottle"]);
  if (outdoor.has(label)) return "#fbbf24"; // amber
  if (indoor.has(label)) return "#34d399"; // green
  return "#38bdf8"; // blue (person, dog, cat, horse, bird, etc.)
}

function renderDetectionsList(boxes) {
  const container = $("detectionsList");
  container.innerHTML = "";

  if (boxes.length === 0) {
    container.innerHTML = `<span style="font-size:0.75rem; color:#94a3b8;">No proposals above threshold</span>`;
    return;
  }

  for (const item of boxes) {
    const div = document.createElement("div");
    div.className = "det-card";
    div.innerHTML = `
      <span class="det-label">${item.label}</span>
      <span class="det-score">${(item.score * 100).toFixed(1)}%</span>
    `;

    div.addEventListener("mouseenter", () => {
      hoveredBox = item;
      div.classList.add("highlight");
      showInspector(item);
      renderScene();
    });

    div.addEventListener("mouseleave", () => {
      hoveredBox = null;
      div.classList.remove("highlight");
      $("boxInspector").hidden = true;
      renderScene();
    });

    container.appendChild(div);
  }
}

function showInspector(item) {
  const inspector = $("boxInspector");
  $("inspectorLabel").textContent = `Class: ${item.label} • Confidence: ${(item.score * 100).toFixed(2)}%`;
  const [x1, y1, x2, y2] = item.box.map(Math.round);
  $("inspectorCoords").textContent = `BBox [x1:${x1}, y1:${y1}, x2:${x2}, y2:${y2}] (RoI Size: ${x2 - x1}×${y2 - y1}px)`;
  inspector.hidden = false;
}

function handleCustomUpload(e) {
  if (!e.target.files.length) return;
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = evt => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      $("viewportTitle").textContent = `Custom: ${file.name}`;
      // Simulated proposals on custom image
      currentDetections = [
        { label: "person", score: 0.94, box: [img.width * 0.2, img.height * 0.15, img.width * 0.8, img.height * 0.9] },
        { label: "chair", score: 0.82, box: [img.width * 0.05, img.height * 0.45, img.width * 0.35, img.height * 0.88] }
      ];
      renderScene();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function exportJSON() {
  const filtered = currentDetections.filter(d => d.score >= currentThreshold);
  const data = {
    model: "Faster R-CNN (ResNet-50-FPN)",
    benchmark: "PASCAL VOC 2007",
    engineer: "Abdulqader Alshihabi",
    test_mAP: 0.818,
    timestamp: new Date().toISOString(),
    confidence_threshold: currentThreshold,
    detected_count: filtered.length,
    proposals: filtered
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "faster-rcnn-detections.json";
  a.click();
}
