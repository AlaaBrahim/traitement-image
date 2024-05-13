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


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/histogram/")
async def get_histogram(base64_image: str = Form(...)):
    processor = Base64ImageProcessor(base64_image)

    result = processor.calculate_histogram()

    if isinstance(result, tuple):  # Check if it's a tuple (indicating 3 values) -> colored image
        hist_blue, hist_green, hist_red = result
        return JSONResponse(content={"hist_blue": hist_blue.tolist(),
                                 "hist_green": hist_green.tolist(),
                                 "hist_red": hist_red.tolist(), "type":"rgb"})
    else: # if image is black and white
        result = [int(i) for i in result]
        return JSONResponse(content={"hist": result, "type":"bw"})
    


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