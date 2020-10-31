const { RequestError, NotFoundError } = require("../errors");
const { multiTextValueToSingle } = require("./_util");
const { getDocument, viewResultsFromKeys } = require("../resources/couch");
const Manifest = require("./Manifest");
const Slug = require("./Slug");

const DB_NAME = "collection";

async function lookup(ids) {
  if (ids.length === 0) return {};

  let rows;
  try {
    rows = await viewResultsFromKeys("collection", "access", "basic", ids);
  } catch (error) {
    throw error;
  }

  let collections = {};
  rows.map((row) => {
    row.value.label = multiTextValueToSingle(row.value.label);
    row.value.type = "collection";
    collections[row.id] = row.value;
  });
  return collections;
}

function isNoid(noid) {
  return noid.startsWith("69429/s");
}

async function resolveSlug(id) {
  let slug = await Slug.info(DB_NAME, id);
  slug.type = "collection";
  return slug;
}

async function searchSlug(prefix, limit = 10) {
  return await Slug.search(DB_NAME, prefix, limit);
}

async function loadParents(id) {
  let rows;
  try {
    rows = await viewResultsFromKeys(DB_NAME, "access", "items", [id]);
  } catch (error) {
    throw error;
  }

  return rows.map((row) => {
    return {
      id: row.id,
      slug: row.value.slug,
      label: multiTextValueToSingle(row.value.label),
    };
  });
}

async function fetch(id) {
  const loadItems = async function loadItems(items) {
    let itemIds = items.map((item) => item.id);
    let collectionLookup = lookup(itemIds.filter(isNoid));
    let manifestLookup = Manifest.lookup(itemIds.filter(Manifest.isNoid));
    let collections, manifests;
    try {
      [collections, manifests] = await Promise.all([
        collectionLookup,
        manifestLookup,
      ]);
    } catch (error) {
      throw error;
    }

    let itemRefs = { ...collections, ...manifests };
    return items.map((item) => {
      return { id: item.id, ...itemRefs[item.id] };
    });
  };

  if (!isNoid(id)) {
    throw new RequestError(`${id} is not a valid NOID.`);
  }

  let document;
  try {
    document = await getDocument(DB_NAME, id);
  } catch (error) {
    throw error.status === 404
      ? new NotFoundError(`Collection ${id} not found.`)
      : error;
  }

  let collection = {
    id,
    slug: document.slug,
    label: multiTextValueToSingle(document.label),
    ordered: document.ordered,
    public: "public" in document,
    itemCount: document.items.length,
    parents: await loadParents(id),
  };

  if (document.summary)
    collection.summary = multiTextValueToSingle(document.summary);
  if (document.ordered) collection.items = await loadItems(document.items);

  return collection;
}

Object.assign(module.exports, {
  lookup,
  isNoid,
  resolveSlug,
  searchSlug,
  loadParents,
  fetch,
});
