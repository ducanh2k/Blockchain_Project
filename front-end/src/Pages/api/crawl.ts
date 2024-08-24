// src/pages/api/crawl.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { contractAddress } = req.query;

  const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
  const contract = new ethers.Contract(
    contractAddress as string,
    erc20Abi,
    provider
  );

  try {
    const totalSupply = await contract.totalSupply();
    res.status(200).json({ totalSupply: ethers.formatUnits(totalSupply, 18) });
  } catch (error) {
    res.status(500).json({ error: "Failed to crawl data" });
  }
}

const erc20Abi = ["function totalSupply() view returns (uint256)"];
