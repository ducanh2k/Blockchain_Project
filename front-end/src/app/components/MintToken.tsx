import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { ethers } from "ethers";

interface MintTokenProps {
  signer: ethers.Signer;
  onMintComplete: () => void;
}
const tokenAddress = "0x801ed2ac974E3e48B8c4DeDAcb8042680592eF82";

const tokenAbi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferToken(address _to,uint256 _amount) public",
  "function balanceOf(address account) external view returns (uint256)",
];

const stakingAbi = [
  "function deposit(uint256 _amount) external",
  "function withdraw(uint256 _amount) external",
  "function balanceOf(address account) external view returns (uint256)",
];

const MintToken: React.FC<MintTokenProps> = ({ signer,onMintComplete }) => {
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleMint = async () => {
    try {
      if (!recipient || !amount) {
        message.error("Recipient address and amount are required");
        return;
      }

      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
      const tx = await tokenContract.transferToken(
        recipient,
        ethers.parseUnits(amount, 18)
      );
      await tx.wait();
      message.success("Transfer Token successfully");
      onMintComplete();
    } catch (error) {
      message.error("Transfer failed:" + error);
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Recipient Address">
        <Input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter recipient address"
        />
      </Form.Item>
      <Form.Item label="Amount to Transfer">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to Transfer"
        />
      </Form.Item>
      <Button type="primary" onClick={handleMint}>
        Transfer Tokens
      </Button>
    </Form>
  );
};

export default MintToken;
