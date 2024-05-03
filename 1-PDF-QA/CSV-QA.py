import os

import pandas as pd

# import transformers
# import torch
from langchain_experimental.agents.agent_toolkits import create_csv_agent
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import pipeline
from langchain.llms import HuggingFacePipeline

from langchain.agents import AgentType, Tool, initialize_agent
from langchain.chat_models import ChatOpenAI
from langchain.utilities import SerpAPIWrapper

# search = SerpAPIWrapper()
# tools = [
#     Tool(
#         name="Search",
#         func=search.run,
#         description="useful for when you need to answer questions about current events. You should ask targeted questions",
#     ),
# ]

# from langchain.llms import HuggingFacePipeline
# from transformers import BertTokenizer, BertModel
# tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
# # model = BertModel.from_pretrained("bert-base-uncased")

# pipeline = transformers.pipeline(
#     "text-generation",
#     model="bert-base-uncased",
#     tokenizer=tokenizer
# )

# local_llm = HuggingFacePipeline(pipeline=pipeline)


df = pd.read_csv("dataset.csv")

# # df.head()


from langchain_experimental.agents.agent_toolkits import create_csv_agent
from langchain.llms import OpenAI

# tokenizer = AutoTokenizer.from_pretrained("lmsys/fastchat-t5-3b-v1.0")

# model = AutoModelForSeq2SeqLM.from_pretrained(
#     "lmsys/fastchat-t5-3b-v1.0",
#     #   load_in_8bit=True,
#     #   device_map='auto',
#     #   torch_dtype=torch.float16,
#     #   low_cpu_mem_usage=True,
# )
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-xl")


model = AutoModelForSeq2SeqLM.from_pretrained(
    "google/flan-t5-xl",
    # #   load_in_8bit=True,
    #   device_map='auto',
    #   torch_dtype=torch.float16,
    #   low_cpu_mem_usage=True,
)

pipe = pipeline(
    "text2text-generation",
    model=model,
    tokenizer=tokenizer,
    max_length=2048,
    repetition_penalty=1.15,
)

local_llm = HuggingFacePipeline(pipeline=pipe)


agent = create_csv_agent(local_llm, "dataset.csv", verbose=True)


# Jinesh1,172.72,302,160.9767163,160.359855,58,44,54,48,0.5955862069,0.5757333333,34,32
# Anirudh1,175.26,302,108.6639997,108.6639997,38,31,38,31,1.001485714,0.9128125,38,38
# Divyesh Bhai1,162.56,302,168.0788771,176.055436,54,53,59,53,0.5703859649,0.5329836066,35,37
# Naman Bhai1,174,302,152.8575004,165.236693,54,43,57,48,0.5858585859,0.5541401274,30,28
# Anil sir1,171,302,183.8670899,183.7865267,61,56,59,58,0.5681063123,0.5480769231,35,36
# Anshul Bhai1,167.64,302,196.6040924,199.568444,67,58,66,61,0.5496393443,0.5255172414,44,41
# Rajesh Bhai1,162.56,302,172.028381,169.4027394,62,47,63,44,0.5455033557,0.5455033557,36.5,37
# Nimesh Bhai1,174,302,189.3382992,178.2827728,73,46,64,49,0.5523809524,0.537037037,31,29
# Shaishav Bhai1,175.26,302,187.4828788,184.3508413,66,53,65,52,0.5842,0.5901010101,38,41
# Naitk Bhai1,167.64,302,182.8765062,182.5510651,65,51,63,53,0.5702040816,0.5820833333,42,43
# Kaushik Bhai1,177.8,302,179.4154201,186.954464,62,52,61,58,0.5946488294,0.5772727273,42,42
# Abhishek Sir1,180.34,302,181.4107223,176.6170857,65,50,63,49,0.5951815182,0.5761661342,39,37
# Rushi Patel1,172.72,302,167.0383173,165.1169248,59,47,56,49,0.5500636943,0.5518210863,34,31
# Mihir Sir1,170.18,302,191.9591718,190.1475004,66,56,63,58,0.5788435374,0.572996633,42,45
# Harsh2,172.72,423,388,383,136,111,130,114,0.2609,0.2318,38,37.7
# Jinesh2,172.72,423,377,360,130,110,121,108,0.2485,0.2287,34,32
# Anirudh2,175.26,423,268,254,89,82,85,77,0.4001,0.3376,38,38
# Divyesh Bhai2,162.56,423,405,400,132,126,133,122,0.2419,0.2173,35,37
# Naman Bhai2,174,423,375,392,137,101,137,112,0.2386,0.2175,30,28
# Anil sir2,171,423,406,413,130,129,0.2503,0.2358,0.2503,0.2358,35,36
# Anshul Bhai2,167.64,423,458,452,150,142,0.2325,0.2179,0.2325,0.2179,44,41
# Rajesh Bhai2,162.56,423,415,400,141,123,135,120,0.2455,0.2147,36.5,37
# Nimesh Bhai2,174,423,465,439,177,116,157,122,0.2148,0.2161,31,29
# Shaishav Bhai2,175.26,423,442,421,151,130,146,122,0.2562,0.2346,38,41
# Naitk Bhai2,167.64,423,429,414,147,126,133,131,0.2587,0.2341,42,43
# Kaushik Bhai2,177.8,423,428,424,140,133,136,134,0.2622,0.2276,42,42
# Abhishek Sir2,180.34,423,420,423,153,113,147,122,0.2644,0.2401,39,37
# Rushi Patel2,172.72,423,272,264,93,80,88,80,0.3553,0.336,34,31
# Mihir Sir2,170.18,423,451,446,153,134,146,138,0.2506,0.226,42,45


