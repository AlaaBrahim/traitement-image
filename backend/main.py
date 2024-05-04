from http.client import HTTPException
from typing import Union
from processing import plot_rgb_histogram
from fastapi import FastAPI, File, UploadFile, HTTPException
import numpy as np
import cv2

app = FastAPI()
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

        # Décoder l'image à partir du tampon mémoire contents en une image OpenCV:
        # np.frombuffer(contents, np.uint8) crée un tableau NumPy à partir de contents,
        # np.uint8 spécifie le type de données comme des entiers non signés de 8 bits (representation de l'image),
        # cv2.IMREAD_COLOR indique que l'image doit être lue en RGB
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