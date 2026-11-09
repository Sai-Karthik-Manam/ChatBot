from fastapi import APIRouter, Header, HTTPException, status
from openai import AuthenticationError, OpenAIError

from app.config.settings import settings
from app.models.chat_model import ChatRequest, ChatResponse
from app.services.openai_service import generate_response

router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat_endpoint(
    payload: ChatRequest,
    x_api_key: str = Header(None, alias="X-API-KEY")
):
    # Verify API key if configured
    if settings.CHATBOT_API_KEY and settings.CHATBOT_API_KEY != "your_chatbot_secret_key_here":
        if not x_api_key or x_api_key != settings.CHATBOT_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Missing or invalid X-API-KEY header"
            )

    try:
        reply = await generate_response(payload.message)
        return ChatResponse(
            success=True,
            message=reply,
            user_message=payload.message
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OpenAI authentication failed. Please check your OPENAI_API_KEY in .env."
        )
    except OpenAIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
