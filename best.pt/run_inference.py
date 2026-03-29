from ultralytics import YOLO
import os
import shutil

def run_inference():
    
    
    
    
    model_path = r'c:\Users\ashut\OneDrive\Desktop\A\civicsense\best (1).pt\best (1).pt'
    
    print(f"Loading model from: {model_path}")
    model = YOLO(model_path)
    
    
    source_dir = r'c:\Users\ashut\OneDrive\Desktop\A\civicsense\backend\uploads'
    
    
    output_dir = r'c:\Users\ashut\OneDrive\Desktop\A\civicsense\best.pt\results'
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)
    
    print(f"Scanning for images in: {source_dir}")
    images = [f for f in os.listdir(source_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    if not images:
        print("No images found in the uploads directory.")
        return

    print(f"Found {len(images)} images. Running inference...")
    
    for img_name in images:
        img_path = os.path.join(source_dir, img_name)
        print(f"Processing: {img_name}...")
        try:
            results = model(img_path)
            
            
            for r in results:
                
                
                r.save(filename=os.path.join(output_dir, f"detected_{img_name}"))
        except Exception as e:
            print(f"Failed to process {img_name} (skipping): {e}")
            
    print(f"\nDetection complete! Results saved in: {output_dir}")

if __name__ == "__main__":
    run_inference()
