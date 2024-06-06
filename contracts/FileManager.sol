// SPDX-License-Identifier: UNLICENSED
// Author: @BullsEye72
pragma solidity ^0.8.24;
import "hardhat/console.sol";

/**
 * @title FileManagementFactory
 * @dev This contract is used to create a new file in the blockchain
 */
contract FileManagerFactory {
    struct OwnerData {
        address fileAddress;
        string fileHash;
    }
    mapping(uint => OwnerData[]) private dataByOwner;
    mapping(uint => uint) public filesCountByOwner;

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
            new FileManager(_name, _hash, _owner, _lastModified, manager)
        );
        dataByOwner[_owner].push(OwnerData(newFile, _hash));
        filesCountByOwner[_owner]++;
    }

    function getFilesByOwner(
        uint _owner
    ) public view isManager returns (OwnerData[] memory) {
        return dataByOwner[_owner];
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
    address private manager; // Address of the manager of the file factory
    mapping(string => string) public metadata; // Metadata of the file

    event FileCreated(string name, string fileHash, uint owner, uint dateAdded);

    constructor(
        string memory _name,
        string memory _fileHash,
        uint _owner,
        uint _lastModified,
        address _manager
    ) {
        manager = _manager;

        owner = _owner;
        lastModified = _lastModified;

        dateAdded = block.timestamp;
        factory = msg.sender;

        fileHash = _fileHash;
        name = _name;
    }

    modifier isManager() {
        require(msg.sender == manager, "Caller is not the manager");
        _;
    }

    function getFileContent()
        public
        view
        returns (string memory, string memory, uint, uint, uint)
    {
        return (name, fileHash, owner, lastModified, dateAdded);
    }

    function setMetadata(
        string memory key,
        string memory value
    ) public isManager {
        metadata[key] = value;
    }

    function getMetadata(
        string memory key
    ) public view returns (string memory) {
        return metadata[key];
    }
}
