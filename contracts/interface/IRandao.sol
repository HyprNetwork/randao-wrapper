// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.9;

interface IRandao {
    function newCampaign(uint256 _bnum, uint256 _deposit, uint256 _commitBalkline, uint256 _commitDeadline) payable external returns (uint256 _campaignID);

    function getRandom(uint256 _campaignID) external returns (uint256);

    function refundBounty(uint256 _campaignID) external;
}
