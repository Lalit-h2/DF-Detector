import tensorflow as tf
import numpy as np
import cv2
import os
from tensorflow.keras.models import load_model

MODEL_PATH = "./model/best_model.keras"
IMG_SIZE = 128
MAX_FRAMES = 20

def load_model_once():
    print("Loading model...")
    model = load_model(MODEL_PATH)
    print("✓ Model loaded")
    return model


def preprocess_video(video_path, max_frames=MAX_FRAMES, img_size=IMG_SIZE):
    """
    Preprocess a single video for prediction.
    Returns numpy array of shape (1, max_frames, img_size, img_size, 3)
    """
    print(f"Loading video: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Cannot open video file")
        cap.release()
        # raise Exception("Cannot open video file")
        return None
    
    # Get total frames
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total / fps if fps > 0 else 0
    
    print(f"Video info - Total frames: {total}, FPS: {fps:.2f}, Duration: {duration:.2f}s")
    
    if total <= 0:
        # Fallback: read all frames sequentially
        print("Warning: Cannot get frame count, reading sequentially...")
        frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (img_size, img_size))
            frames.append(frame)
        cap.release()
        
        if len(frames) == 0:
            print("Error: No frames found in video")
            return None
        
        total = len(frames)
        print(f"Read {total} frames sequentially")
    else:
        # Uniform sampling across video
        indices = np.linspace(0, total - 1, num=max_frames, dtype=np.int32)
        frames = []
        
        print(f"Sampling {max_frames} frames from video...")
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ret, frame = cap.read()
            if not ret or frame is None:
                if len(frames) > 0:
                    frame = frames[-1]  # Repeat last frame
                else:
                    frame = np.zeros((img_size, img_size, 3), dtype=np.uint8)
            else:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame = cv2.resize(frame, (img_size, img_size))
            frames.append(frame)
        
        cap.release()
    
    # Handle frame count
    if len(frames) >= max_frames:
        frames = frames[:max_frames]
    else:
        # Pad with last frame if not enough frames
        print(f"Warning: Video has only {len(frames)} frames, padding to {max_frames}")
        last_frame = frames[-1]
        while len(frames) < max_frames:
            frames.append(last_frame)
    
    # Convert to numpy array and normalize
    video_array = np.stack(frames, axis=0).astype(np.float32) / 255.0
    
    # Add batch dimension
    video_array = np.expand_dims(video_array, axis=0)
    
    print(f"Preprocessed video shape: {video_array.shape}")
    print(f"Value range: [{video_array.min():.3f}, {video_array.max():.3f}]")
    return video_array


# Accept video_path and model
def classify_df(video_path: str, model):
    if not os.path.exists(video_path):
        raise Exception("Video not found")

    video_data = preprocess_video(video_path)

    prediction = model.predict(video_data, verbose=0)
    probability = float(prediction[0][0])

    threshold = 0.5
    is_fake = probability > threshold

    confidence = probability if is_fake else (1 - probability)
    

    return confidence, is_fake






