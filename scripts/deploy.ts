import { ethers } from 'hardhat';
import { Config, conf, initConf } from '@/src/model';
import fs from 'fs';

async function main() {
  (conf as unknown as Config) = initConf('config.json');
  console.log('config:', conf);

  // const randao_wrapper = await ethers.deployContract('RandaoCoordinator', [
  //   randao_wrapper_conf.randao,
  // ]);
  const factory = await ethers.getContractAt(
    'RandaoWrapperFactory',
    conf.randao_wrapper_factory,
  );

  const receipt = await (
    await factory.createContract(
      conf.randao,
      conf.randao_wrapper_admin,
      BigInt(conf.deposit),
      BigInt(conf.bounty),
      BigInt(conf.maxTxFee),
      conf.isCheck,
    )
  ).wait();

  if (!receipt) {
    throw 'receipt get failed!!!';
  }

  if (receipt?.status != 1) {
    throw 'RandaoWrapper deploy failed!!!';
  }

  for (const log of receipt!.logs) {
    const parsedLog = factory.interface.parseLog(
      log as unknown as { topics: Array<string>; data: string },
    );
    console.log('event name', parsedLog!.name, 'args value:', parsedLog!.args);

    console.log(`randao wrapper deployed to ${parsedLog!.args.toString()}`);

    conf.randao_wrapper = parsedLog!.args.toString();
    fs.writeFileSync('config.json', JSON.stringify(conf, null, 2));
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
