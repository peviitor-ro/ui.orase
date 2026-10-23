/**
 * Search Feature Component
 * Handles search input, dropdown filtering, keyboard navigation, and locality/county selection.
 */
import { state, notifyStateChange, subscribe } from "../../core/state.js";
import { normalize, escapeHtml } from "../../core/utils.js";

let searchInput = null;
let selectContainer = null;

export function initSearch() {
    searchInput = document.getElementById("api-search");
    selectContainer = document.getElementById("api-select");

    if (!searchInput || !selectContainer) return;

    // Prevent input blur when clicking inside the dropdown
    selectContainer.addEventListener("mousedown", (e) => {
        e.preventDefault();
    });

    // Search input input & focus
    searchInput.addEventListener("input", () => {
        state.currentQuery = searchInput.value.trim();
        renderDropdown();
        notifyStateChange("query-changed");
    });

    searchInput.addEventListener("focus", () => {
        renderDropdown();
        openDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !selectContainer.contains(e.target)) {
            closeDropdown();
        }
    });

    // Keyboard navigation (Escape to close)
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeDropdown();
        }
    });

    // Listen to reactive state changes
    subscribe((currentState, changeType) => {
        if (changeType === "counties-loaded" || changeType === "localities-loaded") {
            if (document.activeElement === searchInput) {
                renderDropdown();
            }
        } else if (changeType === "selection-cleared") {
            renderDropdown();
            closeDropdown();
            if (searchInput) {
                searchInput.value = "";
                searchInput.blur();
            }
        }
    });
}

export function openDropdown() {
    if (selectContainer) {
        selectContainer.classList.add("is-open");
    }
}

export function closeDropdown() {
    if (selectContainer) {
        selectContainer.classList.remove("is-open");
    }
}

export function renderDropdown() {
    if (!selectContainer) return;
    selectContainer.innerHTML = "";
    const query = normalize(state.currentQuery);

    // Case 1: Empty query
    if (!query) {
        if (state.selectedParent && state.allLocalities.length > 0) {
            // Show subordinate localities in selected parent (comuna / municipiu / oras)
            const parentName = state.selectedParent.name;
            const countyName = state.selectedJudet ? state.selectedJudet.nume : "";
            const locs = state.allLocalities.filter((l) =>
                normalize(l.parent) === normalize(parentName) &&
                (!countyName || normalize(l.judet) === normalize(countyName))
            );

            const tipDisplay = state.selectedParent.tip === "comuna" ? "comuna" : state.selectedParent.tip;
            const header = document.createElement("div");
            header.className = "select-header";
            header.innerHTML = `<ion-icon name="location-outline"></ion-icon> Localități din ${escapeHtml(tipDisplay)} ${escapeHtml(parentName)} (${locs.length})`;
            selectContainer.appendChild(header);

            const ul = document.createElement("ul");
            locs.forEach((loc) => {
                const li = createLocalityListItem(loc);
                ul.appendChild(li);
            });
            selectContainer.appendChild(ul);
        } else if (state.selectedJudet && state.allLocalities.length > 0) {
            // Show localities in selected county
            const countyName = state.selectedJudet.nume;
            const locs = state.allLocalities.filter((l) => normalize(l.judet) === normalize(countyName));

            const header = document.createElement("div");
            header.className = "select-header";
            header.innerHTML = `<ion-icon name="location-outline"></ion-icon> Localități din județul ${escapeHtml(state.selectedJudet.numeDiacritice || state.selectedJudet.nume)} (${locs.length})`;
            selectContainer.appendChild(header);

            const ul = document.createElement("ul");
            locs.slice(0, 40).forEach((loc) => {
                const li = createLocalityListItem(loc);
                ul.appendChild(li);
            });
            selectContainer.appendChild(ul);
        } else {
            // Show list of counties
            const header = document.createElement("div");
            header.className = "select-header";
            header.innerHTML = `<ion-icon name="map-outline"></ion-icon> Alege un județ din România (${state.judete.length})`;
            selectContainer.appendChild(header);

            const ul = document.createElement("ul");
            state.judete.forEach((j) => {
                const li = createJudetListItem(j);
                ul.appendChild(li);
            });
            selectContainer.appendChild(ul);
        }
        openDropdown();
        return;
    }

    // Case 2: Query entered
    const resultsFragment = document.createDocumentFragment();

    // 1. Search counties
    const matchingCounties = state.judete.filter((j) => {
        return (
            normalize(j.nume).includes(query) ||
            normalize(j.numeDiacritice).includes(query) ||
            j.cod.toLowerCase() === query
        );
    });

    // 2. Search localities
    let matchingLocalities = [];
    if (state.allLocalities.length > 0) {
        // If a parent is selected, first attempt filtering inside that parent
        if (state.selectedParent) {
            matchingLocalities = state.allLocalities.filter((l) => {
                if (state.selectedJudet && normalize(l.judet) !== normalize(state.selectedJudet.nume)) return false;
                const matchesParent = normalize(l.parent) === normalize(state.selectedParent.name) || normalize(l.name) === normalize(state.selectedParent.name);
                return matchesParent && (l.normName.includes(query) || (!state.selectedJudet && l.normJudet.includes(query)));
            });
        }

        // If no matches inside parent or no parent selected, search within county / full dataset
        if (matchingLocalities.length === 0) {
            matchingLocalities = state.allLocalities.filter((l) => {
                if (state.selectedJudet) {
                    if (normalize(l.judet) !== normalize(state.selectedJudet.nume)) return false;
                }
                return l.normName.includes(query) || (!state.selectedJudet && l.normJudet.includes(query));
            });
        }

        // Sort by relevance (exact prefix first)
        matchingLocalities.sort((a, b) => {
            const aStarts = a.normName.startsWith(query);
            const bStarts = b.normName.startsWith(query);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.name.localeCompare(b.name);
        });
    }

    if (matchingCounties.length === 0 && matchingLocalities.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "select-empty";
        emptyDiv.textContent = `Niciun rezultat găsit pentru "${state.currentQuery}"`;
        selectContainer.appendChild(emptyDiv);
        openDropdown();
        return;
    }

    // Render matching counties (if not already locked to a county)
    if (!state.selectedJudet && matchingCounties.length > 0) {
        const hJudete = document.createElement("div");
        hJudete.className = "select-header";
        hJudete.innerHTML = `<ion-icon name="map-outline"></ion-icon> Județe`;
        resultsFragment.appendChild(hJudete);

        const ulJudete = document.createElement("ul");
        matchingCounties.forEach((j) => {
            ulJudete.appendChild(createJudetListItem(j));
        });
        resultsFragment.appendChild(ulJudete);
    }

    // Render matching localities
    if (matchingLocalities.length > 0) {
        const hLoc = document.createElement("div");
        hLoc.className = "select-header";
        hLoc.innerHTML = `<ion-icon name="location-outline"></ion-icon> Localități (${matchingLocalities.length})`;
        resultsFragment.appendChild(hLoc);

        const ulLoc = document.createElement("ul");
        matchingLocalities.slice(0, 35).forEach((loc) => {
            ulLoc.appendChild(createLocalityListItem(loc));
        });
        resultsFragment.appendChild(ulLoc);
    }

    selectContainer.appendChild(resultsFragment);
    openDropdown();
}

