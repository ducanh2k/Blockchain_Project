import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { ethers } from "ethers";
import { useWeb3ModalAccount, useDisconnect } from "@web3modal/ethers/react"; // Import hook for disconnecting wallet

interface SignInWithMetaMaskProps {
  onSignIn: (address: string, signer: ethers.Signer) => void;
}

const BSC_TESTNET_CHAIN_ID = "0x61";

const SignInWithMetaMask: React.FC<SignInWithMetaMaskProps> = ({
  onSignIn,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const { address, chainId, isConnected } = useWeb3ModalAccount(); // Use hook to fetch information from MetaMask
  const { disconnect } = useDisconnect(); // Hook to disconnect wallet

  // When user sign in successfully, run connectWallet
  useEffect(() => {
    if (isConnected && address && chainId === 97) {
      connectWallet(address);
    }
  }, [isConnected, address, chainId]); // Run when connection changes or address

  const connectWallet = async (userAddress: string) => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        // Check chain ID to ensure user is connected with BSC Testnet
        if (network.chainId !== BigInt(parseInt(BSC_TESTNET_CHAIN_ID, 16))) {
          message.error("Please connect with BSC Testnet.");
          return;
        }

        const signer = provider.getSigner();

        // Call API to fetch nonce from backend
        const nonceResponse = await fetch(
          `http://localhost:5000/api/getNonce?address=${userAddress}`
        );
        if (!nonceResponse.ok) {
          message.error("Failed to fetch nonce from the server.");
          return;
        }
        const { nonce } = await nonceResponse.json();

        // Request signature from MetaMask
        const messageToSign = `I am signing my one-time nonce: ${nonce}`;
        const signature = await (await signer).signMessage(messageToSign);

        // Send signature and address to backend
        const authResponse = await fetch("http://localhost:5000/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: userAddress,
            signature,
            message: messageToSign,
          }),
        });

        if (authResponse.ok) {
          const { token } = await authResponse.json();
          localStorage.setItem("authToken", token); // Save token to local storage to protect route
          message.success(
            `Signed in successfully with address: ${userAddress}`
          );
          onSignIn(userAddress, await signer); // Callback when sign in successfully
        } else {
          message.error("Authentication failed.");
        }
      } else {
        message.error("MetaMask is not installed.");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      message.error("Cannot connect with MetaMask.");
    }
  };

  // Add disconnect wallet functionality
  const disconnectWallet = () => {
    disconnect(); // This will handle disconnection from web3modal
    setAccount(null); // Clear account state
    localStorage.removeItem("authToken"); // Remove token from local storage
    message.info("Disconnected wallet successfully.");
  };

  return (
    <div>
      {isConnected && address ? (
        <div>
          <p>Connected with address: {address}</p>
          <Button onClick={disconnectWallet} style={{ marginLeft: "10px" }}>
            Log out
          </Button>
        </div>
      ) : (
        <w3m-button label="Connect Wallet" />
      )}
    </div>
  );
};

export default SignInWithMetaMask;
