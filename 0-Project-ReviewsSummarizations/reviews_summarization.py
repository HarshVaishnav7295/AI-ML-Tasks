from transformers import pipeline
import pandas as pd
import os
import json
import traceback
import time
import glob 
from reviews_sentiment_analysis import getSentimentAnalysisOfCSV


summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def max_token_length(Reviews_arr, max_token_length):
    try:
        # print("Reviews",Reviews_arr)
        # print("tokn",max_token_length)
        # Reviews_arr => array of reviews for dataset
        # max_token_length => max no. of token used for generating summary

        # merge all tokens in Reviews_arr
        # print("max_token_length",max_token_length)
        review_string = " ".join(Reviews_arr)
        # print("char",len(review_string))
        new_review = []
        # if Reviews_arr is in processing limit
        if (len(review_string) < max_token_length):
            new_review.append(review_string)
            return new_review
        # spliting all tokens in review_string
        review_arr = review_string
        # print("qwe",(review_arr))
        # print("no-->",round(len(review_arr)/max_token_length))
        for i in range(round(len(review_arr)/max_token_length)):
            if i == 0:
                start = i*max_token_length
            else:
                start = i*max_token_length - 200
            end = (i+1)*max_token_length
            new_review.append(review_arr[start:end])
            # print("new_review-----------",review_arr[start:end])
            # break
        # print("new",new_review)
        return new_review
    except Exception as e:
        print("Error from max_token_length function :",e)
        return ""
def recursiveSummaryGeneration(Review_arg,limit):
    try:
        summary_output = []
        token_arr = max_token_length(Review_arg,limit)
        final_output = " ".join(token_arr)
        if(len(final_output) < 1500):
            return final_output
        
        # print("tt",len(token_arr[0]))
        while(len(final_output) > 1500):
            print("Called.!!")
            # print("final op",len(final_output))
            # print("token",len(token_arr))
            # token_arr = max_token_length(summary_output,limit)
            if len(token_arr) != 1 or len(token_arr[0]) > 1500:
                # print("Called.2!!")
                temp_summary = []
                for i in token_arr:
                    words = len(i)
                    # print("Len of i 2 : ",words)
                    # 500  --  130
                    # if words < 1800:
                    #     print("Direct 2 called")
                    #     temp_summary.append(i)
                    # else:
                    #     print("sum 2 called")

                    # print("------------------------------------------------------------------------------------------------------")
                    output = summarizer(i, min_length=100, do_sample=True)
                    # print(output)
                    # print("------------------------------------------------------------------------------------------------------")
                    temp_summary.append(output[0]['summary_text'])
                # print("Called.3!!")
                summary_output = temp_summary
                final_output = " ".join(temp_summary)
                # print("ssss",summary_output)
                token_arr = max_token_length(summary_output,limit)
                # print("22",len(token_arr[0]))
                # print("Called.4!!",len(summary_output[0]))
                # return
            else:
                # print("else called")
                final_output =  " ".join(token_arr)
                # break
        # print(summary_output)
        # print(len(final_output))
        return final_output
        # if(len(summary_output) == 1 and len(summary_output[0]) < words):
        #     return summary_output[0]
        # else:
        #     return recursiveSummaryGeneration(summary_output,limit)
    except Exception as e:
        print("Error from recursiveSummaryGeneration : ",e)
        return ""
def generateSummary(filename):
    try:

        dataset = pd.read_csv(os.path.join(os.path.dirname(__file__),filename))
        # print(dataset.empty)
        if dataset.empty:
            return " "
        else:
            # dataset = dataset['body'] if not dataset.empty else []
            dataset = dataset['body']
            limit = 2500
            return recursiveSummaryGeneration(dataset,limit)
            # token_arr = max_token_length(dataset,limit)
            # print("Token arr : ",token_arr)
            # summary_output = []
            # for i in token_arr:
            #     words = len(i.split(" "))
            #     print("Len of i 1 : ",words)
            #     if words < limit:
            #         print("Direct 1 called")
            #         summary_output.append(i)
            #     else:
            #         print("summar 1 called")
            #     # elif words>50:
            #         output = summarizer(i, max_length=130, min_length=30, do_sample=True)
            #         print("initial : ",output[0]['summary_text'])
            #         summary_output.append(output[0]['summary_text'])
            
            # print("!st summary : ",summary_output)
            # token_arr_for_partial_summary = max_token_length(summary_output,limit)
            # # print(token_arr_for_partial_summary)
            # final_summary = []
            # for i in token_arr_for_partial_summary:
            #     # print("------------------------------------------------------------------------------------------------------")
            #     # words = len(i.split(" "))
            #         words = len(i.split(" "))
            #         print("Len of i 2 : ",words)

            #         if words < limit:
            #             print("Direct 2 called")
            #             final_summary.append(i)
            #         else:
            #         # elif words>50:
            #             print("summar 2 called")

            #             output = summarizer(i, max_length=130, min_length=30, do_sample=True)
            #         # print(output)
            #             final_summary.append(output[0]['summary_text'])
            #         # print("------------------------------------------------------------------------------------------------------")
            
            # final_summary_text = ''
            # for item in final_summary:
            #     final_summary_text = final_summary_text + " " + item

            # print("Final Summary : ",final_summary_text)
            # return final_summary_text
    except Exception as e:
        print("Error from generateSummary function :",e)
        return ""



