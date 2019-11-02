var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "ms", "./libs/is-document-visible", "./libs/is-online"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ms_1 = __importDefault(require("ms"));
    const is_document_visible_1 = __importDefault(require("./libs/is-document-visible"));
    const is_online_1 = __importDefault(require("./libs/is-online"));
    // Cache
    const __cache = new Map();
    function cacheGet(key) {
        return __cache.get(key) || undefined;
    }
    exports.cacheGet = cacheGet;
    function cacheSet(key, value) {
        return __cache.set(key, value);
    }
    exports.cacheSet = cacheSet;
    function cacheClear() {
        __cache.clear();
    }
    exports.cacheClear = cacheClear;
    // state managers
    const CONCURRENT_PROMISES = {};
    exports.CONCURRENT_PROMISES = CONCURRENT_PROMISES;
    const CONCURRENT_PROMISES_TS = {};
    exports.CONCURRENT_PROMISES_TS = CONCURRENT_PROMISES_TS;
    const FOCUS_REVALIDATORS = {};
    exports.FOCUS_REVALIDATORS = FOCUS_REVALIDATORS;
    const CACHE_REVALIDATORS = {};
    exports.CACHE_REVALIDATORS = CACHE_REVALIDATORS;
    const MUTATION_TS = {};
    exports.MUTATION_TS = MUTATION_TS;
    // error retry
    function onErrorRetry(_, __, config, revalidate, opts) {
        if (!is_document_visible_1.default()) {
            // if it's hidden, stop
            // it will auto revalidate when focus
            return;
        }
        // exponential backoff
        const count = Math.min(opts.retryCount || 0, 8);
        const timeout = ~~((Math.random() + 0.5) * (1 << count)) * config.errorRetryInterval;
        setTimeout(revalidate, timeout, opts);
    }
    // config
    const defaultConfig = {
        // events
        onLoadingSlow: () => { },
        onSuccess: () => { },
        onError: () => { },
        onErrorRetry,
        errorRetryInterval: ms_1.default('5s'),
        focusThrottleInterval: ms_1.default('5s'),
        dedupingInterval: ms_1.default('2s'),
        loadingTimeout: ms_1.default('3s'),
        refreshInterval: 0,
        revalidateOnFocus: true,
        refreshWhenHidden: false,
        shouldRetryOnError: true,
        suspense: false
    };
    if (typeof window !== 'undefined') {
        // client side: need to adjust the config
        // based on the browser status
        // slow connection (<= 70Kbps)
        if (navigator['connection']) {
            if (['slow-2g', '2g'].indexOf(navigator['connection'].effectiveType) !== -1) {
                defaultConfig.errorRetryInterval = ms_1.default('10s');
                defaultConfig.loadingTimeout = ms_1.default('5s');
            }
        }
    }
    // Focus revalidate
    let eventsBinded = false;
    if (typeof window !== 'undefined' && !eventsBinded) {
        const revalidate = () => {
            if (!is_document_visible_1.default() || !is_online_1.default())
                return;
            for (let key in FOCUS_REVALIDATORS) {
                if (FOCUS_REVALIDATORS[key][0])
                    FOCUS_REVALIDATORS[key][0]();
            }
        };
        window.addEventListener('visibilitychange', revalidate, false);
        window.addEventListener('focus', revalidate, false);
        // only bind the events once
        eventsBinded = true;
    }
    exports.default = defaultConfig;
});
