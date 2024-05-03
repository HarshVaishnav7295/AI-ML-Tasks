import streamlit as st
import pandas as pd
from reviews_summarization import getSummary
import os
from reviews_percentage import FindSentiment
import webbrowser

st.set_page_config(
    page_title="Review Summarizer",
)

# with open('designing.css') as source_des:
#     st.markdown(f"<style>{source_des.read()}</style>",unsafe_allow_html=True)
def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

local_css("designing.css")
# st.markdown(
#     """
# <style>
#     div[data-testid="stVerticalBlock"] div[stMarkdown]{
#         min-width : 1000px !important;
#         margin-left:-150px;
#     }
# </style>
# """,
#     unsafe_allow_html=True,
# )

def summarize_reviews(file):
    # Read the uploaded file as a Pandas DataFrame
    dataframe = pd.read_csv(file)

    # Apply your review summarization functionality to the DataFrame
    # ...

    # Return the summarized reviews
    return summarized_reviews

st.header('Review Summarization', divider='rainbow')
# uploaded_file = st.file_uploader("Choose a file")

if st.button("Generate Summary", type="primary"):
    # if uploaded_file is not None:
    #     filename, extension = os.path.splitext(uploaded_file.name)
        # st.write("called")
        with st.spinner("Generating Summary..."):
            summarized_reviews = getSummary("shopify-5027345563701")
            sentiments = FindSentiment("shopify-5027345563701")

        webbrowser.open("index.html")
    #     st.success("Summary Generated Successfully!")
    #     # st.write("-------------------")
    #     st.write("**Positive Review Summary**::",summarized_reviews['positive_review_summary'])
    #     # with st.container():
    #     #     contact_form = f"""
    #     #     <div class="red-text"><b>Positive Review Summary ::</b>{summarized_reviews['positive_review_summary']}</div>
    #     #     <div class="red-text"><b>Neutral Reviews Summary ::"</b>{summarized_reviews['neutral_review_summary']}</div>
    #     #     <div class="red-text"><b>Negative Review Summary ::"</b>{summarized_reviews['negative_review_summary']}</div>
    #     #     <div class="red-text"><b>Negative Review Summary ::"</b>{summarized_reviews['negative_review_summary']}</div>
    #     #     <div class="red-text"><b>Negative Review Summary ::"</b>{summarized_reviews['negative_review_summary']}</div>
    #     #     <div class="red-text"><b>Negative Review Summary ::"</b>{summarized_reviews['negative_review_summary']}</div>
    #     #     """
    #     #     st.markdown(contact_form, unsafe_allow_html=True)
    #     st.write("**Neutral Reviews Summary**::",summarized_reviews['neutral_review_summary'])
    #     st.write("**Negative Review Summary**::",summarized_reviews['negative_review_summary'])

    #     st.write("**Positive Reviews** : ( :smiley: ) :",sentiments['positive'])
    #     st.write("**Neutral Reviews** : ( :neutral_face: ) :",sentiments['neutral'])
    #     st.write("**Negative Reviews** : ( :disappointed: ) :",sentiments['negative'])
    # else:
    #     st.warning("Please upload Dataset CSV")

# if uploaded_file is not None:
#     filename, extension = os.path.splitext(uploaded_file.name)
#     st.write("Upload Successful for product-id : ", filename)   

    