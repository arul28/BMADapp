import { APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';

type CreateUserInput = {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
};

export type CreatedUser = {
  id?: string;
  email: string;
  name: string;
  role?: string;
  password?: string;
};

const resolveApiUrl = () => {
  const baseUrl = process.env.API_URL ?? `${process.env.BASE_URL ?? 'http://localhost:3000'}/api`;
  return baseUrl.replace(/\/$/, '');
};

const buildUserPayload = (overrides: CreateUserInput = {}) => ({
  email: overrides.email ?? faker.internet.email(),
  name: overrides.name ?? faker.person.fullName(),
  password: overrides.password ?? faker.internet.password({ length: 12 }),
  role: overrides.role ?? 'user',
});

export function createUserFactory(request: APIRequestContext) {
  const createdUserIds: string[] = [];
  const apiBase = resolveApiUrl();

  const createUser = async (overrides: CreateUserInput = {}) => {
    const payload = buildUserPayload(overrides);
    const response = await request.post(`${apiBase}/users`, { data: payload });

    if (!response.ok()) {
      throw new Error(`Failed to seed user: ${response.status()} ${await response.text()}`);
    }

    const created = (await response.json()) as CreatedUser;

    if (created.id) {
      createdUserIds.push(created.id);
    }

    return created;
  };

  const cleanup = async () => {
    for (const userId of createdUserIds) {
      try {
        await request.delete(`${apiBase}/users/${userId}`);
      } catch {
        // Cleanup best-effort to avoid blocking the suite
      }
    }
    createdUserIds.length = 0;
  };

  return {
    createUser,
    cleanup,
  };
}

export type UserFactory = ReturnType<typeof createUserFactory>;
