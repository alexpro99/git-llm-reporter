import { exec } from 'child_process';
import { resolve } from 'path';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const E2E_TIMEOUT = 20000; // 20 seconds
jest.setTimeout(E2E_TIMEOUT);

const TEST_REPO_PATH = resolve(process.cwd(), 'e2e/test-repo');
const CLI_PATH = resolve(process.cwd(), 'cli/index.js');

// Helper function to run commands in the test repo
const runInRepo = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: TEST_REPO_PATH }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
};

// Helper function to run the CLI
const runCli = (args) => {
    return new Promise((resolve, reject) => {
        exec(`node ${CLI_PATH} ${args}`, { 
            cwd: TEST_REPO_PATH,
            env: { ...process.env, E2E_TEST_MOCK_AI: 'true' } 
        }, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
};

describe('End-to-End Test', () => {
  beforeAll(async () => {
    // Clean up previous runs and create a fresh repo
    rmSync(TEST_REPO_PATH, { recursive: true, force: true });
    mkdirSync(TEST_REPO_PATH, { recursive: true });

    await runInRepo('git init');
    await runInRepo('git config user.name "Test User"');
    await runInRepo('git config user.email "test@example.com"');
    
    // Create some commits
    writeFileSync(`${TEST_REPO_PATH}/file1.txt`, 'initial content');
    await runInRepo('git add .');
    await runInRepo('git commit -m "feat: add initial file"');
    
    writeFileSync(`${TEST_REPO_PATH}/file1.txt`, 'updated content');
    await runInRepo('git add .');
    await runInRepo('git commit -m "fix: update content of file1"');
  });

  afterAll(() => {
    // Clean up the test repo
    rmSync(TEST_REPO_PATH, { recursive: true, force: true });
  });

  it('should generate a summary report for a commit range', async () => {
    const { stdout } = await runCli('HEAD~1..HEAD');
    expect(stdout).toContain('Mocked Summary Report');
  });

  it('should generate a personal report when --report-type is personal', async () => {
    const { stdout } = await runCli('HEAD~1..HEAD --report-type personal');
    expect(stdout).toContain('Mocked Personal Report');
  });
});
