import base64
import numpy as np
from PIL import Image
from io import BytesIO
import cv2
import matplotlib.pyplot as plt



# Classe qui permet de manipuler une image au format base64
class Base64ImageProcessor:
    # Initialisation avec une image en base64
    def __init__(self, base64_image):
        self.base64_image = base64_image
        self.image, self.image_format = self.base64_to_image(base64_image)

    # Convertir une chaîne de base64 en objet image
    def base64_to_image(self, base64_str):
        # Extraire le header et la partie encodée de la chaîne base64
        header, encoded = base64_str.split(',', 1)
        
        # Déterminer le format de l'image à partir du header
        if "image/png" in header:
            image_format = "PNG"
        elif "image/jpeg" in header:
            image_format = "JPEG"
        elif "image/gif" in header:
            image_format = "GIF"
        else:
            raise ValueError("Format d'image non pris en charge")

        # Décoder les données base64 en octets et créer une image
        image_bytes = base64.b64decode(encoded)
        image = Image.open(BytesIO(image_bytes))
        return image, image_format

    # Convertir un objet image en base64
    def image_to_base64(self, image):
        # Convertir l'image en octets avec le format correct
        buffered = BytesIO()
        image.save(buffered, format=self.image_format)
        # Encoder les octets en base64
        base64_bytes = base64.b64encode(buffered.getvalue())
        # Créer la nouvelle chaîne base64 avec le header original
        header = self.get_image_header()
        base64_str = f"{header},{base64_bytes.decode()}"
        return base64_str

    # Obtenir le header de l'image base64 pour conserver le format
    def get_image_header(self):
        # Extraire le header original de l'image base64
        header = self.base64_image.split(',')[0]
        return header

    # Convertir une image en niveaux de gris
    def convert_to_grayscale(self):
        # Convertir l'image en tableau numpy
        image_np = np.array(self.image)

        # Vérifier si l'image est déjà en niveaux de gris
        if len(image_np.shape) == 2:
            # Si elle est déjà en niveaux de gris, aucune conversion n'est nécessaire
            print(image_np.shape)
            return self.base64_image
        
        # Si elle est en RGB ou RGBA, convertir en niveaux de gris
        # Formule commune pour la conversion en niveaux de gris :
        # 0.2989 * R + 0.5870 * G + 0.1140 * B
        if image_np.shape[2] == 4:
            # Traiter RGBA en ignorant le canal alpha
            image_np = image_np[:, :, :3]

        # Calculer les valeurs en niveaux de gris
        gray_np = (0.2989 * image_np[:, :, 0] + 0.5870 * image_np[:, :, 1] + 0.1140 * image_np[:, :, 2]).astype(np.uint8)

        # Convertir le tableau numpy en image Pillow
        grayscale_image = Image.fromarray(gray_np, mode="L")

        self.image = grayscale_image
            
    def calculate_histogram(self):
        """
        Une image BGR est représentée par une matrice de taille (hauteur, largeur, 3), 
        où 3 représente les canaux de couleur (bleu, vert, rouge)
        """
        image = np.array(self.image)

        if image is None:
            print("Impossible de lire l'image.")
        # Séparer les canaux de couleur:
        blue_channel = image[:,:,0]
        green_channel = image[:,:,1]
        red_channel = image[:,:,2]
        
        # Initialiser l'histogramme pour chaque couleur
        hist_blue = np.zeros(256)
        hist_green = np.zeros(256)
        hist_red = np.zeros(256)
        
        # Compter les occurrences de chaque intensité de lumière d'un pixel dans chaque canal
        for i in range(image.shape[0]):
            for j in range(image.shape[1]):
                hist_blue[blue_channel[i,j]] += 1
                hist_green[green_channel[i,j]] += 1
                hist_red[red_channel[i,j]] += 1
            # Afficher les histogrammes
        plt.title("Histogramme des canaux de couleur")
        plt.xlabel("i")
        plt.ylabel("h(i)")
        plt.plot(hist_blue, color='blue', label='Canal Bleu')
        plt.plot(hist_green, color='green', label='Canal Vert')
        plt.plot(hist_red, color='red', label='Canal Rouge')
        plt.legend()
        plt.show()
        return hist_blue, hist_green, hist_red


    def detect_edges(self, threshold1 = 30, threshold2 = 100):
        """
        Pour détecter les contours dans une image, nous devons d'abord la convertir en niveaux de gris

        Puis il y aura un calcul de gradient: Les contours sont souvent définis comme des changements significatifs 
        dans les niveaux d'intensité de l'image. 
        Pour détecter ces changements, la détection de contour utilise généralement des opérateurs de gradient,
        tels le filtre de Laplace (filtres passe-haut). 

        Ensuite, nous devons appliquer un seuillage pour convertir l'image en bitmap
        où les pixels sont soit considérés comme appartenant à un contour, soit non. On doit donc specifier les seuils (thresholds)
        """


        # Valeurs de seuil par défaut sont 30 et 100
        
        # # Convertir les paramètres en int
        # threshold1 = int(threshold1)
        # threshold2 = int(threshold2)

        print("Threshold1:", threshold1)
        print("Threshold2:", threshold2)

        image = np.array(self.image)

        # Convertir l'image en niveaux de gris
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Appliquer l'opérateur de détection de contours Canny
        edges = cv2.Canny(gray_image, threshold1=threshold1, threshold2=threshold2)

        cv2.imshow("Edges Detected", edges)
        cv2.waitKey(0)  # Wait for a key press to close the window
        cv2.destroyAllWindows()  # Close all OpenCV windows
        return edges
        
    

# Test de la classe
if __name__ == "__main__":
    # Exemple d'image en base64 (fournissez un exemple valide)
    sample_base64_image = "data:image/png;base64,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"
    
    # Initialiser la classe avec l'image base64
    processor = Base64ImageProcessor(sample_base64_image)

    # Convertir l'image en niveaux de gris et obtenir la nouvelle chaîne base64
    # grayscale_base64_image = processor.convert_to_grayscale()

    # # Afficher l'image en niveaux de gris encodée en base64
    # print(grayscale_base64_image)

    # processor.detect_edges()

    processor.calculate_histogram()
