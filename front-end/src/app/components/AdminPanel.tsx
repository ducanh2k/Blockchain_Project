"use client";
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Table, message } from "antd";
import axios from "axios";
import { ethers } from "ethers";

const AdminPanel: React.FC = () => {
  const [apr, setApr] = useState<number>(8);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get(`/api/transactions`);
        setTransactions(data.transactions);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleUpdateApr = async () => {
    try {
      // Assume signer is already available through MetaMask connection
      const signer = new ethers.BrowserProvider(window.ethereum).getSigner();
      const contract = new ethers.Contract(
        "CONTRACT_ADDRESS",
        adminAbi,
        await signer
      );
      const tx = await contract.updateApr(apr);
      await tx.wait();
      message.success("APR updated successfully");
    } catch (error) {
      message.error("Failed to update APR");
    }
  };

  const columns = [
    { title: "Transaction ID", dataIndex: "txId", key: "txId" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Date", dataIndex: "date", key: "date", sorter: true },
  ];

  return (
    <div>
      <Form layout="inline" style={{ marginBottom: "20px" }}>
        <Form.Item label="APR">
          <Input value={apr} onChange={(e) => setApr(Number(e.target.value))} />
        </Form.Item>
        <Button type="primary" onClick={handleUpdateApr}>
          Update APR
        </Button>
      </Form>
      <Table
        columns={columns}
        dataSource={transactions}
        loading={loading}
        pagination={{}}
      />
    </div>
  );
};

const adminAbi: any = [
  // ABI for the admin functions
];

export default AdminPanel;
