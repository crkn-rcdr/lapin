const Slug = require("../models/Slug");

module.exports = {
  resolveSlug: (req, res, next) => {
    let slug = new Slug("manifest", req.params.id);
    slug
      .initialize()
      .then(() => res.json(slug))
      .catch((error) => next(error));
  },
  searchSlug: (req, res, next) => {
    Slug.search("manifest", req.params.prefix)
      .then((results) => res.json(results))
      .catch((error) => next(error));
  },
};
