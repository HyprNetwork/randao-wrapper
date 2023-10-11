import { JsonRpcProvider, ethers } from 'ethers';
import IRandaoWrapperAbi from '@/build/abi/contracts/interface/IRandaoWrapper.sol/IRandaoWrapper.json';
import { IRandaoWrapper } from '@/build/types';
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
    const randao_wrapper = new ethers.Contract(
      conf.randao_wrapper,
      IRandaoWrapperAbi,
      provider,
    ) as unknown as IRandaoWrapper;

    const [roundId, answer, startedAt, updatedAt, answeredInRound] =
      await randao_wrapper.latestRoundData();
    logInfo(
      'latestRoundData ret:',
      roundId,
      answer,
      startedAt,
      updatedAt,
      answeredInRound,
    );

    const ret = await randao_wrapper.getFeeConfig();
    logInfo('getFeeConfig ret:', ret);
  } catch (e) {
    logErr('run error', e);
  }
}

main().catch((error) => {
  logErr(error);
  process.exitCode = 1;
});
