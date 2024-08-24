const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DepositReward", function () {
  let TokenA, NFTB, DepositReward;
  let tokenA: any, nftB, depositReward: any;
  let owner, addr1: any, addr2;

  beforeEach(async function () {
    // Get signers (accounts)
    [owner, addr1, addr2] = await ethers.getSigners();

    // Get contract factories for the contracts you want to deploy
    TokenA = await ethers.getContractFactory("TokenA");
    NFTB = await ethers.getContractFactory("NFTB");
    DepositReward = await ethers.getContractFactory("DepositReward");

    // Deploy the contracts
    tokenA = await TokenA.deploy(1000000);
    nftB = await NFTB.deploy();
    depositReward = await DepositReward.deploy(tokenA.address, nftB.address);

    // Transfer tokens to test addresses
    await tokenA.transfer(addr1.address, 500000);
    await tokenA.transfer(addr2.address, 500000);
  });

  it("Should allow deposit and mint NFT", async function () {
    // Approve the contract to spend tokens on behalf of addr1
    await tokenA
      .connect(addr1)
      .approve(depositReward.address, 1000000);

    // Perform a deposit action
    await depositReward
      .connect(addr1)
      .deposit(1000000);

    // Retrieve deposits and check the results
    const deposits = await depositReward.getDeposits(addr1.address);
    expect(deposits.length).to.equal(1);
  });
});
