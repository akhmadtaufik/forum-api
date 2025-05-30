#!/bin/bash
set -e

echo "Starting database production setup..."

# Create user and database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER "$PGUSER" WITH PASSWORD '$PGPASSWORD';
  CREATE DATABASE "$PGDATABASE";
  GRANT ALL PRIVILEGES ON DATABASE "$PGDATABASE" TO "$PGUSER";
  ALTER DATABASE "$PGDATABASE" OWNER TO "$PGUSER";
EOSQL

echo "Database production setup completed!"
echo "Created user: $PGUSER"
echo "Database: $PGDATABASE"
