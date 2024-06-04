// SPDX-License-Identifier: UNLICENSED
// Author: @BullsEye72
pragma solidity ^0.8.24;
import "hardhat/console.sol";

/**
 * @title FileManagementFactory
 * @dev This contract is used to create a new file in the blockchain
 */
contract FileManagerFactory {
    mapping(uint => uint) public filesCountByOwner;

    mapping(uint => address[]) private managedFilesByOwner;
    address private manager;

    // event for EVM logging
    event OwnerSet(address indexed oldOwner, address indexed newOwner);

    // modifier to check if caller is owner
    modifier isManager() {
        require(msg.sender == manager, "Caller is not the manager");
        _;
    }

    constructor() {
        manager = msg.sender;
        emit OwnerSet(address(0), manager);
    }

    function createFile(
        string memory _name,
        string memory _hash,
        uint _owner,
        uint _lastModified
    ) public isManager {
        address newFile = address(
            new FileManager(_name, _hash, _owner, _lastModified)
        );
        managedFilesByOwner[_owner].push(newFile);
        filesCountByOwner[_owner]++;
    }

    function getFilesByOwner(
        uint _owner
    ) public view isManager returns (address[] memory) {
        return managedFilesByOwner[_owner];
    }

    /**
     * @dev Change owner
     * @param newOwner address of new owner
     */
    function changeOwner(address newOwner) public isManager {
        emit OwnerSet(manager, newOwner);
        manager = newOwner;
    }

    /**
     * @dev Return owner address
     * @return address of owner
     */
    function getManager() external view returns (address) {
        return manager;
    }

    function getSender() external view returns (address) {
        return msg.sender;
    }

    function testManager() external view isManager returns (bool) {
        return true;
    }
}

/**
 * @title FileManagement
 * @dev This contract is used to manage a file in the blockchain
 */
contract FileManager {
    string name; // Name of the file
    string fileHash; // Hash SHA256 of the file
    uint owner; // ID of the owner, comes from the database
    uint lastModified; // Last time the file was modified, from metadata
    uint dateAdded; // Date the file was added to the blockchain
    address public factory; // Address of the factory of the file

    constructor(
        string memory _name,
        string memory _fileHash,
        uint _owner,
        uint _lastModified
    ) {
        owner = _owner;
        lastModified = _lastModified;

        dateAdded = block.timestamp;
        factory = msg.sender;

        fileHash = _fileHash;
        name = _name;
    }

    function getFileContent()
        public
        view
        returns (string memory, string memory, uint, uint, uint)
    {
        return (name, fileHash, owner, lastModified, dateAdded);
    }
}
