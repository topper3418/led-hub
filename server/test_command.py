import sys

from src.db import Database
from src.dispatcher import get_new_states




def main():
    if len(sys.argv) != 2:
        print("Usage: python test_command.py \"command\"")
        sys.exit(1)
    command = sys.argv[1]
    try:
        with Database() as db:
            updates = get_new_states(db, command)
        print(updates)
    except ValueError as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
