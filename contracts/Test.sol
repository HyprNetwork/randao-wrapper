// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Test {
    event TestEvent(uint256 value);

    uint256 v = 0;

    function test() public returns (uint256) {
        v++;
        emit TestEvent(v);
        return v;
    }
}
