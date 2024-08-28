pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFTB.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DepositReward is Ownable {
    IERC20 public tokenA;
    NFTB public nftB;
    uint256 public constant TOKEN_THRESHOLD = 1_000_000 * 10 ** 18;
    uint256 public constant LOCK_PERIOD = 5 minutes;
    uint256 public apr = 8;

    struct Deposit {
        uint256 amount;
        uint256 depositTime;
        uint256 apr; // store APR at the time of deposit
    }

    mapping(address => Deposit[]) public deposits;

    event DepositMade(address indexed user, uint256 amount, uint256 depositTime);
    event Withdraw(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event APRUpdated(uint256 newAPR);

    constructor(IERC20 _tokenA, NFTB _nftB) Ownable(msg.sender) {
        tokenA = _tokenA;
        nftB = _nftB;
    }

    // Allow users to deposit TokenA
    function deposit(uint256 amount) external {
        require(amount >= TOKEN_THRESHOLD, "Deposit must be at least 1M TokenA");

        require(
            tokenA.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        deposits[msg.sender].push(Deposit({
            amount: amount,
            depositTime: block.timestamp,
            apr: apr // store current APR
        }));

        emit DepositMade(msg.sender, amount, block.timestamp);

        if (amount >= TOKEN_THRESHOLD) {
            nftB.mint(msg.sender);
        }
    }

    // Allow users to withdraw their deposits after the lock period
    function withdraw(uint256 index) external {
        Deposit storage userDeposit = deposits[msg.sender][index];
        require(userDeposit.amount > 0, "Deposit already withdrawn");
        require(
            block.timestamp >= userDeposit.depositTime + LOCK_PERIOD,
            "Tokens are still locked"
        );

        uint256 amount = userDeposit.amount;
        userDeposit.amount = 0;

        require(tokenA.transfer(msg.sender, amount), "Token transfer failed");
        emit Withdraw(msg.sender, amount);
    }

    // Allow users to claim rewards based on the APR
    function claimReward(uint256 index) external {
        Deposit storage userDeposit = deposits[msg.sender][index];
        require(
            block.timestamp >= userDeposit.depositTime + LOCK_PERIOD,
            "Tokens are still locked"
        );

        uint256 reward = (userDeposit.amount * userDeposit.apr) / 100;
        require(tokenA.transfer(msg.sender, reward), "Token transfer failed");
        emit RewardClaimed(msg.sender, reward);
    }

    // Admin function to update the APR
    function setAPR(uint256 newAPR) external onlyOwner {
        apr = newAPR;
        emit APRUpdated(newAPR);
    }

    // Function to get all deposits for a user
    function getDeposits(address user) external view returns (Deposit[] memory) {
        return deposits[user];
    }
}
