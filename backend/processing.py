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