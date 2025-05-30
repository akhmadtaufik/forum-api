#!/bin/bash
set -e

echo "Starting database test setup..."

# Check if user PGUSER_TEST exists
# Connects to the default database (e.g., 'postgres') as the superuser
USER_EXISTS=$(psql -v ON_ERROR_STOP=1 -tAc "SELECT 1 FROM pg_roles WHERE rolname = '${PGUSER_TEST}'" --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}")

if [ "${USER_EXISTS}" = "1" ]; then
    echo "User ${PGUSER_TEST} already exists."
else
    echo "Creating user ${PGUSER_TEST}..."
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" -c "CREATE USER \"${PGUSER_TEST}\" WITH PASSWORD '${PGUSER_PASS}';"
fi

# Check if database PGDATABASE_TEST exists
# Connects to the default database (e.g., 'postgres') as the superuser
DB_EXISTS=$(psql -v ON_ERROR_STOP=1 -tAc "SELECT 1 FROM pg_database WHERE datname = '${PGDATABASE_TEST}'" --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}")

if [ "${DB_EXISTS}" = "1" ]; then
    echo "Database ${PGDATABASE_TEST} already exists."
else
    echo "Creating database ${PGDATABASE_TEST}..."
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" -c "CREATE DATABASE \"${PGDATABASE_TEST}\";"
fi

# Grant privileges and set owner
echo "Granting privileges and setting owner for ${PGDATABASE_TEST} to ${PGUSER_TEST}..."
psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
  GRANT ALL PRIVILEGES ON DATABASE "${PGDATABASE_TEST}" TO "${PGUSER_TEST}";
  ALTER DATABASE "${PGDATABASE_TEST}" OWNER TO "${PGUSER_TEST}";
EOSQL

echo "Database test setup completed!"
echo "User: ${PGUSER_TEST}"
echo "Database: ${PGDATABASE_TEST}"
