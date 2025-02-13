from flask import Flask

from src.db import Database
from src.logging import get_logger

from .devices import devices_bp
from .led_strips import led_strips_bp
from .command import command_bp
from .middleware import close_db, get_db


logger = get_logger(__name__)


def get_app():
    app = Flask(__name__)

    with Database() as db:
        db.init_db()

    app.before_request(get_db)

    app.register_blueprint(devices_bp, url_prefix='/devices')
    app.register_blueprint(led_strips_bp, url_prefix='/led_strips')
    app.register_blueprint(command_bp, url_prefix='/command')

    app.teardown_request(close_db)

    return app
