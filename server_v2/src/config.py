import os

import dotenv

dotenv.load_dotenv()

LOGGING_DATABASE_PATH = os.getenv("LOGGING_DATABASE_PATH", "data/logs.db")
DATABASE_PATH = os.getenv("DTABASE_PATH", "data/database.db")
