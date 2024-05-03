import cv2
import numpy as np

def is_grayscale(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    cumulative_hist = np.cumsum(hist)
    contrast = np.max(cumulative_hist) - np.min(cumulative_hist)
    print(contrast)
    contrast_threshold = 60000  # Adjust this value as needed
    if contrast < contrast_threshold:
        return True
    else:
        return False

def is_colorful(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    std_dev = np.std(lab, axis=(0, 1))
    print(std_dev)
    threshold = 100
    if np.any(std_dev > threshold):
        return True
    else:
        return False

def analyze_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        print("Error: Unable to load image.")
        return

    if is_grayscale(image):
        print("Image is grayscale (black, white, or shades of gray).")
    else:
        if is_colorful(image):
            print("Image is colorful.")
        else:
            print("Image is not colorful (may contain some color but not predominantly).")

analyze_image("color3.png")
