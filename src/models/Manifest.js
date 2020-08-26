const { NotFoundError } = require("../errors");
const { getDocument, viewResultsFromKeys } = require("../resources/couch");
const { multiTextValueToSingle } = require("../util");

class Manifest {
  static #DB_NAME = "manifest";
  #id;
  #slug;
  #label;
  #summary;
  #ocrPdf;
  #type;
  #freezeParameters;
  #canvases = [];
  #parents = [];

  constructor(id) {
    this.#id = id;
  }
  get id() {
    this.#id;
  }
  async initialize() {
    let document;
    try {
      document = await getDocument(Manifest.#DB_NAME, this.#id);
    } catch (error) {
      throw error.status === 404
        ? new NotFoundError(`Manifest ${this.#id} not found.`)
        : error;
    }
    this.#slug = document.slug;
    this.#label = multiTextValueToSingle(document.label);
    if (document.summary)
      this.#summary = multiTextValueToSingle(document.summary);
    this.#ocrPdf = document.ocrPdf;
    this.#type = document.type;
    this.#freezeParameters = document.freezeParameters;
  }
  //load Parents
  #loadParents = async () => {
    let rows;
    try {
      rows = await viewResultsFromKeys(Manifest.#DB_NAME, "access", "items", [
        this.#id,
      ]);
    } catch (error) {
      throw error;
    }

    this.#parents = rows.map((row) => {
      return {
        id: row.id,
        slug: row.value.slug,
        label: multiTextValueToSingle(row.value.label),
      };
    });
  };
  //loads canvases
  #loadCanvases = async () => {
    let rows;
    try {
      rows = await viewResultsFromKeys("canvas", "null", "_all_docs", keys);
    } catch (error) {
      throw error;
    }

    this.#canvases = rows.map((row) => {
      return {
        id: row.id,
        slug: row.value.slug,
        label: multiTextValueToSingle(row.value.label),
      };
    });
  };
  async loadCanvasItems() {
    try {
      await Promise.all([this.#loadParents(), this.#loadCanvases()]);
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.#id,
      slug: this.#slug,
      label: this.#label,
      summary: this.#summary,
      ocrPdf: this.#ocrPdf,
      canvases: this.#canvases,
      type: this.#type,
      freezeParameters: this.#freezeParameters,
      parents: this.#parents,
    };
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
