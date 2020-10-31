const env = require("require-env");
const key = !env.contains("AUTHLESS") ? env.require("JWT_SECRET") : "";
const nJwt = require("njwt");
const { UnauthorizedError } = require("../errors");

module.exports = (req, _res, next) => {
  if (process.env.AUTHLESS) {
    next();
  } else {
    let token =
      ((req.headers.authorization || "").match(/^Bearer (.+)$/i) || [])[1] ||
      null;

    if (!token) {
      throw new UnauthorizedError(`Access requires a signed JWT in the Authorization header, in the form

Authorization: Bearer $jwt`);
    }

    let jwtData;
    try {
      jwtData = nJwt.verify(token, key);
    } catch (ignore) {}

    if (!jwtData) {
      throw new UnauthorizedError("Could not verify JWT");
    }

    next();
  }
};
