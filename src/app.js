const express = require("express");
const cors = require("cors");
const env = require("require-env");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const { MethodNotHandled } = require("./errors");
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
    // TODO: this is doing something weird. I'd like to figure it out
    // validateResponses: nodeEnv === "test",
    validateResponses: false,
    operationHandlers: {
      basePath: path.join(__dirname, "routes"),
      resolver: (basePath, route) => {
        const method = route.schema["x-eov-operation-id"];
        const modulePath = path.join(
          basePath,
          route.schema["x-eov-operation-handler"]
        );
        const handler = require(modulePath);
        if (handler && handler[method]) {
          return handler[method];
        } else {
          return (_req, _res, next) => {
            next(new MethodNotHandled());
          };
        }
      },
    },
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
