const chai = require("chai");
chai.use(require("chai-http"));
chai.should();

const couch = process.env.COUCH || "http://localhost:22222/";

describe("Test deployer", () => {
  it("loads and deploys content", async () => {
    let response = await chai
      .request(couch)
      .get("/manifest/69429%2fm00000000035")
      .set("Accept", "application/json");
    response.status.should.equal(200);
  });
});
