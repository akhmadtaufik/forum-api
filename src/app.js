require("dotenv").config();
process.env.TZ = "UTC"; // Set timezone to UTC for the application
const createServer = require("./Infrastructures/http/createServer");
const container = require("./Infrastructures/container");

(async () => {
  const server = await createServer(container);
  await server.start();
  console.log(`server start at ${server.info.uri}`);
})();
