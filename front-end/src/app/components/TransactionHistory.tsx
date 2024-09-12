import React, { useState, useEffect } from "react";
import { message, Table } from "antd";
import axios from "axios";

interface TransactionHistoryProps {
  address: string; 
}

interface Transaction {
  txId: string;
  type: string;
  amount: string;
  date: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (address) {
        try {
          const { data } = await axios.get(
            `http://18.140.3.110/api/transactions?address=${address}`
          );
          setTransactions(
            data.transactions.map((transaction: any) => ({
              txId: transaction.transactionHash,
              type: transaction.eventType,
              amount: transaction.amount,
              date: new Date(transaction.depositTime).toLocaleString(),
            }))
          );
        } catch (error) {
          console.error("Failed to fetch transactions", error);
          message.error("Failed to fetch transactions");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTransactions();
  }, [address]); // Chỉ fetch giao dịch khi address thay đổi

  const columns = [
    { title: "Transaction ID", dataIndex: "txId", key: "txId" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Date", dataIndex: "date", key: "date", sorter: true },
  ];

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      loading={loading}
      pagination={{ pageSize: 10 }}
      rowKey="txId"
    />
  );
};

export default TransactionHistory;
