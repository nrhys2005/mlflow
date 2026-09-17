/* eslint-disable @databricks/no-singleton-query-client -- OSS MLflow entry points own their QueryClient */
import { QueryClient } from './reactQueryHooks';

/**
 * Builds the QueryClient used by the OSS MLflow UI entry points.
 *
 * `networkMode: 'always'` is deliberate. React Query's default `'online'` pauses work whenever
 * `navigator.onLine` is false, before `queryFn`/`mutationFn` ever runs, so nothing fails, nothing
 * retries and no error surfaces — requests are simply never started. `navigator.onLine` is not a
 * reliable signal: on desktop Chrome it is browser-process-wide state that can latch to false while
 * the network is working, which left the whole UI stuck on loading skeletons.
 *
 * MLflow UI queries target the tracking server that served this page, so if the page loaded, the
 * server is reachable and pausing on that flag buys nothing. Mutations are set for the same reason:
 * the paused-mutation queue is in-memory only (MLflow does not use `persistQueryClient`), so a
 * paused mutation does not survive a reload and only shows up as a spinner that never resolves.
 */
export const createMlflowQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { networkMode: 'always' },
      mutations: { networkMode: 'always' },
    },
  });
