import pandas as pd
import os

def FindSentiment(productId):
    negative = pd.read_csv(os.path.join(os.path.dirname(__file__),'./{id}/negative_reviews.csv'.format(id = productId)))
    neutral = pd.read_csv(os.path.join(os.path.dirname(__file__),'./{id}/neutral_reviews.csv'.format(id = productId)))
    positive = pd.read_csv(os.path.join(os.path.dirname(__file__),'./{id}/positive_reviews.csv'.format(id = productId)))


    d1_count = len(negative)
    d2_count = len(neutral)
    d3_count = len(positive)

    total = d1_count + d2_count + d3_count

    d1_per = d1_count / total
    d2_per = d2_count / total
    d3_per = d3_count / total

    print("Negative Percentage : ",d1_per*100)
    print("Neutral Percentage : ",d2_per*100)
    print("Positive Percentage : ",d3_per*100)
    # print(":grinning_face_with_big_eyes:")
    return {
        "positive" : f' {round(d3_per*100,2)} %',
        "neutral" : f' {round(d2_per*100,2)} %',
        "negative" : f' {round(d1_per*100,2)} %',
    }
# main()    