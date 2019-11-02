var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./use-swr", "./use-swr", "./use-swr-pages"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(require("./use-swr"));
    const use_swr_1 = __importDefault(require("./use-swr"));
    var use_swr_pages_1 = require("./use-swr-pages");
    exports.useSWRPages = use_swr_pages_1.useSWRPages;
    exports.default = use_swr_1.default;
});
