/**
 * Core utility functions
 */

export function normalize(str) {
    if (!str || typeof str !== "string") return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[șş]/gi, "s")
        .replace(/[țţ]/gi, "t")
        .replace(/[ăâ]/gi, "a")
        .replace(/î/gi, "i")
        .toLowerCase()
        .trim();
}

export function escapeHtml(text) {
    if (!text || typeof text !== "string") return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
