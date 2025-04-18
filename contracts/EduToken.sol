// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduToken is ERC20, Ownable {

    mapping(address => uint256) public stakedBalance;
    uint256 public totalStaked;

    event TokensMinted(address indexed to, uint256 amount);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);

    constructor() ERC20("EduToken", "EDU") {}

    /// @notice Mint EDU tokens to donor (only allowed for DonationVault or Owner)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /// @notice Stake EDU tokens to participate in DAO
    function stake(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Not enough tokens to stake");
        _transfer(msg.sender, address(this), amount);

        stakedBalance[msg.sender] += amount;
        totalStaked += amount;

        emit TokensStaked(msg.sender, amount);
    }

    /// @notice Unstake EDU tokens
    function unstake(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Not enough staked tokens");
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;

        _transfer(address(this), msg.sender, amount);

        emit TokensUnstaked(msg.sender, amount);
    }

    /// @notice View if user is eligible for DAO (for frontend use)
    function isEligibleForDAO(address user, uint256 requiredStake) external view returns (bool) {
        return stakedBalance[user] >= requiredStake;
    }
}
