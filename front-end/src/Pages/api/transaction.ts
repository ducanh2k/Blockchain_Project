import { NextApiRequest, NextApiResponse } from 'next';

const mockTransactions = [
  {
    txId: '0x1234',
    type: 'Deposit',
    amount: '1000',
    date: '2024-08-23',
    address: '0xCA915780d6d9b48bC2803E4a7AB983779e65F128'
  },
];

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;
  const transactions = mockTransactions.filter((tx) => tx.address === address);
  res.status(200).json({ transactions });
};
