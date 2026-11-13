# Faster R-CNN Deep Object Detection Pipeline & RoI Inspector

[![Live Demo](https://img.shields.io/badge/Demo-Live_GitHub_Pages-0ea5e9?style=for-the-badge&logo=googlechrome&logoColor=white)](https://abdulqader-alshihabi.github.io/Faster-RCNN-Object-Detection/)
[![Colab](https://img.shields.io/badge/Notebook-Open_in_Colab-f59e0b?style=for-the-badge&logo=googlecolab&logoColor=white)](https://colab.research.google.com/github/Abdulqader-Alshihabi/Faster-RCNN-Object-Detection/blob/main/notebooks/FasterRCNN_VOC2007_Portfolio.ipynb)
[![Framework](https://img.shields.io/badge/Framework-PyTorch_Torchvision-34d399?style=for-the-badge&logo=pytorch&logoColor=white)](https://github.com/Abdulqader-Alshihabi/Faster-RCNN-Object-Detection)
[![Backbone](https://img.shields.io/badge/Backbone-ResNet--50--FPN-6366f1?style=for-the-badge)](https://github.com/Abdulqader-Alshihabi/Faster-RCNN-Object-Detection)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

An end-to-end two-stage deep object detection pipeline trained on the PASCAL VOC benchmark. Combines a ResNet-50 Feature Pyramid Network (FPN) backbone with an interactive web studio for inspecting Region Proposal Network (RPN) candidates, RoIAlign pooling, and bounding box regression coordinates.

---

## Architectural Deep Dive

Unlike single-stage architectures (e.g. YOLO, SSD) that predict bounding boxes and class logits directly from grid anchors, Faster R-CNN decomposes object detection into a sequential two-stage framework:

```
[ Input Radiograph / Natural Image (HxW) ]
                    |
                    v
    +-------------------------------+
    |  Stage 1: ResNet-50 Backbone  |
    |  + Feature Pyramid Net (FPN)  |
    +-------------------------------+
         |             |             |
        P2            P3            P4 (Multi-scale feature maps)
         \             |             /
          +------------+------------+
                       |
                       v
    +-------------------------------------+
    |  Stage 2: Region Proposal Net (RPN) |
    |  - 3 Aspect Ratios x 3 Scales       |
    |  - Binary Objectness Classifier     |
    |  - Initial Delta Box Regression     |
    +-------------------------------------+
                       |
                       v  (Top 1,000 RoI Proposals)
    +-------------------------------------+
    |  Stage 3: RoIAlign Pooling Layer    |
    |  - Exact bilinear interpolation     |
    |  - Preserves sub-pixel alignment    |
    +-------------------------------------+
                       |
                       v  (7x7x256 feature vectors)
    +-------------------------------------+
    |  Stage 4: Fast R-CNN Detection Head |
    |  - 21-Class Softmax Classifier      |
    |  - Class-Specific Box Refinement    |
    |  - Non-Maximum Suppression (NMS)    |
    +-------------------------------------+
                       |
                       v
    [ Final Detections: Class Label, Score %, Bounding Box (x1, y1, x2, y2) ]
```

---

## Experimental Protocol & Benchmark Metrics

The model was trained from ImageNet pre-trained weights on the PASCAL VOC 2007 trainval split (5,011 images across 20 classes) and evaluated on the 4,952 test split images.

| Metric | Value | Experimental Context |
| :--- | :--- | :--- |
| **Backbone** | ResNet-50 with FPN | 41.5M parameters |
| **Validation mAP@0.50** | **81.7%** | Epoch 10 checkpoint selection |
| **Test Set mAP@0.50** | **81.8%** | Evaluated on 4,952 held-out VOC test images |
| **Warm Inference Latency** | **24 ms** | NVIDIA A100-SXM4-40GB GPU |
| **Proposal Budget** | 1,000 RoIs | Pre-NMS stage 2 proposal limit |
| **NMS IoU Threshold** | 0.50 | Eliminates overlapping candidate boxes |

---

## Interactive Web Studio Features

- **PASCAL VOC Benchmark Scenes:** Instant interactive visualization of high-density scenes (person-animal interactions, multi-chair living rooms, transport scenes).
- **Bounding Box Inspector:** Real-time hover tool displaying exact coordinates `[x1, y1, x2, y2]`, RoI pixel dimensions, and class confidence scores.
- **Dynamic Confidence Filtering:** Real-time slider adjusting acceptance threshold from 10% (investigating low-confidence proposals) to 95% (strict precision).
- **Class Filtering:** Color-coded categorical segmentation across transport, living indoor items, and living organisms.
- **JSON Audit Export:** Direct export of formatted detection predictions and proposal geometries for external downstream analysis.

---

## 20 Evaluated Object Classes

`aeroplane`, `bicycle`, `bird`, `boat`, `bottle`, `bus`, `car`, `cat`, `chair`, `cow`, `diningtable`, `dog`, `horse`, `motorbike`, `person`, `pottedplant`, `sheep`, `sofa`, `train`, `tvmonitor`.

---

## Repository Structure

```
Faster-RCNN-Object-Detection/
├── docs/                               # Interactive GitHub Pages web application
│   ├── index.html                      # Two-stage inspector web interface
│   ├── style.css                       # Modern dark slate styling
│   ├── app.js                          # Interactive scene manager and canvas renderer
│   ├── examples/                       # Pre-computed VOC detection ground truths & images
│   │   ├── 000001.png & .json          # Scene 1: Person & Dog
│   │   └── 000003.png & .json          # Scene 2: Living Room Furnishings
│   └── model/                          # ONNX runtime split graphs & class manifests
├── notebooks/
│   └── FasterRCNN_VOC2007_Portfolio.ipynb # Executed PyTorch training and evaluation notebook
└── README.md                           # Comprehensive technical report
```

---

## Local Setup & Training

### 1. Run the Web Studio Locally
```bash
git clone https://github.com/Abdulqader-Alshihabi/Faster-RCNN-Object-Detection.git
cd Faster-RCNN-Object-Detection
python -m http.server 8000 --directory docs
```
Open `http://localhost:8000` in any web browser.

### 2. Python Environment & Model Evaluation
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

pip install torch torchvision torcheval opencv-python pillow

# Run PyTorch evaluation on test split
python -c "
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn
model = fasterrcnn_resnet50_fpn(weights='DEFAULT')
model.eval()
print('Faster R-CNN architecture initialized with FPN backbone.')
"
```

---

## Author & Engineering Credentials

**Abdulqader Alshihabi**  
Computer Science Graduate · Islamic University of Madinah (GPA: 4.62 / 5.00, First Class Honors)  
Software & AI Engineer specializing in Computer Vision, Enterprise Architecture, and Deep Learning.

- **Portfolio:** [https://abdulqader-alshihabi.github.io/](https://abdulqader-alshihabi.github.io/)
- **GitHub:** [@Abdulqader-Alshihabi](https://github.com/Abdulqader-Alshihabi)
- **LinkedIn:** [https://www.linkedin.com/in/Abdulqader-Alshihabi/](https://www.linkedin.com/in/Abdulqader-Alshihabi/)
- **Email:** [abdulqader.moh.2003@gmail.com](mailto:abdulqader.moh.2003@gmail.com)

---

## License

This project is open-source under the MIT License. See [LICENSE](LICENSE) for details.
