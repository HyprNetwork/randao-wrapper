// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.9;

import "./interface/IRandaoConsumer.sol";
import "./interface/IRandaoWrapper.sol";

contract RandaoConsumerMock1 is IRandaoConsumer {
    address public randaoWrapper;

    event LogRandaoConsumerRes(uint256 indexed requestId, uint256[] randomWords);
    event LogRandaoConsumerReq(uint256 indexed requestId);

    // address self;

    constructor(address _randaoWrapper) {
        randaoWrapper = _randaoWrapper;
        // self = address(this);
    }

    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        emit LogRandaoConsumerRes(requestId, randomWords);
    }

    function testRequestRandomWords() external returns (uint256) {
        uint256 requestId = IRandaoWrapper(randaoWrapper).requestRandomWords("", 0, 0, 0, 10);
        emit LogRandaoConsumerReq(requestId);
        return requestId;
    }

    function charge() external payable {
        IRandaoWrapper(randaoWrapper).charge{ value: msg.value }();
    }
}
