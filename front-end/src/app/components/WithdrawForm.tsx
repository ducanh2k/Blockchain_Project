import React, { useState, useEffect } from "react";
import { Form, Button, message } from "antd";
import { ethers } from "ethers";

interface WithdrawFormProps {
  signer: ethers.Signer;
  onWithdrawSuccess: () => void;
}

const stakingAddress = "0xFA59E603266fe375287fEc7fc027b2B502f05286";

const stakingAbi = [
  "function withdraw() external",
  "function claimReward() external",
  "function getDeposits(address account) external view returns (tuple(uint256 amount, uint256 depositTime, uint256 apr)[])",
  "function getPendingReward(address account) external view returns (uint256)",
  "function depositNFTB(uint256 tokenId) external", 
  "function withdrawNFTB(uint256 tokenId) external",
];


const nftBAbi = [
  "function approve(address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
];

const nftBAddress = "0xAcCB7041476FD50a49612ACBb4ccbc8b9369d94A";

const WithdrawForm: React.FC<WithdrawFormProps> = ({
  signer,
  onWithdrawSuccess,
}) => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [pendingReward, setPendingReward] = useState<string>("1");
  const [pendingWithdraw, setPendingWithdraw] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<string | null>(null);

  // Fetch user deposits
  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const contract = new ethers.Contract(
          stakingAddress,
          stakingAbi,
          signer
        );
        const userDeposits = await contract.getDeposits(
          await signer.getAddress()
        );
        setDeposits(userDeposits);
      } catch (error) {
        console.error("Error fetching deposits:", error);
        message.error("Failed to fetch deposits");
      }
    };

    fetchDeposits();
  }, [signer]);

  // Fetch one NFTB token ID that user owns
  useEffect(() => {
    const fetchTokenId = async () => {
      try {
        const nftBContract = new ethers.Contract(nftBAddress, nftBAbi, signer);
        const userAddress = await signer.getAddress();

        const balance = await nftBContract.balanceOf(userAddress);
        message.success(`Your NFTB balance: ${balance.toString()}`);

        if (balance > 0) {
          const tokenId = await nftBContract.tokenOfOwnerByIndex(
            userAddress,
            0
          );
          message.info(`Your NFTB token ID: ${tokenId.toString()}`);
          setTokenId(tokenId.toString());
        } else {
        }
      } catch (error) {
        console.error("Error fetching NFTB token:", error);
        message.error("Failed to fetch NFTB token ID");
      }
    };

    fetchTokenId();
  }, [signer]);

  const handleWithdraw = async () => {
    try {
      const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
      const tx = await contract.withdraw({ gasLimit: 500000 });
      await tx.wait();
      message.success("Withdraw successful");
      setPendingReward("0");
      setPendingWithdraw(true);
      onWithdrawSuccess();
    } catch (error) {
      console.error("Error during withdrawal:", error);
      message.error("Withdraw failed");
    }
  };

  const handleClaimReward = async () => {
    try {
      const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
      const tx = await contract.claimReward({ gasLimit: 500000 });
      await tx.wait();
      message.success("Claim reward successful");
    } catch (error) {
      console.error("Error during reward claim:", error);
      message.error("Claim reward failed");
    }
  };

  // Function to handle NFTB deposit
  const handleDepositNFTB = async () => {
    if (!tokenId) {
      message.error("No NFTB token available for deposit.");
      return;
    }

    try {
      const nftBContract = new ethers.Contract(nftBAddress, nftBAbi, signer);
      const userAddress = await signer.getAddress();

      // Approve the staking contract to transfer this NFTB
      const approveTx = await nftBContract.approve(stakingAddress, tokenId);
      await approveTx.wait();
      message.success(`Approval successful for NFTB with Token ID: ${tokenId}`);

      // Now deposit the NFTB to staking contract
      const stakingContract = new ethers.Contract(
        stakingAddress,
        stakingAbi,
        signer
      );
      const depositTx = await stakingContract.depositNFTB(tokenId, {
        gasLimit: 500000,
      }); 
      await depositTx.wait();
      message.success(`NFTB with Token ID: ${tokenId} deposited successfully`);
    } catch (error) {
      console.error("Error depositing NFTB:", error);
      message.error("Deposit NFTB failed");
    }
  };

  const handleWithdrawNFTB = async () => {
    try {
      const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
      const tx = await contract.withdrawNFTB(tokenId,{ gasLimit: 500000 });
      await tx.wait();
      message.success("NFTB withdrawn successfully");
    } catch (error) {
      console.error("Error withdrawing NFTB:", error);
      message.error("Withdraw NFTB failed");
    }
  };

  return (
    <Form layout="vertical">
      {deposits.length > 0 && (
        <div>
          <h4>Your Last Deposit:</h4>
          <ul>
            <li>
              Locked until{" "}
              {new Date(
                (Number(deposits[deposits.length - 1].depositTime) + 5 * 60) *
                  1000
              ).toLocaleString()}
            </li>
          </ul>
        </div>
      )}

      <Button type="primary" onClick={handleWithdraw}>
        Withdraw All
      </Button>
      <Button
        type="default"
        onClick={handleClaimReward}
        style={{ marginLeft: 10 }}
      >
        Claim All Rewards
      </Button>

      <div>
        <br />
        <Button type="primary" onClick={handleDepositNFTB} disabled={!tokenId}>
          Deposit NFTB
        </Button>
        <Button
          type="default"
          onClick={handleWithdrawNFTB}
          style={{ marginLeft: 10 }}
        >
          Withdraw NFTB
        </Button>
      </div>
    </Form>
  );
};

export default WithdrawForm;
