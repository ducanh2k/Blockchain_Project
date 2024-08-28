import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { ethers } from 'ethers';

interface WithdrawFormProps {
  signer: ethers.Signer;
}

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
  const [amount, setAmount] = useState<string>('');

  const handleWithdraw = async (action: 'withdraw' | 'claimReward') => {
    try {
      const contract = new ethers.Contract('0xCA915780d6d9b48bC2803E4a7AB983779e65F128', erc20Abi, signer);
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
