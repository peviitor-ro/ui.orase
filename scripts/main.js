/**
 * ui.orase - Search Engine & Code Snippet Playground
 * Application Entry Point
 * Powered by https://orase.peviitor.ro/
 */

import { initTooltips } from "./core/tooltip.js";
import { fetchCounties, fetchAllLocalities } from "./core/api.js";
import { initSearch } from "./features/search/search.js";
import { initTags } from "./features/tags/tags.js";
import { initCodeSnippet } from "./features/code-snippet/code-snippet.js";

async function init() {
    // 1. Initialize UI components & tooltips
    initTooltips();
    initSearch();
    initTags();
    initCodeSnippet();

    // 2. Fetch counties list immediately
    await fetchCounties();

    // 3. Fetch full Romania dataset in background for instant search across all localities
    fetchAllLocalities();
}

// Start application when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
