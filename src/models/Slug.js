const { NotFoundError } = require("../errors");
const {
  viewResultFromKey,
  viewResultsFromKeys,
  searchView,
} = require("../resources/couch");

class Slug {
  #type;
  #id;
  #noid;
  #label;
  #isAlias;
  #aliasOf;

  constructor(type, id) {
    this.#type = type;
    this.#id = id;
    // if the type names and the db names were different, we'd set this.#db here
  }

  get id() {
    this.#id;
  }

  async initialize() {
    let row;
    try {
      row = await viewResultFromKey(this.#type, "access", "slug", this.#id);
    } catch (error) {
      (error) => {
        throw error.status === 404
          ? new NotFoundError(`Slug ${this.#id} not found.`)
          : error;
      };
    }
    this.#noid = row.id;
    this.#label = row.value.label;
    this.#isAlias = row.value.isAlias;
    this.#aliasOf = row.value.aliasOf;
  }

  toJSON() {
    return {
      id: this.#id,
      noid: this.#noid,
      label: this.#label,
      type: this.#type,
      isAlias: this.#isAlias,
      aliasOf: this.#aliasOf,
    };
  }

  static async search(type, prefix, limit = 10) {
    let results;
    try {
      results = await searchView(type, "access", "slug", prefix, limit);
    } catch (error) {
      throw error;
    }
    return results;
  }
}

module.exports = Slug;
