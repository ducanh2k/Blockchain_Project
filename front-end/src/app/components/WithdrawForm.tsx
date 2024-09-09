import React, { useState, useEffect } from "react";
import { Form, Button, message } from "antd";
import { ethers } from "ethers";

interface WithdrawFormProps {
  signer: ethers.Signer;
  onWithdrawSuccess: () => void;
}

const stakingAddress = "0xF0CE63286F919Ab97aa3Deea0475BED1dd307d99";

const stakingAbi = [
  "function withdraw() external",
  "function claimReward() external",
  "function getDeposits(address account) external view returns (tuple(uint256 amount, uint256 depositTime, uint256 apr)[])",
  "function getPendingReward(address account) external view returns (uint256)",
  "function depositNFTB() external", // Add depositNFTB function
  "function withdrawNFTB() external", // Add withdrawNFTB function
];

const WithdrawForm: React.FC<WithdrawFormProps> = ({
  signer,
  onWithdrawSuccess,
}) => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [pendingReward, setPendingReward] = useState<string>("1");
  const [pendingWithdraw, setPendingWithdraw] = useState<boolean>(false);

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
    // if (pendingReward === "0") {
    //   message.info("You have no rewards left.");
    //   return;
    // }
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

  // New function to handle NFTB deposit
  const handleDepositNFTB = async () => {
    try {
      const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
      const tx = await contract.depositNFTB({ gasLimit: 500000 });
      await tx.wait();
      message.success("NFTB deposited successfully");
    } catch (error) {
      console.error("Error depositing NFTB:", error);
      message.error("Deposit NFTB failed");
    }
  };

  // New function to handle NFTB withdrawal
  const handleWithdrawNFTB = async () => {
    try {
      const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
      const tx = await contract.withdrawNFTB({ gasLimit: 500000 });
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
        <Button type="primary" onClick={handleDepositNFTB}>
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
