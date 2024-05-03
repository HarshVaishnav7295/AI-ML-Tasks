import requests
import csv

def getReviewsCsvByProductId(base_url,okendo_id_url):
    try:
        BASE_URL = base_url
        first_response = requests.get(url=BASE_URL+okendo_id_url)
        product_ids = []
        response = first_response.json()
        # print(response)
        fieldnames = ["reviewId","productId","body","rating","productName","variantId"]
        i = 0
        while 'nextUrl' in response.keys():
            reviews = response['reviews']
            for review in reviews:
                dict_data = {
                    "reviewId": review['reviewId'],
                    "productId": review['productId'],
                    "body": review['body'],
                    "rating": review['rating'],
                    "productName": review['productName'],
                    "variantId": review['variantId'] if "variantId" in review.keys() else "",
                }
                if review['productId'] in product_ids:
                    with open(str(review['productId'])+".csv", "a", newline="") as f:
                        writer = csv.DictWriter(f, fieldnames=dict_data.keys())
                        i = i+1
                        writer.writerow(dict_data)
                else:
                    with open(str(review['productId'])+".csv", "w", newline="") as f:
                        writer = csv.DictWriter(f, fieldnames=fieldnames)
                        writer.writeheader()
                        writer.writerow(dict_data)
                        product_ids.append(str(review['productId']))

            if 'nextUrl' not in response.keys():
                break
            else:
                response = requests.get(url=BASE_URL + response['nextUrl'])
                response = response.json()
    except Exception as e:
        print("Error from getReviewsCsvByProductId function :",e)
        

getReviewsCsvByProductId("https://api.okendo.io/v1","/stores/0aa361c9-6e12-4aca-8532-7975aa3d584d/reviews")