import fs from 'fs';
import path from 'path';

const getExecutableName = () =>
  process.platform === 'win32'
    ? path.join('.bin', 'eslint.cmd')
    : path.join('.bin', 'eslint');

export const resolveEslintBin = (cwd = process.cwd()) => {
  let currentDir = cwd;
  const executableName = getExecutableName();

  while (true) {
    const candidate = path.join(currentDir, 'node_modules', executableName);

    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      return process.platform === 'win32' ? 'eslint.cmd' : 'eslint';
    }

    currentDir = parentDir;
  }
};
