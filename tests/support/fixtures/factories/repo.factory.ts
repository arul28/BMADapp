import { faker } from '@faker-js/faker';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

type RepoFixtureConfig = {
  includeOutputFolder?: boolean;
  includeOutputLine?: boolean;
};

type RepoFixtureInstance = {
  repoPath: string;
  expectedArtifacts: string[];
};

export type RepoFixture = {
  createValidRepo: (config?: RepoFixtureConfig) => Promise<RepoFixtureInstance>;
  createInvalidRepo: () => Promise<RepoFixtureInstance>;
  allowlistRoot: () => string;
  cleanup: () => Promise<void>;
};

const CONFIG_RELATIVE = path.join('.bmad', 'bmm', 'config.yaml');
const OUTPUT_FOLDER = 'devDocs';

async function writePlaceholderFile(root: string, relativePath: string, contents: string) {
  const absolutePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, contents, { encoding: 'utf8' });
}

async function buildRepo(isValid: boolean, config?: RepoFixtureConfig): Promise<RepoFixtureInstance> {
  const repoPath = await fs.mkdtemp(path.join(os.tmpdir(), `bmad-repo-${faker.string.alphanumeric(6).toLowerCase()}-`));
  const expectedArtifacts: string[] = [];

  if (isValid) {
    const includeOutputLine = config?.includeOutputLine ?? true;
    const includeOutputFolder = config?.includeOutputFolder ?? true;
    await writePlaceholderFile(
      repoPath,
      CONFIG_RELATIVE,
      [
        '# BMM Module Configuration',
        `project_name: ${faker.commerce.productName()}`,
        ...(includeOutputLine ? ["output_folder: '{project-root}/devDocs'"] : []),
      ].join('\n'),
    );
    if (includeOutputLine && includeOutputFolder) {
      await fs.mkdir(path.join(repoPath, OUTPUT_FOLDER), { recursive: true });
    }
    expectedArtifacts.push(CONFIG_RELATIVE);
    if (includeOutputLine && includeOutputFolder) {
      expectedArtifacts.push(OUTPUT_FOLDER);
    }
  }

  return { repoPath, expectedArtifacts };
}

export async function createRepoFixture(): Promise<RepoFixture> {
  const createdPaths: string[] = [];
  let rootForAllowlist: string | undefined;

  return {
    createValidRepo: async (config?: RepoFixtureConfig) => {
      const repo = await buildRepo(true, config);
      createdPaths.push(repo.repoPath);
      const canonicalRoot = await fs.realpath(path.dirname(repo.repoPath));
      rootForAllowlist = rootForAllowlist ?? canonicalRoot;
      return repo;
    },
    createInvalidRepo: async () => {
      const repo = await buildRepo(false);
      createdPaths.push(repo.repoPath);
      const canonicalRoot = await fs.realpath(path.dirname(repo.repoPath));
      rootForAllowlist = rootForAllowlist ?? canonicalRoot;
      return repo;
    },
    allowlistRoot: () => rootForAllowlist ?? os.tmpdir(),
    cleanup: async () => {
      for (const repoPath of createdPaths) {
        try {
          await fs.rm(repoPath, { recursive: true, force: true });
        } catch {
          // Best-effort cleanup to avoid blocking the suite
        }
      }
      createdPaths.length = 0;
    },
  };
}
