#!/bin/bash
set -e

# Pastikan postgres sudah siap
until pg_isready; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# Buat database dengan nama yang sama dengan user jika belum ada
# Ini untuk mengatasi error "database developer does not exist"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  SELECT 'CREATE DATABASE $POSTGRES_USER' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_USER');
  GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_USER TO $POSTGRES_USER;
  GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

echo "Database test setup completed!"
