# Sample for Randao Wrapper VRF 

## There are some Randao Wrapper VRF usage case, you are able to build a game on-chain safely step by step follow sample below. 

### For using Randao Wrapper VRF, first you need to write a smart contract using solidity language, code example is as follow:
``` solidity
// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.9;

import "./interface/IRandaoConsumer.sol";
import "./interface/IRandaoWrapper.sol";

contract RandaoConsumerSample is IRandaoConsumer {
    address randaoWrapper;

    event LogRandaoConsumerRes(
        uint256 indexed requestId,
        uint256[] randomWords
    );
    event LogRandaoConsumerReq(uint256 indexed requestId);

    // Init your smart contract and save address of RandaoWrapper contract to your contract.
    constructor(address _randaoWrapper) {
        randaoWrapper = _randaoWrapper;
    }

    // Request random numbers through calling requestRandomWords() function of RandaoWrapper contract.
    function callRequestRandomWords() external returns (uint256) {
        uint256 requestId = IRandaoWrapper(randaoWrapper).requestRandomWords(
            "",
            0,
            0,
            0,
            10
        );
        emit LogRandaoConsumerReq(requestId);
        return requestId;
    }

    // Charge bounty fee of random numbers request to RandaoWrapper contract.
    function charge() external payable {
        IRandaoWrapper(randaoWrapper).charge{ value: msg.value }();
    }

    // Provide a rawFulfillRandomWords() callback function that would be called by RandaoWrapper contract when random numbers generating successful.
    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        emit LogRandaoConsumerRes(requestId, randomWords);
    }
}
```

### Next, you need to compile your smart contract by hardhat tool, execute commands is as follow:
``` bash
yarn hardhat compile
yarn hardhat typechain
```

### Finally, you need to write some typescript codes for calling your contract function to request and get random numbers response, code example is as follow:
``` typescript
import { JsonRpcProvider, Wallet, ethers } from 'ethers';
// import RandaoConsumerSample json abi from hardhat compile.
import RandaoConsumerSampleAbi from '@/build/abi/contracts/RandaoConsumerSample.sol/RandaoConsumerSample.json';
// import RandaoConsumerSample contract type from hardhat typechain.
import { RandaoConsumerSample } from '@/build/types';
// import RandaoConsumerSample Event type from hardhat typechain.
import { LogRandaoConsumerResEvent } from '@/build/types/RandaoConsumerSample';

try {
    const provider = new JsonRpcProvider('<web3 rpc>');
    const signer = new Wallet('<your secret key>', provider);
    const randao_samp = new ethers.Contract(
        '<RandaoWrapper contract address>',
        RandaoConsumerSampleAbi,
        signer,
    ) as unknown as RandaoConsumerSample;

    const bounty = BigInt('<the bounty of request random numbers>');
    // Charge bounty fee to RandaoWrapper for requesting random number.
    let receipt = await (
        await randao_samp.charge({ value: bounty })
    ).wait();
    if (receipt == null) {
        throw 'charge receipt get failed';
    }

    // Call callRequestRandomWords function for reuqesting random numbers.
    receipt = await (await randao_samp.callRequestRandomWords()).wait();
    if (receipt == null) {
        throw 'RandaoConsumerSample receipt get failed';
    }

    console.log('RandaoConsumerSample status: ', receipt?.status);

    let requestId = undefined;
    const contract = randao_samp as unknown as ethers.Contract;
    // Get a requestId from LogRandaoConsumerReq event in receipt logs.
    for (const log of receipt!.logs) {
        const parsedLog = contract.interface.parseLog(
        log as unknown as { topics: Array<string>; data: string },
        );
        console.log(
        'event name',
        parsedLog?.name,
        'args value:',
        parsedLog?.args,
        );
        if (parsedLog?.args.requestId) {
        requestId = parsedLog?.args.requestId ?? requestId;
        }
    }
    console.log('requestId: ', requestId);

    // Get random numbers response from your rawFulfillRandomWords() callback function through listening contract evnet.
    randao_samp.once(
        randao_samp.filters.LogRandaoConsumerRes(requestId),
        async (event1) => {
        const [requestId, randomWords]: LogRandaoConsumerResEvent.OutputTuple =
            (
            event1 as unknown as {
                args: LogRandaoConsumerResEvent.OutputTuple;
            }
            ).args;
        console.log(
            'LogRandaoConsumerResultEvent requestId: ',
            requestId,
            'randomWords: ',
            randomWords,
        );
        },
    );
} catch (e) {
    console.log('run error', e);
}
```