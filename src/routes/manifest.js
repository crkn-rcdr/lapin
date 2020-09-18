const Manifest = require("../models/Manifest");

module.exports = {
  fetch: (req, res, next) => {
    Manifest.fetch(req.params.id)
      .then((manifest) => res.json(manifest))
      .catch((error) => next(error));
  },
  resolveSlug: (req, res, next) => {
    Manifest.resolveSlug(req.params.id)
      .then((slug) => res.json(slug))
      .catch((error) => next(error));
  },
  searchSlug: (req, res, next) => {
    Manifest.searchSlug(req.params.prefix)
      .then((results) => res.json(results))
      .catch((error) => next(error));
  },
};
