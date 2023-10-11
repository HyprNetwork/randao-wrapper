import { JsonRpcProvider, Wallet, ethers } from 'ethers';
import IRandaoWrapperAbi from '@/build/abi/contracts/interface/IRandaoWrapper.sol/IRandaoWrapper.json';
import { IRandaoWrapper } from '@/build/types';
import Debug from 'debug';
import { CmdOpts3, Config, conf, initConf, initOpts3, opts3 } from './model';

const logDebug = Debug('debug');
const logInfo = Debug('info');
const logErr = Debug('error');

async function main() {
  logInfo('randao charge test...');

  try {
    (opts3 as unknown as CmdOpts3) = initOpts3();
    (conf as unknown as Config) = initConf(opts3.config);

    logDebug('cmd opts:', opts3);
    logDebug('config:', conf);

    const provider = new JsonRpcProvider(conf.rpc_url);
    const signer = new Wallet(conf.sec_key, provider);
    const randao_wrapper = new ethers.Contract(
      conf.randao_wrapper,
      IRandaoWrapperAbi,
      signer,
    ) as unknown as IRandaoWrapper;

    const receipt = await (
      await randao_wrapper.charge({ value: BigInt(opts3.amount) })
    ).wait();
    if (receipt == null) {
      throw 'randao wrapper charge receipt get failed';
    }

    logInfo('randao wrapper charge status: ', receipt?.status);
  } catch (e) {
    logErr('run error', e);
  }
}

main().catch((error) => {
  logErr(error);
  process.exitCode = 1;
});
