import { JsonRpcProvider, Wallet, ethers } from 'ethers';
import RandaoConsumerMock1Abi from '@/build/abi/contracts/RandaoConsumerMock1.sol/RandaoConsumerMock1.json';
import { RandaoConsumerMock1 } from '@/build/types';
import Debug from 'debug';
import { CmdOpts1, Config, conf, initConf, initOpts2, opts2 } from './model';
import { LogRandaoConsumerResEvent } from '@/build/types/RandaoConsumerMock1';

const logDebug = Debug('debug');
const logInfo = Debug('info');
const logErr = Debug('error');

async function main() {
  logInfo('randao wrapper test...');

  try {
    (opts2 as unknown as CmdOpts1) = initOpts2();
    (conf as unknown as Config) = initConf(opts2.config);

    logDebug('cmd opts:', opts2);
    logDebug('config:', conf);

    const provider = new JsonRpcProvider(conf.rpc_url);
    const signer = new Wallet(conf.sec_key, provider);
    const randao_mock1 = new ethers.Contract(
      conf.randao_consumer_mock1,
      RandaoConsumerMock1Abi,
      signer,
    ) as unknown as RandaoConsumerMock1;

    let receipt = await (
      await randao_mock1.charge({ value: BigInt(conf.bounty) * BigInt(2) })
    ).wait();
    if (receipt == null) {
      throw 'charge receipt get failed';
    }

    receipt = await (await randao_mock1.testRequestRandomWords()).wait();
    if (receipt == null) {
      throw 'testRequestRandomWords receipt get failed';
    }

    logInfo('testRequestRandomWords status: ', receipt?.status);

    let requestId = undefined;
    const contract = randao_mock1 as unknown as ethers.Contract;
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

    randao_mock1.once(
      randao_mock1.filters.LogRandaoConsumerRes(requestId),
      async (event1) => {
        const [requestId, randomWords]: LogRandaoConsumerResEvent.OutputTuple =
          (
            event1 as unknown as {
              args: LogRandaoConsumerResEvent.OutputTuple;
            }
          ).args;
        logInfo(
          'LogRandaoConsumerResultEvent requestId: ',
          requestId,
          'randomWords: ',
          randomWords,
        );
      },
    );
  } catch (e) {
    logErr('run error', e);
  }
}

main().catch((error) => {
  logErr(error);
  process.exitCode = 1;
});
