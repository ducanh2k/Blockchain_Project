"use client";
import { Form, Input, Button, message } from "antd";
import { ethers } from "ethers";
import { useState } from "react";

interface DepositFormProps {
  signer: ethers.Signer;
  onDepositSuccess: () => void;
}

const tokenAddress = "0x15dDefCf6dFD0653178772914f162FcB6e1dD473";
const stakingAddress = "0xEcdB4CC39e4FdC005A39F161919DD5d8ecd759b4";

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

const DepositForm: React.FC<DepositFormProps> = ({ signer,onDepositSuccess }) => {
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
      const parsedAmount = ethers.parseUnits(amount, 18);
      const approveTx = await tokenContract.approve(
        stakingAddress,
        parsedAmount
      );
      await approveTx.wait();
      const depositTx = await rewardContract.deposit(parsedAmount, {
        gasLimit: 500000,
      });
      await depositTx.wait();
      message.success("Deposit successful");
      onDepositSuccess();
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
