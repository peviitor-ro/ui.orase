/**
 * Application State Manager
 */

export const state = {
    judete: [],             // All 42 counties loaded from /judete/
    allLocalities: [],      // 16,900+ localities loaded from /
    isAllLoaded: false,
    selectedJudet: null,    // e.g. { nume: "Cluj", numeDiacritice: "Cluj", cod: "CJ" }
    selectedParent: null,   // e.g. { name: "Zimbor", tip: "comuna" }
    selectedLocality: null, // e.g. { name: "Chendremal", tip: "sat", judet: "SALAJ", parent: "Zimbor", parentTip: "comuna" }
    currentQuery: "",
    currentTab: "javascript",
    rawCode: ""
};

const listeners = [];

export function subscribe(listener) {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
}

export function notifyStateChange(changeType) {
    for (const listener of listeners) {
        listener(state, changeType);
    }
}
