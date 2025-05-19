from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import flask_login
from flask_login import login_user, login_required, logout_user, current_user
from ..models import User, UserRole
from ..db import create_user, UsernameAlreadyExistsException
import re
from ..fidosession import get_user_id, close_fido_session, start_fido_session
from ..models import db, User, UserRole, Record, Request, Schedule, Parent, Baptism, Confirmation, Wedding, Death, Priest, Region, Province, CityMun, Barangay
import traceback 
import uuid

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    logout_user()

    if current_user.is_authenticated:
        return redirect('/')

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()

        if user:
            if check_password_hash(user.password, password):
                start_fido_session(user.id)
                return redirect('/login_fido')
            else:
                flash('Incorrect password, try again.', category='error')
        else:
            flash('Email does not exist.', category='error')

    return render_template("login.html", active_page='login', user=current_user, UserRole=UserRole)

@auth.route('/login_fido')
def login_fido():
    """This route returns the HTML for the fido-login page. This page can only be accessed if the user has a valid
    fido-session."""

    
    if flask_login.current_user.is_authenticated:
        return redirect("/home")

    
    user_id = get_user_id()
    print('USER ID CHECK2')
    print(user_id)
    if user_id is None:
        return redirect('/login')

    return render_template("login_fido.html", active_page='login', user=current_user, UserRole=UserRole)

@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    logout_user()

    if current_user.is_authenticated:
        return redirect('/')

    return render_template("signup.html", active_page='signup', user=current_user, UserRole=UserRole)

@auth.route('/signup-user', methods=['POST'])
def signupUser():
    try:    
        print("POST METHOD")
        data = request.form.to_dict()

        first_name = request.form.get('fname')
        middle_name = request.form.get('mname')
        last_name = request.form.get('lname')
        username = request.form.get('username')
        contact_number = request.form.get('contact_number')
        email = request.form.get('email')
        password = request.form.get('password')

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)

        existing_user = User.query.filter(
            and_(
                User.first_name.ilike(first_name),
                User.middle_name.ilike(middle_name) if middle_name else User.middle_name.is_(None),
                User.last_name.ilike(last_name)
            )
        ).first()

        if existing_user:
            return jsonify({
                "error": "A user with the same name already exists.",
                "type": "warning"
            }), 409

        if not re.match(r'^09\d{9}$', contact_number):
            return jsonify({
                "error": "Invalid contact number format. Use 09XXXXXXXXX.",
                "type": "warning"
            }), 400

        if User.query.filter_by(username=username).first():
            return jsonify({
                "error": "Username already exists.",
                "type": "warning"
            }), 409

        if User.query.filter_by(email=email).first():
            return jsonify({
                "error": "Email already exists.",
                "type": "warning"
            }), 409

        
        temp_id = str(uuid.uuid4())

        
        session[f"temp_user_{temp_id}"] = {
            "username": username,
            "first_name": first_name,
            "middle_name": middle_name,
            "last_name": last_name,
            "contact_number": contact_number,
            "email": email,
            "password": hashed_password,
            "role": UserRole.STAFF.value
        }

        print("SUCCESS\n\n")

        return jsonify({
            "status": "ok",
            "type":"info",
            "message": "Account data received. Proceed with authentication.",
            "temp_id": temp_id  
        })
    except Exception as e:
        db.session.rollback()
        print("ERROR OCCURRED:", str(e))  
        traceback.print_exc()
        return jsonify({
            "error": "Server error occurred.",
            "details": str(e),
            "type": "error"
        }), 500












from sqlalchemy import and_

@auth.route("/submit-account", methods=["POST"])
@login_required
def submit_account():
    try:
        data = request.form.to_dict()

        first_name = request.form.get('fname')
        middle_name = request.form.get('mname')
        last_name = request.form.get('lname')
        username = request.form.get('username')
        contact_number = request.form.get('contact_number')
        email = request.form.get('email')
        password = request.form.get('password')

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)

        existing_user = User.query.filter(
            and_(
                User.first_name.ilike(first_name),
                User.middle_name.ilike(middle_name) if middle_name else User.middle_name.is_(None),
                User.last_name.ilike(last_name)
            )
        ).first()

        if existing_user:
            return jsonify({
                "error": "A user with the same name already exists.",
                "type": "warning"
            }), 409

        if not re.match(r'^09\d{9}$', contact_number):
            return jsonify({
                "error": "Invalid contact number format. Use 09XXXXXXXXX.",
                "type": "warning"
            }), 400

        if User.query.filter_by(username=username).first():
            return jsonify({
                "error": "Username already exists.",
                "type": "warning"
            }), 409

        if User.query.filter_by(email=email).first():
            return jsonify({
                "error": "Email already exists.",
                "type": "warning"
            }), 409

        
        temp_id = str(uuid.uuid4())

        
        session[f"temp_user_{temp_id}"] = {
            "username": username,
            "first_name": first_name,
            "middle_name": middle_name,
            "last_name": last_name,
            "contact_number": contact_number,
            "email": email,
            "password": hashed_password,
            "role": UserRole.STAFF.value
        }

        # new_user = User(
        #     username=username,
        #     first_name=first_name,
        #     middle_name=middle_name,
        #     last_name=last_name,
        #     contact_number=contact_number,
        #     email=email,
        #     password=hashed_password,
        #     role=UserRole.STAFF
        # )

        # db.session.add(new_user)
        # db.session.commit()

        return jsonify({
            "status": "ok",
            "type":"info",
            "message": "Account data received. Proceed with authentication.",
            "temp_id": temp_id  
        })

        # return jsonify({
        #     "message": "Proceed to authentication",
        #     "user_id": new_user.id,
        #     "type": "success"
        # }), 200

    except Exception as e:
        db.session.rollback()
        print("ERROR OCCURRED:", str(e))  
        traceback.print_exc()
        return jsonify({
            "error": "Server error occurred.",
            "details": str(e),
            "type": "error"
        }), 500

@auth.route("/edit-account/<int:user_id>", methods=["PUT"])
def edit_account(user_id):
    try:
        data = request.form or request.json
        print(f"Edit request data: {data}")

        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found.", "type": "error"}), 404

        
        fname = data.get("fname", user.first_name)
        mname = data.get("mname", user.middle_name or "")
        lname = data.get("lname", user.last_name)
        username = data.get("username", user.username)
        email = data.get("email", user.email)

        
        duplicate_name = User.query.filter(
            User.first_name == fname,
            User.middle_name == mname,
            User.last_name == lname,
            User.id != user_id
        ).first()
        if duplicate_name:
            return jsonify({
                "message": "Another user with the same full name already exists.",
                "type": "error"
            }), 400

        
        if 'username' in data:
            existing_user = User.query.filter(User.username == username, User.id != user_id).first()
            if existing_user:
                return jsonify({"message": "Username already taken.", "type": "error"}), 400

        
        if 'email' in data:
            existing_email = User.query.filter(User.email == email, User.id != user_id).first()
            if existing_email:
                return jsonify({"message": "Email already in use.", "type": "error"}), 400

        
        user.first_name = fname
        user.middle_name = mname
        user.last_name = lname
        user.username = username
        user.contact_number = data.get("contact_number", user.contact_number)
        user.email = email

        db.session.commit()

        return jsonify({
            "message": "User account updated successfully!",
            "type": "success"
        }), 200

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({
            "message": f"An error occurred: {str(e)}",
            "type": "error"
        }), 500


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))