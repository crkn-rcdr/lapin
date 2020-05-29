const Collection = require("../models/Collection");

module.exports = {
  fetch: (req, res, next) => {
    let collection = new Collection(req.params.id);
    collection
      .initialize()
      .then(() => collection.loadParents())
      .then(() => collection.loadItemsAndSlugs())
      .then(() => res.json(collection))
      .catch((error) => next(error));
  },
};
