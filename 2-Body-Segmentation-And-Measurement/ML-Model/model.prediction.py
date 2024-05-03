import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import pickle
import sys
import json
import os
from sklearn.linear_model import LinearRegression


def predictValues():
    data = json.dumps(sys.argv)
    # json_obj1 = data[1]
    # json_obj2 = data[2]

    chestObj = json.loads(data[1])
    waistObj = json.loads(data[2])

    with open(os.path.join(os.path.dirname(__file__),'chest_model.pkl'), 'rb') as f:
        chest_LR_Model = pickle.load(f, encoding='utf-8')
        # chest_LR_Model = pickle.load(open(os.path.join(os.path.dirname(__file__),'chest_model.pkl')))
        # waist_LR_Model = pickle.load(open(os.path.join(os.path.dirname(__file__),'waist_model.pkl')))
 
    with open(os.path.join(os.path.dirname(__file__),'waist_model.pkl'), 'rb') as f:
        waist_LR_Model = pickle.load(f, encoding='utf-8')

    chest_circumference_cm = chest_LR_Model.predict(
        [
            [
                chestObj.circumference,
                chestObj.distance,
                chestObj.calibration1,
                chestObj.calibration2,
            ]
        ]
    )
    waist_circumference_cm = waist_LR_Model.predict(
        [
            [
                waistObj.circumference,
                waistObj.distance,
                waistObj.calibration1,
                waistObj.calibration2,
            ]
        ]
    )
    print("chest_circumference_cm : ",chest_circumference_cm)
    print("waist_circumference_cm : ",waist_circumference_cm)
    return {chest_circumference_cm, waist_circumference_cm}


predictValues()
