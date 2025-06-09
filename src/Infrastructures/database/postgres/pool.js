/* istanbul ignore file */
const { Pool, types } = require("pg");

// Ensure TIMESTAMPTZ is parsed as a string to preserve UTC
const TIMESTAMPTZ_OID = 1184;
types.setTypeParser(TIMESTAMPTZ_OID, (val) => val);

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

const poolConfig = process.env.NODE_ENV === "test" ? testConfig : {};
const pool = new Pool(poolConfig);

// Set TIME ZONE to UTC and datestyle for every new connection
pool.on("connect", (client) => {
  client.query("SET TIME ZONE 'UTC'; SET datestyle = 'ISO, YMD';", (err) => {
    if (err) {
      console.error(
        "Failed to set time zone or datestyle for new PostgreSQL client:",
        err
      );
    }
  });
});

module.exports = pool;
