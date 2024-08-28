import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DepositReward Contract", function () {
  let TokenA: any, tokenA: any;
  let NFTB: any, nftB: any;
  let DepositReward: any, depositReward: any;
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

    beforeEach(async function () {
      // Get the ContractFactory and Signers here.
      TokenA = await ethers.getContractFactory("TokenA");
      NFTB = await ethers.getContractFactory("NFTB");
      DepositReward = await ethers.getContractFactory("DepositReward");
  
      [owner, addr1, addr2] = await ethers.getSigners();
  
      // Deploy TokenA and NFTB contracts
      tokenA = await TokenA.deploy();
      await tokenA.deployed();
      console.log("TokenA deployed at:", tokenA.address);
  
      nftB = await NFTB.deploy();
      await nftB.deployed();
      console.log("NFTB deployed at:", nftB.address);
  
      // Ensure that tokenA and nftB are properly deployed
      if (!tokenA.address || !nftB.address) {
          throw new Error("TokenA or NFTB contract deployment failed");
      }
  
      // Deploy DepositReward contract
      depositReward = await DepositReward.deploy(tokenA.address, nftB.address);
      await depositReward.deployed();
      console.log("DepositReward deployed at:", depositReward.address);
  
      // Mint some tokens to addr1 and approve DepositReward contract
      await tokenA.mintToken(addr1.address, ethers.parseUnits("1000000", 18));
      await tokenA.connect(addr1).approve(depositReward.address, ethers.parseUnits("1000000", 18));
  });
  

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await depositReward.owner()).to.equal(owner.address);
    });

    it("Should assign initial supply of tokens to addr1", async function () {
      const addr1Balance = await tokenA.balanceOf(addr1.address);
      expect(ethers.formatUnits(addr1Balance, 18)).to.equal("1000000.0");
    });
  });

  describe("Minting and Depositing", function () {
    it("Should allow addr1 to deposit tokens and mint an NFT", async function () {
      // Addr1 deposits 1M tokens
      await depositReward
        .connect(addr1)
        .deposit(ethers.parseUnits("1000000", 18));

      // Check that addr1 received an NFT
      expect(await nftB.balanceOf(addr1.address)).to.equal(1);

      // Check that depositReward contract received the tokens
      const contractBalance = await tokenA.balanceOf(depositReward.address);
      expect(ethers.formatUnits(contractBalance, 18)).to.equal("1000000.0");
    });

    it("Should fail if deposit is less than TOKEN_THRESHOLD", async function () {
      await expect(
        depositReward.connect(addr1).deposit(ethers.parseUnits("500000", 18))
      ).to.be.revertedWith("Deposit must be at least 1M TokenA");
    });
  });

  describe("Withdrawing", function () {
    it("Should allow addr1 to withdraw tokens after lock period", async function () {
      // Addr1 deposits 1M tokens
      await depositReward
        .connect(addr1)
        .deposit(ethers.parseUnits("1000000", 18));

      // Fast forward time by 5 minutes
      await ethers.provider.send("evm_increaseTime", [5 * 60]);
      await ethers.provider.send("evm_mine", []);

      // Addr1 withdraws tokens
      await depositReward.connect(addr1).withdraw(0);

      // Check that addr1 received the tokens back
      const addr1Balance = await tokenA.balanceOf(addr1.address);
      expect(ethers.formatUnits(addr1Balance, 18)).to.equal("1000000.0");
    });

    it("Should not allow withdrawal before lock period", async function () {
      // Addr1 deposits 1M tokens
      await depositReward
        .connect(addr1)
        .deposit(ethers.parseUnits("1000000", 18));

      // Try to withdraw immediately
      await expect(depositReward.connect(addr1).withdraw(0)).to.be.revertedWith(
        "Tokens are still locked"
      );
    });
  });

  describe("Claiming Rewards", function () {
    it("Should allow addr1 to claim rewards after lock period", async function () {
      // Addr1 deposits 1M tokens
      await depositReward
        .connect(addr1)
        .deposit(ethers.parseUnits("1000000", 18));

      // Fast forward time by 5 minutes
      await ethers.provider.send("evm_increaseTime", [5 * 60]);
      await ethers.provider.send("evm_mine", []);

      // Addr1 claims rewards
      await depositReward.connect(addr1).claimReward(0);

      // Check that addr1 received the reward
      const addr1Balance = await tokenA.balanceOf(addr1.address);
      // const expectedReward = ethers.parseUnits("1000000", 18).mul(8).div(100);
      const expectedReward = ethers.parseUnits("1000000", 18);
      expect(addr1Balance).to.equal(expectedReward);
    });

    it("Should not allow claiming rewards before lock period", async function () {
      // Addr1 deposits 1M tokens
      await depositReward
        .connect(addr1)
        .deposit(ethers.parseUnits("1000000", 18));

      // Try to claim reward immediately
      await expect(
        depositReward.connect(addr1).claimReward(0)
      ).to.be.revertedWith("Tokens are still locked");
    });
  });
});
