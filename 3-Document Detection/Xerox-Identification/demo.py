import os
import cv2
import sys
import time
import subprocess
import numpy as np
from PIL import Image
from numpy import asarray

try:
    import torch

except ModuleNotFoundError as e:
    subprocess.Popen([f"{sys.executable} -m pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu"], shell=True)
    time.sleep(30)

from torchvision.models.segmentation import deeplabv3_mobilenet_v3_large
from utility_functions import deep_learning_scan

def load_model_DL_MBV3(num_classes=2, device=torch.device("cpu"), img_size=384):
    checkpoint_path = os.path.join(os.getcwd(), "model_mbv3_iou_mix_2C049.pth")
    checkpoints = torch.load(checkpoint_path, map_location=device)

    model = deeplabv3_mobilenet_v3_large(num_classes=num_classes, aux_loss=True).to(device)
    model.load_state_dict(checkpoints, strict=False)
    model.eval()
    with torch.no_grad():
        _ = model(torch.randn((1, 3, img_size, img_size)))
    return model

def main(input_file, image_size=384):
    img = Image.open(input_file)
    image = asarray(img)
    output = None

    model = load_model_DL_MBV3(img_size=image_size)
    output = deep_learning_scan(og_image=image, trained_model=model, image_size=image_size)

    pilImage = Image.fromarray(output)
    pilImage.save("output.png")
    pilImage.show()

    # Reshape the image into a 2D array of pixels (height x width, 3)
    pixels = np.reshape(output, (-1, 3))

    # Find unique colors
    unique_colors = np.unique(pixels, axis=0)

    # Count the number of unique colors
    num_unique_colors = len(unique_colors)

    print("Number of unique colors:", num_unique_colors)
    if(num_unique_colors < 40000 and is_grayscale(cv2.imread("output.png"))):
        print("Xerox")
    else:
        print("Original Document")

    return output

def is_grayscale(image):
    # Convert image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Calculate histogram
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    # Calculate cumulative sum of histogram
    cumulative_hist = np.cumsum(hist)
    # Calculate contrast
    contrast = np.max(cumulative_hist) - np.min(cumulative_hist)
    print("Contrast : ", contrast)
    # Define a threshold for contrast
    contrast_threshold = 100000  # Adjust this value as needed
    if contrast > contrast_threshold:
        return True
    else:
        return False

def is_colorful(image):
    # Convert image to Lab color space
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    # Compute standard deviation of each channel
    std_dev = np.std(lab, axis=(0, 1))
    print("std_dev: ", std_dev)
    # Threshold for colorfulness determination
    threshold = 50
    if np.any(std_dev > threshold):
        return True
    else:
        return False

    