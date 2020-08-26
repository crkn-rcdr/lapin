const Canvas = require("../models/Canvas");

module.exports = {
  fetch: (req, res, next) => {
    let canvas = new Canvas(req.params.id);
    canvas
      .initialize()
      .then(() => res.json(canvas))
      .catch((error) => next(error));
  },
};
