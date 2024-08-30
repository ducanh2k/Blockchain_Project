// src/app/pages/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Layout, Typography, Menu, message } from "antd";
import { ethers } from "ethers";
import SignInWithMetaMask from "./components/SignInWithMetaMask";
import DepositForm from "./components/DepositForm";
import WithdrawForm from "./components/WithdrawForm";
import TransactionHistory from "./components/TransactionHistory";
import MintToken from "./components/MintToken"; 
import Link from "next/link";

const tokenAddress = "0x801ed2ac974E3e48B8c4DeDAcb8042680592eF82";
const stakingAddress = "0xc5170aB7bD41544f123c18F0E4F38783C63121F9";
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

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const Home: React.FC = () => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>("");

  // State for balances
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [depositBalance, setDepositBalance] = useState<string>("0");
  const [withdrawBalance, setWithdrawBalance] = useState<string>("0");

  const fetchBalances = async (signer: ethers.Signer) => {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
      const stakingContract = new ethers.Contract(
        stakingAddress,
        stakingAbi,
        signer
      );

      const tokenBalance = await tokenContract.balanceOf(wallet_address);
      setTokenBalance(ethers.formatUnits(tokenBalance, 18));

      const depositBalance = await tokenContract.balanceOf(stakingAddress);
      setDepositBalance(ethers.formatUnits(depositBalance, 18));

    } catch (error) {
      console.error("Error fetching balances:", error);
      message.error("Error fetching balances");
    }
  };

  const handleSignIn = async (
    userAddress: string,
    userSigner: ethers.Signer
  ) => {
    setSigner(userSigner);
    setAddress(userAddress);
    await fetchBalances(userSigner);
  };

  useEffect(() => {
    if (signer) {
      fetchBalances(signer);
    }
  }, [signer]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200} className="site-layout-background">
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          style={{ height: "100%", borderRight: 0 }}
        >
          <Menu.Item key="dashboard">
            <Link href="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="admin">
            <Link href="/admin">Admin Panel</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header>
          <Title style={{ color: "white", textAlign: "center" }} level={2}>
            ERC20 Token Staking dApp
          </Title>
        </Header>
        <Content style={{ padding: "0 50px", marginTop: 24 }}>
          <SignInWithMetaMask onSignIn={handleSignIn} />
          {signer ? (
            <div>
              <div style={{ marginTop: "20px", color: "black" }}>
                <p>Token Balance: {tokenBalance} TOKEN</p>
                <p>Deposit Balance: {depositBalance} TOKEN</p>
                <p>Withdraw Balance: {withdrawBalance} TOKEN</p>
              </div>
              <MintToken signer={signer} onMintComplete={() => fetchBalances(signer)}/>
              <DepositForm signer={signer} onDepositSuccess={() => fetchBalances(signer)} />
              <WithdrawForm signer={signer} onWithdrawSuccess={() => fetchBalances(signer)} />
              <TransactionHistory address={address} />
            </div>
          ) : (
            <p>
              Please sign in to view your balances and interact with the dApp.
            </p>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
