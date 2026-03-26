import fs from 'fs';

import { resolveEslintBin } from './eslint-bin';

jest.mock('fs');

describe('resolveEslintBin', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should resolve the nearest eslint binary up the directory tree', () => {
    jest.mocked(fs.existsSync).mockImplementation((filePath) => {
      return filePath === '/repo/node_modules/.bin/eslint';
    });

    expect(resolveEslintBin('/repo/packages/app')).toBe(
      '/repo/node_modules/.bin/eslint'
    );
  });

  it('should fall back to eslint on PATH when no binary is found', () => {
    jest.mocked(fs.existsSync).mockReturnValue(false);

    expect(resolveEslintBin('/repo/packages/app')).toBe('eslint');
  });
});
