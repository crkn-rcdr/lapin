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
  #ordered;
  #public;
  #itemIds;
  #items;
  #parents = [];
  #slugMap;

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
    this.#label = multiTextValueToSingle(document.label);
    this.#ordered = document.ordered;
    this.#public = "public" in document;
    this.#itemIds = document.items;
  }

  async loadParents() {
    let rows;
    try {
      rows = await viewResultsFromKeys(Collection.#DB_NAME, "access", "items", [
        this.#id,
      ]);
    } catch (error) {
      throw error;
    }

    this.#parents = rows.map((row) => {
      return { id: row.id, label: multiTextValueToSingle(row.value) };
    });
  }

  #loadItems = async () => {
    console.log(this.#itemIds);
    console.log(this.#itemIds.filter(Manifest.isNoid));
    let collectionLookup = Collection.basicLookup(
      this.#itemIds.filter(Collection.isNoid)
    );
    let manifestLookup = Manifest.basicLookup(
      this.#itemIds.filter(Manifest.isNoid)
    );
    let collections, manifests;
    try {
      [collections, manifests] = await Promise.all([
        collectionLookup,
        manifestLookup,
      ]);
    } catch (error) {
      throw error;
    }
    console.log(manifests);
    let itemRefs = { ...collections, ...manifests };
    this.#items = this.#itemIds.map((id) => {
      return { id, ...itemRefs[id] } || {};
    });
  };

  #loadSlugs = async () => {
    // we're looking up slugs for 1. the collection's items
    let noids = this.#itemIds.concat(
      this.#parents.map((parent) => parent.id), // 2. the collection's parents
      [this.#id] // 3 the collection itself
    );

    try {
      this.#slugMap = await Slug.slugMap(noids);
    } catch (error) {
      throw error;
    }
  };

  #insertSlugs = () => {
    this.#slug = this.#slugMap[this.#id];
    this.#parents.map((parent) => (parent.slug = this.#slugMap[parent.id]));
    this.#items.map((item) => (item.slug = this.#slugMap[item.id]));
  };

  async loadItemsAndSlugs() {
    try {
      await Promise.all([this.#loadItems(), this.#loadSlugs()]);
    } catch (error) {
      throw error;
    }
    this.#insertSlugs();
  }

  toJSON() {
    return {
      id: this.#id,
      slug: this.#slug,
      label: this.#label,
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
