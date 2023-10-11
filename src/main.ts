import { JsonRpcProvider, Wallet, ethers } from 'ethers';
import sleep from 'sleep-promise';
import IRandaoWrapperAbi from '@/build/abi/contracts/interface/IRandaoWrapper.sol/IRandaoWrapper.json';
import { IRandaoWrapper } from '@/build/types';
import { LogRequestRandomEvent } from '@/build/types/interface/IRandaoWrapper';
import Debug from 'debug';
import { CmdOpts1, Config, conf, initConf, initOpts1, opts1 } from './model';

const logDebug = Debug('debug');
const logInfo = Debug('info');
const logErr = Debug('error');

async function main() {
  logInfo('randao wrapper start...');

  try {
    (opts1 as unknown as CmdOpts1) = initOpts1();
    (conf as unknown as Config) = initConf(opts1.config);

    logDebug('cmd opts:', opts1);
    logDebug('config:', conf);

    const provider = new JsonRpcProvider(conf.rpc_url);
    const signer = new Wallet(conf.sec_key, provider);
    const randao_wrapper = new ethers.Contract(
      conf.randao_wrapper,
      IRandaoWrapperAbi,
      signer,
    ) as unknown as IRandaoWrapper;

    const subtasks = new Map<bigint, Promise<void>>();

    logInfo('randao wrapper account:', signer.address);

    randao_wrapper.on(
      randao_wrapper.filters.LogRequestRandom(undefined, undefined, undefined),
      async (event1) => {
        const [
          campaignID,
          from,
          bnum,
          bounty,
          deposit,
          commitBalkline,
          commitDeadline,
        ]: LogRequestRandomEvent.OutputTuple = (
          event1 as unknown as { args: LogRequestRandomEvent.OutputTuple }
        ).args;

        try {
          if (!subtasks.has(campaignID)) {
            logInfo(
              'RequestRandomEvent',
              campaignID,
              from,
              bounty,
              deposit,
              bnum,
              commitBalkline,
              commitDeadline,
            );

            const subtask1 = waitFulfillRandom(
              campaignID,
              bnum,
              randao_wrapper,
              provider,
            ).catch((err) => {
              logErr('subtask error:', err);
            });
            subtasks.set(campaignID, subtask1);

            while (subtasks.size > conf.max_randao_wrapper) {
              const subtask2 = [...subtasks.entries()].pop();
              if (subtask2 != null) {
                const [campaignID2, subtask3] = subtask2!;
                await subtask3;
                subtasks.delete(campaignID2);
              }
            }
          }
        } catch (err) {
          logErr('waitFulfillRandom error:', err);
        }
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

async function waitFulfillRandom(
  requestId: bigint,
  nBlock: bigint,
  randao_wrapper: IRandaoWrapper,
  provider: JsonRpcProvider,
) {
  try {
    await waitBlocks(provider, nBlock);
    const receipt = await (
      await randao_wrapper.rawFulfillRandomWords(requestId)
    ).wait();
    if (receipt == null) {
      throw 'requestRandomWords receipt get failed';
    }

    logInfo('FulfillRandom requestId:', requestId, 'status:', receipt?.status);
  } catch (e) {
    logErr('FulfillRandom error: ', e);
  }
}

async function waitBlocks(provider: JsonRpcProvider, destBnum: bigint) {
  // eslint-disable-next-line
  while (true) {
    const currentBlockNumber = BigInt(await provider.getBlockNumber());
    if (currentBlockNumber >= destBnum) {
      break;
    }

    // console.log(requestId, bnum, currentBlockNumber);

    await sleep(500);
  }
}
