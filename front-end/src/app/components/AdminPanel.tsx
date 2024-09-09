"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  message,
  Typography,
  Card,
  Space,
} from "antd";
import axios from "axios";
import { ethers } from "ethers";

const { Title } = Typography;

const address_staking = "0xFA59E603266fe375287fEc7fc027b2B502f05286";

const AdminPanel: React.FC = () => {
  const [apr, setApr] = useState<number>(8);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const walletAddress = localStorage.getItem("walletAddress");
    if (walletAddress) {
      setAddress(walletAddress);
      const fetchTransactions = async () => {
        try {
          const { data } = await axios.get(
            `http://localhost:5000/api/transactions?address=${walletAddress}`
          );
          setTransactions(
            data.transactions.map((transaction: any) => ({
              ...transaction,
              key: transaction.transactionHash,
            }))
          );
        } catch (error) {
          console.error("Failed to fetch transactions", error);
          message.error("Failed to fetch transactions");
        } finally {
          setLoading(false);
        }
      };
      fetchTransactions();
    }
  }, []);

  const handleUpdateApr = async () => {
    try {
      const signer = new ethers.BrowserProvider(window.ethereum).getSigner();
      const contract = new ethers.Contract(
        address_staking,
        adminAbi,
        await signer
      );
      const tx = await contract.setBaseAPR(apr);
      await tx.wait();
      message.success("APR updated successfully");
    } catch (error) {
      message.error("Failed to update APR");
      console.error("Error updating APR:", error);
    }
  };

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "transactionHash",
      key: "transactionHash",
      ellipsis: true, // Truncate long text
      width: "25%", // Set width
    },
    { title: "Type", dataIndex: "eventType", key: "eventType", width: "15%" },
    { title: "Amount", dataIndex: "amount", key: "amount", width: "20%" },
    { title: "Address", dataIndex: "user", key: "user", ellipsis: true },
    {
      title: "Date",
      dataIndex: "depositTime",
      key: "depositTime",
      sorter: true,
      width: "20%",
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Card style={{ marginBottom: "20px", padding: "20px" }}>
        <Space direction="vertical">
          <Title level={4}>Update APR</Title>
          <Form layout="inline">
            <Form.Item label="APR">
              <Input
                value={apr}
                onChange={(e) => setApr(Number(e.target.value))}
                style={{ width: "100px" }}
              />
            </Form.Item>
            <Button type="primary" onClick={handleUpdateApr}>
              Update APR
            </Button>
          </Form>
        </Space>
      </Card>
      <Card style={{ padding: "20px" }}>
        <Title level={4} style={{ marginBottom: "20px" }}>
          Transaction History
        </Title>
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          pagination={{ pageSize: 5 }}
          bordered
          rowKey="transactionHash"
        />
      </Card>
    </div>
  );
};

const adminAbi: any = [
  "function setBaseAPR(uint256 newAPR) external",
  "function deposit(uint256 _amount) public",
  "function deposits(address account) external view returns (uint256)",
  "function withdraw(uint256 _amount) external",
  "function balanceOf(address account) external view returns (uint256)",
];

export default AdminPanel;
