import React, { useState } from 'react';
import { Button, message } from 'antd';
import { ethers } from 'ethers';

interface SignInWithMetaMaskProps {
  onSignIn: (address: string, signer: ethers.Signer) => void;
}

const BSC_TESTNET_CHAIN_ID = '0x61'; // ID của chuỗi BSC Testnet

const SignInWithMetaMask: React.FC<SignInWithMetaMaskProps> = ({ onSignIn }) => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const { chainId } = await provider.getNetwork();

        if (chainId !== BigInt(parseInt(BSC_TESTNET_CHAIN_ID, 16))) {
          message.error('Please connect with BSC Testnet.');
          return;
        }

            await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await (await signer).getAddress();
        setAccount(address);
        message.success(`Connected: ${address}`);
        onSignIn(address, await signer);
      } catch (error) {
        message.error('Cannot connect with MetaMask.');
      }
    } else {
      message.error('MetaMask is not installed.');
    }
  };

  return (
    <Button type="primary" onClick={connectWallet}>
      {account ? `Connected: ${account}` : 'Connect with MetaMask'}
    </Button>
  );
};

export default SignInWithMetaMask;
