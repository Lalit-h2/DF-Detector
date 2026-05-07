from video_classify import load_model_once, classify_df

model = load_model_once()

video_path = "test.mp4"   # put a sample video here

confidence, is_fake = classify_df(video_path, model)

print("Fake:", is_fake)
print("Confidence:", confidence)