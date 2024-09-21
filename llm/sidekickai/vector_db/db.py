import pinecone

API_KEY = 'd3ab8290-56a0-40aa-bbd2-0f3d0e23c060'
ENVIRONMENT = 'asia-southeast1-gcp-free'
INDEX_NAME = 'zepto-gpt'


class Pinecone:

    def __init__(self):
        self.api_key = API_KEY
        self.env = ENVIRONMENT
        # self.client = pinecone.init(api_key=self.api_key, environment=self.env)
        self.idx = self.client.Index(INDEX_NAME)

    def insert_data(self, id, vector, datatype: str):
        return self.idx.upsert([(id, vector, {"type": datatype})])

    def bulk_insert_data(self, arr):
        return self.idx.upsert(arr)

    def query_data(self, vector, top_k=1):
        return self.idx.query(
            vector=vector,
            top_k=top_k,
            include_metadata=True
        )
