from pydantic import BaseModel, Field


class ChatRequest(BaseModel):

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000
    )

    user_id: str = Field(
        ...,
        min_length=1,
        max_length=100
    )


class ChatResponse(BaseModel):

    success: bool

    message: str

    user_message: str