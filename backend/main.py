from http.client import HTTPException
from io import BytesIO
from typing import Union
from image_processor import Base64ImageProcessor
from processing import calculate_histogram, detect_edges
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




# @app.post("/upload/")
# async def upload_image(imageUploaded: UploadFile = File(...)):
#     global image
#     try:
#         # Lire l'image à partir de "imageUploaded" (passée en paramètre)
#         contents = await imageUploaded.read()

#         decoded_image = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

#         # Si image non trouvée, retourner erreur
#         if decoded_image is None:
#             raise HTTPException(status_code=404, detail="Impossible de lire l'image.")
        
#         # Affecter l'image décodée dans la variable globale image
#         image = decoded_image
#         return {"message": "Image téléchargée avec succès."}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

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



@app.get("/histogram/")
# async def get_histogram(base64_image: str = Form(...)):
async def get_histogram(base64_image: str = Form(...)):
    # Read the contents of the file
    # contents = await file.read()
    
    # Convert the contents to base64
    # base64_image = base64.b64encode(contents).decode("utf-8")
    # print(base64_image)
    processor = Base64ImageProcessor(base64_image)

    result = processor.calculate_histogram()

    if isinstance(result, tuple):  # Check if it's a tuple (indicating 3 values)
        hist_blue, hist_green, hist_red = result
        # Handle the 3 values
        print("Value 1:", value1)
        print("Value 2:", value2)
        print("Value 3:", value3)
        
        return JSONResponse(content={"hist_blue": hist_blue.tolist(),
                                 "hist_green": hist_green.tolist(),
                                 "hist_red": hist_red.tolist()})
    else:
        # Handle the single value
        print("Single value:", result)
        return JSONResponse(content={"hist": result.tolist()})
    


@app.get("/detect_edges/")
async def get_edges(base64_image: str = Form(...), threshold1: int = 30, threshold2: int = 100):
    processor = Base64ImageProcessor(base64_image)
    processor.detect_edges(threshold1, threshold2)
    return {"message": "Filtre de edge detection appliqué avec succès.", "base64_image": processor.get_base64_image()}



@app.get("/adjust_contrast/")
async def adjust_contrast(contrast_level: float = Query(..., ge=0, le=100)):
    global IMAGE

    try:
        # Vérifier si l'image est chargée
        if IMAGE is None:
            raise HTTPException(status_code=404, detail="Impossible de lire l'image.")

        # Convert the image to a PIL Image object
        pil_image = Image.fromarray(IMAGE)

        # Adjust the contrast of the image
        enhancer = ImageEnhance.Contrast(pil_image)
        adjusted_image = enhancer.enhance(contrast_level / 50)

        # Encode the adjusted image as a base64 string
        buffered = BytesIO()
        adjusted_image.save(buffered, format="PNG")
        base64_image = base64.b64encode(buffered.getvalue()).decode('utf-8')


        # Return the base64 encoded image in the response
        return {
            "message": "Contraste ajusté avec succès.",
            "adjusted_image_base64": base64_image
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.get("/adjust_luminance/")
async def adjust_luminance(luminance_level: float = Query(..., ge=0, le=100)):
    global IMAGE
    try:
         # Vérifier si l'image est chargée
        if IMAGE is None:
            raise HTTPException(status_code=404, detail="Impossible de lire l'image.")

        # Convert the image to a PIL Image object
        pil_image = Image.fromarray(IMAGE)

        # Adjust the contrast of the image
        enhancer = ImageEnhance.Brightness(pil_image)
        adjusted_image = enhancer.enhance(luminance_level/50)

        # Encode the adjusted image as a base64 string
        buffered = BytesIO()
        adjusted_image.save(buffered, format="PNG")
        base64_image = base64.b64encode(buffered.getvalue()).decode('utf-8')

        # Return the base64 encoded image in the response
        return {
            "message": "Luminance ajustée avec succès.",
            "adjusted_image_base64": base64_image
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/filter/grayscale")
async def apply_grayscale_filter(base64_image: str = Form(...)):
    processor = Base64ImageProcessor(base64_image)
    processor.convert_to_grayscale()
    return {"message": "Filtre de conversion en niveaux de gris appliqué avec succès.", "base64_image": processor.get_base64_image()}