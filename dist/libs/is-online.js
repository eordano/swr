"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isOnline() {
    if (typeof navigator.onLine !== 'undefined') {
        return navigator.onLine;
    }
    // always assume it's online
    return true;
}
exports.default = isOnline;
