import numpy as np
import pandas as pd
import pickle
from sklearn.linear_model import LinearRegression
import os.path

def trainModel():
    try:
        ########### Chest - Model Training ###########

        # Loading dataset : 
        dataset = pd.read_csv(os.path.join(os.path.dirname(__file__),'dataset.csv'))

        # Data Preprocessing :

        dataset['chest'] = dataset['chest']
        dataset['waist'] = dataset['waist']


        # Data Extraction : 

        df = dataset.iloc[:,[0,1,2,3,9,10,11]]
        chest_independent_variables = df.iloc[:40,1:-1].values
        chest_dependent_variable= df.iloc[:40,-1].values

        # Model Building : 

        chest_LR_Model = LinearRegression()

        # Model Training : 

        chest_LR_Model.fit(chest_independent_variables,chest_dependent_variable)

        # Model Saving : 

        filename1 = os.path.join(os.path.dirname(__file__),'chest_model.pkl')
        pickle.dump(chest_LR_Model, open(filename1, 'wb'))

        # Chest Model Relation : 

        # intecept : 
        print(chest_LR_Model.intercept_)

        # coeficients : 
        print(chest_LR_Model.coef_)
        ########### Waist - Model Training ###########

        # Data Extraction : 

        dfw = dataset.iloc[:,[0,1,3,8,9,11]]

        waist_independent_variables = dfw.iloc[:12,1:-1].values
        waist_dependent_variable = dfw.iloc[:12,-1].values

        # Model Building : 

        waist_LR_Model = LinearRegression()

        # Model Training : 

        waist_LR_Model.fit(waist_independent_variables,waist_dependent_variable)

        # Model Saving : 

        filename2 = os.path.join(os.path.dirname(__file__),'waist_model.pkl')
        pickle.dump(waist_LR_Model, open(filename2, 'wb'))

        # Waist Model Relation : 

        # intecept : 
        print(waist_LR_Model.intercept_)

        # coeficients : 
        print(waist_LR_Model.coef_)

        return {
            "success":True,
            "error":""
        }
    except Exception as e:
        # print("Error occured in Training models.")
        # print("Error : ",e)
        return {
            "success":False,
            "error":e
        }

trainModel()

