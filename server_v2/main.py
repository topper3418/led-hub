from logging import debug
from src import app
from src import Database

if __name__ == "__main__":
    with Database() as db:
        db.init_db()

    app.run(
        port=5000,
        host="0.0.0.0",
        debug=True
    )

