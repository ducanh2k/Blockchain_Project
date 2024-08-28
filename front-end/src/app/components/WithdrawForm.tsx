import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { ethers } from "ethers";

interface WithdrawFormProps {
  signer: ethers.Signer;
}

const tokenAddress = "0x4236160D4c4f3b1aAca9722EB60024828DE92976";
const stakingAddress = "0x823F10728B618b4bb8cB6a552eA5d9c5c6C66EA2";
const wallet_address = "0x75B9803fc26EEe1e44217D994d13D93525DE3f80";

const tokenAbi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function mintToken(address _to,uint256 _amount) public",
  "function balanceOf(address account) external view returns (uint256)",
];

const stakingAbi = [
  "function deposit(uint256 _amount) external",
  "function withdraw(uint256 _amount) external",
  "function balanceOf(address account) external view returns (uint256)",
];

const WithdrawForm: React.FC<WithdrawFormProps> = ({ signer }) => {
  const [amount, setAmount] = useState<string>("");

  const handleWithdraw = async (action: "withdraw" | "claimReward") => {
    try {
      const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
      const tx =
        action === "withdraw"
          ? await contract.withdraw(ethers.parseUnits(amount, 18), {
              gasLimit: 500000,
            })
          : await contract.claimReward();
      await tx.wait();
      message.success(
        `${action === "withdraw" ? "Withdraw" : "Claim reward"} successful`
      );
    } catch (error) {
      message.error(
        `${action === "withdraw" ? "Withdraw" : "Claim reward"} failed`
      );
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Amount to Withdraw">
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Form.Item>
      <Button type="primary" onClick={() => handleWithdraw("withdraw")}>
        Withdraw
      </Button>
      <Button
        type="default"
        onClick={() => handleWithdraw("claimReward")}
        style={{ marginLeft: 10 }}
      >
        Claim Reward
      </Button>
    </Form>
  );
};

export default WithdrawForm;
