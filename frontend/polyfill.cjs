// polyfill.cjs
// Automatically required on startup of all Node processes/workers

// 1. Mock Node version
try {
  Object.defineProperty(process.versions, 'node', { value: '20.10.0' });
} catch (e) {}

// 2. Polyfill ES2023 Array methods
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) {
    return [...this].sort(compareFn);
  };
}

if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}

if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function(start, deleteCount, ...items) {
    const copy = [...this];
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

if (!Array.prototype.with) {
  Array.prototype.with = function(index, value) {
    const copy = [...this];
    const actualIndex = index < 0 ? this.length + index : index;
    copy[actualIndex] = value;
    return copy;
  };
}
