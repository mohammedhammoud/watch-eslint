import { ChildProcess, spawn } from 'child_process';

import { resolveEslintCommand } from './eslint-command';

type LintOptions = {
  args: (number | string)[];
  files?: string[];
};

export const lint = ({ args: argv, files = [] }: LintOptions) => {
  const stringArgs = [...files, ...argv, '--exit-on-fatal-error'].map((arg) =>
    arg.toString()
  );
  const eslintCommand = resolveEslintCommand(stringArgs);

  const eslint: ChildProcess = spawn(
    eslintCommand.command,
    eslintCommand.args,
    {
      stdio: 'inherit',
    }
  );

  eslint.on('close', (code) => {
    if (code === 2) {
      console.log(`ESLint process exited with code ${code}`);
    }
  });
};
