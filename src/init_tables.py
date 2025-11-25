# src/init_tables.py
import sys
import os

# Aseguramos que Python encuentre los módulos
sys.path.append(os.getcwd())

from database import engine, Base
# IMPORTANTE: Importar todos los modelos para que SQLAlchemy sepa que existen
from models import * def init_db():
    print("Conectando a la base de datos...")
    try:
        # Esto crea todas las tablas definidas en tus modelos
        # Solo crea las que no existen, así que es seguro correrlo varias veces
        Base.metadata.create_all(bind=engine)
        print("✅ ¡Tablas creadas exitosamente!")
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")

if __name__ == "__main__":
    init_db()