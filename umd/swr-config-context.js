(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "react"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = require("react");
    const SWRConfigContext = react_1.createContext({});
    SWRConfigContext.displayName = 'SWRConfigContext';
    exports.default = SWRConfigContext;
});
