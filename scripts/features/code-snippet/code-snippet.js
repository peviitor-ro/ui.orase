/**
 * Code Snippet Playground Component
 * Generates dynamic code snippets (JavaScript, cURL, Python, PHP, JSON)
 * based on current selection and provides syntax highlighting & clipboard copy.
 */
import { state, subscribe } from "../../core/state.js";
import { escapeHtml } from "../../core/utils.js";
import {
    highlightJavaScript,
    highlightCurl,
    highlightPython,
    highlightPhp,
    highlightJson
} from "./highlighters.js";

let codeDisplay = null;
let codeDesc = null;
let copyBtn = null;
let tabButtons = null;
let jsonCard = null;
let isInitialized = false;

export function initCodeSnippet() {
    codeDisplay = document.getElementById("code-display");
    codeDesc = document.getElementById("code-snippet-desc");
    copyBtn = document.getElementById("copy-code-btn");
    tabButtons = document.querySelectorAll(".code-tab");
    jsonCard = document.getElementById("json-example");

    // Language tab buttons
    if (tabButtons) {
        tabButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                tabButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                state.currentTab = btn.getAttribute("data-lang");
                updateCodeSnippet(true);
            });
        });
    }

    // Copy to clipboard button
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (!state.rawCode) return;
            navigator.clipboard
                .writeText(state.rawCode)
                .then(() => {
                    copyBtn.classList.add("copied");
                    const icon = copyBtn.querySelector("ion-icon");
                    if (icon) icon.setAttribute("name", "checkmark-outline");
                    copyBtn.setAttribute("data-tooltip", "Copied!");
                    setTimeout(() => {
                        copyBtn.classList.remove("copied");
                        if (icon) icon.setAttribute("name", "copy-outline");
                        copyBtn.setAttribute("data-tooltip", "Copy code");
                    }, 2000);
                })
                .catch((err) => {
                    console.error("Clipboard copy error:", err);
                });
        });
    }

    // Subscribe to state changes to update snippet dynamically
    subscribe((currentState, changeType) => {
        if (
            changeType === "query-changed" ||
            changeType === "selection-changed" ||
            changeType === "selection-cleared"
        ) {
            updateCodeSnippet(true);
        }
    });

    // Initial render without animation
    updateCodeSnippet(false);
    isInitialized = true;
}

