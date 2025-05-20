from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from os import path, os
from flask_migrate import Migrate
from flask_mail import Mail
from .config.config import Config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
mail = Mail()

def create_app():
    app = Flask(__name__, static_url_path="")

    # Generate a random secret key for sessions
    app.secret_key = os.urandom(32)  # Used for session

    # Use DATABASE_URL from environment (Railway PostgreSQL)
    import urllib.parse
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url or f"mysql+pymysql://{Config.DB_USER}:{Config.DB_PASSWORD}@{Config.DB_HOST}/{Config.DB_NAME}"

    # Fix the port issue from Render
    app.config['SERVER_NAME'] = None  # Remove to avoid port-related ValueError
    app.config['PREFERRED_URL_SCHEME'] = 'https'  # Render and Railway use HTTPS

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    # Load models
    from .models import User, Request, Schedule, Record, Parent, Priest, Baptism, Confirmation, Wedding, Death

    # Register the audit listener module
    with app.app_context():
        from .controllers import audit

    # User loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register blueprints
    from .controllers.views import views
    from .controllers.auth import auth
    from .controllers.admin import admin
    from .controllers.api import api as fido_bp
    from .controllers.api_db import api_db as api_db
    from .controllers.api_routes import api_route as api_route
    
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')
    app.register_blueprint(admin, url_prefix='/admin')
    app.register_blueprint(fido_bp)
    app.register_blueprint(api_db, url_prefix='/api_db')
    app.register_blueprint(api_route)

    # Mail Configurations
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'sjp.carmonacavite@gmail.com'
    app.config['MAIL_PASSWORD'] = 'hlha qnpm tfjl raul'  # Use app password for Gmail
    app.config['MAIL_DEFAULT_SENDER'] = ('St. Joseph Carmona Online', 'sjp.carmonacavite@gmail.com')

    mail.init_app(app)
    return app
