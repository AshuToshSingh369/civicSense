from fastapi import FastAPI, File, UploadFile, HTTPException
from ultralytics import YOLO
import io
from PIL import Image
import os
import uvicorn

app = FastAPI(title="CivicSense YOLO API")


MODEL_PATH = r'c:\Users\ashut\OneDrive\Desktop\A\civicsense\best (1).pt\best (1).pt'
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model file not found at {MODEL_PATH}")

print(f"Loading YOLO model from {MODEL_PATH}...")
model = YOLO(MODEL_PATH)

@app.get("/")
async def root():
    return {"message": "CivicSense YOLO API is running", "model": "best_model.pt"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        
        results = model(image)
        
        
        detections = []
        highest_severity = 3 
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                
                cls_id = int(box.cls[0])
                label = model.names[cls_id]
                conf = float(box.conf[0])
                
                
                xyxy = box.xyxy[0].tolist()
                
                detections.append({
                    "class": label,
                    "confidence": conf,
                    "bbox": xyxy
                })
                
                
                
                
                if label.lower() in ['fire', 'accident', 'danger', 'critical']:
                    highest_severity = 5
                elif label.lower() in ['pothole', 'leak', 'flood']:
                    highest_severity = max(highest_severity, 4)

        return {
            "threatLevel": "Critical" if highest_severity == 5 else ("High" if highest_severity == 4 else "Medium"),
            "severityScore": highest_severity * 2, 
            "detectedObjects": list(set([d["class"] for d in detections])),
            "confidence": float(results[0].boxes.conf.mean()) if len(detections) > 0 else 0,
            "detections": detections,
            "isDuplicate": False,
            "flaggedForReview": False
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
