const router = require("express").Router();
const Manifest = require("../models/Manifest");

router.get("/:id", (req, res, next) => {
  Manifest.fetch(req.params.id)
    .then((manifest) => res.json(manifest))
    .catch((error) => next(error));
});

router.get("/slug/:id", (req, res, next) => {
  Manifest.resolveSlug(req.params.id)
    .then((slug) => res.json(slug))
    .catch((error) => next(error));
});

router.post("/slug/search/:prefix", (req, res, next) => {
  Manifest.searchSlug(req.params.prefix)
    .then((results) => res.json(results))
    .catch((error) => next(error));
});

// TODO: have router.delete("/:id") call Manifest.unpublish

module.exports = router;
