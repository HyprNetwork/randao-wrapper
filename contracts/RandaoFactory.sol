// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./RandaoWrapper.sol";

contract RandaoWrapperFactory {
    uint256 randaoWrapperNums = 0;
    mapping(address => address) randaoWrapperInstancesMap;
    address[] randaoWrapperInstancesArray;

    event LogContractCreated(address indexed newContract);

    function createContract(
        address randao,
        address admin,
        uint256 _deposit,
        uint256 _bounty,
        uint256 _maxTxFee,
        bool isCheck
    ) public returns (address) {
        RandaoWrapper newContract = new RandaoWrapper(
            randao,
            admin,
            _deposit,
            _bounty,
            _maxTxFee,
            isCheck
        );
        randaoWrapperInstancesMap[address(newContract)] = msg.sender;
        randaoWrapperInstancesArray.push(address(newContract));
        randaoWrapperNums++;

        emit LogContractCreated(address(newContract));

        return address(newContract);
    }

    function getNewContractAddress() public view returns (address) {
        return randaoWrapperInstancesArray[randaoWrapperNums - 1];
    }
}
