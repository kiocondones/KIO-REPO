from flask import Flask
import os
from dotenv import load_dotenv
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from datetime import timedelta

from app.config import Config

load_dotenv()

# app config
app = Flask(__name__)
bcrypt = Bcrypt(app)
# Configure CORS for frontend apps
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
                   "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                   "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002",
                   "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
rest_api = Api(app)
jwt = JWTManager(app)

# Development
config = Config().dev_config

app.env = config.ENV
app.debug = config.DEBUG

# Database Connection - with fallback defaults for local development
db_uri = os.environ.get("SQLALCHEMY_DATABASE_URI_DEV")
if not db_uri:
    # Fallback to default local development database
    db_uri = f"mysql+pymysql://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}"

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = os.environ.get("SQLALCHEMY_TRACK_MODIFICATIONS", "False")
# app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=10) # Expires after 10 hours
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=5) # Refersh token expires after 5 days


db = SQLAlchemy(app)
migrate = Migrate(app, db)

from app.models import Account, User, Department, Role, SLAPolicy, TimeUnit


def seed_defaults():
    try:
        account = Account.query.filter_by(id=1).first()
    except Exception:
        return

    if not account:
        account = Account(
            id=1,
            name="Default Account",
            description="Default organization account",
        )
        db.session.add(account)
        db.session.commit()

    default_roles = ["Admin", "Technician", "Manager", "Viewer"]
    default_departments = [
        "Business Intelligence Group",
        "IT Department",
        "Facilities Management",
        "Housekeeping",
    ]

    departments = {}
    for d in default_departments:
        dep = Department.query.filter_by(name=d, account_id=account.id).first()
        if not dep:
            dep = Department(name=d, account_id=account.id)
            db.session.add(dep)
        departments[d] = dep

    db.session.commit()

    roles = {}
    for r in default_roles:
        role = Role.query.filter_by(name=r, account_id=account.id).first()
        if not role:
            role = Role(
                name=r,
                description=f"Default {r} role",
                department=departments.get("IT Department"),
                account_id=account.id,
            )
            db.session.add(role)
        roles[r] = role

    if not SLAPolicy.query.filter_by(name="standard", account_id=account.id).first():
        db.session.add(SLAPolicy(
            name="standard",
            response_time=4,
            response_unit=TimeUnit.HOURS,
            resolution_time=24,
            resolution_unit=TimeUnit.HOURS,
            escalation_l1=8,
            escalation_l1_unit=TimeUnit.HOURS,
            escalation_l2=16,
            escalation_l2_unit=TimeUnit.HOURS,
            account_id=account.id,
        ))

    db.session.commit()

    if not User.query.filter_by(email="admin@gcg.com", account_id=account.id).first():
        hashed_password = bcrypt.generate_password_hash("password").decode("utf-8")
        db.session.add(User(
            name="Carlo Mendoza",
            email="admin@gcg.com",
            phone="09112345678",
            role=roles.get("Admin"),
            location="Manila Branch",
            password=hashed_password,
            department=departments.get("IT Department"),
            account_id=account.id,
        ))

    if not User.query.filter_by(email="requestor@gcg.com", account_id=account.id).first():
        hashed_password = bcrypt.generate_password_hash("password").decode("utf-8")
        db.session.add(User(
            name="John Doe",
            email="requestor@gcg.com",
            phone="09112345679",
            role=roles.get("Viewer"),
            password=hashed_password,
            location="Manila Branch",
            account_id=account.id,
        ))

    if not User.query.filter_by(email="technician@gcg.com", account_id=account.id).first():
        hashed_password = bcrypt.generate_password_hash("password").decode("utf-8")
        db.session.add(User(
            name="John Dela Cruz",
            email="technician@gcg.com",
            phone="09112345638",
            role=roles.get("Technician"),
            password=hashed_password,
            department=departments.get("IT Department"),
            location="Manila Branch",
            account_id=account.id,
        ))

    db.session.commit()


try:
    with app.app_context():
        seed_defaults()
except Exception as e:
    print(f"Warning: Could not seed defaults: {e}")


from .api import servicedesk_routes, auth_routes, requestor_routes, technician_routes, service_config_routes
servicedesk_routes(rest_api)
auth_routes(rest_api)
requestor_routes(rest_api)
technician_routes(rest_api)
service_config_routes(rest_api)


# from .socket import register_socket_events, emit_notification

from flask import send_from_directory

UPLOAD_FOLDER = "uploads"
@app.route("/api/uploads/<path:filename>")
def uploaded_file(filename):
    link = send_from_directory(UPLOAD_FOLDER, filename)
    return link

from .socket import socketio
socketio.init_app(app)

from app.api.health_resource import HealthResource
rest_api.add_resource(HealthResource, "/api/health")
