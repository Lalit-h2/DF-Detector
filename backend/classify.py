import tensorflow as tf
import numpy as np
import cv2
import os
from tensorflow.keras.models import load_model


MODEL_PATH = r"best_model.keras"
VIDEO_PATH = r"test_video.mp4"

IMG_SIZE = 128
MAX_FRAMES = 20


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


def classify_df():
	try:
		model = load_model(MODEL_PATH)
		print("✓ Model loaded successfully!")
		print(f"Model input shape: {model.input_shape}")
		print(f"Model output shape: {model.output_shape}")
	except Exception as e:
		print(f"✗ Error loading model: {e}")
		raise e

	print("\n" + "="*70)
	print("PREPROCESSING VIDEO")
	print("="*70)

	if not os.path.exists(VIDEO_PATH):
		print(f"✗ Error: Video file not found at {VIDEO_PATH}")
		raise Exception("Video not found")

	video_data = preprocess_video(VIDEO_PATH, max_frames=MAX_FRAMES, img_size=IMG_SIZE)

	if video_data is None:
		print("✗ Error: Failed to preprocess video")
		raise Exception("Failed to preprocess video")
	# ============================================================================
	# MAKE PREDICTION
	# ============================================================================
	print("\n" + "="*70)
	print("MAKING PREDICTION")
	print("="*70)

	print("Running inference...")
	prediction = model.predict(video_data, verbose=0)
	probability = prediction[0][0]

	print(f"\nRaw prediction probability: {probability:.6f}")
     
	print("\n" + "="*70)
	print("RESULTS")
	print("="*70)

	threshold = 0.5
	is_fake :bool = probability > threshold

	print(f"Threshold: {threshold}")
	print(f"Probability of FAKE: {probability:.2%}")
	print(f"Probability of REAL: {(1-probability):.2%}")

	print("\n" + "-"*70)
	if is_fake:
		confidence = probability
		print(f"🚨 PREDICTION: FAKE (Deepfake detected)")
		print(f"   Confidence: {confidence:.2%}")
		
		# Confidence levels
		if confidence > 0.9:
			print(f"   ⚠️  Very high confidence - likely a deepfake")
		elif confidence > 0.7:
			print(f"   ⚠️  High confidence - probably a deepfake")
		elif confidence > 0.5:
			print(f"   ⚠️  Moderate confidence - might be a deepfake")
	else:
		confidence:float = 1 - probability
		print(f"✓ PREDICTION: REAL (Authentic video)")
		print(f"  Confidence: {confidence:.2%}")
		
		# Confidence levels
		if confidence > 0.9:
			print(f"  ✓ Very high confidence - likely authentic")
		elif confidence > 0.7:
			print(f"  ✓ High confidence - probably authentic")
		elif confidence > 0.5:
			print(f"  ✓ Moderate confidence - might be authentic")

	print("-"*70)
	score=confidence  
	return score,"Fake Video" if is_fake else "Real Video"






# # ============================================================================
# # LOAD MODEL
# # ============================================================================
# print("="*70)
# print("DEEPFAKE DETECTION - VIDEO TESTING")
# print("="*70)

# print(f"\nLoading model from: {MODEL_PATH}")




# # ============================================================================
# # INTERPRET RESULTS
# # ============================================================================


# # ============================================================================
# # ADDITIONAL ANALYSIS (OPTIONAL)
# # ============================================================================
# print("\n" + "="*70)
# print("ADDITIONAL ANALYSIS")
# print("="*70)

# # Test with different thresholds
# thresholds = [0.3, 0.5, 0.7, 0.9]
# print("\nPrediction at different thresholds:")
# for thresh in thresholds:
#     result = "FAKE" if probability > thresh else "REAL"
#     print(f"  Threshold {thresh:.1f}: {result}")


# # Provide interpretation guide
# print("\n" + "="*70)
# print("INTERPRETATION GUIDE")
# print("="*70)
# print("""
# How to interpret the results:

# 1. Probability Score:
#    - 0.0 - 0.3: Likely REAL video
#    - 0.3 - 0.5: Uncertain, leaning REAL
#    - 0.5 - 0.7: Uncertain, leaning FAKE
#    - 0.7 - 1.0: Likely FAKE video

# 2. Confidence Levels:
#    - Very High (>90%): Strong evidence
#    - High (70-90%): Good evidence
#    - Moderate (50-70%): Weak evidence, manual review recommended

# 3. Important Notes:
#    - This is a binary classifier (FAKE vs REAL)
#    - No model is 100% accurate
#    - Consider multiple factors beyond this prediction
#    - Video quality and length affect accuracy
#    - For critical decisions, use multiple detection methods
# """)

# print("="*70)
# print("Testing complete!")
# print("="*70)


# # ============================================================================
# # SAVE RESULTS TO FILE (OPTIONAL)
# # ============================================================================
# save_results = input("\nDo you want to save results to a text file? (y/n): ").strip().lower()

# if save_results == 'y':
#     output_file = "prediction_results.txt"
#     with open(output_file, 'w') as f:
#         f.write("="*70 + "\n")
#         f.write("DEEPFAKE DETECTION RESULTS\n")
#         f.write("="*70 + "\n\n")
#         f.write(f"Video: {VIDEO_PATH}\n")
#         f.write(f"Model: {MODEL_PATH}\n")
#         f.write(f"Date: {np.datetime64('now')}\n\n")
#         f.write(f"Prediction: {'FAKE' if is_fake else 'REAL'}\n")
#         f.write(f"Confidence: {(probability if is_fake else 1-probability):.2%}\n")
#         f.write(f"Fake Probability: {probability:.6f}\n")
#         f.write(f"Real Probability: {(1-probability):.6f}\n")
    
#     print(f"✓ Results saved to {output_file}")