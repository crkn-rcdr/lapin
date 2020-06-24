const Manifest = require("./Manifest");
const Slug = require("./Slug");
const { NotFoundError } = require("../errors");
const { multiTextValueToSingle } = require("../util");
const { getDocument, viewResultsFromKeys } = require("../resources/couch");

class Collection {
  static #DB_NAME = "collection";

  #id;
  #slug;
  #label;
  #summary;
  #ordered;
  #public;
  #items;
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
      document = await getDocument(Collection.#DB_NAME, this.#id);
    } catch (error) {
      throw error.status === 404
        ? new NotFoundError(`Collection ${this.#id} not found.`)
        : error;
    }
    this.#slug = document.slug;
    this.#label = multiTextValueToSingle(document.label);
    if (document.summary)
      this.#summary = multiTextValueToSingle(document.summary);
    this.#ordered = document.ordered;
    this.#public = "public" in document;
    this.#items = document.items;
  }

  #loadParents = async () => {
    let rows;
    try {
      rows = await viewResultsFromKeys(Collection.#DB_NAME, "access", "items", [
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

  #loadItems = async () => {
    let itemIds = this.#items.map((item) => item.id);
    let collectionLookup = Collection.basicLookup(
      itemIds.filter(Collection.isNoid)
    );
    let manifestLookup = Manifest.basicLookup(itemIds.filter(Manifest.isNoid));
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
    this.#items = this.#items.map((item) => {
      return { id: item.id, ...itemRefs[item.id] };
    });
  };

  async loadParentsAndItems() {
    try {
      await Promise.all([this.#loadParents(), this.#loadItems()]);
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
      ordered: this.#ordered,
      public: this.#public,
      items: this.#items,
      parents: this.#parents,
    };
  }

  // returns the labels of a list of collection ids
  static async basicLookup(collectionIds) {
    if (collectionIds.length === 0) return {};

    let rows;
    try {
      rows = await viewResultsFromKeys(
        "collection",
        "access",
        "basic",
        collectionIds
      );
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

  static isNoid(noid) {
    return noid.startsWith("69429/s");
  }
}

module.exports = Collection;
