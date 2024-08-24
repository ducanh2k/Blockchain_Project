"use client";
import React from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "@/app/components/AdminPanel";
import { Layout, Typography, Button } from "antd";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const Admin: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/"); 
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Title style={{ color: "white", textAlign: "center" }} level={2}>
          Admin Panel
        </Title>
      </Header>
      <Content style={{ padding: "50px", textAlign: "center" }}>
        <AdminPanel />
        <Button
          type="primary"
          onClick={handleGoHome}
          style={{ marginTop: "20px" }}
        >
          Quay về trang chủ
        </Button>
      </Content>
    </Layout>
  );
};

export default Admin;
