// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEduToken {
    function mint(address to, uint256 amount) external;
}

contract DonationVault is Ownable {
    IEduToken public eduToken;

    struct Donation {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Donation[]) private _donorHistory; // made private for security, exposed via getter
    mapping(address => uint256) public totalDonatedByUser; // added: easier total per user lookup
    uint256 public totalDonations;
    uint256 public numberOfDonors;

    event DonationMade(address indexed donor, uint256 amount);
    event FundsReleased(address indexed recipient, uint256 amount);

    constructor(address _eduTokenAddress) {
        require(_eduTokenAddress != address(0), "Invalid token address");
        eduToken = IEduToken(_eduTokenAddress);
    }

    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0");

        // If it's the user's first donation, count them as a new donor
        if (totalDonatedByUser[msg.sender] == 0) {
            numberOfDonors += 1;
        }

        _donorHistory[msg.sender].push(Donation({
            amount: msg.value,
            timestamp: block.timestamp
        }));

        totalDonatedByUser[msg.sender] += msg.value;
        totalDonations += msg.value;

        // Mint reward tokens: 1 EDU per 0.001 ETH donated (example)
        uint256 rewardAmount = msg.value / 1e15;
        eduToken.mint(msg.sender, rewardAmount);

        emit DonationMade(msg.sender, msg.value);
    }

    function releaseFunds(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient balance");
        recipient.transfer(amount);
        emit FundsReleased(recipient, amount);
    }

    function getDonationsByUser(address donor) external view returns (Donation[] memory) {
        return _donorHistory[donor];
    }

    function getLatestDonation(address donor) external view returns (Donation memory) {
        require(_donorHistory[donor].length > 0, "No donations found for user");
        return _donorHistory[donor][_donorHistory[donor].length - 1];
    }
}
