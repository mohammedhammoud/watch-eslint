jest.mock('../package.json', () => ({
  version: '1.0.0-test',
}));
jest.mock('./eslint-command', () => ({
  resolveEslintCommand: jest.fn(() => ({
    args: ['/repo/node_modules/eslint/bin/eslint.js', '--help'],
    command: process.execPath,
  })),
}));

const getArgv = async () => {
  return (await import('./argv')).getArgv();
};

describe('argv', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('should parse watcher-ignores option correctly', async () => {
    process.argv = ['node', 'script.js', '--watcher-ignores', 'test', 'logs'];
    const argv = (await getArgv()).argv;
    expect(argv['watcher-ignores']).toEqual(['test', 'logs']);
  });

  it('should parse watcher-delay option correctly', async () => {
    process.argv = ['node', 'script.js', '--watcher-delay', '500'];
    const argv = (await getArgv()).argv;
    expect(argv['watcher-delay']).toEqual(500);
  });

  it('should display help information when --help or -h is passed', async () => {
    jest.doMock('child_process', () => ({
      spawn: jest.fn(() => {
        return {
          on: jest.fn((event, callback) => {
            if (event === 'close') callback(0);
          }),
          stderr: { on: jest.fn() },
          stdout: {
            on: jest.fn((event, callback) => {
              if (event === 'data') {
                callback(Buffer.from('ESLint help output'));
              }
            }),
          },
        };
      }),
    }));

    process.argv = ['node', 'script.js', '--help'];

    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation();

    process.argv = ['node', 'script.js', '--help'];
    const { parser } = await getArgv();
    const parserHelpOutput = await parser.getHelp();
    expect(logSpy).toHaveBeenNthCalledWith(1, 'ESLint help output');
    expect(logSpy).toHaveBeenNthCalledWith(2, parserHelpOutput);
    expect(exitSpy).toHaveBeenCalledWith(0);
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should use the resolved eslint command when printing help', async () => {
    const { resolveEslintCommand } = await import('./eslint-command');

    jest.doMock('child_process', () => ({
      spawn: jest.fn(() => {
        return {
          on: jest.fn((event, callback) => {
            if (event === 'close') callback(0);
          }),
          stderr: { on: jest.fn() },
          stdout: {
            on: jest.fn((event, callback) => {
              if (event === 'data') {
                callback(Buffer.from('ESLint help output'));
              }
            }),
          },
        };
      }),
    }));

    process.argv = ['node', 'script.js', '--help'];

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation();

    await getArgv();

    expect(resolveEslintCommand).toHaveBeenCalledWith(['--help']);
    exitSpy.mockRestore();
  });

  it('should show version information when --watcher-version is passed', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });

    try {
      process.argv = ['node', 'script.js', '--watcher-version'];
      await getArgv();
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('process.exit:')) {
        const exitCode = parseInt(error.message.split(': ')[1], 10);
        // eslint-disable-next-line jest/no-conditional-expect
        expect(exitCode).toBe(0);
      } else {
        throw error;
      }
    } finally {
      expect(logSpy).toHaveBeenCalledWith('1.0.0-test');
      logSpy.mockRestore();
      exitSpy.mockRestore();
    }
  });

  it('should handle unknown options as arguments', async () => {
    process.argv = ['node', 'script.js', '--unknown-option', 'value'];
    const argv = (await getArgv()).argv;
    expect(argv._).toEqual(['--unknown-option', 'value']);
  });

  it('should have default watcher-ignores patterns', async () => {
    process.argv = ['node', 'script.js'];
    const argv = (await getArgv()).argv;
    expect(argv['watcher-ignores']).toEqual(['node_modules', '.git']);
  });

  it('should have default watcher-delay value', async () => {
    process.argv = ['node', 'script.js'];
    const argv = (await getArgv()).argv;
    expect(argv['watcher-delay']).toEqual(300);
  });
});
