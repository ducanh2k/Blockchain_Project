pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFTB.sol";
import "./TokenA.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract DepositReward is Ownable {
    IERC20 public tokenA;
    NFTB public nftB;
    uint256 public constant TOKEN_THRESHOLD = 1_000_000 * 10 ** 18;
    uint256 public constant LOCK_PERIOD = 5 minutes;
    uint256 public apr = 8;

    TokenA public tokenAa;

    struct Deposit {
        uint256 amount;
        uint256 depositTime;
        uint256 apr; // store APR at the time of deposit
    }

    mapping(address => Deposit[]) public deposits;

    event DepositMade(
        address indexed user,
        uint256 amount,
        uint256 depositTime
    );
    event Withdraw(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event APRUpdated(uint256 newAPR);

    constructor(
        IERC20 _tokenA,
        NFTB _nftB,
        TokenA _tokenAa
    ) Ownable(msg.sender) {
        tokenA = _tokenA;
        nftB = _nftB;
        tokenAa = _tokenAa;
    }

    // Allow users to deposit TokenA
    function deposit(uint256 amount) external {
        require(amount >= TOKEN_THRESHOLD, "Amount too small");
        require(
            tokenA.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        deposits[msg.sender].push(
            Deposit({amount: amount, depositTime: block.timestamp, apr: apr})
        );

        emit DepositMade(msg.sender, amount, block.timestamp);

        if (amount >= TOKEN_THRESHOLD) {
            nftB.mint(msg.sender);
        }
    }

    // Allow users to withdraw their deposits after the lock period
    function withdraw() external {
        uint256 totalWithdrawn = 0;

        for (uint256 i = 0; i < deposits[msg.sender].length; i++) {
            Deposit storage userDeposit = deposits[msg.sender][i];
            if (
                userDeposit.amount > 0 &&
                block.timestamp >= userDeposit.depositTime + LOCK_PERIOD
            ) {
                totalWithdrawn += userDeposit.amount;
                userDeposit.amount = 0;
            }
        }

        require(
            totalWithdrawn > 0,
            "No tokens available for withdrawal or tokens are still locked"
        );
        require(
            tokenA.transfer(msg.sender, totalWithdrawn),
            "Token transfer failed"
        );

        emit Withdraw(msg.sender, totalWithdrawn);
    }

    // Allow users to claim rewards for all deposits
    function claimReward() external {
        uint256 totalReward = 0;
        uint256 secondsInAYear = 365 * 24 * 60 * 60;

        for (uint256 i = 0; i < deposits[msg.sender].length; i++) {
            Deposit storage userDeposit = deposits[msg.sender][i];
            if (
                block.timestamp >= userDeposit.depositTime + LOCK_PERIOD &&
                userDeposit.amount > 0
            ) {
                uint256 timeStaked = block.timestamp - userDeposit.depositTime;
                uint256 reward = (userDeposit.amount *
                    userDeposit.apr *
                    timeStaked) / (100 * secondsInAYear);
                totalReward += reward;
            }
        }

        require(totalReward > 0, "No rewards available to claim");
        tokenAa.transferToken(msg.sender, totalReward);
        emit RewardClaimed(msg.sender, totalReward);
    }

    // Admin function to update the APR
    function setAPR(uint256 newAPR) external onlyOwner {
        apr = newAPR;
        emit APRUpdated(newAPR);
    }

    // Function to get all deposits for a user
    function getDeposits(
        address user
    ) external view returns (Deposit[] memory) {
        return deposits[user];
    }
}
