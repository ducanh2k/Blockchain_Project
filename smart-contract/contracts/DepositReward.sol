// contracts/DepositReward.sol
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFTB.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DepositReward is Ownable {
    IERC20 public tokenA;
    NFTB public nftB;
    mapping(uint8 => uint256) public counterEvent;
    uint256 public apr = 8;
    uint256 public constant LOCK_PERIOD = 5 minutes;
    uint256 public constant TOKEN_THRESHOLD = 1_000_000 * 10 ** 18;
    struct UserInfo {
        uint256 amount;
        uint256 startTime;
        uint256 apr;
    }
    struct Deposit {
        address user;
        uint256 amount;
        uint256 depositTime;
    }
    event DepositMade(
        uint256 id,
        address indexed user,
        uint256 amount,
        uint256 depositTime
    );
    mapping(address => Deposit[]) public deposits;

    mapping(address => UserInfo[]) public userInfo;

    constructor(IERC20 _tokenA, NFTB _nftB) Ownable(msg.sender) {
        tokenA = _tokenA;
        nftB = _nftB;
    }

    function deposit(uint256 amount) external {
        require(
            amount >= TOKEN_THRESHOLD,
            "Deposit must be at least 1M TokenA"
        );

        tokenA.transferFrom(msg.sender, address(this), amount);
        counterEvent[0]++;
        // bool hasNFT = nftB.balanceOf(msg.sender) > 0;

        deposits[msg.sender].push(
            Deposit({
                amount: amount,
                depositTime: block.timestamp,
                user: msg.sender
            })
        );
        // userInfo.amount += amount;
        emit DepositMade(counterEvent[0], msg.sender, amount, block.timestamp);
        if (amount >= TOKEN_THRESHOLD) {
            nftB.mint(msg.sender);
        }
    }

    function withdraw(uint256 index) external {
        Deposit storage userDeposit = deposits[msg.sender][index];
        require(
            block.timestamp >= userDeposit.depositTime + LOCK_PERIOD,
            "Tokens are still locked"
        );

        uint256 amount = userDeposit.amount;
        userDeposit.amount = 0;

        tokenA.transfer(msg.sender, amount);
    }

    // function withdrawNFT(uint256 nftId) external {
    //     counterEvent[2]++;
    //     userInfo[msg.sender].apr -= 2;
    // }

    function claimReward(uint256 index) external {
        Deposit storage userDeposit = deposits[msg.sender][index];
        require(
            block.timestamp >= userDeposit.depositTime + LOCK_PERIOD,
            "Tokens are still locked"
        );

        uint256 reward = (userDeposit.amount * apr) / 100;
        tokenA.transfer(msg.sender, reward);
    }

    function getDeposits(
        address user
    ) external view returns (Deposit[] memory) {
        return deposits[user];
    }
}
