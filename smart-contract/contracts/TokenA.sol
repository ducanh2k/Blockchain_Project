pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenA is ERC20 {
    uint public tokenCounter;
    uint public constant ALL_TOKEN = 1_000_000_000 * 10 ** 18;
    address public staking;
    constructor() ERC20("TokenA", "TKA") {
        _mint(address(this), ALL_TOKEN);
    }

    // function setStaking(address _staking) external onlyOwner{
    //     staking = _staking;
    // }

    event TransferEvent(address indexed _to, uint256 _amount);

    function mintToken(address _to, uint256 _amount) public {
        _mint(_to, _amount);
        tokenCounter++;
        emit TransferEvent(_to, _amount);
    }

    function transferToken(address _to, uint256 _amount) public {
        _transfer(address(this),_to, _amount);
        emit TransferEvent(_to, _amount);
    }
}
