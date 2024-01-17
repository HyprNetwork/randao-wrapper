// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IRandaoWrapper {
    event LogRequestRandom(uint256 indexed requestId, address indexed from, uint256 indexed bnum, uint256 bounty, uint256 deposit, uint256 commitBalkline, uint256 commitDeadline);

    event LogRawFulfillRandomWords(uint256, uint256[]);

    /// @dev Charge some fee to randao wrapper that can be used to pay bounty when some random numbers generated are successful. The value in transaction parameter is used as the amount of the charge.
    function charge() external payable;

    /// @dev Send a request for random numbers generation.
    /// @param numWords for the number of request random numbers.
    /// @return requestId for request random numbers.
    function requestRandomWords(bytes32, uint256, uint256, uint256, uint256 numWords) external returns (uint256 requestId);

    /// @dev Random generation response callback after generating successfully. must be provided by you own contract.
    /// @param requestId for request random numbers.
    function rawFulfillRandomWords(uint256 requestId) external;

    function latestRoundData() external view returns (uint256 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint256 answeredInRound);

    function getFeeConfig() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256);

    function refundFee(uint256 requestId) external payable;
}
