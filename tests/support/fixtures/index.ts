import { test as base, expect } from '@playwright/test';
import { createRepoFixture, RepoFixture } from './factories/repo.factory';
import { createUserFactory, UserFactory } from './factories/user-factory';

type TestFixtures = {
  userFactory: UserFactory;
  repoFixture: RepoFixture;
};

export const test = base.extend<TestFixtures>({
  userFactory: async ({ request }, use) => {
    const factory = createUserFactory(request);
    await use(factory);
    await factory.cleanup();
  },
  repoFixture: async ({}, use) => {
    const fixture = await createRepoFixture();
    await use(fixture);
    await fixture.cleanup();
  },
});

export { expect };
