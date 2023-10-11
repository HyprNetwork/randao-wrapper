import { JsonRpcProvider, Wallet, ethers } from 'ethers';
import RandaoConsumerMock2Abi from '@/build/abi/contracts/RandaoConsumerMock2.sol/RandaoConsumerMock2.json';
import { RandaoConsumerMock2 } from '@/build/types';
import Debug from 'debug';
import { CmdOpts1, Config, conf, initConf, initOpts2, opts2 } from './model';

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
    const randao_mock2 = new ethers.Contract(
      conf.randao_consumer_mock2,
      RandaoConsumerMock2Abi,
      signer,
    ) as unknown as RandaoConsumerMock2;

    let receipt = await (
      await randao_mock2.charge({ value: BigInt(conf.bounty) * BigInt(2) })
    ).wait();
    if (receipt == null) {
      throw 'charge receipt get failed';
    }

    receipt = await (await randao_mock2.testRequestRandomWords()).wait();
    if (receipt == null) {
      throw 'testRequestRandomWords receipt get failed';
    }

    logInfo('testRequestRandomWords status: ', receipt?.status);
  } catch (e) {
    logErr('run error', e);
  }
}

main().catch((error) => {
  logErr(error);
  process.exitCode = 1;
});
