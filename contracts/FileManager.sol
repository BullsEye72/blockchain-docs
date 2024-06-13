// SPDX-License-Identifier: UNLICENSED
// Author: @BullsEye72
pragma solidity ^0.8.24;
import "hardhat/console.sol";

contract FileStorage {
    // Structs
    struct File {
        uint userId;
    }

    // Variables
    address public manager;
    mapping(string => File) public files; // Key is the files checksum

    //Events
    event FileAdded(string fileHash, uint blockNumber, uint timestamp);
    event TestEvent(string data);

    // Modifiers
    modifier onlyManager() {
        require(msg.sender == manager, "Caller is not the manager");
        _;
    }

    // Constructor
    constructor() {
        manager = msg.sender;
    }

    function changeManager(address _newManager) public onlyManager {
        manager = _newManager;
    }

    // Functions
    function storeFile(string memory _hash, uint _userId) public onlyManager {
        // Store the file in the blockchain
        File memory newFile = File({userId: _userId});
        files[_hash] = newFile;

        emit FileAdded(_hash, block.number, block.timestamp);
    }

    function testEvent() public {
        string memory data = string(
            abi.encodePacked("Hello World", " ", block.timestamp)
        );
        emit TestEvent(data);
    }
}
