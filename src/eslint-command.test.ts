import fs from 'fs';
import os from 'os';
import path from 'path';

import { resolveEslintBin, resolveEslintCommand } from './eslint-command';

describe('resolveEslintBin', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-command-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { force: true, recursive: true });
  });

  it('should resolve eslint up the directory tree', () => {
    const eslintBin = path.join(
      tmpDir,
      'node_modules',
      'eslint',
      'bin',
      'eslint.js'
    );
    const workspacePackage = path.join(tmpDir, 'packages', 'app');

    fs.mkdirSync(path.dirname(eslintBin), { recursive: true });
    fs.mkdirSync(workspacePackage, { recursive: true });
    fs.writeFileSync(eslintBin, '');

    expect(resolveEslintBin(workspacePackage)).toBe(fs.realpathSync(eslintBin));
  });

  it('should fall back to eslint on PATH when no binary is found', () => {
    expect(resolveEslintBin(tmpDir)).toBe('eslint');
  });

  it('should run resolved eslint through node', () => {
    const eslintBin = path.join(
      tmpDir,
      'node_modules',
      'eslint',
      'bin',
      'eslint.js'
    );
    const workspacePackage = path.join(tmpDir, 'packages', 'app');

    fs.mkdirSync(path.dirname(eslintBin), { recursive: true });
    fs.mkdirSync(workspacePackage, { recursive: true });
    fs.writeFileSync(eslintBin, '');

    expect(resolveEslintCommand(['--help'], workspacePackage)).toEqual({
      args: [fs.realpathSync(eslintBin), '--help'],
      command: process.execPath,
    });
  });
});
