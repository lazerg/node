// Flags: --expose-internals
'use strict';

const common = require('../common');
if (!common.hasCrypto)
  common.skip('missing crypto');
const assert = require('assert');
const http2 = require('http2');
const { kTimeout } = require('internal/timers');

const server = http2.createServer();
server.setTimeout(common.platformTimeout(60000), common.mustNotCall());

server.on('session', common.mustCall((session) => {
  session.on('close', common.mustCall(() => {
    assert.strictEqual(session.timeout, 0);
    assert.strictEqual(session[kTimeout]._idleTimeout, -1);
    server.close();
  }));
}));

server.listen(0, common.mustCall(() => {
  const client = http2.connect(`http://localhost:${server.address().port}`);
  client.on('connect', common.mustCall(() => client.close()));
}));
