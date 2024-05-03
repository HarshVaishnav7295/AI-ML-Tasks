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

# This block executes only on the first run when your package isn't installed
except ModuleNotFoundError as e:
    subprocess.Popen([f"{sys.executable} -m pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu"], shell=True)
    # wait for subprocess to install package before running your actual code below
    time.sleep(30)

from torchvision.models.segmentation import deeplabv3_mobilenet_v3_large, deeplabv3_resnet50
from utility_functions import traditional_scan, deep_learning_scan, manual_scan, get_image_download_link


def load_model_DL_MBV3(num_classes=2, device=torch.device("cpu"), img_size=384):
    checkpoint_path = os.path.join(os.getcwd(), "model_mbv3_iou_mix_2C049.pth")
    checkpoints = torch.load(checkpoint_path, map_location=device)

    model = deeplabv3_mobilenet_v3_large(num_classes=num_classes, aux_loss=True).to(device)
    model.load_state_dict(checkpoints, strict=False)
    model.eval()
    with torch.no_grad():
        _ = model(torch.randn((1, 3, img_size, img_size)))
    return model

def main(input_file, procedure, image_size=384):
    img = Image.open(input_file)
    image = asarray(img)
    output = None

    model = load_model_DL_MBV3(img_size=IMAGE_SIZE)
    output = deep_learning_scan(og_image=image, trained_model=model, image_size=image_size)

    pilImage = Image.fromarray(output)
    pilImage.save("output.png")
    pilImage.show()
    print(type(pilImage))
    return output

IMAGE_SIZE = 384
procedure_selected = "Deep Learning"
file_upload = "extracted_image.png"
_ = main(input_file=file_upload, procedure=procedure_selected, image_size=IMAGE_SIZE)