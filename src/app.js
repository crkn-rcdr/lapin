const express = require("express");
const cors = require("cors");
const env = require("require-env");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const { ping } = require("./resources/couch");
const swagger = require("swagger-ui-express");
const { OpenApiValidator } = require("express-openapi-validator");

const tokenHandler = require("./security/jwt");

const nodeEnv = env.require("NODE_ENV");

const buildApp = async () => {
  const app = express();
  const apiSpec = path.join(__dirname, "../spec/api.json");

  app.use(cors());
  app.use(bodyParser.json());

  if (nodeEnv === "development") app.use(require("morgan")("dev"));
  app.use(express.static(path.join(__dirname, "public")));

  app.use("/spec", express.static(apiSpec));
  app.use("/docs", swagger.serve, swagger.setup(require(apiSpec)));

  const validator = new OpenApiValidator({
    apiSpec,
    // validateResponses: nodeEnv === "test", NOTE: this is doing something weird
    validateResponses: false,
    operationHandlers: path.join(__dirname, "routes"),
    validateSecurity: env.contains("AUTHLESS")
      ? false
      : { handlers: { tokenAuth: tokenHandler } },
  });

  await validator.install(app);

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
