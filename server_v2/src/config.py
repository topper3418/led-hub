import os

import dotenv

dotenv.load_dotenv()

DATABASE_PATH = os.getenv("DTABASE_PATH", "data/database.db")
LOGGING_SERVICE_ENDPOINT = os.getenv('LOGGING_SERVICE_ENDPOINT', 'http://localhost:8080')
