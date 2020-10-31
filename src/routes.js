const fs = require("fs");
const router = require("express").Router();

let routes = fs
  .readdirSync(`${__dirname}/routes`)
  .filter((file) => file.endsWith(".js"))
  .map((file) => file.slice(0, -3));

// appends the name of the route file to the route structure
// e.g. if a file called 'manifest' exists, its routes will be namespaced
// under '/manifest/$route'
routes.map((route) => router.use(`/${route}`, require(`./routes/${route}`)));

module.exports = router;
