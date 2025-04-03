# file for the application to be served by gunicorn or something like that. 
# to run for development, use dev.py
from src import get_app, config


app = get_app()

