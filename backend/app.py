from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import tempfile   # ✅ NEW

from classify import classify_df, load_model_once

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once
model = load_model_once()

@app.get("/test")
def test():
    return {"message": "working"}

@app.post("/upload")
async def process_video(file: UploadFile = File(...)):
    temp_path = None   # keep reference for cleanup

    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            temp_path = tmp.name
            shutil.copyfileobj(file.file, tmp)

        # Run inference using temp file
        score, label = classify_df(temp_path, model)

        return {
            "label": label,
            "confidence": round(score, 4)
        }

    except Exception as err:
        print(err)
        return JSONResponse(
            status_code=500,
            content={"error": str(err)}
        )

    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
