(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
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
});
