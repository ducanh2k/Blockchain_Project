pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenA is ERC20 {
    uint public tokenCounter;

    constructor() ERC20("TokenA", "TKA") {}

    event TestEvent(address indexed _to, uint256 _amount);

    function mintToken(address _to, uint256 _amount) public {
        _mint(_to, _amount);
        tokenCounter++;
        emit TestEvent(_to, _amount);
    }
}
