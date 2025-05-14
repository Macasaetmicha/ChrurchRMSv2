from . import db

class Barangay(db.Model):
    __tablename__ = 'refbrgy'
    id = db.Column(db.Integer, primary_key=True)
    brgyCode = db.Column(db.String(255), unique=True, nullable=True)
    brgyDesc = db.Column(db.Text)
    regCode = db.Column(db.String(255), nullable=True)
    provCode = db.Column(db.String(255), nullable=True)
    citymunCode = db.Column(db.String(255), db.ForeignKey('refcitymun.citymunCode'), nullable=True)

    citymun = db.relationship('CityMun', back_populates='barangays')