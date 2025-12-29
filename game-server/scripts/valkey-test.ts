import { valkey } from '../src/core/datasources/valkey.datasource';

async function main() {
  await valkey.set('fw:test:key', 'hello-valkey');
  const value = await valkey.get('fw:test:key');
  console.log('Valkey test value:', value);
  await valkey.quit();
}

main().catch((err) => {
  console.error('Valkey test error:', err);
  process.exit(1);
});
