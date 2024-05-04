import cv2
import matplotlib.pyplot as plt
import numpy as np

def calculate_histogram(image):
    """
    Une image BGR est représentée par une matrice de taille (hauteur, largeur, 3), 
    où 3 représente les canaux de couleur (bleu, vert, rouge)
    """
    
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

    return hist_blue, hist_green, hist_red

def plot_rgb_histogram(image):
    
    # Calculer les histogrammes de chaque canal de couleur
    hist_blue, hist_green, hist_red = calculate_histogram(image)
    
    # Afficher les histogrammes
    plt.title("Histogramme des canaux de couleur")
    plt.xlabel("i")
    plt.ylabel("h(i)")
    plt.plot(hist_blue, color='blue', label='Canal Bleu')
    plt.plot(hist_green, color='green', label='Canal Vert')
    plt.plot(hist_red, color='red', label='Canal Rouge')
    plt.legend()
    plt.show()


def detect_edges(image, threshold1 = 30, threshold2 = 100):
    """
    Pour détecter les contours dans une image, nous devons d'abord la convertir en niveaux de gris

    Puis il y aura un calcul de gradient: Les contours sont souvent définis comme des changements significatifs 
    dans les niveaux d'intensité de l'image. 
    Pour détecter ces changements, la détection de contour utilise généralement des opérateurs de gradient,
    tels que le gradient de Sobel ou le filtre de Laplace (filtres passe-haut). 

    Ensuite, nous devons appliquer un seuillage pour convertir l'image en bitmap
    où les pixels sont soit considérés comme appartenant à un contour, soit non. On doit donc specifier les seuils (thresholds)
    """


    # Valeurs de seuil par défaut sont 30 et 100
    
    # Convertir les paramètres en int
    threshold1 = int(threshold1)
    threshold2 = int(threshold2)

    # Convertir l'image en niveaux de gris
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Appliquer l'opérateur de détection de contours Canny
    edges = cv2.Canny(gray_image, threshold1=threshold1, threshold2=threshold2)

    cv2.imshow("Edges Detected", edges)
    cv2.waitKey(0)  # Wait for a key press to close the window
    cv2.destroyAllWindows()  # Close all OpenCV windows
    return edges