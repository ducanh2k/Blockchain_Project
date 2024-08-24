import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import axios from 'axios';

interface TransactionHistoryProps {
  address: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get(`/api/transactions?address=${address}`);
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [address]);

  const columns = [
    { title: 'Transaction ID', dataIndex: 'txId', key: 'txId' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Date', dataIndex: 'date', key: 'date', sorter: true },
  ];

  return <Table columns={columns} dataSource={transactions} loading={loading} pagination={{ pageSize: 10 }} />;
};

export default TransactionHistory;
