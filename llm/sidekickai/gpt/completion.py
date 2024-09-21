import json
import os

import openai

OPENAI_BASE_URL = os.getenv("OPEN_AI_BASE_URL", "https://0x8815e7c98d14c2fd24f2c9d695d245970ee09ffd.us.gaianet.network/v1")
OPENAI_API_KEY = os.getenv("OPEN_AI_API_KEY", "gaia")
TEXT_EMBEDDING = 'nomic-embed'
GPT_MODEL = "llama"


ADDRESS_PROMPT = [
        {
            "role": "system",
            "content": "Address Cleaner"
        },
        {
            "role": "user",
            "content": "72-A, Platinum Enclave, Sector 18, Rohini, New Delhi - 110085"
        },
        {
            "role": "assistant",
            "content": "{\"street\": \"72-A, Platinum Enclave, Sector 18\",\"city\": \"New Delhi\",\"state\": \"Delhi\",\"zip\": \"110085\"}"
        },
        {
            "role": "user",
            "content": "H401, D1, Shaitaan Singh Vihar, Vidayathar Nagar, Jaipur, Rajasthan-302031"
        }
]

class ChatCompletion:

    def __init__(self):
        self.model = GPT_MODEL
        self.embedding = TEXT_EMBEDDING
        self.openai_client = openai.OpenAI(base_url=OPENAI_BASE_URL,
                                           api_key=OPENAI_API_KEY)

    def get_embeddings(self, query: str):
        embeddings = self.openai_client.embeddings.create(input=[query], model=self.embedding)
        return embeddings['data'][0]['embedding']

    def bulk_embeddings(self, query_arr):
        embeddings = self.openai_client.embeddings.create(input=query_arr, model=self.embedding)
        return embeddings['data']

    def query_completion(self, prompt: [dict]):
        response = self.openai_client.chat.completions.create(
            model=self.model,
            messages=prompt
        )
        return response


if __name__ == '__main__':
    client = ChatCompletion()
    print(client.query_completion(ADDRESS_PROMPT))
