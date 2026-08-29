'use strict';

// Disconnecting the channel from the parent must still emit 'close' once the
// child has exited, just like letting the channel reach EOF on its own does.

const common = require('../common');
const assert = require('assert');
const { fork } = require('child_process');

if (process.argv[2] === 'child') {
  process.send('ready');
} else {
  const child = fork(process.argv[1], ['child']);

  let gotDisconnect = false;
  let gotExit = false;

  child.on('message', common.mustCall(function(message) {
    assert.strictEqual(message, 'ready');
    child.disconnect();
  }));

  child.on('disconnect', common.mustCall(function() {
    gotDisconnect = true;
  }));

  child.on('exit', common.mustCall(function() {
    gotExit = true;
  }));

  child.on('close', common.mustCall(function() {
    assert(gotDisconnect);
    assert(gotExit);
  }));
}
