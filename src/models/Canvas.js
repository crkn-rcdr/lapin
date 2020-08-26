const { NotFoundError } = require("../errors");
const { getDocument, viewResultsFromKeys } = require("../resources/couch");
const { multiTextValueToSingle } = require("../util");

class Canvas {
  static #DB_NAME = "canvas";
  #id;
  constructor(id) {
    this.#id = id;
    this.#master = master;
    this.#source = source;
  }
  async initialize() {
    let document;
    try {
      document = await getDocument(Canvas.#DB_NAME, this.#id);
    } catch (error) {
      throw error.status === 404
        ? new NotFoundError(`Canvas ${this.#id} not found.`)
        : error;
    }

    this.#master = document.master;
    this.#source = document.source;
  }

  static async basicLookup(canvasIds) {
    if (canvasIds.length === 0) return {};

    let rows;
    try {
      rows = await viewResultsFromKeys(
        Canvas.#DB_NAME,
        "access",
        "basic",
        canvasIds
      );
    } catch (error) {
      throw error;
    }

    let canvas = {};
    rows.map((row) => {
      canvas[row.id] = row.value;
    });
    return canvas;
  }

  static isNoid(noid) {
    return noid.startsWith("69429/c");
  }
}

module.exports = Canvas;
