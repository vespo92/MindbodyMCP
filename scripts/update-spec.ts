import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const SPEC_URL = 'https://api.mindbodyonline.com/public/v6/swagger/doc';
const SPEC_PATH = resolve(import.meta.dir, '../docs/openapi.json');
const LOCK_PATH = resolve(import.meta.dir, '../docs/openapi.lock');

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

async function main() {
  console.log(`Fetching spec from ${SPEC_URL}...`);

  const response = await fetch(SPEC_URL);
  if (!response.ok) {
    console.error(`Fetch failed: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const fetched = await response.text();
  const fetchedHash = sha256(fetched);

  const storedHash = existsSync(LOCK_PATH) ? readFileSync(LOCK_PATH, 'utf8').trim() : null;

  if (storedHash === fetchedHash) {
    console.log('Spec is up to date — no changes detected.');
    return;
  }

  if (storedHash) {
    console.log('Spec has changed:');
    console.log(`  previous hash: ${storedHash}`);
    console.log(`  new hash:      ${fetchedHash}`);

    const previous = existsSync(SPEC_PATH)
      ? JSON.parse(readFileSync(SPEC_PATH, 'utf8'))
      : null;
    const next = JSON.parse(fetched);

    if (previous) {
      const prevPaths = Object.keys(previous.paths ?? {});
      const nextPaths = Object.keys(next.paths ?? {});
      const added = nextPaths.filter((p) => !prevPaths.includes(p));
      const removed = prevPaths.filter((p) => !nextPaths.includes(p));
      if (added.length) console.log(`  added paths (${added.length}):`, added);
      if (removed.length) console.log(`  removed paths (${removed.length}):`, removed);
      if (!added.length && !removed.length)
        console.log('  no path additions/removals — likely parameter or schema changes');
    }
  } else {
    console.log(`Wrote initial lock file with hash: ${fetchedHash}`);
  }

  writeFileSync(SPEC_PATH, fetched);
  writeFileSync(LOCK_PATH, fetchedHash + '\n');
  console.log('docs/openapi.json and docs/openapi.lock updated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
