import React, { useState, useEffect } from "react";
import { Form, Button, message } from "antd";
import { ethers } from "ethers";

interface WithdrawFormProps {
  signer: ethers.Signer;
  onWithdrawSuccess: () => void;
}

const stakingAddress = "0xEcdB4CC39e4FdC005A39F161919DD5d8ecd759b4";

const stakingAbi = [
  "function withdraw() external",
  "function claimReward() external",
  "function getDeposits(address account) external view returns (tuple(uint256 amount, uint256 depositTime, uint256 apr)[])",
];

const WithdrawForm: React.FC<WithdrawFormProps> = ({
  signer,
  onWithdrawSuccess,
}) => {
  const [deposits, setDeposits] = useState<any[]>([]);

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
      {<br />}
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
      {
        <div>
          <br />
        </div>
      }
    </Form>
  );
};

export default WithdrawForm;
