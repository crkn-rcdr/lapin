const chai = require("chai");
chai.use(require("chai-http"));
chai.should();

describe("Manifest routes", () => {
  let lapin;

  before(() => {
    lapin = chai.request("http://localhost:8081");
  });

  describe("GET /manifest/{id}", () => {
    it("returns a manifest object according to spec", async () => {
      const manifest = await lapin.get("/v1/manifest/69429%2fm0000000002k");
      manifest.status.should.equal(200);
      manifest.body.should.deep.equal({
        id: "69429/m0000000002k",
        slug: "monograph",
        label: { en: "Monograph" },
        type: "multicanvas",
        canvases: [
          {
            id: "69429/c0v11vd6pm9c",
            label: {
              none: ["p. 1"],
            },
          },
          {
            id: "69429/c0q814m91v8f",
            label: {
              none: ["p. 2"],
            },
          },
        ],
        parents: [
          {
            id: "69429/s0028pc2v60r",
            slug: "root",
            label: {
              en: "Root collection",
              fr: "Première collection",
            },
          },
        ],
      });
    });
  });

  describe("GET /manifest/slug/{id}", () => {
    it("returns information about the slug when found", async () => {
      const slugInfo = await lapin.get("/v1/manifest/slug/monograph");
      slugInfo.status.should.equal(200);
      slugInfo.body.should.deep.equal({
        id: "monograph",
        isAlias: false,
        label: {
          en: ["Monograph"],
        },
        noid: "69429/m0000000002k",
        type: "manifest",
      });
    });

    it("returns 404 when the slug is not found", async () => {
      const noSlug = await lapin.get("/v1/manifest/slug/not-a-slug");
      noSlug.status.should.equal(404);
    });
  });

  describe("POST /manifest/slug/search/{prefix}", () => {
    it("returns the slugs that start with the prefix", async () => {
      const slugList = await lapin.post("/v1/manifest/slug/search/m");
      slugList.status.should.equal(200);
      slugList.body.should.deep.equal(["manifest1", "monograph"]);
    });

    it("returns an empty list if no slugs start with the prefix", async () => {
      const slugList = await lapin.post("/v1/collection/slug/search/haha");
      slugList.status.should.equal(200);
      slugList.body.should.deep.equal([]);
    });
  });
});
