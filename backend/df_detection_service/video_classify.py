import torch
import torch.nn as nn
import torchvision.transforms as T
import numpy as np
import cv2
import os
import timm

# ── Model config (must match training) ────────────────────────────────────────
MODEL_PATH = "./model/best_model.pth"
FRAME_SIZE = 224
SEQ_LEN    = 16
DEVICE     = torch.device("cpu")   # switch to "cuda" if GPU is available

# ── ImageNet normalisation used during training ────────────────────────────────
_INFERENCE_TRANSFORM = T.Compose([
    T.ToPILImage(),
    T.Resize((FRAME_SIZE, FRAME_SIZE)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std =[0.229, 0.224, 0.225]),
])


# ── Model definition (must match training exactly) ────────────────────────────
class DeepfakeDetector(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = timm.create_model(
            "efficientnet_b0", pretrained=False, num_classes=0
        )
        self.lstm = nn.LSTM(1280, 256, batch_first=True)
        self.fc   = nn.Linear(256, 1)

    def forward(self, x):
        B, T, C, H, W = x.shape
        x    = x.view(B * T, C, H, W)
        feat = self.backbone(x)           # (B*T, 1280)
        feat = feat.view(B, T, -1)        # (B, T, 1280)
        out, _ = self.lstm(feat)          # (B, T, 256)
        out  = out[:, -1]                 # last timestep
        return self.fc(out)               # (B, 1)  – raw logit


def load_model_once() -> DeepfakeDetector:
    """Load weights once at startup and return the model in eval mode."""
    print("Loading PyTorch model …")
    model = DeepfakeDetector()
    state = torch.load(MODEL_PATH, map_location=DEVICE)

    # Support both raw state-dicts and checkpoint dicts
    if isinstance(state, dict) and "model_state_dict" in state:
        state = state["model_state_dict"]

    model.load_state_dict(state)
    model.to(DEVICE)
    model.eval()
    print("✓ Model loaded")
    return model


# ── Video pre-processing ──────────────────────────────────────────────────────
def preprocess_video(video_path: str,
                     seq_len: int = SEQ_LEN) -> torch.Tensor | None:
    """
    Uniformly sample *seq_len* frames from the video, apply inference
    transforms and return a tensor of shape (1, seq_len, 3, 224, 224).
    Returns None if the video cannot be opened or is empty.
    """
    print(f"Loading video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: cannot open video file")
        cap.release()
        return None

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    fps   = cap.get(cv2.CAP_PROP_FPS)
    dur   = total / fps if fps > 0 else 0
    print(f"Video info – frames: {total}, FPS: {fps:.2f}, duration: {dur:.2f}s")

    frames: list[np.ndarray] = []

    if total <= 0:
        # Fallback: read sequentially when frame count is unavailable
        print("Warning: frame count unavailable – reading sequentially")
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame)
        cap.release()
    else:
        indices = np.linspace(0, total - 1, num=seq_len, dtype=np.int32)
        print(f"Sampling {seq_len} frames uniformly …")
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ret, frame = cap.read()
            if not ret or frame is None:
                frame = frames[-1] if frames else \
                        np.zeros((FRAME_SIZE, FRAME_SIZE, 3), dtype=np.uint8)
            else:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame)
        cap.release()

    if len(frames) == 0:
        print("Error: no frames extracted")
        return None

    # Pad / truncate to exactly seq_len frames
    while len(frames) < seq_len:
        frames.append(frames[-1])
    frames = frames[:seq_len]

    # Apply per-frame transform and stack → (seq_len, 3, 224, 224)
    tensors = torch.stack([_INFERENCE_TRANSFORM(f) for f in frames])
    # Add batch dimension → (1, seq_len, 3, 224, 224)
    return tensors.unsqueeze(0).to(DEVICE)


# ── Main classification entry-point ──────────────────────────────────────────
def classify_df(video_path: str, model: DeepfakeDetector) -> tuple[float, bool]:
    """
    Classify a video as real or fake.

    Returns
    -------
    confidence : float
        Probability score for the predicted class (0–1).
    is_fake : bool
        True if the video is classified as a deepfake.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")

    video_tensor = preprocess_video(video_path)
    if video_tensor is None:
        raise ValueError(f"Could not extract frames from: {video_path}")

    with torch.no_grad():
        logit = model(video_tensor)           # (1, 1)
        probability = torch.sigmoid(logit).item()

    threshold = 0.5
    is_fake   = probability > threshold
    confidence = probability if is_fake else (1.0 - probability)

    print(f"Result – probability: {probability:.4f}, "
          f"is_fake: {is_fake}, confidence: {confidence:.4f}")
    return confidence, is_fake