function escapeJs(str) {
    return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function escapeDoubleQuotes(str) {
    return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildJavaScriptCode(mode, queryVal, judetVal) {
    let urlDecl = "";
    if (mode === "locality") {
        if (judetVal) {
            urlDecl = `const query = '${escapeJs(queryVal)}';\nconst judet = '${escapeJs(judetVal)}';\nconst url = \`https://orase.peviitor.ro/search/?q=\${encodeURIComponent(query)}&judet=\${encodeURIComponent(judet)}\`;`;
        } else {
            urlDecl = `const query = '${escapeJs(queryVal)}';\nconst url = \`https://orase.peviitor.ro/search/?q=\${encodeURIComponent(query)}\`;`;
        }
    } else if (mode === "judet") {
        urlDecl = `const judet = '${escapeJs(judetVal)}';\nconst url = \`https://orase.peviitor.ro/ROMANIA/\${encodeURIComponent(judet)}/\`;`;
    } else if (mode === "query") {
        urlDecl = `const query = '${escapeJs(queryVal)}';\nconst url = \`https://orase.peviitor.ro/search/?q=\${encodeURIComponent(query)}\`;`;
    } else {
        urlDecl = `const url = 'https://orase.peviitor.ro/judete/';`;
    }

    return `${urlDecl}

fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network error: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log('Received data:', data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });`;
}

function buildCurlCode(mode, queryVal, judetVal) {
    if (mode === "locality") {
        if (judetVal) {
            return `QUERY="${escapeDoubleQuotes(queryVal)}"
JUDET="${escapeDoubleQuotes(judetVal)}"

curl -G "https://orase.peviitor.ro/search/" \\
     --data-urlencode "q=\${QUERY}" \\
     --data-urlencode "judet=\${JUDET}" \\
     -H "Accept: application/json"`;
        } else {
            return `QUERY="${escapeDoubleQuotes(queryVal)}"

curl -G "https://orase.peviitor.ro/search/" \\
     --data-urlencode "q=\${QUERY}" \\
     -H "Accept: application/json"`;
        }
    } else if (mode === "judet") {
        return `JUDET="${escapeDoubleQuotes(judetVal)}"

curl -X GET "https://orase.peviitor.ro/ROMANIA/\${JUDET}/" \\
     -H "Accept: application/json"`;
    } else if (mode === "query") {
        return `QUERY="${escapeDoubleQuotes(queryVal)}"

curl -G "https://orase.peviitor.ro/search/" \\
     --data-urlencode "q=\${QUERY}" \\
     -H "Accept: application/json"`;
    } else {
        return `curl -X GET "https://orase.peviitor.ro/judete/" \\
     -H "Accept: application/json"`;
    }
}

function buildPythonCode(mode, queryVal, judetVal) {
    let setup = "";
    if (mode === "locality") {
        if (judetVal) {
            setup = `import requests
from urllib.parse import quote

query = "${escapeDoubleQuotes(queryVal)}"
judet = "${escapeDoubleQuotes(judetVal)}"
url = f"https://orase.peviitor.ro/search/?q={quote(query)}&judet={quote(judet)}"`;
        } else {
            setup = `import requests
from urllib.parse import quote

query = "${escapeDoubleQuotes(queryVal)}"
url = f"https://orase.peviitor.ro/search/?q={quote(query)}"`;
        }
    } else if (mode === "judet") {
        setup = `import requests
from urllib.parse import quote

judet = "${escapeDoubleQuotes(judetVal)}"
url = f"https://orase.peviitor.ro/ROMANIA/{quote(judet)}/"`;
    } else if (mode === "query") {
        setup = `import requests
from urllib.parse import quote

query = "${escapeDoubleQuotes(queryVal)}"
url = f"https://orase.peviitor.ro/search/?q={quote(query)}"`;
    } else {
        setup = `import requests

url = "https://orase.peviitor.ro/judete/"`;
    }

    return `${setup}

try:
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    print("Received data:", data)
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")`;
}

function buildPhpCode(mode, queryVal, judetVal) {
    let setup = "";
    if (mode === "locality") {
        if (judetVal) {
            setup = `$query = "${escapeDoubleQuotes(queryVal)}";
$judet = "${escapeDoubleQuotes(judetVal)}";
$url = "https://orase.peviitor.ro/search/?q=" . urlencode($query) . "&judet=" . urlencode($judet);`;
        } else {
            setup = `$query = "${escapeDoubleQuotes(queryVal)}";
$url = "https://orase.peviitor.ro/search/?q=" . urlencode($query);`;
        }
    } else if (mode === "judet") {
        setup = `$judet = "${escapeDoubleQuotes(judetVal)}";
$url = "https://orase.peviitor.ro/ROMANIA/" . urlencode($judet) . "/";`;
    } else if (mode === "query") {
        setup = `$query = "${escapeDoubleQuotes(queryVal)}";
$url = "https://orase.peviitor.ro/search/?q=" . urlencode($query);`;
    } else {
        setup = `$url = "https://orase.peviitor.ro/judete/";`;
    }

    return `<?php
${setup}

$response = @file_get_contents($url);

if ($response === false) {
    echo "Error calling endpoint.";
} else {
    $data = json_decode($response, true);
    print_r($data);
}
?>`;
}

/**
 * Build Code Snippets dynamically based on current selection
 */
export function updateCodeSnippet(animate = false) {
    let mode = "default";
    let queryVal = "";
    let judetVal = "";
    let descText = "Toate județele din România";
    let sampleJson = "";

    if (state.selectedLocality) {
        mode = "locality";
        queryVal = state.selectedLocality.name;
        if (state.selectedJudet && state.selectedJudet.nume) {
            judetVal = state.selectedJudet.nume;
        }
        descText = `Căutare: ${queryVal} (${state.selectedLocality.tip})`;

        sampleJson = JSON.stringify(
            {
                results: [
                    {
                        type: state.selectedLocality.tip || "sat",
                        data: {
                            nume: state.selectedLocality.name,
                            tip: state.selectedLocality.tip,
                            judet: {
                                nume: state.selectedJudet ? state.selectedJudet.nume : "",
                                numeDiacritice: state.selectedJudet
                                    ? state.selectedJudet.numeDiacritice
                                    : "",
                                cod: state.selectedJudet ? state.selectedJudet.cod : ""
                            },
                            adresaCompleta:
                                state.selectedLocality.adresa &&
                                state.selectedLocality.adresa.length > 0
                                    ? state.selectedLocality.adresa
                                    : [
                                          `${state.selectedLocality.tip} ${state.selectedLocality.name}, județul ${state.selectedJudet ? state.selectedJudet.nume : ""}, România`
                                      ]
                        }
                    }
                ]
            },
            null,
            2
        );
    } else if (state.selectedJudet) {
        mode = "judet";
        judetVal = state.selectedJudet.nume.toUpperCase();
        descText = `Localitățile din județul ${state.selectedJudet.numeDiacritice}`;

        sampleJson = JSON.stringify(
            {
                nume: "ROMANIA",
                judet: [
                    {
                        nume: judetVal,
                        municipiu: [
                            {
                                nume: `${judetVal}`,
                                localitate: [
                                    {
                                        nume: `${judetVal}`,
                                        tip: "oras",
                                        adresaCompleta: [
                                            `orasul ${judetVal}, judetul ${judetVal}, România`
                                        ]
                                    }
                                ]
                            }
                        ],
                        oras: [],
                        comuna: []
                    }
                ]
            },
            null,
            2
        );
    } else if (state.currentQuery && state.currentQuery.trim().length >= 2) {
        mode = "query";
        queryVal = state.currentQuery.trim();
        descText = `Căutare după termenul: "${queryVal}"`;

        sampleJson = JSON.stringify(
            {
                results: [
                    {
                        type: "localitate",
                        data: {
                            nume: queryVal,
                            tip: "oras"
                        }
                    }
                ]
            },
            null,
            2
        );
    } else {
        mode = "default";
        descText = "Lista completă a județelor (42)";

        sampleJson = JSON.stringify(
            {
                judete: [
                    { nume: "Alba", numeDiacritice: "Alba", cod: "AB" },
                    { nume: "Arad", numeDiacritice: "Arad", cod: "AR" },
                    { nume: "Cluj", numeDiacritice: "Cluj", cod: "CJ" },
                    { nume: "Timiș", numeDiacritice: "Timiș", cod: "TM" },
                    { nume: "București", numeDiacritice: "București", cod: "B" }
                ]
            },
            null,
            2
        );
    }

    // Update meta bar
    if (codeDesc) codeDesc.textContent = descText;

    // Generate Code by Tab
    let raw = "";
    let highlighted = "";

    switch (state.currentTab) {
        case "javascript":
            raw = buildJavaScriptCode(mode, queryVal, judetVal);
            highlighted = highlightJavaScript(raw);
            break;

        case "curl":
            raw = buildCurlCode(mode, queryVal, judetVal);
            highlighted = highlightCurl(raw);
            break;

        case "python":
            raw = buildPythonCode(mode, queryVal, judetVal);
            highlighted = highlightPython(raw);
            break;

        case "php":
            raw = buildPhpCode(mode, queryVal, judetVal);
            highlighted = highlightPhp(raw);
            break;

        case "json":
            raw = sampleJson;
            highlighted = highlightJson(raw);
            break;

        default:
            raw = buildJavaScriptCode(mode, queryVal, judetVal);
            highlighted = highlightJavaScript(raw);
    }

    state.rawCode = raw;

    if (!codeDisplay) return;

    if (!animate || !isInitialized || !jsonCard) {
        codeDisplay.innerHTML = highlighted;
        return;
    }

    // Capture starting height before DOM update
    const startHeight = jsonCard.getBoundingClientRect().height;

    // Slight fade out of code content during morph
    codeDisplay.style.opacity = "0.3";
    codeDisplay.innerHTML = highlighted;

    // Measure natural height of new content
    jsonCard.style.height = "auto";
    const targetHeight = jsonCard.getBoundingClientRect().height;

    if (Math.abs(startHeight - targetHeight) > 2) {
        // Lock to starting height
        jsonCard.style.height = `${startHeight}px`;

        // Force browser layout reflow
        void jsonCard.offsetHeight;

        // Animate smoothly to target height
        jsonCard.style.transition = "height 0.28s cubic-bezier(0.25, 1, 0.5, 1)";
        jsonCard.style.height = `${targetHeight}px`;

        const onTransitionEnd = (e) => {
            if (e.target === jsonCard && e.propertyName === "height") {
                jsonCard.style.height = "";
                jsonCard.style.transition = "";
                jsonCard.removeEventListener("transitionend", onTransitionEnd);
            }
        };
        jsonCard.addEventListener("transitionend", onTransitionEnd);
    } else {
        jsonCard.style.height = "";
    }

    requestAnimationFrame(() => {
        codeDisplay.style.transition = "opacity 0.2s ease";
        codeDisplay.style.opacity = "1";
    });
}
