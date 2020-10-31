const express = require("express");
const cors = require("cors");
const env = require("require-env");
const bodyParser = require("body-parser");
const http = require("http");
const { MethodNotHandled } = require("./errors");
const { ping } = require("./resources/couch");

const tokenHandler = require("./security/jwt");

const nodeEnv = env.require("NODE_ENV");

const buildApp = async () => {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  if (nodeEnv === "development") app.use(require("morgan")("dev"));

  app.use(tokenHandler);

  app.use("/v1/", require("./routes"));

  app.use((req, _res, next) => {
    if (!req.route) {
      throw new MethodNotHandled();
    }
    next();
  });

  app.use((err, _req, res, _next) => {
    let status = err.status || 500;
    let obj = { message: err.message, status };
    if (nodeEnv !== "production") obj.stack = err.stack;
    res.status(status).json(obj);
  });

  app.start = async (port) => {
    try {
      await ping();
    } catch (ignore) {
      process.exit(1);
    }

    const server = http.createServer(app);
    server.listen(port);
    console.log(`Lapin has started. Listening on port ${port}`);

    return server;
  };

  return app;
};

module.exports = buildApp;
