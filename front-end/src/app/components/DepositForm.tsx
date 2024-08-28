"use client";
import { Form, Input, Button, message } from "antd";
import { ethers } from "ethers";
import { useState } from "react";

interface DepositFormProps {
  signer: ethers.Signer;
}

const tokenAddress = "0x7177f1345a32fBEB32E3fCe8a265909bF047df59";
const stakingAddress = "0x4870b2e3850412Be2fAD50B4a260756b14398902";
const wallet_address = "0x75B9803fc26EEe1e44217D994d13D93525DE3f80";

const tokenAbi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function mintToken(address _to,uint256 _amount) public",
  "function balanceOf(address account) external view returns (uint256)",
];

const stakingAbi = [
  "function deposit(uint256 _amount) public",
  "function deposits(address account) external view returns (uint256)",
  "function withdraw(uint256 _amount) external",
  "function balanceOf(address account) external view returns (uint256)",
];

const DepositForm: React.FC<DepositFormProps> = ({ signer }) => {
  const [amount, setAmount] = useState<string>("");

  const handleDeposit = async () => {
    if (parseFloat(amount) < 1000000) {
      message.error("Deposit must be at least 1M TokenA");
      return;
    }
    try {
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
      const rewardContract = new ethers.Contract(
        stakingAddress,
        stakingAbi,
        signer
      );
      // Parse amount to the correct format
      const parsedAmount = ethers.parseUnits(amount, 18);

      // Approve the staking contract to spend tokens
      console.log("Approving staking contract...");
      const approveTx = await tokenContract.approve(
        stakingAddress,
        parsedAmount
      );
      await approveTx.wait();
      console.log("Approval successful");

      // Deposit the tokens
      console.log("Depositing tokens...");
      const depositTx = await rewardContract.deposit(parsedAmount, {
        gasLimit: 500000,
      });
      await depositTx.wait();
      console.log("Deposit successful");

      message.success("Deposit successful");
    } catch (error) {
      console.error("Error during deposit:", error);
      message.error("Deposit failed");
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Amount to Deposit">
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Form.Item>
      <Button type="primary" onClick={handleDeposit}>
        Deposit
      </Button>
    </Form>
  );
};

export default DepositForm;
