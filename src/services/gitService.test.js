import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

jest.unstable_mockModule('simple-git', () => {
  const mGit = {
    raw: jest.fn(),
    show: jest.fn(),
  };
  return {
    __esModule: true,
    default: jest.fn(() => mGit),
  };
});

const simpleGit = (await import('simple-git')).default;
const { getCommitLogs, getCommitLogsByBranch, getCommitDiff } = await import('./gitService.js');


const FIELD_SEPARATOR = "|||";
const RECORD_SEPARATOR = "%";

describe('gitService', () => {
  let git;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    git = simpleGit();
    jest.clearAllMocks();
  });

  describe('getCommitLogs', () => {
    it('should parse commit logs correctly', async () => {
      const mockOutput = `hash1${FIELD_SEPARATOR}2025-07-06T12:00:00Z${FIELD_SEPARATOR}author1${FIELD_SEPARATOR}feat: new feature${RECORD_SEPARATOR}hash2${FIELD_SEPARATOR}2025-07-05T12:00:00Z${FIELD_SEPARATOR}author2${FIELD_SEPARATOR}fix: a bug${RECORD_SEPARATOR}`;
      git.raw.mockResolvedValue(mockOutput);

      const commits = await getCommitLogs('main..develop');

      expect(git.raw).toHaveBeenCalledWith(expect.arrayContaining(['log', 'main..develop']));
      expect(commits).toHaveLength(2);
      expect(commits[0]).toEqual({ hash: 'hash1', date: '2025-07-06T12:00:00Z', author: 'author1', message: 'feat: new feature' });
      expect(commits[1]).toEqual({ hash: 'hash2', date: '2025-07-05T12:00:00Z', author: 'author2', message: 'fix: a bug' });
    });

    it('should return an empty array if no commits are found', async () => {
      git.raw.mockResolvedValue('');
      const commits = await getCommitLogs('main..develop');
      expect(commits).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      git.raw.mockRejectedValue(new Error('Git error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const commits = await getCommitLogs('main..develop');
      
      expect(commits).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener los logs de Git:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should filter by author if devFilter is provided', async () => {
      const mockOutput = `hash1${FIELD_SEPARATOR}2025-07-06T12:00:00Z${FIELD_SEPARATOR}author1${FIELD_SEPARATOR}feat: new feature${RECORD_SEPARATOR}`;
      git.raw.mockResolvedValue(mockOutput);

      const commits = await getCommitLogs('main..develop', 'author1');

      expect(git.raw).toHaveBeenCalledWith(expect.arrayContaining(['--author=author1']));
      expect(commits).toHaveLength(1);
      expect(commits[0].author).toBe('author1');
    });
  });

  describe('getCommitLogsByBranch', () => {
    it('should call git.raw with the correct parameters', async () => {
      const branch = 'master';
      const days = 5;
      
      await getCommitLogsByBranch(branch, days);

      expect(git.raw).toHaveBeenCalledWith(expect.arrayContaining(['log', branch, expect.stringMatching(/--since=/)]));
    });

    it('should filter by author if devFilter is provided', async () => {
      const branch = 'master';
      const days = 5;
      const mockOutput = `hash1${FIELD_SEPARATOR}2025-07-06T12:00:00Z${FIELD_SEPARATOR}author1${FIELD_SEPARATOR}feat: new feature${RECORD_SEPARATOR}`;
      git.raw.mockResolvedValue(mockOutput);

      const commits = await getCommitLogsByBranch(branch, days, 'author1');

      expect(git.raw).toHaveBeenCalledWith(expect.arrayContaining(['--author=author1']));
      expect(commits).toHaveLength(1);
      expect(commits[0].author).toBe('author1');
    });
  });

  describe('getCommitDiff', () => {
    it('should return the diff for a given commit hash', async () => {
      const mockDiff = 'diff --git a/file.js b/file.js...';
      git.show.mockResolvedValue(mockDiff);

      const diff = await getCommitDiff('hash1');

      expect(git.show).toHaveBeenCalledWith(['-m', 'hash1']);
      expect(diff).toBe(mockDiff);
    });

    it('should handle errors when getting a diff', async () => {
        git.show.mockRejectedValue(new Error('Git show error'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        const diff = await getCommitDiff('hash1');
        
        expect(diff).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener el diff para el commit hash1: Error: Git show error');
        consoleErrorSpy.mockRestore();
    });
  });
});
