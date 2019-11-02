var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "react", "react-dom", "lodash.throttle", "fast-deep-equal", "./config", "./swr-config-context", "./libs/is-document-visible", "./libs/use-hydration"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = require("react");
    const react_dom_1 = require("react-dom");
    const lodash_throttle_1 = __importDefault(require("lodash.throttle"));
    const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
    const config_1 = __importStar(require("./config"));
    const swr_config_context_1 = __importDefault(require("./swr-config-context"));
    const is_document_visible_1 = __importDefault(require("./libs/is-document-visible"));
    const use_hydration_1 = __importDefault(require("./libs/use-hydration"));
    const trigger = function (key, shouldRevalidate = true) {
        const updaters = config_1.CACHE_REVALIDATORS[key];
        if (updaters) {
            for (let i = 0; i < updaters.length; ++i) {
                updaters[i](shouldRevalidate);
            }
        }
    };
    exports.trigger = trigger;
    const mutate = function (key, data, shouldRevalidate = true) {
        // update timestamp
        config_1.MUTATION_TS[key] = Date.now() - 1;
        // update cached data
        config_1.cacheSet(key, data);
        // update existing SWR Hooks' state
        const updaters = config_1.CACHE_REVALIDATORS[key];
        if (updaters) {
            for (let i = 0; i < updaters.length; ++i) {
                updaters[i](shouldRevalidate);
            }
        }
    };
    exports.mutate = mutate;
    function useSWR(...args) {
        let _key, fn, config = {};
        if (args.length >= 1) {
            _key = args[0];
        }
        if (typeof args[1] === 'function') {
            fn = args[1];
        }
        else if (typeof args[1] === 'object') {
            config = args[1];
        }
        if (typeof args[2] === 'object') {
            config = args[2];
        }
        // we assume `key` as the identifier of the request
        // `key` can change but `fn` shouldn't
        // (because `revalidate` only depends on `key`)
        let key;
        if (typeof _key === 'function') {
            try {
                key = _key();
            }
            catch (err) {
                // dependencies not ready
                key = '';
            }
        }
        else {
            key = _key;
        }
        config = Object.assign({}, config_1.default, react_1.useContext(swr_config_context_1.default), config);
        if (typeof fn === 'undefined') {
            // use a global fetcher
            fn = config.fetcher;
        }
        // stale: get from cache
        let [data, setData] = react_1.useState(config.suspense ? config_1.cacheGet(key) : use_hydration_1.default() ? undefined : config_1.cacheGet(key));
        // it is fine to call `useHydration` conditionally here
        // because `config.suspense` should never change
        let [error, setError] = react_1.useState();
        let [isValidating, setIsValidating] = react_1.useState(false);
        // error ref inside revalidate (is last request errored?)
        const errorRef = react_1.useRef(false);
        const unmountedRef = react_1.useRef(false);
        const keyRef = react_1.useRef(key);
        const dataRef = react_1.useRef(data);
        const revalidate = react_1.useCallback(async (revalidateOpts = {}) => {
            if (!key)
                return false;
            if (unmountedRef.current)
                return false;
            let loading = true;
            try {
                setIsValidating(true);
                let newData;
                let originalRequest = !!(config_1.CONCURRENT_PROMISES[key] === undefined || revalidateOpts.noDedupe);
                let ts;
                if (!originalRequest) {
                    // different component, dedupe requests
                    // need the new data for the state
                    ts = config_1.CONCURRENT_PROMISES_TS[key];
                    newData = await config_1.CONCURRENT_PROMISES[key];
                }
                else {
                    // if no cache being rendered (blank page),
                    // we trigger the loading slow event
                    if (!config_1.cacheGet(key)) {
                        setTimeout(() => {
                            if (loading)
                                config.onLoadingSlow(key, config);
                        }, config.loadingTimeout);
                    }
                    config_1.CONCURRENT_PROMISES[key] = fn(key);
                    config_1.CONCURRENT_PROMISES_TS[key] = ts = Date.now();
                    setTimeout(() => {
                        delete config_1.CONCURRENT_PROMISES[key];
                        delete config_1.CONCURRENT_PROMISES_TS[key];
                    }, config.dedupingInterval);
                    newData = await config_1.CONCURRENT_PROMISES[key];
                    // trigger the success event
                    // (only do it for the original request)
                    config.onSuccess(newData, key, config);
                }
                // if the revalidation happened earlier than local mutations,
                // we should ignore the result because it could override.
                if (config_1.MUTATION_TS[key] && ts <= config_1.MUTATION_TS[key]) {
                    setIsValidating(false);
                    return false;
                }
                errorRef.current = false;
                react_dom_1.unstable_batchedUpdates(() => {
                    setIsValidating(false);
                    setError(undefined);
                    if (dataRef.current && fast_deep_equal_1.default(dataRef.current, newData)) {
                        // deep compare to avoid extra re-render
                        // do nothing
                    }
                    else {
                        // data changed
                        setData(newData);
                        config_1.cacheSet(key, newData);
                        if (originalRequest) {
                            // also update other SWRs from cache
                            trigger(key, false);
                        }
                        keyRef.current = key;
                        dataRef.current = newData;
                    }
                });
            }
            catch (err) {
                delete config_1.CONCURRENT_PROMISES[key];
                react_dom_1.unstable_batchedUpdates(() => {
                    setIsValidating(false);
                    setError(err);
                });
                config.onError(err, key, config);
                errorRef.current = true;
                if (config.shouldRetryOnError) {
                    const retryCount = (revalidateOpts.retryCount || 0) + 1;
                    config.onErrorRetry(err, key, config, revalidate, Object.assign({}, revalidateOpts, { retryCount }));
                }
            }
            loading = false;
            return true;
        }, [key]);
        const forceRevalidate = react_1.useCallback(() => revalidate({ noDedupe: true }), [
            revalidate
        ]);
        // mounted
        react_1.useLayoutEffect(() => {
            if (!key)
                return undefined;
            // after `key` updates, we need to mark it as mounted
            unmountedRef.current = false;
            const _newData = config_1.cacheGet(key);
            // update the state if the cache changed OR the key changed
            if ((_newData && !fast_deep_equal_1.default(data, _newData)) || keyRef.current !== key) {
                setData(_newData);
                dataRef.current = _newData;
                keyRef.current = key;
            }
            // revalidate after mounted
            if (_newData && window['requestIdleCallback']) {
                // delay revalidate if there's cache
                // to not block the rendering
                window['requestIdleCallback'](revalidate);
            }
            else {
                revalidate();
            }
            // whenever the window gets focused, revalidate
            // throttle: avoid being called twice from both listeners
            // and tabs being switched quickly
            const onFocus = lodash_throttle_1.default(revalidate, config.focusThrottleInterval);
            if (config.revalidateOnFocus) {
                if (!config_1.FOCUS_REVALIDATORS[key]) {
                    config_1.FOCUS_REVALIDATORS[key] = [onFocus];
                }
                else {
                    config_1.FOCUS_REVALIDATORS[key].push(onFocus);
                }
            }
            // updater
            const onUpdate = (shouldRevalidate = true) => {
                // update data from the cache
                const newData = config_1.cacheGet(key);
                if (!fast_deep_equal_1.default(data, newData)) {
                    react_dom_1.unstable_batchedUpdates(() => {
                        setError(undefined);
                        setData(newData);
                    });
                    dataRef.current = newData;
                    keyRef.current = key;
                }
                if (shouldRevalidate) {
                    return revalidate();
                }
                return false;
            };
            if (!config_1.CACHE_REVALIDATORS[key]) {
                config_1.CACHE_REVALIDATORS[key] = [onUpdate];
            }
            else {
                config_1.CACHE_REVALIDATORS[key].push(onUpdate);
            }
            // polling
            let id = null;
            async function tick() {
                if (!errorRef.current &&
                    (config.refreshWhenHidden || is_document_visible_1.default())) {
                    // only revalidate when the page is visible
                    // if API request errored, we stop polling in this round
                    // and let the error retry function handle it
                    await revalidate();
                }
                const interval = config.refreshInterval;
                id = setTimeout(tick, interval);
            }
            if (config.refreshInterval) {
                id = setTimeout(tick, config.refreshInterval);
            }
            return () => {
                // cleanup
                setData = () => null;
                setIsValidating = () => null;
                setError = () => null;
                // mark it as unmounted
                unmountedRef.current = true;
                if (config_1.FOCUS_REVALIDATORS[key]) {
                    const index = config_1.FOCUS_REVALIDATORS[key].indexOf(onFocus);
                    if (index >= 0)
                        config_1.FOCUS_REVALIDATORS[key].splice(index, 1);
                }
                if (config_1.CACHE_REVALIDATORS[key]) {
                    const index = config_1.CACHE_REVALIDATORS[key].indexOf(onUpdate);
                    if (index >= 0)
                        config_1.CACHE_REVALIDATORS[key].splice(index, 1);
                }
                if (id !== null) {
                    clearTimeout(id);
                }
            };
        }, [key, config.refreshInterval, revalidate]);
        // suspense (client side only)
        if (config.suspense && typeof data === 'undefined') {
            if (typeof window !== 'undefined') {
                if (!config_1.CONCURRENT_PROMISES[key]) {
                    // need to trigger revalidate immediately
                    // to throw the promise
                    revalidate();
                }
                throw config_1.CONCURRENT_PROMISES[key];
            }
        }
        return {
            error,
            // `key` might be changed in the upcoming hook re-render,
            // but the previous state will stay
            // so we need to match the latest key and data
            data: keyRef.current === key ? data : undefined,
            revalidate: forceRevalidate,
            isValidating
        };
    }
    const SWRConfig = swr_config_context_1.default.Provider;
    exports.SWRConfig = SWRConfig;
    exports.default = useSWR;
});
