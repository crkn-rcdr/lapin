const buildApp = require("../../src/app");

let server;

before(async () => {
  const app = await buildApp();
  server = await app.start(8081);
});

after(() => {
  server.close();
});
