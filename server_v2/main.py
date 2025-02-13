from src import get_app

if __name__ == "__main__":
    app = get_app()

    app.run(
        port=5000,
        host="0.0.0.0",
        debug=True
    )

