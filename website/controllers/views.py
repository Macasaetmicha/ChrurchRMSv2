from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user
from ..models import db, User, UserRole

views = Blueprint('views', __name__)

@views.route('/')
def index():
    return redirect(url_for('auth.login')) 

@views.route('/home')
@login_required
def home():
    return render_template("home.html", active_page='home', user=current_user, UserRole=UserRole)

@views.route('/request')
@login_required
def request():
    return render_template("request.html", active_page='request', user=current_user, UserRole=UserRole)

@views.route('/setting')
@login_required
def setting():
    return render_template("setting.html", active_page='setting', user=current_user, UserRole=UserRole)