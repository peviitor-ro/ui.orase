/**
 * Syntax Highlighting Utility Functions (VS Code & Antigravity IDE Dark+ Theme)
 * Tokenizes JavaScript, cURL, Python, PHP, and JSON with zero-collision token indexing.
 */

function escapeCode(text) {
    if (!text || typeof text !== "string") return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function highlightJavaScript(code) {
    let esc = escapeCode(code);
    const tokens = [];
    const addToken = (cls, text) => {
        tokens.push(`<span class="${cls}">${text}</span>`);
        return `\x00${tokens.length - 1}\x00`;
    };

    // Template literals with backticks: `...`
    esc = esc.replace(/`([^`\\]*(?:\\.[^`\\]*)*)`/gs, (match, content) => {
        if (!content.includes("${")) {
            return addToken("hl-str", "`" + content + "`");
        }
        let out = addToken("hl-str", "`");
        let remaining = content;
        while (remaining.length > 0) {
            const startIdx = remaining.indexOf("${");
            if (startIdx === -1) {
                out += addToken("hl-str", remaining + "`");
                break;
            }
            if (startIdx > 0) {
                out += addToken("hl-str", remaining.substring(0, startIdx));
            }
            const endIdx = remaining.indexOf("}", startIdx + 2);
            if (endIdx === -1) {
                out += addToken("hl-str", remaining.substring(startIdx) + "`");
                break;
            }
            const expr = remaining.substring(startIdx + 2, endIdx);
            out += "${" + expr + "}";
            remaining = remaining.substring(endIdx + 1);
            if (remaining.length === 0) {
                out += addToken("hl-str", "`");
            }
        }
        return out;
    });

    // Standard string literals
    esc = esc.replace(/('(?:\\'|[^'\\])*'|"(?:\\"|[^"\\])*")/g, (m) => addToken("hl-str", m));

    // Comments
    esc = esc.replace(/(^|\s)(\/\/[^\n]*)/g, (_, p1, p2) => p1 + addToken("hl-cmt", p2));

    // Types / Classes
    esc = esc.replace(/\b(Error|Response|Promise|JSON|Object|Array|URLSearchParams|URL)\b/g, (m) => addToken("hl-type", m));

    // Control flow keywords
    esc = esc.replace(/\b(return|if|else|throw|try|catch|finally|await|async)\b/g, (m) => addToken("hl-ctrl", m));

    // Declaration keywords
    esc = esc.replace(/\b(const|let|var|function|new|import|from|export|default|class)\b/g, (m) => addToken("hl-kw", m));

    // Function calls
    esc = esc.replace(/\b(fetch|then|catch|log|error|json|encodeURIComponent)\b(?=\()/g, (m) => addToken("hl-fn", m));

    // Common variables & properties
    esc = esc.replace(/\b(url|params|query|judet|q|response|data|error|status|ok)\b/g, (m) => addToken("hl-var", m));

    // Booleans & null
    esc = esc.replace(/\b(true|false|null|undefined)\b/g, (m) => addToken("hl-bool", m));

    // Restore all tokens
    esc = esc.replace(/\x00(\d+)\x00/g, (_, idx) => tokens[Number(idx)]);
    return esc;
}

export function highlightCurl(code) {
    let esc = escapeCode(code);
    const tokens = [];
    const addToken = (cls, text) => {
        tokens.push(`<span class="${cls}">${text}</span>`);
        return `\x00${tokens.length - 1}\x00`;
    };

    // Strings (with ${VAR} parameter expansion highlighted)
    esc = esc.replace(/("(?:\\"|[^"\\])*")/g, (m) => {
        let inner = m.replace(/(\$\{)([A-Z0-9_]+)(\})/g, (_, p1, p2, p3) => `${p1}<span class="hl-var">${p2}</span>${p3}`);
        return addToken("hl-str", inner);
    });

    // Comments
    esc = esc.replace(/(^|\s)(#[^\n]*)/g, (_, p1, p2) => p1 + addToken("hl-cmt", p2));

    // Bash variable assignments: QUERY= or JUDET=
    esc = esc.replace(/\b([A-Z_][A-Z0-9_]*)=/g, (_, p1) => addToken("hl-var", p1) + "=");

    // curl command
    esc = esc.replace(/\b(curl)\b/g, (m) => addToken("hl-fn", m));

    // HTTP method
    esc = esc.replace(/\b(GET|POST|PUT|DELETE)\b/g, (m) => addToken("hl-type", m));

    // Flags
    esc = esc.replace(/(-X|-H|-G|--data-urlencode|--header|--request)\b/g, (m) => addToken("hl-flag", m));

    // Restore all tokens
    esc = esc.replace(/\x00(\d+)\x00/g, (_, idx) => tokens[Number(idx)]);
    return esc;
}

export function highlightPython(code) {
    let esc = escapeCode(code);
    const tokens = [];
    const addToken = (cls, text) => {
        tokens.push(`<span class="${cls}">${text}</span>`);
        return `\x00${tokens.length - 1}\x00`;
    };

    // Python f-strings: f"..."
    esc = esc.replace(/f"([^"\\]*(?:\\.[^"\\]*)*)"/gs, (match, content) => {
        if (!content.includes("{")) {
            return addToken("hl-str", 'f"' + content + '"');
        }
        let out = addToken("hl-str", 'f"');
        let remaining = content;
        while (remaining.length > 0) {
            const startIdx = remaining.indexOf("{");
            if (startIdx === -1) {
                out += addToken("hl-str", remaining + '"');
                break;
            }
            if (startIdx > 0) {
                out += addToken("hl-str", remaining.substring(0, startIdx));
            }
            const endIdx = remaining.indexOf("}", startIdx + 1);
            if (endIdx === -1) {
                out += addToken("hl-str", remaining.substring(startIdx) + '"');
                break;
            }
            const expr = remaining.substring(startIdx + 1, endIdx);
            out += "{" + expr + "}";
            remaining = remaining.substring(endIdx + 1);
            if (remaining.length === 0) {
                out += addToken("hl-str", '"');
            }
        }
        return out;
    });

    // Standard string literals
    esc = esc.replace(/('(?:\\'|[^'\\])*'|"(?:\\"|[^"\\])*")/g, (m) => addToken("hl-str", m));

    // Comments
    esc = esc.replace(/(^|\s)(#[^\n]*)/g, (_, p1, p2) => p1 + addToken("hl-cmt", p2));

    // Types / Classes / Libraries
    esc = esc.replace(/\b(requests|exceptions|RequestException|Exception|urllib|parse)\b/g, (m) => addToken("hl-type", m));

    // Control flow
    esc = esc.replace(/\b(try|except|raise|if|else|elif|return)\b/g, (m) => addToken("hl-ctrl", m));

    // Declaration keywords
    esc = esc.replace(/\b(import|as|from|def|class)\b/g, (m) => addToken("hl-kw", m));

    // Functions
    esc = esc.replace(/\b(get|raise_for_status|json|print|quote)\b(?=\()/g, (m) => addToken("hl-fn", m));

    // Variables
    esc = esc.replace(/\b(url|params|response|data|e|query|judet)\b/g, (m) => addToken("hl-var", m));

    // Booleans & None
    esc = esc.replace(/\b(True|False|None)\b/g, (m) => addToken("hl-bool", m));

    // Restore all tokens
    esc = esc.replace(/\x00(\d+)\x00/g, (_, idx) => tokens[Number(idx)]);
    return esc;
}

export function highlightPhp(code) {
    let esc = escapeCode(code);
    const tokens = [];
    const addToken = (cls, text) => {
        tokens.push(`<span class="${cls}">${text}</span>`);
        return `\x00${tokens.length - 1}\x00`;
    };

    // Strings
    esc = esc.replace(/('(?:\\'|[^'\\])*'|"(?:\\"|[^"\\])*")/g, (m) => addToken("hl-str", m));

    // Comments
    esc = esc.replace(/(^|\s)(\/\/[^\n]*)/g, (_, p1, p2) => p1 + addToken("hl-cmt", p2));

    // PHP open/close tags
    esc = esc.replace(/(&lt;\?php|\?&gt;)/g, (m) => addToken("hl-kw", m));

    // Control flow
    esc = esc.replace(/\b(if|else|return|try|catch)\b/g, (m) => addToken("hl-ctrl", m));

    // Keywords
    esc = esc.replace(/\b(function|new)\b/g, (m) => addToken("hl-kw", m));

    // Functions
    esc = esc.replace(/\b(echo|print_r)\b/g, (m) => addToken("hl-fn", m));
    esc = esc.replace(/\b(file_get_contents|json_decode|urlencode|http_build_query)\b(?=\()/g, (m) => addToken("hl-fn", m));

    // PHP Variables ($...)
    esc = esc.replace(/(\$[a-zA-Z_0-9]+)/g, (m) => addToken("hl-var", m));

    // Booleans & null
    esc = esc.replace(/\b(true|false|null)\b/g, (m) => addToken("hl-bool", m));

    // Restore all tokens
    esc = esc.replace(/\x00(\d+)\x00/g, (_, idx) => tokens[Number(idx)]);
    return esc;
}

export function highlightJson(code) {
    let esc = escapeCode(code);
    // Keys (VS Code light blue: #9cdcfe)
    esc = esc.replace(/("[^"]+")(?=\s*:)/g, '<span class="hl-key">$1</span>');
    // String values (VS Code orange: #ce9178)
    esc = esc.replace(/:\s*("[^"]*")/g, ': <span class="hl-str">$1</span>');
    // Numbers (VS Code light green: #b5cea8)
    esc = esc.replace(/:\s*(\b\d+\b)/g, ': <span class="hl-num">$1</span>');
    // Booleans & null (VS Code blue: #569cd6)
    esc = esc.replace(/:\s*\b(true|false|null)\b/g, ': <span class="hl-bool">$1</span>');
    return esc;
}
