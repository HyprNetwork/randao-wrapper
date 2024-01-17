// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interface/IRandaoWrapper.sol";
import "./interface/IRandaoConsumer.sol";
import "./interface/IRandao.sol";

contract RandaoWrapper is IRandaoWrapper {
    IRandao public randao;

    mapping(uint256 => uint256) public requestNums;
    mapping(uint256 => address) public requestConsumers;
    mapping(address => uint256) public chargeUsers;
    uint256[] public requestIds;

    address public admin;
    uint256 public deposit;
    uint256 public bounty;
    uint256 public maxTxFee;
    bool public isCheck;

    constructor(address _randao, address _admin, uint256 _deposit, uint256 _bounty, uint256 _maxTxFee, bool _isCheck) {
        admin = _admin;
        randao = IRandao(_randao);

        deposit = _deposit;
        bounty = _bounty;
        maxTxFee = _maxTxFee;
        isCheck = _isCheck;

        require(bounty >= deposit, "bounty is too less1");
        require((deposit / maxTxFee / 4) > 0, "deposit is too less1!!!");
    }

    modifier adminCheck(address caller) {
        // require(caller == admin, "caller is not admin");
        _;
    }

    function requestRandomWords(bytes32, uint256, uint256, uint256, uint256 numWords) external adminCheck(msg.sender) returns (uint256 requestId) {
        require(address(this).balance > bounty, "Randao Wrapper balance is too less");
        if (isCheck) {
            require(chargeUsers[msg.sender] >= bounty, "user charge balance is too less");
            chargeUsers[msg.sender] -= bounty;
        }

        require(numWords != 0, "numWords is error!!!");

        // uint256 deposit = 2e7 wei;
        // uint256 bounty = 2e7 wei;
        // uint256 maxFee = 1e6 wei;
        // // uint256 bounty = msg.value;

        uint256 bnum = block.number + 20;
        uint256 commitBalkline = 16;
        uint256 commitDeadline = 8;

        // if (requestIds.length != 0) {
        //     requestId = requestIds[requestIds.length - 1] + 10;
        // } else {
        //     requestId = 1;
        // }
        // requestIds.push(requestId);
        requestId = randao.newCampaign{ value: bounty }(bnum, deposit, commitBalkline, commitDeadline);

        // require(requestId != 0, "requestId generate error!!!");
        require((requestNums[requestId] == 0) && (requestConsumers[requestId] == address(0)), "requestId is repeated!!!");
        requestNums[requestId] = numWords;
        requestConsumers[requestId] = msg.sender;

        emit LogRequestRandom(requestId, msg.sender, bnum, bounty, deposit, commitBalkline, commitDeadline);

        return requestId;
    }

    function rawFulfillRandomWords(uint256 requestId) external {
        // require(requestId != 0, "requestId is error1!!!");
        require((requestNums[requestId] != 0) && (requestConsumers[requestId] != address(0)), "requestId is error2!!!");

        uint256[] memory randomWords = new uint256[](requestNums[requestId]);
        randomWords[0] = randao.getRandom(requestId);
        for (uint256 i = 1; i < requestNums[requestId]; i++) {
            randomWords[i] = uint256(
                keccak256(abi.encodePacked(randomWords[i - 1]))
            );
        }

        IRandaoConsumer randaoConsumer = IRandaoConsumer(requestConsumers[requestId]);

        // randaoConsumer.rawFulfillRandomWords(requestId, randomWords);

        (bool success, bytes memory data) = address(randaoConsumer).call(
            abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", requestId, randomWords));

        if (!success) {
            bytes memory result = new bytes(data.length - 4);
            for (uint256 i = 4; i < data.length; i++) {
                result[i - 4] = data[i];
            }
            string memory reason = abi.decode(result, (string));
            revert(string.concat("rawFulfillRandomWords call error: ", reason));
        }

        delete requestNums[requestId];
        delete requestConsumers[requestId];

        emit LogRawFulfillRandomWords(requestId, randomWords);
    }

    function latestRoundData() external pure returns (uint256 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint256 answeredInRound) {
        return (0, 0, 0, 0, 0);
    }

    function getFeeConfig() external pure returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256)  {
        return (0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    function refundFee(uint256 requestId) external payable {
        randao.refundBounty(requestId);
    }

    function charge() external payable {
        require(msg.value > bounty, "charge is too less!!!");
        chargeUsers[msg.sender] += msg.value;
    }

    fallback() external payable {}

    receive() external payable {}
}