function createJudetListItem(j) {
    const li = document.createElement("li");
    li.className = "select-item";
    if (state.selectedJudet && state.selectedJudet.cod === j.cod) {
        li.classList.add("selected");
    }

    li.innerHTML = `
        <span class="item-badge badge-judet">Județ</span>
        <span class="item-title">${escapeHtml(j.numeDiacritice || j.nume)}</span>
        <span class="item-sub">${escapeHtml(j.cod)}</span>
    `;

    li.addEventListener("click", () => {
        selectJudet(j);
    });

    return li;
}

function createLocalityListItem(loc) {
    const li = document.createElement("li");
    li.className = "select-item";

    let badgeClass = "badge-sat";
    let tipDisplay = loc.tip || "sat";
    if (tipDisplay === "municipiu") badgeClass = "badge-municipiu";
    else if (tipDisplay === "oras") badgeClass = "badge-oras";
    else if (tipDisplay === "comuna") badgeClass = "badge-comuna";
    else if (tipDisplay === "sector") badgeClass = "badge-sector";

    let parentInfo = "";
    if (loc.parent) {
        let prefix = "";
        if (loc.parentTip === "comuna") prefix = "com. ";
        else if (loc.parentTip === "municipiu") prefix = "mun. ";
        else if (loc.parentTip === "oras") prefix = "oraș ";
        parentInfo = `(${prefix}${loc.parent})`;
    }
    const judetName = loc.judetDiacritice || loc.judet;
    const judetInfo = judetName ? `jud. ${judetName}` : "";
    const subInfo = [parentInfo, judetInfo].filter(Boolean).join(" ");

    // Highlight active selection
    if (state.selectedLocality && state.selectedLocality.name === loc.name && state.selectedLocality.tip === loc.tip && state.selectedLocality.parent === loc.parent) {
        li.classList.add("selected");
    } else if (!state.selectedLocality && state.selectedParent && state.selectedParent.name === loc.name && state.selectedParent.tip === loc.tip) {
        li.classList.add("selected");
    }

    li.innerHTML = `
        <span class="item-badge ${badgeClass}">${escapeHtml(tipDisplay)}</span>
        <span class="item-title">${escapeHtml(loc.name)}</span>
        <span class="item-sub">${escapeHtml(subInfo)}</span>
    `;

    li.addEventListener("click", () => {
        selectLocality(loc);
    });

    return li;
}

function selectJudet(j) {
    state.selectedJudet = j;
    state.selectedParent = null;
    state.selectedLocality = null;
    state.currentQuery = "";
    if (searchInput) searchInput.value = "";
    renderDropdown();
    notifyStateChange("selection-changed");
}

function selectLocality(loc) {
    // 1. Resolve county
    if (loc.judet) {
        const foundJudet = state.judete.find((j) => normalize(j.nume) === normalize(loc.judet));
        if (foundJudet) {
            state.selectedJudet = foundJudet;
        } else {
            state.selectedJudet = { nume: loc.judet, numeDiacritice: loc.judetDiacritice || loc.judet, cod: "" };
        }
    }

    // 2. Resolve parent vs locality
    if (loc.tip === "comuna" || loc.tip === "municipiu" || loc.tip === "oras") {
        state.selectedParent = {
            name: loc.name,
            tip: loc.tip
        };
        state.selectedLocality = null;
    } else {
        state.selectedLocality = loc;
        if (loc.parent) {
            state.selectedParent = {
                name: loc.parent,
                tip: loc.parentTip || "comuna"
            };
        } else {
            state.selectedParent = null;
        }
    }

    state.currentQuery = "";
    if (searchInput) searchInput.value = "";
    closeDropdown();
    notifyStateChange("selection-changed");
}
