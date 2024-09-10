import React, { useState } from "react";
import { Button, message } from "antd";
import { ethers } from "ethers";

interface SignInWithMetaMaskProps {
  onSignIn: (address: string, signer: ethers.Signer) => void;
}

const BSC_TESTNET_CHAIN_ID = "0x61"; 

const SignInWithMetaMask: React.FC<SignInWithMetaMaskProps> = ({
  onSignIn,
}) => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Kết nối MetaMask và kiểm tra chain ID
        const provider = new ethers.BrowserProvider(window.ethereum);
        const { chainId } = await provider.getNetwork();

        if (chainId !== BigInt(parseInt(BSC_TESTNET_CHAIN_ID, 16))) {
          message.error("Please connect with BSC Testnet.");
          return;
        }

        // Yêu cầu MetaMask cho phép kết nối với tài khoản
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await (await signer).getAddress();
        setAccount(address);

        // Gọi API để lấy nonce từ backend
        const nonceResponse = await fetch(
          `http://localhost:5000/api/getNonce?address=${address}`
        );
        if (!nonceResponse.ok) {
          message.error("Failed to fetch nonce from the server.");
          return;
        }
        const { nonce } = await nonceResponse.json();

        // Yêu cầu MetaMask ký nonce
        const messageToSign = `I am signing my one-time nonce: ${nonce}`;
        const signature = await (await signer).signMessage(messageToSign);

        // Gửi chữ ký và địa chỉ ví tới backend để xác thực
        const authResponse = await fetch("http://localhost:5000/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            signature,
            message: messageToSign,
          }),
        });

        if (authResponse.ok) {
          const { token } = await authResponse.json();
          localStorage.setItem("authToken", token); // Lưu token vào localStorage để bảo vệ các route
          message.success(`Signed in successfully with address: ${address}`);
          onSignIn(address, await signer); // Gọi hàm callback khi đăng nhập thành công
        } else {
          message.error("Authentication failed.");
        }
      } catch (error) {
        message.error("Cannot connect with MetaMask.");
      }
    } else {
      message.error("MetaMask is not installed.");
    }
  };

  return (
    <Button type="primary" onClick={connectWallet}>
      {account ? `Connected: ${account}` : "Connect with MetaMask"}
    </Button>
  );
};

export default SignInWithMetaMask;
