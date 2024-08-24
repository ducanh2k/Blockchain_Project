import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { ethers } from "ethers";

interface MintTokenProps {
  signer: ethers.Signer;
}

const MintToken: React.FC<MintTokenProps> = ({ signer }) => {
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleMint = async () => {
    try {
      const contract = new ethers.Contract(
        "0x078722D23A1Eb72e780Cd985b17e10C9CEbE6848",
        erc20Abi,
        signer
      );
      const tx = await contract.mint(recipient, ethers.parseUnits(amount, 18));
      await tx.wait();
      message.success("Token minted successfully");
    } catch (error) {
      console.error("Minting failed:", error);
      message.error("Minting failed");
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

const erc20Abi: any = ["function mint(address to, uint256 amount) public"];

export default MintToken;
