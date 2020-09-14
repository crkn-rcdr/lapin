const chai = require("chai");
chai.use(require("chai-http"));
chai.should();

describe("Collection routes", () => {
  let lapin;

  before(() => {
    lapin = chai.request("http://localhost:8081");
  });

  describe("GET /collection/{id}", () => {
    it("returns a collection object according to spec", async () => {
      const orderedCollection = await lapin.get(
        "/v1/collection/69429%2fs0028pc2v81f"
      );
      orderedCollection.status.should.equal(200);
      orderedCollection.body.should.deep.equal({
        id: "69429/s0028pc2v81f",
        slug: "series",
        label: { en: "Series collection" },
        ordered: true,
        public: false,
        items: [
          {
            id: "69429/m00000000035",
            label: {
              en: "First issue",
            },
            manifestType: "multicanvas",
            slug: "issue1",
            type: "manifest",
          },
          {
            id: "69429/m0000000004r",
            label: {
              en: "Second issue",
            },
            manifestType: "multicanvas",
            slug: "issue2",
            type: "manifest",
          },
        ],
        parents: [
          {
            id: "69429/s0028pc2v60r",
            label: {
              en: "Root collection",
              fr: "Première collection",
            },
            slug: "root",
          },
        ],
      });
    });

    it("returns a 404 when the id cannot be found", async () => {
      const badCollection = await lapin.get(
        "/v1/collection/69429%2fs0029pc2v81f"
      );
      badCollection.status.should.equal(404);
    });

    it("returns a 400 when the collection id is not a NOID", async () => {
      const reallyBadCollection = await lapin.get(
        "/v1/collection/not-a-collection-noid"
      );
      reallyBadCollection.status.should.equal(400);
    });
  });

  describe("GET /collection/slug/{id}", () => {
    it("returns information about the slug when found", async () => {
      const slugInfo = await lapin.get("/v1/collection/slug/series");
      slugInfo.status.should.equal(200);
      slugInfo.body.should.deep.equal({});
    });

    it("returns 404 when the slug is not found", async () => {
      const noSlug = await lapin.get("/v1/collection/slug/not-a-slug");
      console.log(noSlug);
      noSlug.status.should.equal(404);
    });
  });
});
