from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import requests
from bs4 import BeautifulSoup
import re
import pandas as pd
import os
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification


def getSentimentAnalysisOfCSV(filepath):
    try:
        print("Starting Sentiment Analysis Proces...")
        tokenizer = AutoTokenizer.from_pretrained(
            "nlptown/bert-base-multilingual-uncased-sentiment"
        )
        model = AutoModelForSequenceClassification.from_pretrained(
            "nlptown/bert-base-multilingual-uncased-sentiment"
        )

        # tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
        # model = DistilBertForSequenceClassification.from_pretrained(
        #     "distilbert-base-uncased", problem_type="multi_label_classification",return_dict=True
        # )

        dataset = pd.read_csv(filepath)
        # print("shape",dataset.shape)
        positive_reviews = []
        neutral_reviews = []
        negative_reviews = []

        for i in range(0, len(dataset)):
        # for i in range(0, 2):
            statement = dataset.iloc[i]["body"]

            # inputs = tokenizer(statement, return_tensors="pt")
            # with torch.no_grad():
            #     logits = model(**inputs).logits
            

            # predicted_class_ids = torch.arange(0, logits.shape[-1])[torch.sigmoid(logits).squeeze(dim=0) > 0.5]

            # labels = torch.sum(
            #     torch.nn.functional.one_hot(
            #         predicted_class_ids[None, :].clone(), num_classes=2
            #     ),
            #     dim=1,
            # ).to(torch.float)
            # print("ss", logits)
            # print("Logits : ",logits)
            # class_to_idx = {"POSITIVE": 1, "NEGATIVE": 0}
            # probs = torch.nn.functional.softmax(logits, dim=1)
            # sorted_probs, sorted_indices = torch.sort(probs, dim=1, descending=True)

            # results = []
            # for i in range(probs.shape[0]):
            #     example_dict = []

            #     for j in range(2):
            #         print("dd",sorted_probs[i, j].item())
            #         label_prob = {
            #             "label": class_to_idx[sorted_indices[i, j].item()],
            #             "score": sorted_probs[i, j].item()
            #         }
            #         example_dict.append(label_prob)

            #     results.append(example_dict)

            # print(results)
            # predicted_class_id = logits.argmax().item()

            # model.config.id2label[predicted_class_id]

            tokens = tokenizer.encode(statement, return_tensors="pt")
            result = model(tokens)
            # print("result-> ",logits.toLis)
            rating = int(torch.argmax(result.logits)) + 1
            if (rating > 3 and int(dataset.iloc[i]['rating']) > 2) or int(dataset.iloc[i]['rating']) > 3:
                positive_reviews.append(dataset.iloc[i])
            elif rating < 3 and int(dataset.iloc[i]['rating']) < 3:
                negative_reviews.append(dataset.iloc[i])
            # elif int(dataset.iloc[i]['rating']) in [2,3,4]:
            else:
                neutral_reviews.append(dataset.iloc[i])

        positive_reviews = pd.DataFrame(positive_reviews)
        neutral_reviews = pd.DataFrame(neutral_reviews)
        negative_reviews = pd.DataFrame(negative_reviews)
        print("pos : ",len(positive_reviews))
        print("neu : ",len(neutral_reviews))
        print("neg : ",len(negative_reviews))
        file_path = os.path.join(os.path.dirname(__file__),'{id}'.format(id = dataset.iloc[i]['productId']))
        if not os.path.exists(file_path):
            os.makedirs(file_path)

        positive_reviews.to_csv(os.path.join(file_path,'positive_reviews.csv'))
        neutral_reviews.to_csv(os.path.join(file_path,'neutral_reviews.csv'))
        negative_reviews.to_csv(os.path.join(file_path,'negative_reviews.csv'))
        print("Sentiment Analysis Proces Completed.")

        return {
            "success":True,
            "data":{
                "positive_reviews":positive_reviews,
                "neutral_reviews":neutral_reviews,
                "negative_reviews":negative_reviews
            }
        }
    except Exception as e:
        print("Error from getSentimentAnalysisOfCSV function :",e)
        return {"success": False, "error": str(e)}


# data = getSentimentAnalysisOfCSV("shopify-5027350183989.csv")

# tokenizer = AutoTokenizer.from_pretrained(
#     "nlptown/bert-base-multilingual-uncased-sentiment"
# )
# model = AutoModelForSequenceClassification.from_pretrained(
#     "nlptown/bert-base-multilingual-uncased-sentiment"
# )
# statement = """
# I ordered two different patterns, I’d one Instead I found another spot in the house for this one, and I’m keeping both"""
# tokens = tokenizer.encode(statement, return_tensors="pt")
# result = model(tokens)
# rating = int(torch.argmax(result.logits)) + 1
# print("Rai",rating)

# """
# First I got the rug in a big size. I love it,so I ordered another for under the coffee table!!! These are beautiful,easy to put down,and washed beautifully.I had the other company's rug,ends in ruggable,and did not like it.My Tumble rugs are better quality,easier to put down and look great.
# """
# """
# I ordered two different patterns, thinking I’d return one…. Instead I found another spot in the house for this one, and I’m keeping both.
# """

# """
# Wouldn't you know it, the dog puked all over this brand new living room rug THREE DAYS after it arrived. Thankfully the rug lived up to it's hype and went through the washing machine flawlessly. Kicking myself for not buying this sooner!
# """

# """
# My rug got lost in the mail by Fedex. Customer support was able to help me track it down but by the time it arrive it was too late.
# """

# """
# This rug had made me want to remotely house. Very excited to be able to change it when I want.
# """

# """
# I ordered this to be a pop of color in my kitchen which has neutral beige/grey flooring and dark grey cabinets. Unfortunately the rug came with a different colored border than the listing photos. The edge is dark blue, not grey which clashes too much with my cabinets. I’ll be returning it and hope the other color options I order are a better fit. Love the concept!
# """

# """
# Oh my gosh!!!! Can not say enough positive things about this company, the people that work for this company and the product. Before ordering, I spoke with the head designer Kerri Ann about her opinions of a rug for my room. I sent pictures of my room to her, she sent pictures of the rugs she thought would be the best match back to me. What other company takes time to literally help you pick out a rug for your home? Don’t think I have ever had this kind of service... I will only be ordering from Tumble for my washable rugs!! I am a very happy customer
# """


# print(len(data['data']['neutral_reviews']))
# print(len(data['data']['negative_reviews']))
# print(data['neutral_reviews'])
# print(data['negative_reviews'])
# dataset = pd.read_csv('Restaurant_Reviews.csv')
# dataset = dataset['Review']
# print(dataset)
# positive_reviews = []
# neutral_reviews = []
# negative_reviews = []

# for i in range(0,len(dataset)):
#     statement = dataset[i].replace('.',' ')
#     tokens = tokenizer.encode(statement, return_tensors='pt')
#     result = model(tokens)
#     rating = int(torch.argmax(result.logits))+1
#     if rating > 3:
#         positive_reviews.append(dataset[i])
#     elif rating < 3:
#         negative_reviews.append(dataset[i])
#     else:
#         neutral_reviews.append(dataset[i])

# positive_reviews = pd.DataFrame(positive_reviews)
# neutral_reviews = pd.DataFrame(neutral_reviews)
# negative_reviews = pd.DataFrame(negative_reviews)

# positive_reviews.to_csv('positive_reviews.csv')
# neutral_reviews.to_csv('neutral_reviews.csv')
# negative_reviews.to_csv('negative_reviews.csv')
# int(torch.argmax(result.logits))+1
# print("REsult->",int(torch.argmax(result.logits))+1)
