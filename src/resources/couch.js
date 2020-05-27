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

function handleErrors(res) {
  if (res.status === 404) {
    throw new NotFoundError("Couch error status: 404");
  }
  if (res.status >= 500) {
    throw new ResourceUnreachableError();
  }
  return;
}

// 1. fetch a document from a given db
// 2. given a list of ids and a db, fetch all of the documents
// 3. given a view and a list of keys, fetch all of the values in the view?

async function getDocument(db, id) {
  let response = await _request([db, encodeURIComponent(id)].join("/"));
  handleErrors(response);
  return await response.json();
}

async function _getResultFromView(db, ddoc, view, key, includeDocs) {
  let response = await _request(
    [db, "_design", ddoc, "_view", view].join("/"),
    { key: JSON.stringify(key), include_docs: includeDocs }
  );
  handleErrors(response);
  let data = await response.json();
  if (data.rows.length === 0) {
    throw new NotFoundError("Key lookup failed.");
  }
  return data.rows[0];
}

async function getIdFromView(db, ddoc, view, key) {
  return (await _getResultFromView(db, ddoc, view, key, false)).id;
}

async function getDocumentFromView(db, ddoc, view, key) {
  return (await _getResultFromView(db, ddoc, view, key, true)).doc;
}

async function documentsWithPrefix(db, prefix) {
  return;
}

async function documentsByIDs(db, keys) {
  let result = await _request([db, "_all_docs"].join("/"), {}, "POST", {
    keys,
  });
  return result;
}

async function viewResultsFromKeys(db, ddoc, view, keys) {
  let response = await _request(
    [db, "_design", ddoc, "_view", view].join("/"),
    {},
    "POST",
    { keys }
  );
  handleErrors(response);
  return (await response.json()).rows;
}

module.exports = {
  getDocument,
  getIdFromView,
  getDocumentFromView,
  documentsWithPrefix,
  documentsByIDs,
  viewResultsFromKeys,
};
