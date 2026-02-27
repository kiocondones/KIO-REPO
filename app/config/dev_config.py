class DevConfig:
    def __init__(self):
        self.ENV = "development"
        self.DEBUG = True

        # Flask server
        self.FLASK_HOST = "127.0.0.1"
        self.FLASK_PORT = 8000

        # Database
        self.DB_HOST = "localhost"
        self.DB_PORT = 3306
        self.DB_USER = "root"
        self.DB_PASSWORD = "Goli_Unified123"
        self.DB_NAME = "goli_unified"