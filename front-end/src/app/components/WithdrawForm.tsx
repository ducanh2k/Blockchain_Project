import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { ethers } from 'ethers';

interface WithdrawFormProps {
  signer: ethers.Signer;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({ signer }) => {
  const [amount, setAmount] = useState<string>('');

  const handleWithdraw = async (action: 'withdraw' | 'claimReward') => {
    try {
      const contract = new ethers.Contract('CONTRACT_ADDRESS', erc20Abi, signer);
      const tx = action === 'withdraw'
        ? await contract.withdraw(ethers.parseUnits(amount, 18))
        : await contract.claimReward();
      await tx.wait();
      message.success(`${action === 'withdraw' ? 'Withdraw' : 'Claim reward'} successful`);
    } catch (error) {
      message.error(`${action === 'withdraw' ? 'Withdraw' : 'Claim reward'} failed`);
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Amount to Withdraw">
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Form.Item>
      <Button type="primary" onClick={() => handleWithdraw('withdraw')}>
        Withdraw
      </Button>
      <Button type="default" onClick={() => handleWithdraw('claimReward')} style={{ marginLeft: 10 }}>
        Claim Reward
      </Button>
    </Form>
  );
};

const erc20Abi: ethers.Interface | ethers.InterfaceAbi = [
  // ABI for your ERC20 token, withdraw, and claim reward functions
];

export default WithdrawForm;
