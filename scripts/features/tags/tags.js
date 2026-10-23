/**
 * Tags Feature Component
 * Displays active filters (county and locality) with labels and removal handles.
 */
import { state, notifyStateChange, subscribe } from "../../core/state.js";
import { escapeHtml } from "../../core/utils.js";

let tagsContainer = null;

export function initTags() {
    tagsContainer = document.getElementById("api-tags");
    if (!tagsContainer) return;

    renderTags();

    // Subscribe to state changes to automatically re-render tags
    subscribe((currentState, changeType) => {
        if (changeType === "selection-changed" || changeType === "selection-cleared") {
            renderTags();
        }
    });
}

export function renderTags() {
    if (!tagsContainer) return;
    tagsContainer.innerHTML = "";

    // Tag 1: Județ
    if (state.selectedJudet) {
        const tagJudet = document.createElement("div");
        tagJudet.className = "tag";
        tagJudet.setAttribute("data-label", "județ");
        tagJudet.innerHTML = `<span class="close" aria-label="Elimină"><ion-icon name="close-outline"></ion-icon></span>${escapeHtml(state.selectedJudet.numeDiacritice || state.selectedJudet.nume)}`;

        const closeBtn = tagJudet.querySelector(".close");
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            state.selectedJudet = null;
            state.selectedParent = null;
            state.selectedLocality = null;
            state.currentQuery = "";
            renderTags();
            notifyStateChange("selection-cleared");
        });

        tagsContainer.appendChild(tagJudet);
    }

    // Tag 2: Comună / Municipiu / Oraș (Unitate administrativă superioară)
    if (state.selectedParent) {
        let tipLabel = state.selectedParent.tip || "comună";
        if (tipLabel === "comuna") tipLabel = "comună";
        else if (tipLabel === "oras") tipLabel = "oraș";

        const tagParent = document.createElement("div");
        tagParent.className = "tag";
        tagParent.setAttribute("data-label", tipLabel);
        tagParent.innerHTML = `<span class="close" aria-label="Elimină"><ion-icon name="close-outline"></ion-icon></span>${escapeHtml(state.selectedParent.name)}`;

        const closeBtn = tagParent.querySelector(".close");
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            state.selectedParent = null;
            state.selectedLocality = null;
            state.currentQuery = "";
            renderTags();
            notifyStateChange("selection-changed");
        });

        tagsContainer.appendChild(tagParent);
    }

    // Tag 3: Sat / Localitate componentă
    if (state.selectedLocality) {
        let tipLabel = state.selectedLocality.tip || "sat";
        if (tipLabel === "comuna") tipLabel = "comună";
        else if (tipLabel === "oras") tipLabel = "oraș";

        const tagLoc = document.createElement("div");
        tagLoc.className = "tag";
        tagLoc.setAttribute("data-label", tipLabel);
        tagLoc.innerHTML = `<span class="close" aria-label="Elimină"><ion-icon name="close-outline"></ion-icon></span>${escapeHtml(state.selectedLocality.name)}`;

        const closeBtn = tagLoc.querySelector(".close");
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            state.selectedLocality = null;
            state.currentQuery = "";
            renderTags();
            notifyStateChange("selection-changed");
        });

        tagsContainer.appendChild(tagLoc);
    }
}
