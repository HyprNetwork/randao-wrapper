import { readFileSync } from 'fs';
import yargs from 'yargs';
import z from 'zod';

export {
  CmdOpts1,
  CmdOpts3,
  Config,
  ConfigSchema,
  conf,
  initConf,
  initOpts1,
  initOpts2,
  initOpts3,
  opts1,
  opts2,
  opts3,
};

let conf: Config;
let opts1: CmdOpts1;
let opts2: CmdOpts1;
let opts3: CmdOpts3;

const ConfigSchema = z.object({
  rpc_url: z.string(),
  chain_id: z.number(),
  chain_name: z.string(),
  randao: z.string(),
  randao_wrapper: z.string(),
  randao_wrapper_admin: z.string(),
  randao_wrapper_factory: z.string(),
  randao_consumer_mock1: z.string(),
  randao_consumer_mock2: z.string(),
  sec_key: z.string(),
  max_randao_wrapper: z.number(),
  deposit: z.string(),
  bounty: z.string(),
  maxTxFee: z.string(),
  isCheck: z.boolean(),
});

type Config = z.infer<typeof ConfigSchema>;

function initConf(path: string): Config {
  const conf_str = readFileSync(path).toString();
  return ConfigSchema.parse(JSON.parse(conf_str));
}

class CmdOpts3 {
  config: string = '';
  amount: string = '';
}

class CmdOpts1 {
  config: string = '';
}

function initOpts1(): CmdOpts1 {
  const opts = yargs
    .strict()
    .strictCommands()
    .option('config', {
      describe: 'config file path',
      default: 'config.json',
      alias: 'c',
      type: 'string',
    })
    .usage('Usage: rw [command] <options>')
    .parserConfiguration({
      'strip-aliased': true,
      'duplicate-arguments-array': false,
    })
    .parseSync() as CmdOpts1;

  // console.log('command options: ', opts);
  return opts;
}

function initOpts2(): CmdOpts1 {
  const opts = yargs
    .strict()
    .strictCommands()
    .option('config', {
      describe: 'config file path',
      default: 'config.json',
      alias: 'c',
      type: 'string',
    })
    .usage('Usage: rts [command] <options>')
    .parserConfiguration({
      'strip-aliased': true,
      'duplicate-arguments-array': false,
    })
    .parseSync() as CmdOpts1;

  // console.log('command options: ', opts);
  return opts;
}

function initOpts3(): CmdOpts3 {
  const opts = yargs
    .strict()
    .strictCommands()
    .option('config', {
      describe: 'config file path',
      default: 'config.json',
      alias: 'c',
      type: 'string',
    })
    .option('amount', {
      describe: 'charge amount',
      default: 'charge',
      alias: 'a',
      type: 'string',
    })
    .usage('Usage: rwcharge [command] <options>')
    .parserConfiguration({
      'strip-aliased': true,
      'duplicate-arguments-array': false,
    })
    .parseSync() as CmdOpts3;

  // console.log('command options: ', opts);
  return opts;
}
