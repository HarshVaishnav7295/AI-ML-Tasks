import os
from PyPDF2 import PdfReader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
import json
from langchain.chains import RetrievalQA


doc_reader = PdfReader("AIC Specs (2023-10-17).pdf")
# print(doc_reader)


# reading all data and puttinh it in single variable
raw_text = ""
for i, page in enumerate(doc_reader.pages):
    text = page.extract_text()
    if text:
        raw_text += text

# spliting text into chunks of 1000 ( no. of characters )
text_splitter = CharacterTextSplitter(
    separator="\n",
    chunk_size=1000,
    chunk_overlap=200,  # striding over the text
    length_function=len,
)

# NOTE : here used overlapping of 200 words, as we are going to make embeddings for each chunk
# and to make semantic meanings more acccurate, it is good to use overlap, as each statement has affect of previous statement,
# so meanings loss will be decreased.
texts = text_splitter.split_text(raw_text)
# print("1")

# creating embeddings for each chunks
embeddings = OpenAIEmbeddings()
# print("2")

# # using FAISS -> it is good for finding similarity between vectors.
docsearch = FAISS.from_texts(texts, embeddings)
# print("3")

# query = "how does GPT-4 change social media?"
# docs = docsearch.similarity_search(query)

# print(len(docs))

## simple chain :

# chain = load_qa_chain(OpenAI(),
#                       chain_type="stuff")

# # template : Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

# # {context}

# # Question: {question}
# # Helpful Answer:

# query = "who are the authors of the book?"
# docs = docsearch.similarity_search(query)
# print(chain.run(input_documents=docs, question=query))

## Map Rerank :
# chain = load_qa_chain(OpenAI(),
#                       chain_type="map_rerank",
#                       return_intermediate_steps=True
#                       )

# query = "who are openai?"
# docs = docsearch.similarity_search(query,k=10)
# results = chain({"input_documents": docs, "question": query}, return_only_outputs=True)

# print("REsults : ",results['output_text'])
# print("REsults : ",results['intermediate_steps'])

retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 10})
rqa = RetrievalQA.from_chain_type(
    llm=OpenAI(), chain_type="stuff", retriever=retriever, return_source_documents=True
)

results = rqa(
    "What is viewer, formatter, editor, publisher acl rank status for R Regular-TG?"
)
print("Source Docs : ", results["source_documents"])
print("Answer : ======", results["result"])
