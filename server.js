const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const logger = require("morgan");
const http = require("http");
const swagger = require("swagger-ui-express");
const { OpenApiValidator } = require("express-openapi-validator");

const tokenHandler = require("./security/jwt");

const port = 8081;
const app = express();
const apiSpec = path.join(__dirname, "api.json");

app.use(bodyParser.json());

app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/spec", express.static(apiSpec));
app.use("/docs", swagger.serve, swagger.setup(require(apiSpec)));

new OpenApiValidator({
  apiSpec,
  validateResponses: true,
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
      res
        .status(err.status || 500)
        .json({ status: err.status, message: err.message });
    });

    http.createServer(app).listen(port);
    console.log(`Listening on port ${port}`);
  });

module.exports = app;
