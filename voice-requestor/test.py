from ollama import chat
from pydantic import BaseModel

# Define a Pydantic model that matches the JSON produced by LedState.render()
class ColorModel(BaseModel):
    r: int
    g: int
    b: int

class LedStateModel(BaseModel):
    on: bool
    brightness: int
    color: ColorModel
    connected: bool | None

# Call the model with the structured output format set to our JSON schema.
response = chat(
    messages=[{
        'role': 'user',
        'content': 'set the lights to bright red',
    }],
    model='llama3.2',  # Use your actual model name if different.
    format=LedStateModel.model_json_schema(),
)

# Parse the returned JSON using the Pydantic model.
led_state = LedStateModel.model_validate_json(response.message.content)
print(led_state)
from pprint import pprint
pprint(led_state.dict())
