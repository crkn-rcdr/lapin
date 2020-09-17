const chai = require("chai");
chai.use(require("chai-http"));
chai.should();

describe("Manifest routes", () => {
  let lapin;

  before(() => {
    lapin = chai.request("http://localhost:8081/v1");
  });

  describe("GET /manifest/{id}", () => {
    it("has yet to be implemented", async () => {
      const manifest = await lapin.get("/manifest/69429%2fm0000000004r");
      manifest.status.should.equal(501);
      manifest.body.message.should.include("not yet handled");
    });
  });
});
