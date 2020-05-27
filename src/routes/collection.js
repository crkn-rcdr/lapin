const { NotFoundError } = require("../errors");
const {
  multiTextValueToSingle,
  isCollectionNoid,
  isManifestNoid,
} = require("../util");
const { getDocument, viewResultsFromKeys } = require("../resources/couch");

const lookupItems = function (items) {
  let collectionLookup = viewResultsFromKeys(
    "collection",
    "access",
    "basic",
    items.filter(isCollectionNoid)
  ).then((rows) => {
    let collections = {};
    rows.map((row) => {
      row.value.label = multiTextValueToSingle(row.value.label);
      collections[row.id] = row.value;
    });
    return collections;
  });

  let manifestLookup = viewResultsFromKeys(
    "manifest",
    "access",
    "basic",
    items.filter(isManifestNoid)
  ).then((rows) => {
    let manifests = {};
    rows.map((row) => {
      row.value.label = multiTextValueToSingle(row.value.label);
      manifests[row.id] = row.value;
    });
    return manifests;
  });

  return Promise.all([collectionLookup, manifestLookup]).then(
    ([collections, manifests]) => {
      return items.map((item) => {
        let value = isCollectionNoid(item)
          ? collections[item] || {}
          : isManifestNoid(item)
          ? manifests[item] || {}
          : {};
        return { id: item, ...value };
      });
    }
  );
};

module.exports = {
  fetch: (req, res, next) => {
    let id = req.params.id;
    let collection;
    getDocument("collection", id)
      .then((document) => {
        collection = {
          id,
          label: multiTextValueToSingle(document.label),
          ordered: document.ordered,
          public: "public" in document,
          items: document.items,
        };
        return collection;
      })
      .catch((error) =>
        error.status === 404
          ? next(new NotFoundError(`Collection ${id} not found.`))
          : next(error)
      )
      .then((collection) => {
        // find the collection's parents
        return viewResultsFromKeys("collection", "access", "items", [id]).then(
          (rows) => {
            collection.parents = [];
            rows.map((row) =>
              collection.parents.push({
                id: row.id,
                label: multiTextValueToSingle(row.value),
              })
            );
            return collection;
          }
        );
      })
      .then((collection) => {
        // look up information about the collection's items
        let itemLookup = lookupItems(collection.items);
        // look up slugs for 1. collection items
        let slugKeys = collection.items.concat(
          collection.parents.map((parent) => parent.id), // 2. the collection's parents
          [id] // 3. the collection itself
        );
        let slugLookup = viewResultsFromKeys(
          "slug",
          "access",
          "noid",
          slugKeys
        ).then((slugs) => slugs.map((slug) => slug.id));
        return Promise.all([itemLookup, slugLookup]).then(([items, slugs]) => {
          // apply the slug to 1. the collection itself
          collection.slug = slugs[slugs.length - 1];
          // apply the slug to 2. the collection's parents
          slugs
            .slice(items.length, slugs.length - 1)
            .map((slug, index) => (collection.parents[index].slug = slug));
          // 3. collection items
          collection.items = items.map((item, index) => {
            item.slug = slugs[index];
            return item;
          });
          return collection;
        });
      })
      .then((collection) => res.json(collection))
      .catch((error) => next(error));
  },
};
