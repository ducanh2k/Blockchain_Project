pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTB is ERC721, Ownable {
    uint256 public tokenId;

    constructor() ERC721("NFTB", "NFTB") Ownable(msg.sender) {}

    function mint(address to) external onlyOwner {
        _safeMint(to, tokenId);
        tokenId ++;
    }
}
