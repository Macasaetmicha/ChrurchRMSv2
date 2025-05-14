from . import db

class CityMun(db.Model):
    __tablename__ = 'refcitymun'
    id = db.Column(db.Integer, primary_key=True)
    psgcCode = db.Column(db.String(255))
    citymunDesc = db.Column(db.Text)
    regCode = db.Column(db.String(255), nullable=True)
    provCode = db.Column(db.String(255), db.ForeignKey('refprovince.provCode'), nullable=True)
    citymunCode = db.Column(db.String(255), unique=True, nullable=True)

    barangays = db.relationship('Barangay', back_populates='citymun', lazy=True)
    province = db.relationship('Province', back_populates='citymuns')