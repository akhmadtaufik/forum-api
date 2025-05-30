#!/bin/bash
set -e

echo "Starting database test setup..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER "$PGUSER_TEST" WITH PASSWORD '$PGUSER_PASS';
  CREATE DATABASE "$PGDATABASE_TEST";
  GRANT ALL PRIVILEGES ON DATABASE "$PGDATABASE_TEST" TO "$PGUSER_TEST";
  ALTER DATABASE "$PGDATABASE_TEST" OWNER TO "$PGUSER_TEST";
EOSQL


echo "Database test setup completed!"
echo "Created user: $PGUSER_TEST"
echo "Database: $PGDATABASE_TEST"
