from http.client import HTTPException
from io import BytesIO
import json
from typing import Union
from image_processor import Base64ImageProcessor
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, ImageEnhance, ImageTk
import numpy as np
import cv2
import base64



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specify your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGE = None

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.post("/upload/")
async def upload_image(image: UploadFile = File(...)):
    global IMAGE
    try:
        # Read the image content directly from the uploaded file
        contents = await image.read()

        # Decode the image using cv2.imdecode (adjust as needed)
        decoded_image = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

        if decoded_image is None:
            raise HTTPException(status_code=404, detail="Impossible de lire l'image.")
        
        IMAGE = decoded_image
        print(IMAGE.shape)
        # You can process or store the decoded_image here (optional)
        return {"message": "Image téléchargée avec succès."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/histogram/")
async def get_histogram(base64_image: str = Form(...)):
    processor = Base64ImageProcessor(base64_image)

    result = processor.calculate_histogram()

    if isinstance(result, tuple):  # Check if it's a tuple (indicating 3 values) -> colored image
        hist_blue, hist_green, hist_red = result
        
        return JSONResponse(content={"hist_blue": hist_blue.tolist(),
                                 "hist_green": hist_green.tolist(),
                                 "hist_red": hist_red.tolist()})
    else: # if image is black and white
        return JSONResponse(content={"hist": result.tolist()})
    


@app.post("/detect_edges/")
async def get_edges(base64_image: str = Form(...), threshold1: str= Form(...), threshold2: str = Form(...)):
    threshold1 = int(threshold1)
    threshold2 = int(threshold2)
    processor = Base64ImageProcessor(base64_image)
    processor.detect_edges(threshold1, threshold2)
    return {"message": "Filtre de edge detection appliqué avec succès.", "base64_image": processor.get_base64_image()}


@app.post("/adjust_contrast/")
async def adjust_contrast(base64_image: str = Form(...), contrast_level: str = Form(...)):
    try:
        # Assurez-vous d'utiliser les mêmes arguments dans la fonction
        processor = Base64ImageProcessor(base64_image)
        processor.adjust_contrast(float(contrast_level))

        # Return the base64 encoded image in the response
        return JSONResponse(content={
            "message": "Contraste ajusté avec succès.",
            "adjusted_image_base64": processor.get_base64_image()
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/adjust_luminance/")
async def adjust_luminance(base64_image: str = Form(...), luminance_level: str = Form(...)):
    try:
        # Assurez-vous d'utiliser les mêmes arguments dans la fonction
        processor = Base64ImageProcessor(base64_image)
        processor.adjust_luminance(float(luminance_level))

        # Return the base64 encoded image in the response
        return JSONResponse(content={
            "message": "Luminance ajustée avec succès.",
            "adjusted_image_base64": processor.get_base64_image()
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/filter/grayscale")
async def apply_grayscale_filter(base64_image: str = Form(...)):
    processor = Base64ImageProcessor(base64_image)
    processor.convert_to_grayscale()
    return {"message": "Filtre de conversion en niveaux de gris appliqué avec succès.", "base64_image": processor.get_base64_image()}


@app.post("/edit_image")
async def apply_edits(base64_image: str = Form(...), edits: str = Form(...)):
    json_edits = json.loads(edits)
    for method_name, args in json_edits.items():
        obj = Base64ImageProcessor(base64_image)
        if 'enabled' not in args:
            continue
        if not args['enabled']:
            continue
        if hasattr(obj, method_name):
            method = getattr(obj, method_name)
            if callable(method):
                args.pop('enabled')
                args = {k.lower(): v for k, v in args.items()}
                method(**args)
                base64_image = obj.get_base64_image()
        
    return {"message": "Éditions appliquées avec succès.", "base64_image": base64_image}