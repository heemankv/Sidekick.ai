import uuid
import json
import hashlib
import uvicorn
from fastapi import FastAPI
import requests
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from mongo.mongodb import get_mongo_client, get_mongo_db, get_mongo_collection

from llm.sidekickai.recommender import SidekickAI

from llm.structs import CreateUserRequest, BaseLLMInputData, UserModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
sidekick_ai = SidekickAI()

def calculate_sha256(data):
  """Calculates the SHA-256 hash of the given data.

  Args:
      data: The data to hash (string or bytes).

  Returns:
      The SHA-256 hash as a hexadecimal string.
  """

  if isinstance(data, str):
      data = data.encode('utf-8')  # Encode string to bytes if necessary

  hash_object = hashlib.sha256()
  hash_object.update(data)
  return hash_object.hexdigest()

@app.get("/")
async def root(request: Request):
    return {"message": "Welcome to sidekick LLM", "path": request.url.path}


@app.post("/user")
async def create_user(request: CreateUserRequest):
    user = UserModel(user_id=request.world_coin_id, world_coin_id=request.world_coin_id, value={})
    print(user)
    resp = get_mongo_collection().insert_one(user.dict())
    print(resp)
    return {"message": f"User created successfully", "user_id": user.user_id}


@app.post("/prompt")
async def input_prompt(request: BaseLLMInputData):
    print(request)
    if request.prompt_type == "address":
        prompt_resp = sidekick_ai.get_address_from_prompt(request.prompt)
    elif request.prompt_type == "profile":
        prompt_resp = sidekick_ai.get_profile_from_prompt(request.prompt)
    elif request.prompt_type == "family":
        prompt_resp = sidekick_ai.get_family_from_prompt(request.prompt)
    elif request.prompt_type == "profession":
        prompt_resp = sidekick_ai.get_profession_from_prompt(request.prompt)
    else:
        return {"message": "Invalid prompt type"}
    user = get_mongo_collection().find_one({"user_id": request.user_id.__str__()})
    user["prompt_response"][request.prompt_type] = json.loads(prompt_resp)
    get_mongo_collection().update_one({"user_id": request.user_id.__str__()}, {"$set": user})
    return {"message": "thank you for your response"}


@app.get("/post-form")
async def post(request: Request):
    user_id = request.query_params.get("user_id")
    user = get_mongo_collection().find_one({"user_id": user_id})
    if user is None:
        return {"message": "User not found"}
    data = user["prompt_response"]
    # call selenium
    api_call = requests.request("POST", "localhost:5001/run", data=data)
    resp = api_call.json()
    # call zk proof
    zk_call_data = {
                    "llmQuestionsHash": calculate_sha256(data),
                    "userInputsHash": calculate_sha256(data),
                    "llmResponsesHash": calculate_sha256(resp),
                    "portalSubmissionsHash": calculate_sha256(resp),
                }
    zk_call = requests.request("POST", "localhost:3002/run", data=zk_call_data)
    if zk_call.status_code != 200:
        return {"message": "error in zk proof"}
    resp = zk_call.json()
    print(resp)

    return {"message": "form submitted ZK proof ID", "hash": resp.get("hash")}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
