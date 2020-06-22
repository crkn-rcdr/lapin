const Collection = require("../models/Collection");
const Slug = require("../models/Slug");

module.exports = {
  fetch: (req, res, next) => {
    let collection = new Collection(req.params.id);
    collection
      .initialize()
      .then(() => collection.loadParentsAndItems())
      .then(() => res.json(collection))
      .catch((error) => next(error));
  },
  resolveSlug: (req, res, next) => {
    let slug = new Slug("collection", req.params.id);
    slug
      .initialize()
      .then(() => res.json(slug))
      .catch((error) => next(error));
  },
  searchSlug: (req, res, next) => {
    Slug.search("collection", req.params.prefix)
      .then((results) => res.json(results))
      .catch((error) => next(error));
  },
};