def getSummary(productId):
    try:
        # if not os.path.exists(os.path.join(os.path.dirname(__file__),'./{id}'.format(id = productId))):
        #     # print("Sub data-set not found..")
        #     # print("Performing Sentiment Analysis ....")
        #     getSentimentAnalysisOfCSV("{productId}.csv".format(productId=productId))
        
        # # print("Sub data-set found..")
        # # print("Performing Text Summarization ....")
        # positive_review_path = os.path.join(os.path.dirname(__file__),'./{id}/positive_reviews.csv'.format(id = productId))
        # neutral_review_path = os.path.join(os.path.dirname(__file__),'./{id}/neutral_reviews.csv'.format(id = productId))
        # negative_review_path = os.path.join(os.path.dirname(__file__),'./{id}/negative_reviews.csv'.format(id = productId))

        # positive_review_summary = generateSummary(positive_review_path)
        # neutral_review_summary = generateSummary(neutral_review_path)
        # negative_review_summary = generateSummary(negative_review_path)
        
        # data = {
        #     "positive_review_summary":positive_review_summary,
        #     "neutral_review_summary":neutral_review_summary,
        #     "negative_review_summary":negative_review_summary
        # }

        # json_object = json.dumps(data, indent=4)
        
        # with open("{id}-summary.json".format(id = productId), "w") as outfile:
        #     outfile.write(json_object)

        # # print("Text Summarization Completed.")
        # return data
        f = open("{id}-summary.json".format(id = productId))
 
        # returns JSON object as 
        # a dictionary
        time.sleep(10)
        data = json.load(f)
        return data


    except Exception as e:
        print("Error from getSummary function :",e)


def main():
    csv_list = glob.glob('./' + "/*.csv")
    # print(csv_list[0].replace(".csv","").replace("./",""))
    for item in csv_list:
        print("--------------------------------------")
        print("Review Summarization of csv : ",item.replace(".csv","").replace("./",""))
        getSummary(item.replace(".csv","").replace("./",""))
        print("Done for csv : ",item.replace(".csv","").replace("./",""))
        print("--------------------------------------")


# main()
# print("----",getSummary('shopify-5032164130869'))
# generateSummary('./shopify-5027335340085/positive_reviews.csv')
# " Amara rug is spill-proof and stain-proof. Can be washed, but not until the first need or the year mark. Comes with a slip-free mat to hold the rug in place. Easy to put together. Tumble rugs are spillproof and machine washable which is everything I needed. The pad that came with is a bit too small, so the rug eventually shifts because the pockets don't have enough pad to fill them. Spills pool on top and easy to wipe clean as advertised."


# Reviews Summarization : 
# ----------------------
# We are collecting data of reviews from shopify, then pre processing it according to requirements.
# Then performing feature extractions and then performing sentiment analysis on data to make 3 classes : Positive, Neutral and Negative.
# Then on those 3 classes performing text summarization and returning summary for each class.

# Flow : 

# 0> Data collection
# 1> Data pre processing
# 2> Feature extraction
# 3> Sentiment Analysis
# 4> Text Summarization on each class

# Models : 

# for sentiment analysis  : bert-base-multilingual-uncased-sentiment
# for text summarization  : bart-large-cnn
# for sentence similarity : sentence-transformers/all-MiniLM-L6-v2

# Future Scope : 

# When receiving new reviews then according to some decided amount of reviews, those new reviews will be added to dataset.
# And then on those will perform Sentence similarity and then add appropriate reviews to final dataset, and on those whole process will be performed again.
