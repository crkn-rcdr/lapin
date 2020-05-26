const { NotFoundError } = require("../errors");
const { getDocumentFromView } = require("../resources/couch");

module.exports = {
  resolve: (req, res, next) => {
    let id = req.params.id;
    getDocumentFromView("slug", "access", "aliases", id)
      .then((document) => {
        res.json({
          id: document._id,
          noid: document.noid,
          type: document.type,
          aliases: document.aliases,
          isAlias: id !== document._id,
        });
      })
      .catch((error) =>
        error.status === 404
          ? next(new NotFoundError(`Slug ${id} not found.`))
          : next(error)
      );
  },
};
