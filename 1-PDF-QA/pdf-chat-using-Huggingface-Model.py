import os
import json
from langchain.chains import RetrievalQA
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import pipeline
from langchain.llms import HuggingFacePipeline
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.document_loaders import PyPDFLoader
from langchain.document_loaders import DirectoryLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms import OpenAI


from InstructorEmbedding import INSTRUCTOR
from langchain.embeddings import HuggingFaceInstructEmbeddings


# tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-xl")

# model = AutoModelForSeq2SeqLM.from_pretrained(
#     "google/flan-t5-xl",
#     # #   load_in_8bit=True,
#     #   device_map='auto',
#     #   torch_dtype=torch.float16,
#     #   low_cpu_mem_usage=True,
# )

# tokenizer = AutoTokenizer.from_pretrained("lmsys/fastchat-t5-3b-v1.0")

# model = AutoModelForSeq2SeqLM.from_pretrained(
#     "lmsys/fastchat-t5-3b-v1.0",
#     #   load_in_8bit=True,
#     #   device_map='auto',
#     #   torch_dtype=torch.float16,
#     #   low_cpu_mem_usage=True,
# )

# pipe = pipeline(
#     "text2text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     max_length=2048,
#     repetition_penalty=1.15,
# )

# local_llm = HuggingFacePipeline(pipeline=pipe)

# print(local_llm('What is the capital of England?'))

loader = DirectoryLoader("./new_papers/", glob="./*.pdf", loader_cls=PyPDFLoader)

documents = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
texts = text_splitter.split_documents(documents)

# instructor_embeddings = HuggingFaceInstructEmbeddings(
#     model_name="hkunlp/instructor-xl", model_kwargs={"device": "cuda"}
# )
embeddings = OpenAIEmbeddings()


persist_directory = "db"

## Here is the nmew embeddings being used
# embedding = instructor_embeddings

vectordb = Chroma.from_documents(
    documents=texts, embedding=embeddings, persist_directory=persist_directory
)

retriever = vectordb.as_retriever(search_kwargs={"k": 3})

qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(), chain_type="stuff", retriever=retriever, return_source_documents=True
)

query = "What is Flash attention?"
llm_response = qa_chain(query)
print("Result :->", llm_response["result"])
