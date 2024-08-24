"use client";
import React from "react";
import AdminPanel from "@/app/components/AdminPanel";
import { Layout, Typography } from "antd";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const Admin: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Title style={{ color: "white", textAlign: "center" }} level={2}>
          Admin Panel
        </Title>
      </Header>
      <Content style={{ padding: "50px", textAlign: "center" }}>
        <AdminPanel />
      </Content>
    </Layout>
  );
};

export default Admin;
