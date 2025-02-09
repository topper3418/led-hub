from src import app
import dotenv


if __name__ == '__main__':
    dotenv.load_dotenv()
    app.run(
        host='0.0.0.0',
        port=9000,
        debug=True
    )
