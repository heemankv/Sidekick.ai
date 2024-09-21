from pydantic import BaseModel
from pydantic.types import UUID
from typing import Dict, Optional


class CreateUserRequest(BaseModel):
    world_coin_id: str


class BaseLLMInputData(BaseModel):
    user_id: UUID
    prompt_type: str
    prompt: str


class UserModel(BaseModel):
    user_id: str
    world_coin_id: str
    value: Optional[Dict] = None
    prompt_response: Optional[Dict] = {}
