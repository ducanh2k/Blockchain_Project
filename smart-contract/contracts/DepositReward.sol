// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./NFTB.sol";
import "./TokenA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DepositReward is Ownable, IERC721Receiver {
    IERC20 public tokenA;
    NFTB public nftB;
    uint256 public constant TOKEN_THRESHOLD = 1_000_000 * 10 ** 18; // 1 triệu token
    uint256 public constant ALL_TOKEN_REWARD = 100_000_000 * 10 ** 18;
    uint256 public constant LOCK_PERIOD = 5 minutes; // Lock thời gian 5 phút cho testing
    uint256 public baseAPR = 8; // Base APR

    TokenA public token_A;

    struct Deposit {
        uint256 amount;
        uint256 depositTime;
        uint256 aprAtDeposit;
        uint256 claimedReward;
        bool rewardClaimed;
    }

    mapping(address => Deposit[]) public deposits;
    mapping(address => uint256) public userAPR;

    event DepositMade(
        address indexed user,
        uint256 amount,
        uint256 depositTime
    );
    event Withdraw(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event APRUpdated(uint256 newAPR);
    event NFTBDeposited(address indexed user, uint256 tokenId);
    event NFTBMinted(address indexed user, uint256 tokenId); // Event for minting NFT
    event NFTBWithdrawn(address indexed user, uint256 tokenId);

    constructor(
        IERC20 _tokenA,
        NFTB _nftB,
        TokenA _token_A
    ) Ownable(msg.sender) {
        tokenA = _tokenA;
        nftB = _nftB;
        token_A = _token_A;
        token_A.mintToken(address(this), ALL_TOKEN_REWARD); // Mint tổng reward
    }

    function getUserAPR(address user) public view returns (uint256) {
        return userAPR[user];
    }

    function deposit(uint256 amount) external {
        require(amount >= TOKEN_THRESHOLD, "Amount too small");
        require(
            tokenA.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        uint256 currentAPR = getUserAPR(msg.sender);
        deposits[msg.sender].push(
            Deposit({
                amount: amount,
                depositTime: block.timestamp,
                aprAtDeposit: currentAPR,
                claimedReward: 0,
                rewardClaimed: false
            })
        );

        if (amount >= TOKEN_THRESHOLD) {
            nftB.mint(msg.sender);
        }

        emit DepositMade(msg.sender, amount, block.timestamp);
    }

    function depositNFTB(uint256 tokenId) external {
        require(nftB.ownerOf(tokenId) == msg.sender, "You don't own this NFTB");
        nftB.safeTransferFrom(msg.sender, address(this), tokenId); // Transfer NFT to contract
        userAPR[msg.sender] = getUserAPR(msg.sender) + 2;
        updateAPRForUser(msg.sender);

        emit NFTBDeposited(msg.sender, tokenId);
    }

    function withdrawNFTB(uint256 tokenId) external {
        require(
            nftB.ownerOf(tokenId) == address(this),
            "Contract doesn't own this NFTB"
        );
        nftB.safeTransferFrom(address(this), msg.sender, tokenId); // Transfer NFT back to user
        userAPR[msg.sender] = getUserAPR(msg.sender) - 2;
        updateAPRForUser(msg.sender);

        emit NFTBWithdrawn(msg.sender, tokenId);
    }

    // Withdraw Token A and rewards
    function withdraw() external {
        uint256 totalWithdrawn = 0;
        uint256 secondsInAYear = 365 * 24 * 60 * 60;

        for (uint256 i = 0; i < deposits[msg.sender].length; i++) {
            Deposit storage userDeposit = deposits[msg.sender][i];
            if (
                userDeposit.amount > 0 &&
                block.timestamp >= userDeposit.depositTime + LOCK_PERIOD
            ) {
                uint256 timeStaked = block.timestamp - userDeposit.depositTime;
                uint256 totalReward = (userDeposit.amount *
                    baseAPR *
                    timeStaked) / (100 * secondsInAYear);

                uint256 totalAmountToWithdraw = userDeposit.amount +
                    totalReward;

                if (userDeposit.rewardClaimed) {
                    totalWithdrawn += userDeposit.amount;
                } else {
                    totalWithdrawn += totalAmountToWithdraw;
                }

                userDeposit.amount = 0;
                userDeposit.claimedReward = totalReward;
                userDeposit.rewardClaimed = true;
            }
        }

        require(
            totalWithdrawn > 0,
            "No tokens available for withdrawal or still locked"
        );
        require(
            tokenA.transfer(msg.sender, totalWithdrawn),
            "Token transfer failed"
        );

        emit Withdraw(msg.sender, totalWithdrawn);
    }

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
                totalReward =
                    (userDeposit.amount * baseAPR * timeStaked) /
                    (100 * secondsInAYear);

                userDeposit.claimedReward += totalReward;
                userDeposit.rewardClaimed = true;
            }
        }

        require(
            tokenA.transfer(msg.sender, totalReward),
            "Token transfer failed"
        );

        emit RewardClaimed(msg.sender, totalReward);
    }

    function setBaseAPR(uint256 newAPR) external onlyOwner {
        baseAPR = newAPR;
        emit APRUpdated(newAPR);
    }

    function getDeposits(
        address user
    ) external view returns (Deposit[] memory) {
        return deposits[user];
    }

    function updateAPRForUser(address user) internal {
        uint256 currentAPR = getUserAPR(user);
        for (uint256 i = 0; i < deposits[user].length; i++) {
            deposits[user][i].aprAtDeposit = currentAPR;
        }
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
