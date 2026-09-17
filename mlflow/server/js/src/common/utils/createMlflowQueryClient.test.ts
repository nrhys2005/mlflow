import { describe, test, expect } from '@jest/globals';
import { createMlflowQueryClient } from './createMlflowQueryClient';
import { onlineManager } from './reactQueryHooks';

describe('createMlflowQueryClient', () => {
  test('defaults queries and mutations to networkMode "always"', () => {
    const defaults = createMlflowQueryClient().getDefaultOptions();

    expect(defaults.queries?.networkMode).toBe('always');
    expect(defaults.mutations?.networkMode).toBe('always');
  });

  test('runs a query while the browser reports being offline', async () => {
    const queryClient = createMlflowQueryClient();
    onlineManager.setOnline(false);

    try {
      // Regression guard: with React Query's default `networkMode: 'online'` this never resolves,
      // because the query is paused before `queryFn` runs.
      await expect(
        queryClient.fetchQuery({ queryKey: ['offline-probe'], queryFn: async () => 'resolved' }),
      ).resolves.toBe('resolved');
    } finally {
      onlineManager.setOnline(true);
      onlineManager.setOnline(undefined);
      queryClient.clear();
    }
  });

  test('runs a mutation while the browser reports being offline', async () => {
    const queryClient = createMlflowQueryClient();
    onlineManager.setOnline(false);

    try {
      const mutation = queryClient.getMutationCache().build(queryClient, { mutationFn: async () => 'mutated' });

      await expect(mutation.execute()).resolves.toBe('mutated');
    } finally {
      onlineManager.setOnline(true);
      onlineManager.setOnline(undefined);
      queryClient.clear();
    }
  });
});
