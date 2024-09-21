import uuid
import json

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from mongo.mongodb import get_mongo_client, get_mongo_db, get_mongo_collection

from llm.sidekickai.recommender import SidekickAI

from llm.structs import CreateUserRequest, BaseLLMInputData, UserModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
sidekick_ai = SidekickAI()


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
async def post():
    return {"message": "form submitted ZK proof ID"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
