import * as child_process from 'child_process';
import fs from 'fs';

import { lint } from './lint';

jest.mock('child_process');
jest.mock('fs');

describe('lint', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should use the nearest eslint binary in the directory tree', () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/path/to/workspace');
    jest
      .mocked(fs.existsSync)
      .mockImplementation(
        (filePath) => filePath === '/path/node_modules/.bin/eslint'
      );
    const spawnMock = jest
      .spyOn(child_process, 'spawn')
      .mockImplementation(() => {
        return {
          on: jest.fn(),
        } as unknown as child_process.ChildProcess;
      });

    lint({ args: [], files: [] });

    expect(spawnMock).toHaveBeenCalledWith(
      '/path/node_modules/.bin/eslint',
      expect.any(Array),
      expect.any(Object)
    );
  });

  it('should fall back to eslint on PATH when no local binary is found', () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/path/to/workspace');
    jest.mocked(fs.existsSync).mockReturnValue(false);
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
