/**
 * API Data Client & Local Search Indexer
 */
import { state, notifyStateChange } from "./state.js";
import { normalize } from "./utils.js";

const diacriticsFix = {
    "Arge?": "Argeș",
    "Bistri?a-Nasaud": "Bistrița-Năsăud",
    "Boto?ani": "Botoșani",
    "Bra?ov": "Brașov",
    "Calara?i": "Călărași",
    "Cara?-Severin": "Caraș-Severin",
    "Constan?a": "Constanța",
    "Dmbovi?a": "Dâmbovița",
    "Gala?i": "Galați",
    "Ialomi?a": "Ialomița",
    "Ia?i": "Iași",
    "Maramure?": "Maramureș",
    "Mehedin?i": "Mehedinți",
    "Mure?": "Mureș",
    "Neam?": "Neamț",
    "Timi?": "Timiș",
    "Vlcea": "Vâlcea",
    "Bucure?ti": "București"
};

export async function fetchCounties() {
    try {
        const resp = await fetch("https://orase.peviitor.ro/judete/");
        const data = await resp.json();
        if (data && Array.isArray(data.judete)) {
            state.judete = data.judete.map((j) => {
                let diac = j.numeDiacritice || j.nume;
                if (diacriticsFix[diac]) diac = diacriticsFix[diac];
                return {
                    nume: j.nume,
                    numeDiacritice: diac,
                    cod: j.cod
                };
            });
            notifyStateChange("counties-loaded");
        }
    } catch (err) {
        console.warn("Could not fetch /judete/ endpoint, fallback will be used", err);
    }
}

export function fetchAllLocalities() {
    fetch("https://orase.peviitor.ro/")
        .then((r) => r.json())
        .then((data) => {
            indexAllLocalities(data);
            state.isAllLoaded = true;
            notifyStateChange("localities-loaded");
        })
        .catch((err) => {
            console.warn("Could not fetch full Romania dataset:", err);
        });
}

function indexAllLocalities(data) {
    const list = [];

    function add(name, tip, judet, parent, parentTip, adresa) {
        if (!name || typeof name !== "string") return;
        const foundJudet = state.judete.find((j) => normalize(j.nume) === normalize(judet));
        const judetDiacritice = foundJudet ? foundJudet.numeDiacritice : judet;

        list.push({
            name: name.trim(),
            tip: (tip || "localitate").toLowerCase(),
            judet: judet || "",
            judetDiacritice: judetDiacritice || "",
            parent: parent || "",
            parentTip: (parentTip || "").toLowerCase(),
            adresa: Array.isArray(adresa) ? adresa : [],
            normName: normalize(name),
            normJudet: normalize(judet)
        });
    }

    function processLocList(locs, tipDefault, parentName, parentTip, judetName) {
        if (!Array.isArray(locs)) return;
        for (const item of locs) {
            if (typeof item === "string" || Array.isArray(item)) continue;
            if (item.nume) {
                add(item.nume, item.tip || tipDefault, judetName, parentName, parentTip, item.adresaCompleta);
            }
            if (Array.isArray(item.localitate)) {
                processLocList(item.localitate, "sat", item.nume, item.tip || tipDefault, judetName);
            }
            if (Array.isArray(item.adresaCompleta) && item.adresaCompleta.length > 0 && typeof item.adresaCompleta[0] === "object") {
                processLocList(item.adresaCompleta, "sat", item.nume, item.tip || tipDefault, judetName);
            }
        }
    }

    if (Array.isArray(data.judet)) {
        for (const j of data.judet) {
            const judetName = j.nume;

            if (Array.isArray(j.municipiu)) {
                for (const m of j.municipiu) {
                    add(m.nume, "municipiu", judetName, "", "", m.adresaCompleta);
                    processLocList(m.localitate, "sat", m.nume, "municipiu", judetName);
                }
            }

            if (Array.isArray(j.oras)) {
                for (const o of j.oras) {
                    add(o.nume, "oras", judetName, "", "", o.adresaCompleta);
                    processLocList(o.localitate, "sat", o.nume, "oras", judetName);
                }
            }

            if (Array.isArray(j.comuna)) {
                for (const c of j.comuna) {
                    add(c.nume, "comuna", judetName, "", "", c.adresaCompleta);
                    processLocList(c.localitate, "sat", c.nume, "comuna", judetName);
                }
            }
        }
    }

    if (data.municipiu && Array.isArray(data.municipiu.sector)) {
        for (const s of data.municipiu.sector) {
            add(s.nume, "sector", "București", "București", "municipiu", []);
        }
    }

    state.allLocalities = list;
}
