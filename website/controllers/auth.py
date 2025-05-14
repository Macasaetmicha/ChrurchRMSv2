from flask import Blueprint, render_template, request, flash, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import flask_login
from flask_login import login_user, login_required, logout_user, current_user
from ..models import User, UserRole
from ..db import create_user, UsernameAlreadyExistsException
import re
from ..fidosession import get_user_id, close_fido_session, start_fido_session

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

    # logged-in users don't have to log in
    if flask_login.current_user.is_authenticated:
        return redirect("/home")

    # check if there is a fido-session
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

    if request.method == 'POST':
        first_name = request.form.get('fname')
        middle_name = request.form.get('mname')
        last_name = request.form.get('lname')
        username = request.form.get('username')
        contact_number = request.form.get('contact_number')
        email = request.form.get('email')
        password = request.form.get('password')

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)

        #Validate contact number format
        if not re.match(r'^09\d{9}$', contact_number):
            flash('Invalid contact number format. Use 09XXXXXXXXX.', category='error')
            return render_template("signup.html", active_page='signup', user=current_user, UserRole=UserRole)
        
        try:
            new_user = create_user(username=username, firstname=first_name, middlename=middle_name, lastname=last_name, contact_number=contact_number, email=email, password=hashed_password)
        
        except UsernameAlreadyExistsException as e:
            flash(str(e), category='error')
            return render_template("signup.html", active_page='signup', user=current_user, UserRole=UserRole)

        # create a new session for the user
        flask_login.login_user(new_user, remember=True)
        flash('Account created successfully!', category='success')
        return redirect('/signup_fido')

    return render_template("signup.html", active_page='signup', user=current_user, UserRole=UserRole)

@auth.route('/signup_fido', methods=['GET', 'POST'])
@login_required
def signup_fido():
    return render_template("signup_fido.html", active_page='signup', user=current_user, UserRole=UserRole)

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))