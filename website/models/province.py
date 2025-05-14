from . import db

class Province(db.Model):
    __tablename__ = 'refprovince'
    id = db.Column(db.Integer, primary_key=True)
    psgcCode = db.Column(db.String(255))
    provDesc = db.Column(db.Text)
    regCode = db.Column(db.String(255), db.ForeignKey('refregion.regCode'), nullable=True)
    provCode = db.Column(db.String(255), unique=True, nullable=True)
    
    citymuns = db.relationship('CityMun', back_populates='province', lazy=True)
    region = db.relationship('Region', back_populates='provinces')