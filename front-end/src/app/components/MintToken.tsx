import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { ethers } from "ethers";

interface MintTokenProps {
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
  "function deposit(uint256 _amount) external",
  "function withdraw(uint256 _amount) external",
  "function balanceOf(address account) external view returns (uint256)",
];

const MintToken: React.FC<MintTokenProps> = ({ signer }) => {
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleMint = async () => {
    try {
      if (!recipient || !amount) {
        message.error("Recipient address and amount are required");
        return;
      }

      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
      const tx = await tokenContract.mintToken(
        recipient,
        ethers.parseUnits(amount, 18)
      );
      await tx.wait();
      message.success("Token minted successfully");
    } catch (error) {
      console.error("Minting failed:", error);
      message.error("Minting failed:" + error);
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
      <Form.Item label="Amount to Mint">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to mint"
        />
      </Form.Item>
      <Button type="primary" onClick={handleMint}>
        Mint Tokens
      </Button>
    </Form>
  );
};

export default MintToken;
