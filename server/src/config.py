import os

import dotenv

dotenv.load_dotenv()

DATABASE_PATH = os.getenv("DTABASE_PATH", "data/database.db")
APP_PORT = int(os.getenv("APP_PORT", 2000))
LOGGING_SERVICE_ENDPOINT = os.getenv('LOGGING_SERVICE_ENDPOINT', 'http://localhost:8080')
BYPASS_LOGGING_SERVICE = os.getenv('BYPASS_LOGGING_SERVICE', False) == 'true'
