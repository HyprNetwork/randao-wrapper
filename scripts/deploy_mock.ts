import { ethers } from 'hardhat';
import { Config, conf, initConf } from '@/src/model';
import fs from 'fs';

async function main() {
  (conf as unknown as Config) = initConf('config.json');
  console.log('config:', conf);

  const factory1 = await ethers.deployContract('RandaoConsumerMock1', [
    conf.randao_wrapper,
  ]);
  await factory1.waitForDeployment();

  console.log(`randao consumer mock1 deployed to ${factory1.target}`);

  const factory2 = await ethers.deployContract('RandaoConsumerMock2', [
    conf.randao_wrapper,
  ]);
  await factory2.waitForDeployment();

  console.log(`randao consumer mock2 deployed to ${factory2.target}`);

  conf.randao_consumer_mock1 = factory1.target.toString();
  conf.randao_consumer_mock2 = factory2.target.toString();
  fs.writeFileSync('config.json', JSON.stringify(conf, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
