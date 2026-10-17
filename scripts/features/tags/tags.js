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

    if (state.selectedJudet) {
        const tagJudet = document.createElement("div");
        tagJudet.className = "tag";
        tagJudet.setAttribute("data-label", "județ");
        tagJudet.innerHTML = `<span class="close" aria-label="Elimină"><ion-icon name="close-outline"></ion-icon></span>${escapeHtml(state.selectedJudet.numeDiacritice)}`;

        const closeBtn = tagJudet.querySelector(".close");
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            state.selectedJudet = null;
            state.selectedLocality = null;
            state.currentQuery = "";
            renderTags();
            notifyStateChange("selection-cleared");
        });

        tagsContainer.appendChild(tagJudet);
    }

    if (state.selectedLocality) {
        const tipLabel = state.selectedLocality.tip || "localitate";
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
            notifyStateChange("selection-cleared");
        });

        tagsContainer.appendChild(tagLoc);
    }
}
