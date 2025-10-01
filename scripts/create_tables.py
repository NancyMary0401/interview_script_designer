#!/usr/bin/env python3
"""
Create SQLite database tables for Interview Script Designer.
Run this script once to create the necessary tables.
"""

import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

try:
    from app.db.session import engine, Base
    from app.models.models import Script
    
    print("Creating SQLite database tables...")
    
    # Create all tables defined in the models
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database tables created successfully!")
    print("Tables created:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")
    
    print("\n🎉 Your database is now ready!")
    print("You can now use the save script functionality.")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the project root directory.")
except Exception as e:
    print(f"❌ Error creating tables: {e}")
