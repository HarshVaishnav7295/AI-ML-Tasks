from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline

model_name = "deepset/roberta-base-squad2"

# a) Get predictions
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)
QA_input = {
    'question': 'What are positive things about this product?',
    'context': "rug is not good."
}
res = nlp(QA_input)
print("REs",res)

# What are problems about this product?
# What are positive things about this product?