from openai import AsyncOpenAI, OpenAIError
from app.config.settings import settings

# Create OpenAI client
client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY
)

SYSTEM_PROMPT = """
You are an AI support assistant for an application.

Your responsibilities are:
1. Answer application-related questions.
2. Explain application features in simple language.
3. Provide step-by-step instructions.
4. Be polite and professional.
5. If you do not know an answer, clearly say so.
6. Never invent application-specific rules or information.

Keep your answers clear, concise, and easy to understand.
""".strip()


async def generate_response(user_message: str) -> str:
    """Generate an AI response using OpenAI."""
    try:
        # Try OpenAI Responses API
        try:
            response = await client.responses.create(
                model=settings.OPENAI_MODEL,
                instructions=SYSTEM_PROMPT,
                input=user_message
            )
            if hasattr(response, "output_text") and response.output_text:
                return response.output_text
        except Exception:
            pass

        # Fallback to standard Chat Completions API
        model_name = settings.OPENAI_MODEL if settings.OPENAI_MODEL != "gpt-5.5" else "gpt-4o-mini"
        completion = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ]
        )
        return completion.choices[0].message.content or ""

    except OpenAIError:
        raise
