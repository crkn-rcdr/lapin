const Collection = require("../models/Collection");

module.exports = {
  fetch: (req, res, next) => {
    Collection.fetch(req.params.id)
      .then((collection) => res.json(collection))
      .catch((error) => next(error));
  },
  resolveSlug: (req, res, next) => {
    Collection.resolveSlug(req.params.id)
      .then((slug) => res.json(slug))
      .catch((error) => next(error));
  },
  searchSlug: (req, res, next) => {
    Collection.searchSlug(req.params.prefix)
      .then((results) => res.json(results))
      .catch((error) => next(error));
  },
};
