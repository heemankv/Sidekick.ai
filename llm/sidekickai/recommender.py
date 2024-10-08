from llm.sidekickai.vector_db.db import Pinecone
from llm.sidekickai.gpt.completion import ChatCompletion
from llm.sidekickai.prompts.prompts import ADDRESS_PROMPT,PROFESSION_PROMPT, PROFIlE_PROMPT, FAMILY_PROMPT


class SidekickAI:

    def __init__(self):
        self.gpt_client = ChatCompletion()
        # self.db = Pinecone()

    def get_address_from_prompt(self, prompts):
        address_prompt = ADDRESS_PROMPT.copy()
        address_prompt.append({"role": "user", "content": prompts})
        return self.gpt_client.query_completion(address_prompt)

    def get_profile_from_prompt(self, prompts):
        profile_prompt = PROFIlE_PROMPT.copy()
        profile_prompt.append({"role": "user", "content": prompts})
        return self.gpt_client.query_completion(profile_prompt)

    def get_family_from_prompt(self, prompts):
        family_prompt = FAMILY_PROMPT.copy()
        family_prompt.append({"role": "user", "content": prompts})
        return self.gpt_client.query_completion(family_prompt)

    def get_profession_from_prompt(self, prompts):
        profession_prompt = PROFESSION_PROMPT.copy()
        profession_prompt.append({"role": "user", "content": prompts})
        return self.gpt_client.query_completion(profession_prompt)
