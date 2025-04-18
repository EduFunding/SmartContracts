// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Interface for DonationVault
interface IDonationVault {
    function releaseFunds(address payable recipient, uint256 amount) external;
}

contract EduFunding is ERC721URIStorage, Ownable {
    // Define the donationVault variable
    IDonationVault public donationVault;

    // Application Types
    enum Role { Student, School }

    // Application Structure
    struct Application {
        address applicant;
        Role role;
        string metadataURI;
        bytes32 applicationHash;
        bool verified;
        bool approved;
        uint256 nftId;
    }

    // NFT Repayment Structure (for students)
    struct Repayment {
        uint256 totalLoan;
        uint256 amountRepaid;
        bool fullyRepaid;
    }

    // Mappings
    mapping(address => Application) public applications;
    mapping(address => bool) public hasApplied;
    mapping(uint256 => Repayment) public repayments;
    mapping(address => uint256[]) public applicantNFTs;
    uint256 public nextNftId;

    // Events
    event ApplicationSubmitted(address indexed applicant, bytes32 appHash);
    event ApplicationVerified(address indexed applicant);
    event ApplicationApproved(address indexed applicant, uint256 nftId);
    event RepaymentMade(address indexed applicant, uint256 nftId, uint256 amount, bool fullyRepaid);

    // Updated Constructor
    constructor(address initialOwner, address _donationVaultAddress)
        ERC721("EduFundingNFT", "EDUF")  // ERC721 constructor
        Ownable()  // Ownable constructor doesn't take an address directly, uses msg.sender by default
    {
        transferOwnership(initialOwner); // Transfer ownership to the provided initialOwner address
        donationVault = IDonationVault(_donationVaultAddress); // Set donationVault address
    }

    // --- Functions ---

    function submitApplication(Role role, string memory metadataURI, bytes32 appHash) external {
        require(!hasApplied[msg.sender], "Already applied");

        applications[msg.sender] = Application({
            applicant: msg.sender,
            role: role,
            metadataURI: metadataURI,
            applicationHash: appHash,
            verified: true,
            approved: false,
            nftId: 0
        });

        hasApplied[msg.sender] = true;

        emit ApplicationSubmitted(msg.sender, appHash);
    }

    function approveApplication(address applicant, uint256 loanAmount) external onlyOwner {
        require(hasApplied[applicant], "No application");
        Application storage app = applications[applicant];
        require(app.verified, "Not verified");
        require(!app.approved, "Already approved");

        uint256 nftId = nextNftId;
        nextNftId++;

        _mint(applicant, nftId);
        _setTokenURI(nftId, app.metadataURI);

        app.approved = true;
        app.nftId = nftId;
        applicantNFTs[applicant].push(nftId);

        if (app.role == Role.Student) {
            repayments[nftId] = Repayment({
                totalLoan: loanAmount,
                amountRepaid: 0,
                fullyRepaid: false
            });
        }

        emit ApplicationApproved(applicant, nftId);
    }

    function repayLoan(uint256 nftId) external payable {
        require(ownerOf(nftId) == msg.sender, "Not NFT owner");
        Repayment storage repayment = repayments[nftId];
        require(!repayment.fullyRepaid, "Already fully repaid");

        repayment.amountRepaid += msg.value;

        if (repayment.amountRepaid >= repayment.totalLoan) {
            repayment.fullyRepaid = true;
        }

        emit RepaymentMade(msg.sender, nftId, msg.value, repayment.fullyRepaid);
    }

    function getApplicantNFTs(address applicant) external view returns (uint256[] memory) {
        return applicantNFTs[applicant];
    }

    function getRepaymentDetails(uint256 nftId) external view returns (uint256 totalLoan, uint256 amountRepaid, bool fullyRepaid) {
        Repayment memory repayment = repayments[nftId];
        return (repayment.totalLoan, repayment.amountRepaid, repayment.fullyRepaid);
    }

    function withdrawRepayments(address payable to) external onlyOwner {
        require(address(this).balance > 0, "No balance");
        to.transfer(address(this).balance);
    }
}
