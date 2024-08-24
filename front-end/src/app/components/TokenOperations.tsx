// src/app/components/TokenOperations.tsx

import React, { useState } from 'react';
import { Input, Button, Form, message } from 'antd';
import { ethers } from 'ethers';

interface TokenOperationsProps {
  signer: ethers.Signer;
}

const TokenOperations: React.FC<TokenOperationsProps> = ({ signer }) => {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const handleDeposit = async () => {
    try {
      const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
      const tx = await contract.transfer('DEPOSIT_ADDRESS', ethers.parseUnits(amount, 18));
      await tx.wait();
      message.success('Deposit successful');
    } catch (error) {
      message.error('Deposit failed');
    }
  };

  const handleWithdraw = async () => {
    try {
      const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
      const tx = await contract.transfer('WITHDRAW_ADDRESS', ethers.parseUnits(amount, 18));
      await tx.wait();
      message.success('Withdrawal successful');
    } catch (error) {
      message.error('Withdrawal failed');
    }
  };

  return (
    <div style={{ marginTop: 50 }}>
      <Form layout="vertical">
        <Form.Item label="ERC20 Contract Address">
          <Input value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} />
        </Form.Item>
        <Form.Item label="Amount">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleDeposit}>
            Deposit
          </Button>
          <Button type="primary" danger onClick={handleWithdraw} style={{ marginLeft: 10 }}>
            Withdraw
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const erc20Abi = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

export default TokenOperations;  // <- Default export here
