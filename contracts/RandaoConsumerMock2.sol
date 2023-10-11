// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.9;

import "./interface/IRandaoConsumer.sol";
import "./interface/IRandaoWrapper.sol";

contract RandaoConsumerMock2 is IRandaoConsumer {
    address randaoWrapper;

    constructor(address _randaoWrapper) {
        randaoWrapper = _randaoWrapper;
    }

    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        require(false, "rawFulfillRandomWords error");
    }

    function testRequestRandomWords() external {
        IRandaoWrapper(randaoWrapper).requestRandomWords("", 0, 0, 0, 10);
    }

    function charge() external payable {
        IRandaoWrapper(randaoWrapper).charge{ value: msg.value }();
    }
}
