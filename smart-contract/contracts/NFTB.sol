pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFTB is ERC721Enumerable  {
    uint256 public tokenId;

    constructor() ERC721("NFTB", "NFTB"){}

    function mint(address to) external {
        _safeMint(to, tokenId);
        tokenId ++;
    }
}
