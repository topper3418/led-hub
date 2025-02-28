import sys
import json
from src.dispatcher.client import get_client
from src.models import LedStrip

def make_led_command(command: str) -> LedStrip:
    client = get_client()
    system_prompt = f"""
You are an LED strip. I will send you a command to change your state. Your state must be represented by the following model: 
{LedStrip.model_json_schema()}
"""
    completion = client.chat.completions.create(
        model="grok-2-latest",
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": command
            },
        ],
    )
    response_string = completion.choices[0].message.content
    if response_string is None:
        raise ValueError("No response from the model.")
    response = json.loads(response_string)
    return LedStrip(**response)


def exrapolate_command(command: str) -> str:
    pass


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_led_command.py \"command\"")
        sys.exit(1)
    command = sys.argv[1]
    response = make_led_command(command)
    print(response)
