import os

from openai import OpenAI

def get_client():
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        raise ValueError("Missing API key")
    return OpenAI(
        api_key=api_key,
        base_url="https://api.x.ai/v1"
    )

