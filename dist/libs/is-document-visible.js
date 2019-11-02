"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isDocumentVisible() {
    if (typeof document.visibilityState !== 'undefined') {
        return (document.visibilityState === 'visible' ||
            document.visibilityState === 'prerender');
    }
    // always assume it's visible
    return true;
}
exports.default = isDocumentVisible;
