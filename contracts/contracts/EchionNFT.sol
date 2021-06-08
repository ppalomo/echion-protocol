//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

contract EchionNFT is ERC721, ERC721URIStorage {

    // Structs
    struct NFT {
        address creator;
        string imageURI;
    }

    // Variables
    NFT[] public tokens;

    // Events
    event AutographMinted(uint id, address indexed creator, string imageURI, string metadataURI);

    /// @notice Contract initializer
    constructor() ERC721("Echion Protocol NFT", "ECHNFT") {}

    /// @notice Function used to mint a new NFT
    /// @param imageURI Link to an image referencing the asset
    /// @param metadataURI Link to metadata
    function mint(string memory imageURI, string memory metadataURI) public returns (uint) {
        uint newId = tokens.length;

        tokens.push(
            NFT(msg.sender, imageURI)
        );

        _safeMint(msg.sender, newId);
        _setTokenURI(newId, metadataURI);

        emit AutographMinted(newId, msg.sender, imageURI, metadataURI);
        return newId;
    }

    /// @notice Returns autograph creator
    /// @param tokenId Token identifier
    function creatorOf(uint tokenId) public view returns (address) {
        return tokens[tokenId].creator;
    }

    /// @notice Returns image URI
    /// @param tokenId Token identifier
    function imageURI(uint tokenId) public view returns (string memory) {
        return tokens[tokenId].imageURI;
    }

    /// @notice See {IERC721Enumerable-totalSupply}
    function totalSupply() public view returns (uint256) {
        return tokens.length;
    }

    /// @notice Burning function
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @notice See {IERC721Metadata-tokenURI}
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

}