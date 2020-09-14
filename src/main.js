const buildApp = require("./app");
const port = 8081;

buildApp()
  .then((app) => app.start(port))
  .catch((error) => console.error(error));
