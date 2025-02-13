from src import get_app, config


if __name__ == "__main__":
    app = get_app()

    app.run(
        port=config.APP_PORT,
        host="0.0.0.0",
        debug=True
    )

