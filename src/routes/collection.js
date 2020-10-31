const router = require("express").Router();
const Collection = require("../models/Collection");

router.get("/:id", (req, res, next) => {
  Collection.fetch(req.params.id)
    .then((collection) => res.json(collection))
    .catch((error) => next(error));
});

router.get("/slug/:id", (req, res, next) => {
  Collection.resolveSlug(req.params.id)
    .then((slug) => res.json(slug))
    .catch((error) => next(error));
});

router.post("/slug/search/:prefix", (req, res, next) => {
  Collection.searchSlug(req.params.prefix)
    .then((results) => res.json(results))
    .catch((error) => next(error));
});

module.exports = router;
