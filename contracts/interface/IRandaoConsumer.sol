// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.9;

interface IRandaoConsumer {
    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external;
}
