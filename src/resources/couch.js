const { NotFoundError, ResourceUnreachableError } = require("../errors");
const fetch = require("node-fetch");
const qs = require("querystring");
const env = require("require-env");
const couchUrl = env.require("COUCH");

async function _request(path, options, method, payload) {
  let url = [couchUrl, path].join("/");
  if (options) url = `${url}?${qs.stringify(options)}`;

  let fetchOptions = {
    headers: {
      Accept: "application/json",
    },
  };

  if (method) fetchOptions.method = method;
  if (payload) fetchOptions.body = JSON.stringify(payload);

  return await fetch(url, fetchOptions);
}

function buildViewPath(db, ddoc, view) {
  if (ddoc === null && view === "_all_docs") {
    return [db, "_all_docs"].join("/");
  } else {
    return [db, "_design", ddoc, "_view", view].join("/");
  }
}

function handleErrors(res) {
  if (res.status === 404) {
    throw new NotFoundError("Couch error status: 404");
  }
  if (res.status >= 500) {
    throw new ResourceUnreachableError();
  }
  return;
}

async function getDocument(db, id) {
  let response = await _request([db, encodeURIComponent(id)].join("/"));
  handleErrors(response);
  return await response.json();
}

async function getDocumentFromView(db, ddoc, view, key) {
  let response = await _request(buildViewPath(db, ddoc, view), {
    key: JSON.stringify(key),
    include_docs: true,
  });
  handleErrors(response);
  let data = await response.json();
  if (data.rows.length === 0) {
    throw new NotFoundError("Key lookup failed.");
  }
  return data.rows[0].doc;
}

async function viewResultsFromKeys(db, ddoc, view, keys) {
  let response = await _request(buildViewPath(db, ddoc, view), {}, "POST", {
    keys,
  });
  handleErrors(response);
  return (await response.json()).rows;
}

async function searchView(db, ddoc, view, prefix, limit) {
  let response = await _request(
    buildViewPath(db, ddoc, view),
    { start_key: JSON.stringify(prefix), limit },
    "GET"
  );
  handleErrors(response);
  return (await response.json()).rows.map((row) => row.key);
}

module.exports = {
  getDocument,
  getDocumentFromView,
  viewResultsFromKeys,
  searchView,
};
