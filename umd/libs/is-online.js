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
    function isOnline() {
        if (typeof navigator.onLine !== 'undefined') {
            return navigator.onLine;
        }
        // always assume it's online
        return true;
    }
    exports.default = isOnline;
});