# # agent

# # agent.agent.llm_chain.prompt.template

# # """
# # You are working with a pandas dataframe in Python. The name of the dataframe is `df`.
# # You should use the tools below to answer the question posed of you:

# # python_repl_ast: A Python shell. Use this to execute python commands. Input should be a valid python command. When using this tool, sometimes output is abbreviated - make sure it does not look abbreviated before using it in your answer.

# # Use the following format:

# # Question: the input question you must answer
# # Thought: you should always think about what to do
# # Action: the action to take, should be one of [python_repl_ast]
# # Action Input: the input to the action
# # Observation: the result of the action
# # ... (this Thought/Action/Action Input/Observation can repeat N times)
# # Thought: I now know the final answer
# # Final Answer: the final answer to the original input question


# # This is the result of `print(df.head())`:
# # {df}

# # Begin!
# # Question: {input}
# # {agent_scratchpad}"""

# agent.run("which person has most closest chest circumferance(px) value to chest?")
# # chest circumferance(px),
# # chest
# # agent.run("how many people are female?")

# # agent.run("how many people have stayed more than 3 years in the city?")

# # agent.run("how many people have stayed more than 3 years in the city and are female?")

# # agent.run("Are there more males or females?")

# # """## LangChain CSV Loader"""

# # from langchain.document_loaders.csv_loader import CSVLoader

# # loader = CSVLoader(file_path='/content/train.csv')
# # data = loader.load()

# # #custom chain etc

# # """## Convert XLS file to csv"""

# # # !pip install openpyxl

# # # !wget -q https://www.dropbox.com/s/co5kwipba9hpumt/excel_files.zip
# # # !unzip -q excel_files.zip

# # # xls_file = r'/content/excel_file_example.xlsx'
# # # output_csv = r'/content/excel_file_example.csv'

# # # Read the XLS file using pandas and openpyxl as the engine
# # data = pd.read_excel(xls_file, engine='openpyxl')

# # # Save the data as a CSV file
# # data.to_csv(output_csv, index=False)

# # agent = create_csv_agent(OpenAI(temperature=0),
# #                          '/content/excel_file_example.csv',
# #                          verbose=True)

# # agent.run("What are the column names?")

# # agent.run("What is the average age?")

# # agent.run("Which country appears the most and how many times does it appear?")

# # # agent.run("What is the ratio of males to females?")
# from langchain.llms import HuggingFacePipeline
# import torch
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, AutoModelForSeq2SeqLM
# from langchain.agents import AgentExecutor
# from langchain.agents import tool


# @tool
# def get_word_length(word: str) -> int:
#     """Returns the length of a word."""
#     return len(word)


# tools = [get_word_length]

# tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-xl")

# model = AutoModelForSeq2SeqLM.from_pretrained(
#     "google/flan-t5-xl",
#     # #   load_in_8bit=True,
#     #   device_map='auto',
#     #   torch_dtype=torch.float16,
#     #   low_cpu_mem_usage=True,
# )

# pipe = pipeline(
#     "text2text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     max_length=1024,
#     repetition_penalty=1.15,
# )

# local_llm = HuggingFacePipeline(pipeline=pipe)

# agent = create_csv_agent(local_llm, "dataset.csv", verbose=True)
# agent_executor = AgentExecutor(agent=agent,tools=tools, handle_parsing_errors=True)
result = agent.run("count different people with same height")
# agent.run(handle_parsing_errors=True)

# handle_parsing_errors=True

print("REs : ", result)
