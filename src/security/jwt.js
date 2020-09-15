const env = require("require-env");
const key = process.env.AUTHLESS ? process.env.JWT_SECRET : "";
const nJwt = require("njwt");

module.exports = (req, _scopes, _schema) => {
  let token =
    ((req.headers.authorization || "").match(/^Bearer (.+)$/i) || [])[1] ||
    null;

  if (!token) {
    throw Error(`Access requires a signed JWT in the Authorization header, in the form

Authorization: Bearer $jwt`);
  }

  let jwtData;
  try {
    jwtData = nJwt.verify(token, key);
  } catch (ignore) {}

  if (!jwtData) {
    throw Error("Could not verify JWT");
  }

  return true;
};
