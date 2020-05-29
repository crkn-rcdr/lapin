const Slug = require("../models/Slug");

module.exports = {
  resolve: (req, res, next) => {
    let slug = new Slug(req.params.id);
    slug
      .initialize()
      .then(() => res.json(slug))
      .catch((error) => next(error));
  },
  search: (req, res, next) => {
    Slug.search(req.params.prefix)
      .then((results) => res.json(results))
      .catch((error) => next(error));
  },
};
