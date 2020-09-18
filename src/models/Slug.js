const { NotFoundError } = require("../errors");
const { viewResultFromKey, searchView } = require("../resources/couch");

async function info(dbName, id) {
  let row;
  try {
    row = await viewResultFromKey(dbName, "access", "slug", id);
  } catch (error) {
    throw error.status === 404
      ? new NotFoundError(`Slug ${id} not found.`)
      : error;
  }
  return {
    id,
    noid: row.id,
    label: row.value.label,
    isAlias: row.value.isAlias,
    aliasOf: row.value.aliasOf,
  };
}

async function search(dbName, prefix, limit) {
  let results;
  try {
    results = await searchView(dbName, "access", "slug", prefix, limit);
  } catch (error) {
    throw error;
  }
  return results;
}

Object.assign(module.exports, { info, search });
