// Flags: --expose-internals
'use strict';
const common = require('../common');

if (common.isWindows)
  common.skip('POSIX errno values');

const tmpdir = require('../common/tmpdir');
const assert = require('node:assert');
const fs = require('node:fs');
const { internalBinding } = require('internal/test/binding');

tmpdir.refresh();

const dirPath = tmpdir.resolve('rm-error-code');
fs.mkdirSync(dirPath, { recursive: true });

const dotPath = `${dirPath}/.`;

assert.throws(() => {
  internalBinding('fs').rmSync(dotPath, 0, true, 0);
}, {
  code: 'EINVAL',
  syscall: 'rm',
  path: dotPath,
  message: /^EINVAL, /
});
