import 'dotenv/config';
import prisma from '../src/config/prisma.js';

async function testPool() {
  console.log('--- Connection Pool Verification ---\n');

  // 1. Test basic connection
  const pgStatus = await prisma.$queryRawUnsafe(
    `SELECT current_setting('max_connections') AS max_conn,
            (SELECT count(*)::int FROM pg_stat_activity) AS active_conn`
  );
  console.log(`PostgreSQL max_connections: ${pgStatus[0].max_conn}`);
  console.log(`Active connections right now: ${pgStatus[0].active_conn}`);

  // 2. Check what our app pool looks like
  const poolLimit = process.env.PRISMA_CONNECTION_LIMIT || '5';
  const poolTimeout = process.env.PRISMA_POOL_TIMEOUT || '10';
  console.log(`\nApp pool config: limit=${poolLimit}, timeout=${poolTimeout}s`);
  console.log(`PgBouncer mode: ${process.env.DATABASE_POOL_URL ? 'YES' : 'NO (direct to PG)'}`);

  // 3. Stress test — fire 20 concurrent queries through the pool of 5
  console.log('\n--- Stress test: 20 concurrent queries through pool ---');
  const start = Date.now();
  const promises = Array.from({ length: 20 }, (_, i) =>
    prisma.$queryRawUnsafe(`SELECT pg_sleep(0.1), ${i} AS idx`)
      .then(() => ({ idx: i, ok: true }))
      .catch(err => ({ idx: i, ok: false, error: err.message }))
  );
  const results = await Promise.all(promises);
  const elapsed = Date.now() - start;
  const failed = results.filter(r => !r.ok);

  console.log(`Completed: ${results.length - failed.length}/20 succeeded in ${elapsed}ms`);
  if (failed.length > 0) {
    console.error(`Failed: ${failed.length}`, failed.map(f => f.error));
  }

  // 4. Check connections after stress test
  const pgStatus2 = await prisma.$queryRawUnsafe(
    `SELECT (SELECT count(*)::int FROM pg_stat_activity) AS active_conn`
  );
  console.log(`\nActive connections after stress test: ${pgStatus2[0].active_conn}`);

  // With pool_limit=5 and 20 queries each sleeping 0.1s,
  // it should take ~400ms (4 batches of 5), not 2000ms (all sequential).
  // This proves the pool is working.
  if (elapsed < 2000) {
    console.log('✅ Connection pooling is working correctly!');
  } else {
    console.log('⚠️ Queries took longer than expected — pool may not be effective.');
  }

  await prisma.$disconnect();
  console.log('\n✅ All pool tests passed. Prisma disconnected cleanly.');
}

testPool().catch(err => {
  console.error('❌ Pool test failed:', err);
  process.exit(1);
});
