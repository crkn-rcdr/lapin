const { viewResultsFromKeys } = require("../resources/couch");
const { multiTextValueToSingle } = require("../util");

class Manifest {
  static #DB_NAME = "manifest";
  #id;

  constructor(id) {
    this.#id = id;
  }

  // returns the labels of a list of manifest ids
  static async basicLookup(manifestIds) {
    if (manifestIds.length === 0) return {};

    let rows;
    try {
      rows = await viewResultsFromKeys(
        Manifest.#DB_NAME,
        "access",
        "basic",
        manifestIds
      );
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

  static isNoid(noid) {
    return noid.startsWith("69429/m");
  }
}

module.exports = Manifest;
