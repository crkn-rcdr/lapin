module.exports = {
  resolve: (req, res) => {
    // res.json({ id: req.params.id, noid: "noid", type: "collection" });
    res.status(404).send({ message: "dang" });
  },
};
