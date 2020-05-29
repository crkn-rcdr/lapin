const Slug = require("../models/Slug");

module.exports = {
  resolve: (req, res, next) => {
    let slug = new Slug(req.params.id);
    slug
      .initialize()
      .then(() => res.json(slug))
      .catch((error) => next(error));
  },
};
