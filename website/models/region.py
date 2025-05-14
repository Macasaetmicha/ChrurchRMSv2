from . import db

class Region(db.Model):
    __tablename__ = 'refregion'
    id = db.Column(db.Integer, primary_key=True)
    psgcCode = db.Column(db.String(255))
    regDesc = db.Column(db.Text)
    regCode = db.Column(db.String(255), unique=True, nullable=True)

    provinces = db.relationship('Province', back_populates='region', lazy=True)
