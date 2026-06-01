// next-wrapper.js
const path = require('path');
const polyfillPath = path.resolve(__dirname, 'polyfill.cjs');

// Propagate polyfill to all child processes and worker threads
if (process.env.NODE_OPTIONS) {
  if (!process.env.NODE_OPTIONS.includes('polyfill.cjs')) {
    process.env.NODE_OPTIONS += ` --require "${polyfillPath}"`;
  }
} else {
  process.env.NODE_OPTIONS = `--require "${polyfillPath}"`;
}

// Run the polyfill in the main process
require('./polyfill.cjs');

// Launch Next.js
require('./node_modules/next/dist/bin/next');
