import * as child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { lint } from './lint';

jest.mock('child_process');

describe('lint', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { force: true, recursive: true });
    jest.restoreAllMocks();
  });

  it('should use eslint resolved from the directory tree', () => {
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

    jest.spyOn(process, 'cwd').mockReturnValue(workspacePackage);
    const spawnMock = jest
      .spyOn(child_process, 'spawn')
      .mockImplementation(() => {
        return {
          on: jest.fn(),
        } as unknown as child_process.ChildProcess;
      });

    lint({ args: [], files: [] });

    expect(spawnMock).toHaveBeenCalledWith(
      process.execPath,
      [fs.realpathSync(eslintBin), '--exit-on-fatal-error'],
      expect.any(Object)
    );
  });

  it('should fall back to eslint on PATH when no local binary is found', () => {
    jest.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    const spawnMock = jest
      .spyOn(child_process, 'spawn')
      .mockImplementation(() => {
        return {
          on: jest.fn(),
        } as unknown as child_process.ChildProcess;
      });

    lint({ args: [], files: [] });

    expect(spawnMock).toHaveBeenCalledWith(
      'eslint',
      expect.any(Array),
      expect.any(Object)
    );
  });

  it('should log a message if eslint process exists with a fatal error', () => {
    const consoleLogMock = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});
    const spawnMock = jest
      .spyOn(child_process, 'spawn')
      .mockImplementation(() => {
        const eslintProcess = {
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              callback(2);
            }
          }),
        };
        return eslintProcess as unknown as child_process.ChildProcess;
      });

    lint({ args: [], files: [] });

    expect(spawnMock).toHaveBeenCalled();
    expect(consoleLogMock).toHaveBeenCalledWith(
      'ESLint process exited with code 2'
    );
  });
});
