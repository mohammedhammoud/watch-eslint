const ESLINT_BIN_PATH = 'eslint/bin/eslint.js';
const FALLBACK_ESLINT_BIN =
  process.platform === 'win32' ? 'eslint.cmd' : 'eslint';

export const resolveEslintBin = (cwd = process.cwd()) => {
  try {
    return require.resolve(ESLINT_BIN_PATH, { paths: [cwd] });
  } catch {
    return FALLBACK_ESLINT_BIN;
  }
};

export const resolveEslintCommand = (args: string[], cwd = process.cwd()) => {
  const eslintBin = resolveEslintBin(cwd);

  if (eslintBin === FALLBACK_ESLINT_BIN) {
    return { args, command: eslintBin };
  }

  return { args: [eslintBin, ...args], command: process.execPath };
};
