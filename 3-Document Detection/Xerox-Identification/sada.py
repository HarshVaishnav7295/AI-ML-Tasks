import cv2
import numpy as np
from PIL import Image
from numpy import asarray

def is_grayscale(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    cumulative_hist = np.cumsum(hist)
    contrast = np.max(cumulative_hist) - np.min(cumulative_hist)
    print("Contrast : ", contrast)
    contrast_threshold = 100000
    if contrast < contrast_threshold:
        return True
    else:
        return False
def main(output):
        img = Image.open(output)
        image = asarray(img)
        pixels = np.reshape(np.asarray(image), (-1, 3))
        unique_colors = np.unique(pixels, axis=0)
        num_unique_colors = len(unique_colors)
        print("Number of unique colors:", num_unique_colors)
        if(num_unique_colors < 40000 and is_grayscale(cv2.imread("color1.jpg"))):
             print("Xerox")
        else:
             print("Original Document")
        return output

main('color1.jpg')