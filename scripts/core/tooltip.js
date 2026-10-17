/**
 * Custom Tooltip Floating Component
 */

export function initTooltips() {
    let tooltip = document.getElementById("app-tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "app-tooltip";
        tooltip.className = "app-tooltip";
        document.body.appendChild(tooltip);
    }

    let activeTarget = null;

    function showTooltip(el) {
        const text = el.getAttribute("data-tooltip");
        if (!text) {
            hideTooltip();
            return;
        }

        activeTarget = el;
        tooltip.textContent = text;
        tooltip.classList.add("visible");
        updatePosition(el);
    }

    function updatePosition(el) {
        const rect = el.getBoundingClientRect();
        const tipRect = tooltip.getBoundingClientRect();

        let top = rect.top - tipRect.height - 7;
        let left = rect.left + rect.width / 2 - tipRect.width / 2;
        let placement = "top";

        if (top < 8) {
            top = rect.bottom + 7;
            placement = "bottom";
        }

        if (left < 10) left = 10;
        if (left + tipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tipRect.width - 10;
        }

        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
        tooltip.setAttribute("data-placement", placement);
    }

    function hideTooltip() {
        activeTarget = null;
        tooltip.classList.remove("visible");
    }

    document.addEventListener("mouseover", (e) => {
        const target = e.target.closest("[data-tooltip]");
        if (target) {
            showTooltip(target);
        }
    });

    document.addEventListener("mouseout", (e) => {
        const target = e.target.closest("[data-tooltip]");
        if (target && target === activeTarget) {
            hideTooltip();
        }
    });

    const observer = new MutationObserver(() => {
        if (activeTarget && activeTarget.hasAttribute("data-tooltip")) {
            showTooltip(activeTarget);
        } else if (!activeTarget) {
            hideTooltip();
        }
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["data-tooltip"] });
}
