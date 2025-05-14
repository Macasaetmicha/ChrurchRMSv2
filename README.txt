#Packages to install
flask
flask-login
flask-sqlalchemy
webauthn
pymysql
flask-migrate
werkzeug

fido2 
cachetools

#For Migrations
$env:FLASK_APP = "main.py"
flask db migrate -m "Description of the migration"
flask db upgrade