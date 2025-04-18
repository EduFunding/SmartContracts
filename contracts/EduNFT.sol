// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduNFT is ERC721URIStorage, Ownable {
    // NFT metadata for funding
    struct NFTData {
        address owner;
        uint256 loanAmount;
        uint256 repaymentDone;
        bool fullyRepaid;
    }

    uint256 public nextTokenId;
    mapping(uint256 => NFTData) public nftData;
    mapping(address => uint256[]) public userNFTs;

    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 loanAmount);
    event RepaymentUpdated(address indexed payer, uint256 indexed tokenId, uint256 amount, bool fullyRepaid);

    // Constructor with arguments passed to the ERC721 constructor
    constructor() ERC721("EduFundingNFT", "EDU-NFT") {
        nextTokenId = 1;
    }

    /// @notice Mint a new NFT when funding is approved
    function mintNFT(address to, string memory tokenURI, uint256 loanAmount) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        nftData[tokenId] = NFTData({
            owner: to,
            loanAmount: loanAmount,
            repaymentDone: 0,
            fullyRepaid: false
        });

        userNFTs[to].push(tokenId);

        emit NFTMinted(to, tokenId, loanAmount);
        return tokenId;
    }

    /// @notice Record repayment against an NFT
    function repay(uint256 tokenId) external payable {
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(!nftData[tokenId].fullyRepaid, "Loan already fully repaid");

        nftData[tokenId].repaymentDone += msg.value;

        if (nftData[tokenId].repaymentDone >= nftData[tokenId].loanAmount) {
            nftData[tokenId].fullyRepaid = true;
        }

        emit RepaymentUpdated(msg.sender, tokenId, msg.value, nftData[tokenId].fullyRepaid);
    }

    /// @notice Get all NFTs owned by a user
    function getUserNFTs(address user) external view returns (uint256[] memory) {
        return userNFTs[user];
    }

    /// @notice Get NFT details
    function getNFTDetails(uint256 tokenId) external view returns (address owner, uint256 loanAmount, uint256 repaid, bool fullyRepaid) {
        NFTData memory data = nftData[tokenId];
        return (data.owner, data.loanAmount, data.repaymentDone, data.fullyRepaid);
    }

    /// @notice Admin can withdraw all collected repayments
    function withdraw(address payable to) external onlyOwner {
        require(address(this).balance > 0, "No balance to withdraw");
        to.transfer(address(this).balance);
    }
}
