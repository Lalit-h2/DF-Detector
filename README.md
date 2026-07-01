# DeepShield

DeepShield is a deepfake video detection platform that analyzes videos using deep learning to determine whether they are authentic or synthetically generated. Unlike image-only detectors, DeepShield performs both **spatial** and **temporal** analysis, allowing it to detect inconsistencies that appear across sequences of video frames.

The detection pipeline is built around a hybrid **CNN-LSTM architecture**, where a convolutional neural network extracts visual features from individual frames while a Long Short-Term Memory (LSTM) network learns temporal relationships between consecutive frames. This combination enables the model to identify subtle artifacts introduced by modern deepfake generation techniques.

## Why CNN + LSTM?

A single video frame may appear completely realistic, making frame-by-frame classification unreliable for many modern deepfakes.

DeepShield therefore analyzes two complementary aspects of a video:

### Spatial Analysis

Each frame is processed independently using **EfficientNet-B0**, which extracts high-level visual features such as:

- facial texture inconsistencies
- blending artifacts
- lighting anomalies
- compression artifacts
- image quality irregularities

### Temporal Analysis

The extracted frame features are then passed to an **LSTM (Long Short-Term Memory)** network.

Instead of analyzing frames independently, the LSTM learns how facial movements evolve over time and identifies temporal inconsistencies such as:

- unnatural eye blinking
- inconsistent facial expressions
- abnormal head movements
- flickering artifacts
- frame-to-frame identity inconsistencies

The final prediction is produced using a binary classifier that outputs:

- **Real**
- **Fake**

along with a confidence score.

## Training Dataset

The detection model is trained using multiple publicly available deepfake datasets to improve generalization across different generation methods.

### FaceForensics++

Contains manipulated videos generated using multiple face manipulation techniques, including:

- DeepFakes
- FaceSwap
- Face2Face
- NeuralTextures

### Celeb-DF

A high-quality dataset consisting of realistic celebrity deepfake videos with significantly fewer visual artifacts than earlier datasets.

### DFDC (DeepFake Detection Challenge)

One of the largest publicly available deepfake datasets released by Facebook AI, containing thousands of manipulated videos created using multiple synthesis pipelines.

### DeeperForensics
DeeperForensics is a large-scale deepfake dataset designed to improve the robustness of detection models under real-world conditions. It contains manipulated face-swapped videos generated using deepfake techniques and includes a wide range of perturbations such as varying lighting, compression levels, blur, and color distortions. These variations help train models that generalize better to videos encountered outside controlled benchmark datasets.

---

## Features

- User authentication using JWT
- Video upload and analysis
- Deepfake prediction (Real/Fake)
- Confidence score generation
- User analysis history
- Video hash-based result caching
- REST API backend
- gRPC communication with ML inference service
- Microservice architecture
- Docker-based deployment

---

## System Architecture

```
                        +----------------+
                        | React Frontend |
                        +-------+--------+
                                |
                           HTTP / REST
                                |
                                ▼
                     +----------------------+
                     | Go Backend Service   |
                     +----------+-----------+
                                |
              +-----------------+-----------------+
              |                                   |
              ▼                                   ▼
     PostgreSQL Database                Python ML Service
                                               |
                                               ▼
                                   EfficientNet-B0 + LSTM
```

The backend acts as the orchestration layer between the frontend, the database, and the machine learning inference service.

---

## Detection Pipeline

```
User uploads video
        │
        ▼
Backend receives video
        │
        ▼
Generate video hash
        │
        ▼
Check cached result
        │
  ┌─────┴────────┐
  │              │
Cached       Not Cached
Result           │
  │              ▼
  │      Send video to ML service
  │              │
  │              ▼
  │      Frame Extraction
  │              ▼
  │       Frame Preprocessing
  │              ▼
  │     EfficientNet-B0 Features
  │              ▼
  │      LSTM Sequence Model
  │              ▼
  │      Binary Classification
  │              ▼
  │      Confidence Score
  │              ▼
  │     Store Result in Database
  │
  └──────────────▼
      Return Prediction
```

---

## Deep Learning Pipeline

DeepShield employs a hybrid CNN-LSTM architecture.

### Spatial Feature Extraction

- EfficientNet-B0
- Extracts frame-level visual features
- Detects subtle image manipulation artifacts

### Temporal Sequence Modeling

- Long Short-Term Memory (LSTM)
- Learns relationships between consecutive video frames
- Detects temporal inconsistencies commonly found in deepfakes

### Classification

The extracted features are passed through a binary classification layer that predicts:

- Real
- Fake

along with a confidence score.

---

## Video Hash-Based Caching

DeepShield avoids repeatedly analyzing identical videos.

```
Video
   │
   ▼
Generate Hash
   │
   ▼
Hash Exists?
   │
 ┌─┴──────┐
 │        │
Yes      No
 │        │
 ▼        ▼
Return   ML Analysis
Cached      │
Result      ▼
        Save Result
```

Benefits include:

- Reduced inference time
- Lower computational cost
- Improved scalability
- Reduced GPU workload

---

## Technology Stack

| Component | Technology |
|----------|------------|
| Frontend | React.js |
| Backend | Go (Golang) |
| Machine Learning | Python |
| Deep Learning | PyTorch |
| Database | PostgreSQL |
| Communication | REST + gRPC |
| Containerization | Docker & Docker Compose |
| Version Control | Git |

---

## Repository Structure

```
DeepShield/
│
├── frontend/                     # React web application
│
├── backend/
│   ├── proto/                    # Shared protobuf definitions
│   ├── main_service/             # Go backend service
│   └── df_detection_service/     # Python ML inference service
│
├── notebooks/                    # Model training notebooks
│
├── compose.yaml                  # Backend deployment
│
└── README.md
```

---

## Services

### Frontend

Responsible for:

- User interface
- Authentication pages
- Video upload
- Visualization of predictions
- Analysis history

---

### Backend (Go)

Responsible for:

- Authentication
- User management
- Video upload handling
- Video hashing
- Database operations
- gRPC communication
- Result caching

Documentation:

```
backend/main_service/README.md
```

---

### Machine Learning Service

Responsible for:

- Video preprocessing
- Frame extraction
- Feature extraction
- Temporal modeling
- Deepfake classification

The service exposes a gRPC API consumed by the backend.

---

### PostgreSQL

Stores:

- User information
- Video metadata
- Detection results
- Video hashes
- User analysis history

---

## Dataset

The model is trained using publicly available deepfake datasets including:

- FaceForensics++
- Celeb-DF
- DFDC (DeepFake Detection Challenge)

---

## Deployment

Backend services are orchestrated using Docker Compose.

The compose configuration starts:

- PostgreSQL
- Go Backend Service
- Python Detection Service

```bash
docker compose up --build
```

The React frontend is containerized separately using the `Containerfile` located in the `frontend` directory.







