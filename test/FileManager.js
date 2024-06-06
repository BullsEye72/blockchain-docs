const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Manages deployed file contracts", function () {
  async function deployFileManagerFixture() {
    const [owner] = await ethers.getSigners();
    const hardhatFileFactory = await ethers.deployContract("FileManagerFactory");
    await hardhatFileFactory.waitForDeployment();
    return { hardhatFileFactory, owner };
  }

  async function createFileFixture() {
    const { hardhatFileFactory, owner } = await loadFixture(deployFileManagerFixture);
    const fileOwnerId = 2;
    await hardhatFileFactory.createFile("Test", "FAKEHASH", fileOwnerId, Date.now());
    const files = await hardhatFileFactory.getFilesByOwner(fileOwnerId);

    return { hardhatFileFactory, owner, files };
  }

  describe("Factory contract manipulation", function () {
    it("can retrieve the manager's address", async function () {
      const { hardhatFileFactory, owner } = await loadFixture(deployFileManagerFixture);
      const manager = await hardhatFileFactory.getManager();
      expect(manager).to.equal(owner.address);
    });

    it("can retrieve an owner's files addresses and hashes", async function () {
      const { hardhatFileFactory, owner } = await loadFixture(deployFileManagerFixture);
      const fileOwnerId = 2;
      await hardhatFileFactory.createFile("Test", "FAKEHASH", fileOwnerId, Date.now());
      await hardhatFileFactory.createFile("Test2", "FAKEHASH2", fileOwnerId, Date.now());
      const files = await hardhatFileFactory.getFilesByOwner(fileOwnerId);

      let filesAddresses = [];
      let filesHashes = [];
      for (let i = 0; i < files.length; i++) {
        filesAddresses.push(files[i][0]);
        filesHashes.push(files[i][1]);
      }

      expect(filesAddresses).to.exist.and.be.an("array").and.have.lengthOf(2);
      expect(filesHashes).to.exist.and.be.an("array").and.have.lengthOf(2);
    });
  });

  describe("Deployment", function () {
    it("Deploys the FileManagerFactory contract", async function () {
      const { hardhatFileFactory, owner } = await loadFixture(deployFileManagerFixture);
      expect(await hardhatFileFactory.getManager()).to.equal(owner.address);
    });

    it("Only manager can call 'isManager' functions", async function () {
      const { hardhatFileFactory, owner } = await loadFixture(deployFileManagerFixture);
      const [manager, newManager] = await ethers.getSigners();

      await expect(hardhatFileFactory.connect(manager).createFile("Test", "FAKEHASH", 1, Date.now())).not.to.be
        .reverted;
      await expect(hardhatFileFactory.connect(manager).getFilesByOwner(2)).not.to.be.reverted;
      await expect(hardhatFileFactory.connect(manager).changeOwner(newManager.address)).not.to.be.reverted;
    });

    it("Other users CAN'T call 'isManager' functions", async function () {
      const { hardhatFileFactory, owner } = await loadFixture(deployFileManagerFixture);
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const expectedRevertReason = "Caller is not the manager";

      await expect(
        hardhatFileFactory.connect(attacker).createFile("Test", "FAKEHASH", 1, Date.now())
      ).to.be.revertedWith(expectedRevertReason);
      await expect(hardhatFileFactory.connect(attacker).getFilesByOwner(2)).to.be.revertedWith(expectedRevertReason);
      await expect(hardhatFileFactory.connect(attacker).changeOwner(attacker.address)).to.be.revertedWith(
        expectedRevertReason
      );
    });

    it("Deploys a new File contract", async function () {
      const { hardhatFileFactory, files } = await loadFixture(createFileFixture);
      expect(files.length).to.equal(1);
    });
  });

  describe("File contract manipulation", function () {
    it("can retrieve a file by its address", async function () {
      const { hardhatFileFactory, files } = await loadFixture(createFileFixture);
      const file = files[0][0]; // get the address (0) of the first file (0)
      const fileManager = await ethers.getContractAt("FileManager", file);
      const fileData = await fileManager.getFileContent();
      expect(fileData).to.exist;
      // continue with the rest of your test logic
    });

    it("has a name, fileHash, owner, and 2 timestamps", async function () {
      const { hardhatFileFactory, files } = await loadFixture(createFileFixture);
      const fileAddress = files[0][0];
      const fileManager = await ethers.getContractAt("FileManager", fileAddress);
      const fileData = await fileManager.getFileContent();

      const name = fileData[0];
      const fileHash = fileData[1];
      const owner = Number(fileData[2]); // cast solidity uint to JS number
      const lastModified = Number(fileData[3]);
      const dateAdded = Number(fileData[4]);

      expect(name).to.exist.and.be.a("string");
      expect(fileHash).to.exist.and.be.a("string");
      expect(owner).to.exist.and.be.a("number");
      expect(lastModified)
        .to.exist.and.be.a("number") // is a number (duh)
        .and.satisfy(Number.isSafeInteger) // is a safe integer (between -2^53 and 2^53)
        .and.satisfy((n) => !isNaN(new Date(n).getTime())); // is a valid date
      expect(dateAdded)
        .to.exist.and.be.a("number")
        .and.satisfy(Number.isSafeInteger)
        .and.satisfy((n) => !isNaN(new Date(n).getTime()));
    });
  });
});
