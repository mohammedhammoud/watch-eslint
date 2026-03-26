import { spawn } from 'child_process';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { version } from '../package.json';
import { resolveEslintBin } from './eslint-bin';

const getEslintHelpOutput = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const eslintHelp = spawn(resolveEslintBin(), ['--help']);

    let output = '';

    eslintHelp.stdout.on('data', (data) => {
      output += data.toString();
    });

    eslintHelp.stderr.on('data', (data) => {
      console.error('stderr: ' + data);
    });

    eslintHelp.on('close', (code) => {
      if (code !== 0) {
        reject(`ESLint process exited with code ${code}`);
      } else {
        resolve(output);
      }
    });
  });
};

export const getArgv = async () => {
  const parser = yargs(hideBin(process.argv))
    .parserConfiguration({ 'unknown-options-as-args': true })
    .option('watcher-ignores', {
      alias: 'wi',
      array: true,
      default: ['node_modules', '.git'],
      description: 'Patterns to ignore while watching files',
      string: true,
      type: 'array',
    })
    .option('watcher-delay', {
      alias: 'wd',
      default: 300,
      description: 'Delay in milliseconds to wait before running the command',
      number: true,
      type: 'number',
    })
    .option({
      help: {
        alias: 'h',
        boolean: true,
        description: 'Show help',
      },
    })
    .help(false)
    .version('--watcher-version', 'Show version information', version)
    .wrap(null)
    .epilogue('For more information, see the ESLint documentation')
    .updateStrings({
      'Options:': 'Watcher options:',
    });

  const argv = await parser.middleware(async (argv) => {
    if (argv.help || argv.h) {
      const originalHelp = await getEslintHelpOutput();
      const yargsHelp = await parser.getHelp();
      console.log(originalHelp);
      console.log(yargsHelp);
      process.exit(0);
    }
  }).argv;

  return { argv, parser };
};
