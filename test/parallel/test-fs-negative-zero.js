'use strict';

require('../common');

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const missing = path.join(
  os.tmpdir(),
  `node-fs-negative-zero-${process.pid}`,
  'entry',
);

function ignoreExpectedError(fn) {
  try {
    fn();
  } catch {
    // Ignore expected file system errors from the missing path.
  }
}

const fd = fs.openSync(process.execPath, -0);
fs.closeSync(fd);

ignoreExpectedError(() => fs.openSync(process.execPath, 'r', -0));
ignoreExpectedError(() => fs.readFileSync(process.execPath, { flag: -0 }));
ignoreExpectedError(() => fs.mkdirSync(missing, { mode: -0 }));
ignoreExpectedError(() => fs.chmodSync(missing, -0));
ignoreExpectedError(() => fs.writeFileSync(missing, '', { mode: -0 }));

fs.watchFile(missing, { interval: -0 }, () => {});
fs.unwatchFile(missing);

// `-0` is an accepted file descriptor, so it must not reach the C++ fast paths
// as a path. Use a child process with `/dev/null` on the standard input to keep
// the reads and the writes independent of how this test is started.
{
  const child = spawnSync(process.execPath, ['-e', `
    const fs = require('fs');
    const operations = [
      () => fs.readFileSync(-0, 'utf8'),
      () => fs.writeFileSync(-0, ''),
      () => fs.appendFileSync(-0, ''),
    ];
    for (const operation of operations) {
      try {
        operation();
      } catch {
        // Ignore expected file system errors from the standard input.
      }
    }
  `], { stdio: ['ignore', 'ignore', 'pipe'] });

  assert.strictEqual(child.stderr.toString(), '');
  assert.strictEqual(child.signal, null);
  assert.strictEqual(child.status, 0);
}
