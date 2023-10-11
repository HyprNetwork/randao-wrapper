import { Config, conf, initConf } from '@/src/model';
import { ethers } from 'hardhat';
import fs from 'fs';

// import * as randao_wrapper_conf from '@/config.json';

async function main() {
  (conf as unknown as Config) = initConf('config.json');
  console.log('config:', conf);

  const factory = await ethers.deployContract('RandaoWrapperFactory');
  await factory.waitForDeployment();

  console.log(
    `randao wrapper factory deployed to ${factory.target.toString()}`,
  );

  conf.randao_wrapper_factory = factory.target.toString();
  fs.writeFileSync('config.json', JSON.stringify(conf, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
