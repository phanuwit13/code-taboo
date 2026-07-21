import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return (env as unknown as CloudflareEnv).DB;
}
