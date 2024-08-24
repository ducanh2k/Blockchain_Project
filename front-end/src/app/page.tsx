// src/app/pages/index.tsx
"use client";
import React, { useState } from "react";
import { Layout, Typography, Menu } from "antd";
import { ethers } from "ethers";
import SignInWithMetaMask from "./components/SignInWithMetaMask";
import DepositForm from "./components/DepositForm";
import WithdrawForm from "./components/WithdrawForm";
import TransactionHistory from "./components/TransactionHistory";
import MintToken from "./components/MintToken"; // Import thành phần MintToken
import Link from "next/link";

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const Home: React.FC = () => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>("");

  const handleSignIn = (address: string, signer: ethers.Signer) => {
    setSigner(signer);
    setAddress(address);
  };

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
          {/* <Menu.Item key="deposit">
            <Link href="/deposit">Deposit</Link>
          </Menu.Item>
          <Menu.Item key="withdraw">
            <Link href="/withdraw">Withdraw</Link>
          </Menu.Item>
          <Menu.Item key="history">
            <Link href="/history">Transaction History</Link>
          </Menu.Item> */}
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
          {signer && (
            <div>
              <MintToken signer={signer} /> 
              <DepositForm signer={signer} />
              <WithdrawForm signer={signer} />
              <TransactionHistory address={address} />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
