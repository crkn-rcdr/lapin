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
const port = 8081;
const app = express();
const apiSpec = path.join(__dirname, "../spec/api.json");

ping().catch(() => process.exit(1));

app.use(cors());
app.use(bodyParser.json());

if (nodeEnv === "development") app.use(require("morgan")("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/spec", express.static(apiSpec));
app.use("/docs", swagger.serve, swagger.setup(require(apiSpec)));

new OpenApiValidator({
  apiSpec,
  validateResponses: nodeEnv === "test",
  operationHandlers: path.join(__dirname, "routes"),
  validateSecurity: {
    handlers: {
      tokenAuth: tokenHandler,
    },
  },
})
  .install(app)
  .then(() => {
    app.use((err, _req, res, _next) => {
      let obj = { message: err.message };
      if (nodeEnv === "development") obj.stack = err.stack;
      res.status(err.status || 500).json(obj);
    });

    http.createServer(app).listen(port);
    console.log(`Lapin has started. Listening on port ${port}`);
  });

module.exports = app;
