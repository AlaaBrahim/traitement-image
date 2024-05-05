from http.client import HTTPException
from typing import Union
from image_processor import Base64ImageProcessor
from processing import plot_rgb_histogram, detect_edges
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageEnhance, ImageTk
import numpy as np
import cv2



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specify your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

image = None

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.post("/upload/")
async def upload_image(imageUploaded: UploadFile = File(...)):

    global image

    try:
        # Lire l'image à partir de "imageUploaded" (passée en paramètre)
        contents = await imageUploaded.read()

        decoded_image = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

        # Si image non trouvée, retourner erreur
        if decoded_image is None:
            raise HTTPException(status_code=404, detail="Impossible de lire l'image.")

        # Affecter l'image décodée dans la variable globale image
        image = decoded_image
        return {"message": "Image téléchargée avec succès."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/histogram/")
async def get_histogram():

    try:
        # Vérifier si l'image est chargée
        if image is None:
            raise HTTPException(status_code=404, detail="Impossible de lire l'image.")
        
        # Afficher l'histogramme
        plot_rgb_histogram(image)
        
        return {"message": "Histogramme affiché avec succès."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/detect_edges/")
async def get_edges(threshold1 = 30, threshold2 = 100):
    global image
    try:
        if image is None:
            raise HTTPException(status_code=404, detail="Impossible de lire l'image.")
        detect_edges(image, threshold1, threshold2)

        return {"message":"Contours détectés avec succès."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/adjust_contrast/")
async def adjust_contrast(contrast_level: float = Query(..., ge=0, le=100)):
    print("Contrast Level: ", contrast_level)
    image = None
    try:
        # Vérifier si l'image est chargée
        if image is None:
            raise HTTPException(status_code=404, detail="Impossible de lire l'image.")
        
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(contrast_level/50)
        
        return {"message": "Contraste ajusté avec succès."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/adjust_luminance/")
async def adjust_luminance(luminance_level: float = Query(..., ge=0, le=100)):
    try:
        # Vérifier si l'image est chargée
        if image is None:
            raise HTTPException(status_code=404, detail="Impossible de lire l'image.")
        
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(luminance_level/50)
        
        return {"message": "Luminance ajustée avec succès."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/filter/greyscale")
async def apply_greyscale_filter(base64_image: str = Form(...)):
    processor = Base64ImageProcessor(base64_image)
    return processor.convert_to_grayscale()