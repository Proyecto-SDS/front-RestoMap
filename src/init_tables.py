import sys
import os

# --- CORRECCIÓN DE RUTAS ---
# Obtenemos la ruta absoluta de donde está ESTE archivo (src/init_tables.py)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Agregamos esa ruta al "path" de Python para que encuentre database.py y models.py
sys.path.append(current_dir)
# También agregamos la carpeta padre (la raíz del proyecto) por si acaso
sys.path.append(os.path.dirname(current_dir))
# ---------------------------

try:
    from database import engine, Base
    # Importamos los modelos explícitamente para registrarlos
    # (Asegúrate de que tu archivo se llame models.py dentro de src/)
    from models import * def init_db():
        print(f"Iniciando creación de tablas en: {engine.url}")
        try:
            # Crea las tablas
            Base.metadata.create_all(bind=engine)
            print("✅ ¡Tablas creadas exitosamente!")
        except Exception as e:
            print(f"❌ Error fatal creando tablas: {e}")
            sys.exit(1) # Forzamos error para que Cloud Run sepa que falló

    if __name__ == "__main__":
        init_db()

except ImportError as e:
    print(f"❌ Error de importación (Rutas): {e}")
    print(f"Rutas actuales de Python: {sys.path}")
    sys.exit(1)