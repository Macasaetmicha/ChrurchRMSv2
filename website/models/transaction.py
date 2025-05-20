from sqlalchemy import Column, Integer
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()

class CustomTransaction(Base):
    __tablename__ = 'transaction'
    id = Column(Integer, primary_key=True, autoincrement=True)  # Avoid sequences

from sqlalchemy_continuum import VersioningManager

versioning_manager = VersioningManager(transaction_cls=CustomTransaction)
