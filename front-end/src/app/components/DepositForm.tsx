import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { ethers } from "ethers";

interface DepositFormProps {
  signer: ethers.Signer;
}

const DepositForm: React.FC<DepositFormProps> = ({ signer }) => {
  const [amount, setAmount] = useState<string>("");

  const handleDeposit = async () => {
    if (parseFloat(amount) < 1000000) {
      message.error("Deposit must be at least 1M TokenA");
      return;
    }
    try {
      const contract = new ethers.Contract(
        "0x078722D23A1Eb72e780Cd985b17e10C9CEbE6848",
        erc20Abi,
        signer
      );
      const tx = await contract.deposit(ethers.parseUnits(amount, 18));
      await tx.wait();
      message.success("Deposit successful");
    } catch (error) {
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

const erc20Abi: any = [
  "function deposit(uint256 _amount) external",
  "function withdraw(uint256 _amount) public",
];

export default DepositForm;
