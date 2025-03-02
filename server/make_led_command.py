import sys
from pprint import pprint
from src.dispatcher.contextCommandProcessor import ContextCommandProcessor


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_led_command.py \"command\"")
        sys.exit(1)
    command = sys.argv[1]
    processor = ContextCommandProcessor()
    pprint(processor.context)
    print("COMMAND:", command)
    command_response = processor.process_command(command)
    pprint(command_response.model_dump())


