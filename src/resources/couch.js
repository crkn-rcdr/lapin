const { NotFoundError, ResourceUnreachableError } = require("../errors");
const fetch = require("node-fetch");
const qs = require("querystring");
const env = require("require-env");
const AbortController = require("abort-controller");
const couchUrl = env.require("COUCH");

async function _request(path, options, method, payload, timeout = 10000) {
  let url = [couchUrl, path].join("/");
  if (options) url = `${url}?${qs.stringify(options)}`;

  let fetchOptions = {
    headers: {
      Accept: "application/json",
    },
  };

  if (method) fetchOptions.method = method;
  if (payload) fetchOptions.body = JSON.stringify(payload);
  const controller = new AbortController();
  const ticker = setTimeout(() => controller.abort(), timeout);
  fetchOptions.signal = controller.signal;

  let response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    console.error(`CouchDB (${couchUrl}) unreachable.`);
    throw new ResourceUnreachableError();
  } finally {
    clearTimeout(ticker);
  }

  return response;
}

async function ping() {
  console.log(`Attempting to contact CouchDB: ${couchUrl}`);
  await _request("_all_dbs", {}, "GET", null, 2000);
  console.log(`CouchDB reachable.`);
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

async function viewResultFromKey(db, ddoc, view, key, includeDocs = false) {
  let response = await _request(buildViewPath(db, ddoc, view), {
    key: JSON.stringify(key),
    include_docs: includeDocs,
  });
  handleErrors(response);
  let data = await response.json();
  if (data.rows.length === 0) {
    throw new NotFoundError("Key lookup failed.");
  }
  return data.rows[0];
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
    {
      start_key: JSON.stringify(prefix),
      end_key: JSON.stringify(`${prefix}\ufff0`),
      limit,
    },
    "GET"
  );
  handleErrors(response);
  return (await response.json()).rows.map((row) => row.key);
}

async function update(db, ddoc, update, id) {
  // TODO: build update URL and request it
  let response = await _request(buildViewPath(db, ddoc, view), {
  }, "DELETE", {
    id,
  });
  handleErrors(response);
  return (await response.json()).rows; //Should the delete call return the remaining rows or the deleted id?
}

module.exports = {
  ping,
  getDocument,
  viewResultFromKey,
  viewResultsFromKeys,
  searchView,
  update,
};
