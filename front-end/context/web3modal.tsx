// context/Web3Modal.tsx
"use client";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

const projectId = "a9373764535eb1a53800c1d4c275f427";

const bscTestnet = {
  chainId: 97,
  name: "BSC Testnet",
  currency: "BNB",
  explorerUrl: "https://testnet.bscscan.com",
  rpcUrl: "https://bsc-testnet.nodereal.io/v1/your-rpc-key",
};

const metadata = {
  name: "My DApp",
  description: "My Web3 DApp",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: bscTestnet.rpcUrl,
  defaultChainId: bscTestnet.chainId,
});

createWeb3Modal({
  ethersConfig,
  chains: [bscTestnet],
  projectId,
  enableAnalytics: true,
});

export function AppKit({ children }: { children: React.ReactNode }) {
  return children;
}
