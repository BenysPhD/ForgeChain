const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplierAgreement", function () {
  let buyer, oracle, arbitrator, supplier, anotherSupplier;
  let stablecoin, oracleMock, supplierAgreement;
  let stablecoinAddr, oracleMockAddr, supplierAgreementAddr;
  const initialTokenSupply = ethers.parseEther("10000");

  async function getDeadline(secondsToAdd = 3600) {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp + secondsToAdd;
  }

  beforeEach(async function () {
    [buyer, oracle, arbitrator, supplier, anotherSupplier] = await ethers.getSigners();

    const TestTokenFactory = await ethers.getContractFactory("TestToken");
    stablecoin = await TestTokenFactory.deploy();
    await stablecoin.waitForDeployment();
    stablecoinAddr = await stablecoin.getAddress();

    await stablecoin.mint(buyer.address, initialTokenSupply);

    const OracleMockFactory = await ethers.getContractFactory("OracleMock");
    oracleMock = await OracleMockFactory.connect(buyer).deploy();
    await oracleMock.waitForDeployment();
    oracleMockAddr = await oracleMock.getAddress();

    const SupplierAgreementFactory = await ethers.getContractFactory("SupplierAgreement");
    supplierAgreement = await SupplierAgreementFactory.connect(buyer).deploy(
      oracle.address,
      arbitrator.address,
      oracleMockAddr,
      stablecoinAddr
    );
    await supplierAgreement.waitForDeployment();
    supplierAgreementAddr = await supplierAgreement.getAddress();
  });

  describe("createAgreement", function () {
    it("should allow buyer to create an agreement", async function () {
      const deadline = await getDeadline();
      await expect(
        supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash")
      ).to.emit(supplierAgreement, "AgreementCreated");

      const agreement = await supplierAgreement.agreement();
      expect(agreement.quantity).to.equal(100);
      expect(agreement.price).to.equal(ethers.parseEther("2"));
      expect(agreement.state).to.equal(0);
    });

    it("should revert if a non-buyer tries to create an agreement", async function () {
      const deadline = await getDeadline();
      await expect(
        supplierAgreement.connect(supplier).createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash")
      ).to.be.revertedWith("Seul le buyer peut créer un accord");
    });
  });

  describe("acceptAgreement", function () {
    beforeEach(async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
    });

    it("should allow a supplier to accept an agreement", async function () {
      await supplierAgreement.connect(supplier).acceptAgreement();
      const supplierInfo = await supplierAgreement.suppliers(supplier.address);
      expect(supplierInfo.accepted).to.equal(true);
    });
  });

  describe("confirmPayment", function () {
    const requiredAmount = ethers.parseEther("200"); // 100 * 2 ETH

    beforeEach(async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
      await supplierAgreement.connect(supplier).acceptAgreement();
    });

    it("should allow buyer to confirm payment after token approval", async function () {
      await stablecoin.connect(buyer).approve(supplierAgreementAddr, requiredAmount);
      await expect(supplierAgreement.confirmPayment(requiredAmount))
        .to.emit(supplierAgreement, "PaymentConfirmed");

      const escrow = await supplierAgreement.escrowAmount();
      expect(escrow).to.equal(requiredAmount);
    });

    it("should revert confirmPayment if tokens are not approved", async function () {
      await expect(supplierAgreement.confirmPayment(requiredAmount)).to.be.reverted;
    });
  });

  describe("startAgreement", function () {
    it("should start the agreement if the deadline has not passed", async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
      await supplierAgreement.startAgreement();
      const agreement = await supplierAgreement.agreement();
      expect(agreement.state).to.equal(2);
    });

    it("should revert if the deadline is passed", async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine", []);
      await expect(supplierAgreement.startAgreement()).to.be.revertedWith("La deadline est dépassée");
    });
  });

  describe("dispatchOrder", function () {
    let requiredAmount;

    beforeEach(async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
      requiredAmount = ethers.parseEther("200");
      await supplierAgreement.connect(supplier).acceptAgreement();
      await stablecoin.connect(buyer).approve(supplierAgreementAddr, requiredAmount);
      await supplierAgreement.confirmPayment(requiredAmount);
      await supplierAgreement.startAgreement();
    });

    it("should allow an accepted supplier to dispatch an order", async function () {
      await expect(supplierAgreement.connect(supplier).dispatchOrder())
        .to.emit(supplierAgreement, "OrderDispatched");
      const agreement = await supplierAgreement.agreement();
      expect(agreement.state).to.equal(4);
    });

    it("should revert if not an accepted supplier", async function () {
      await expect(
        supplierAgreement.connect(anotherSupplier).dispatchOrder()
      ).to.be.revertedWith("Fournisseur non valide");
    });
  });

  describe("updateDeliveryStatus", function () {
    let requiredAmount;

    beforeEach(async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
      requiredAmount = ethers.parseEther("200");
      await supplierAgreement.connect(supplier).acceptAgreement();
      await stablecoin.connect(buyer).approve(supplierAgreementAddr, requiredAmount);
      await supplierAgreement.confirmPayment(requiredAmount);
      await supplierAgreement.startAgreement();
      await supplierAgreement.connect(supplier).dispatchOrder();
    });

    it("should complete if delivery is successful", async function () {
      await expect(supplierAgreement.connect(oracle).updateDeliveryStatus(true))
        .to.emit(supplierAgreement, "DeliveryUpdated");
      const agreement = await supplierAgreement.agreement();
      expect(agreement.state).to.equal(5);
    });

    it("should dispute if delivery fails", async function () {
      await expect(supplierAgreement.connect(oracle).updateDeliveryStatus(false))
        .to.emit(supplierAgreement, "DeliveryUpdated");
      const agreement = await supplierAgreement.agreement();
      expect(agreement.state).to.equal(6);
    });
  });

  describe("resolveDispute", function () {
    let requiredAmount;

    beforeEach(async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
      requiredAmount = ethers.parseEther("200");
      await supplierAgreement.connect(supplier).acceptAgreement();
      await stablecoin.connect(buyer).approve(supplierAgreementAddr, requiredAmount);
      await supplierAgreement.confirmPayment(requiredAmount);
      await supplierAgreement.startAgreement();
      await supplierAgreement.connect(supplier).dispatchOrder();
      await supplierAgreement.connect(oracle).updateDeliveryStatus(false);
    });

    it("should allow arbitrator to refund", async function () {
      await expect(supplierAgreement.connect(arbitrator).resolveDispute("RefundBuyer"))
        .to.emit(supplierAgreement, "DisputeResolved");
      const agreement = await supplierAgreement.agreement();
      expect(agreement.state).to.equal(7);
    });

    it("should allow arbitrator to release funds", async function () {
      await expect(supplierAgreement.connect(arbitrator).resolveDispute("ReleaseFunds"))
        .to.emit(supplierAgreement, "DisputeResolved");
      const agreement = await supplierAgreement.agreement();
      expect(agreement.state).to.equal(5);
    });
  });

  describe("rateSupplier", function () {
    beforeEach(async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
      await supplierAgreement.connect(supplier).acceptAgreement();
    });

    it("should allow rating from buyer", async function () {
      await expect(supplierAgreement.rateSupplier(supplier.address, 4))
        .to.emit(supplierAgreement, "SupplierRated");
      const info = await supplierAgreement.suppliers(supplier.address);
      expect(info.rating).to.equal(4);
    });

    it("should reject invalid ratings", async function () {
      await expect(supplierAgreement.rateSupplier(supplier.address, 0)).to.be.revertedWith("La note doit être entre 1 et 5");
      await expect(supplierAgreement.rateSupplier(supplier.address, 6)).to.be.revertedWith("La note doit être entre 1 et 5");
    });

    it("should reject if not buyer", async function () {
      await expect(
        supplierAgreement.connect(supplier).rateSupplier(supplier.address, 4)
      ).to.be.revertedWith("Seul le buyer peut noter");
    });
  });

  describe("getOracleData", function () {
    it("should return value from oracle", async function () {
      await oracleMock.setLatestAnswer(900);
      const data = await supplierAgreement.getOracleData();
      expect(data).to.equal(900);
    });
  });

  describe("submitZKProof", function () {
    beforeEach(async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("2"), deadline, "QmEncryptedExampleHash");
      await supplierAgreement.connect(supplier).acceptAgreement();
    });

    it("should allow accepted supplier to submit ZKProof", async function () {
      await expect(
        supplierAgreement.connect(supplier).submitZKProof("0x123456abcdef")
      ).to.emit(supplierAgreement, "ZKProofSubmitted");
    });

    it("should reject ZKProof if not accepted", async function () {
      await expect(
        supplierAgreement.connect(anotherSupplier).submitZKProof("0x123456abcdef")
      ).to.be.revertedWith("Fournisseur non engagé");
    });
  });

  describe("confirmPayment fuzz test", function () {
    it("should reject payment lower than required total", async function () {
      const deadline = await getDeadline();
      const pricePerUnit = ethers.parseEther("10");
      await supplierAgreement.createAgreement(100, pricePerUnit, deadline, "Qm...");
      await supplierAgreement.connect(supplier).acceptAgreement();

      const requiredAmount = 100n * pricePerUnit;
      const underPayment = requiredAmount - 1n;

      await stablecoin.connect(buyer).approve(supplierAgreementAddr, underPayment);
      await expect(
        supplierAgreement.confirmPayment(underPayment)
      ).to.be.revertedWith("Montant insuffisant pour l’accord");
    });

    it("should reject payment without prior approval", async function () {
      const deadline = await getDeadline();
      await supplierAgreement.createAgreement(100, ethers.parseEther("10"), deadline, "Qm...");
      await supplierAgreement.connect(supplier).acceptAgreement();

      const total = 100n * ethers.parseEther("10");
      await expect(supplierAgreement.confirmPayment(total)).to.be.reverted;
    });
  });
});