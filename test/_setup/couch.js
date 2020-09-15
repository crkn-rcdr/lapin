const TestDeployer = require("kivik/src/TestDeployer");

const couch = process.env.COUCH || "http://localhost:22222/";
const deployer = new TestDeployer(__dirname + "/../../spec/Databases", couch);

before(async () => {
  await deployer.load();
});

beforeEach(async () => {
  await deployer.deploy();
});

afterEach(async () => {
  await deployer.reset();
});
