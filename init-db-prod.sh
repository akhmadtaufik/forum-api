#!/bin/bash
set -e

echo "Starting database production setup..."

# Check if user PGUSER exists
# Connects to the default database (e.g., 'postgres') as the superuser
USER_EXISTS=$(psql -v ON_ERROR_STOP=1 -tAc "SELECT 1 FROM pg_roles WHERE rolname = '${PGUSER}'" --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}")

if [ "${USER_EXISTS}" = "1" ]; then
    echo "User ${PGUSER} already exists."
else
    echo "Creating user ${PGUSER}..."
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" -c "CREATE USER \"${PGUSER}\" WITH PASSWORD '${PGPASSWORD}';"
fi

# Check if database PGDATABASE exists
# Connects to the default database (e.g., 'postgres') as the superuser
DB_EXISTS=$(psql -v ON_ERROR_STOP=1 -tAc "SELECT 1 FROM pg_database WHERE datname = '${PGDATABASE}'" --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}")

if [ "${DB_EXISTS}" = "1" ]; then
    echo "Database ${PGDATABASE} already exists."
else
    echo "Creating database ${PGDATABASE}..."
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" -c "CREATE DATABASE \"${PGDATABASE}\";"
fi

# Grant privileges and set owner
echo "Granting privileges and setting owner for ${PGDATABASE} to ${PGUSER}..."
psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
  GRANT ALL PRIVILEGES ON DATABASE "${PGDATABASE}" TO "${PGUSER}";
  ALTER DATABASE "${PGDATABASE}" OWNER TO "${PGUSER}";
EOSQL

echo "Database production setup completed!"
echo "User: ${PGUSER}"
echo "Database: ${PGDATABASE}"
