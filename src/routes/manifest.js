const Manifest = require("../models/Manifest");
const Slug = require("../models/Slug");

module.exports = {
  fetch: (req, res, next) => {
    let manifest = new Manifest(req.params.id);
    manifest
      .initialize()
      .then(() => manifest.loadCanvasItems())
      .then(() => res.json(manifest))
      .catch((error) => next(error));
  },
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
