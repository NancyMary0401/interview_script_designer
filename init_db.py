#!/usr/bin/env python3
"""
Database initialization script for Interview Script Designer.
Creates the necessary database tables.
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.session import engine, Base
from app.models.models import Script

def init_db():
    """Initialize the database by creating all tables."""
    print("Creating database tables...")
    
    # Create all tables defined in the models
    Base.metadata.create_all(bind=engine)
    
    print("Database tables created successfully!")
    print("Tables created:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")

if __name__ == "__main__":
    init_db()
