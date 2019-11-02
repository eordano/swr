"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
let isHydration = true;
function useHydration() {
    react_1.useEffect(() => {
        setTimeout(() => {
            isHydration = false;
        }, 1);
    }, []);
    return isHydration;
}
exports.default = useHydration;
