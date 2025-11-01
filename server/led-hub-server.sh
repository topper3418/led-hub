#!/bin/bash

echo "startup script called"

# activate venv
source venv/bin/activate

echo "activated environment"

# serve with gunicorn
gunicorn --bind 0.0.0.0:2000 app:app
