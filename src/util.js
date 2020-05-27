function singleTextValueToMulti(value) {
  let rv = {};
  Object.keys(value).map((key) => (rv[key] = [value[key]]));
  return rv;
}

function multiTextValueToSingle(value) {
  let rv = {};
  Object.keys(value).map((key) => (rv[key] = value[key].join(" / ")));
  return rv;
}

function isCollectionNoid(noid) {
  return noid.startsWith("69429/s");
}

function isManifestNoid(noid) {
  return noid.startsWith("69429/m");
}

module.exports = {
  singleTextValueToMulti,
  multiTextValueToSingle,
  isCollectionNoid,
  isManifestNoid,
};
