const { NotFoundError } = require("../errors");
const {
  getDocumentFromView,
  viewResultsFromKeys,
} = require("../resources/couch");

class Slug {
  static #DB_NAME = "slug";
  #id;
  #noid;
  #type;
  #isAlias;
  #aliases;

  constructor(id) {
    this.#id = id;
  }

  get id() {
    this.#id;
  }

  async initialize() {
    let document;
    try {
      document = await getDocumentFromView(
        Slug.#DB_NAME,
        "access",
        "aliases",
        this.#id
      );
    } catch (error) {
      (error) => {
        throw error.status === 404
          ? new NotFoundError(`Slug ${this.#id} not found.`)
          : error;
      };
    }
    this.#noid = document.noid;
    this.#type = document.type;
    this.#isAlias = this.id !== document.id;
    this.#aliases = document.aliases;
  }

  toJSON() {
    return {
      id: this.#id,
      noid: this.#noid,
      type: this.#type,
      isAlias: this.#isAlias,
      aliases: this.#aliases,
    };
  }

  static async search(prefix, limit = 10) {}

  static async slugMap(noids) {
    let rows;
    try {
      rows = await viewResultsFromKeys("slug", "access", "noid", noids);
    } catch (error) {
      throw error;
    }

    let map = {};
    rows.map((row) => (map[row.key] = row.id));
    return map;
  }
}

module.exports = Slug;
