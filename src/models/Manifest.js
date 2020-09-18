const { NotFoundError } = require("../errors");
const { getDocument, viewResultsFromKeys } = require("../resources/couch");
const { multiTextValueToSingle } = require("../util");
const Collection = require("./Collection");
const Slug = require("./Slug");

const DB_NAME = "manifest";

async function fetch(id) {
  let document;
  try {
    document = await getDocument(DB_NAME, id);
  } catch (error) {
    throw error.status === 404
      ? new NotFoundError(`Manifest ${id} not found.`)
      : error;
  }

  let rv = {
    id,
    slug: document.slug,
    label: multiTextValueToSingle(document.label),
    type: document.type,
    parents: await Collection.loadParents(id),
  };

  if (document.type === "multicanvas") {
    rv.canvases = document.canvases;
  }

  return rv;
}

async function lookup(ids) {
  if (ids.length === 0) return {};

  let rows;
  try {
    rows = await viewResultsFromKeys(DB_NAME, "access", "basic", ids);
  } catch (error) {
    throw error;
  }

  let manifests = {};
  rows.map((row) => {
    row.value.label = multiTextValueToSingle(row.value.label);
    row.value.manifestType = row.value.type;
    row.value.type = "manifest";
    manifests[row.id] = row.value;
  });
  return manifests;
}

async function isNoid(noid) {
  return noid.startsWith("69429/m");
}

async function resolveSlug(id) {
  let slug = await Slug.info(DB_NAME, id);
  slug.type = "manifest";
  return slug;
}

async function searchSlug(prefix, limit = 10) {
  return await Slug.search(DB_NAME, prefix, limit);
}

Object.assign(module.exports, {
  fetch,
  lookup,
  isNoid,
  resolveSlug,
  searchSlug,
});
