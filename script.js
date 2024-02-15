window.onload = function () {
  document.getElementById("searchInput").focus();
};

// Define regular expressions for special characters
const aREG = new RegExp("ș", "g");
const bREG = new RegExp("ț", "g");
const cREG = new RegExp("â", "g");
const dREG = new RegExp("ă", "g");

// Fetch data from the API and initiate the search
async function getData() {
  try {
    const response = await fetch(`https://orase.peviitor.ro/`);
    const data = await response.json();
    search(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

getData();

const cardTemplate = document.querySelector("[data-template]");
const cardContainer = document.querySelector("[data-container]");

const searchInp = document.querySelector(".searchInp");

function validateInput(input) {
  // Use a regular expression to check if the input contains letters, special characters, or spaces
  var regex = /^[a-zA-ZșțâăŞŢÂĂ\s]+$/;
  if (!regex.test(input.value)) {
    // If input is invalid, clear the input value
    input.value = input.value.replace(/[^a-zA-ZșțâăŞŢÂĂ\s]/g, "");
  }
}

function search(data) {
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", function () {
    validateInput(searchInput);
    const searchedVal = searchInput.value.trim().toLowerCase();

    if (searchedVal.length >= 3) {
      const searchResult = searchLocation(searchedVal, data.judet);
      const searchResultBucuresti = searchMunicipiu(
        searchedVal,
        data.municipiu
      );

      if (searchResult || searchResultBucuresti) {
        const uniqueResults = removeDuplicates(searchResult);
        displayResults(uniqueResults, searchResultBucuresti);
      } else {
        displayResults([]);
      }
    } else {
      cardContainer.classList.add("searchResults-display");
      cardContainer.innerHTML =
        "<p>Introdu minim 3 litere ca sa poata functiona searchul</p>";
    }

    if (searchedVal.length < 1) {
      searchInput.style.width = "auto";
      cardContainer.classList.remove("searchResults-display");
      cardContainer.innerHTML = "";
    }
  });

  // Add an event listener to handle paste events
  searchInput.addEventListener("paste", function (event) {
    event.preventDefault();

    const pastedText = event.clipboardData.getData("text");
    searchInput.value = pastedText;

    const searchedVal = pastedText.trim().toLowerCase();
    if (searchedVal.length >= 3) {
      const searchResult = searchLocation(searchedVal, data.judet);
      const searchResultBucuresti = searchMunicipiu(
        searchedVal,
        data.municipiu
      );

      if (searchResult || searchResultBucuresti) {
        const uniqueResults = removeDuplicates(searchResult);
        displayResults(uniqueResults, searchResultBucuresti);
      } else {
        displayResults([]);
      }
    } else {
      cardContainer.classList.add("searchResults-display");
      cardContainer.innerHTML =
        "<p>Introdu minim 3 litere ca sa poata functiona searchul</p>";
    }
  });

  // Add an event listener to the search results container
  cardContainer.addEventListener("click", function (event) {
    const divElement = event.target.closest("div");

    const checkDivText = divElement.innerHTML.includes(
      "<p>Introdu minim 3 litere ca sa poata functiona searchul</p>"
    );

    const checkDivText2 = divElement.innerHTML.includes(
      "Locatia nu a fost gasita!"
    );

    if (divElement && !checkDivText && !checkDivText2) {
      const selectedLocation = divElement.innerText;
      // Add space between words
      const spacedLocation = selectedLocation.replace(/\s+/g, " ");

      searchInput.style.width = `${spacedLocation.length * 9}px`;
      searchInput.value = spacedLocation;
      cardContainer.classList.remove("searchResults-display");
      cardContainer.innerHTML = "";
    }
  });

  function displayResults(results, resultsBucuresti) {
    cardContainer.innerHTML = "";

    if (
      (results && results.length > 0) ||
      (resultsBucuresti && resultsBucuresti.length > 0)
    ) {
      const searchTerm = searchInput.value.trim().toLowerCase();

      // Custom sorting function based on the closeness of the match to the beginning
      const customSort = (a, b) => {
        const aIndex =
          a.query.toLowerCase().indexOf(searchTerm) &&
          a.query
            .toLowerCase()

            .replace(aREG, "s")
            .replace(bREG, "t")
            .replace(cREG, "a")
            .replace(dREG, "a")
            .indexOf(searchTerm);
        const bIndex =
          b.query.toLowerCase().indexOf(searchTerm) &&
          b.query
            .toLowerCase()

            .replace(aREG, "s")
            .replace(bREG, "t")
            .replace(cREG, "a")
            .replace(dREG, "a")
            .indexOf(searchTerm);

        // If the search term is present in both items, sort based on the index
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex || a.query.localeCompare(b.query);
        }

        // If only one of the items contains the search term, prioritize it
        if (aIndex !== -1) {
          return -1;
        }
        if (bIndex !== -1) {
          return 1;
        }

        // If neither item contains the search term, sort alphabetically
        return a.query.localeCompare(b.query);
      };

      // Sort the results array using the custom sort function
      const sortedResults = results.sort(customSort);
      // Display Bucuresti results
      if (resultsBucuresti) {
        resultsBucuresti.forEach((result) => {
          const card = cardTemplate.content.cloneNode(true).children[0];
          const dataQuery = card.querySelector("[data-query]");
          const dataParent = card.querySelector("[data-parent]");
          if (result.parent != null) {
            dataQuery.textContent = result.query + ",";
            dataParent.textContent = result.parent.toLowerCase();
          } else {
            dataQuery.textContent = result.query.toLowerCase() + ",";
            dataParent.textContent = result.query.toLowerCase();
          }

          dataQuery.style.textTransform = "capitalize";
          dataParent.style.textTransform = "capitalize";

          cardContainer.appendChild(card);
        });
      }

      // Display judete results
      if (results) {
        sortedResults.forEach((result) => {
          const card = cardTemplate.content.cloneNode(true).children[0];
          const dataQuery = card.querySelector("[data-query]");
          const dataParent = card.querySelector("[data-parent]");
          const dataJudet = card.querySelector("[data-judet]");

          const keywordsToCheck = ["de", "lui", "cu", "din", "cel", "la", "II"];

          const keywordMatchQuery = keywordsToCheck.some((keyword) =>
            result.query.includes(keyword)
          );
          const keywordMatchParent = keywordsToCheck.some(
            (keyword) =>
              result.parent !== null && result.parent.includes(keyword)
          );

          if (result.judet !== null) {
            dataQuery.textContent = `${
              keywordMatchQuery
                ? result.query + ","
                : result.query.toLowerCase() + ","
            }`;
            dataJudet.textContent = result.judet.toLowerCase();
            dataParent.textContent = `${
              result.tip !== null
                ? `(${
                    keywordMatchParent
                      ? result.parent
                      : result.parent.toLowerCase()
                  })`
                : ""
            }`;
          } else {
            dataQuery.textContent = `${
              keywordMatchQuery
                ? result.query + ","
                : result.query.toLowerCase() + ","
            }`;
            dataParent.textContent = result.query.toLowerCase();
          }

          if (!keywordMatchQuery) {
            dataQuery.style.textTransform = "capitalize";
            dataJudet.style.textTransform = "capitalize";
            if (!keywordMatchParent) {
              dataParent.style.textTransform = "capitalize";
            }
          } else {
            if (!keywordMatchParent) {
              dataParent.style.textTransform = "capitalize";
            }
            dataJudet.style.textTransform = "capitalize";
          }

          cardContainer.appendChild(card);
        });
      }
    } else {
      const p = document.createElement("p");
      p.textContent = "Locatia nu a fost gasita!";
      cardContainer.appendChild(p);
    }

    cardContainer.classList.add("searchResults-display");
  }

  function searchMunicipiu(query, locations) {
    let matchingLocations = [];

    const filtre = locations.nume
      .toLowerCase()
      .replace(aREG, "s")
      .includes(query);

    if (filtre) {
      const result = {
        query: locations.nume,
      };
      matchingLocations.push(result);
    }

    for (const sector of locations.sector) {
      if (sector.nume.toLowerCase().includes(query)) {
        matchingLocations.push({
          query: sector.nume,
          parent: locations.nume,
        });
      }
    }
    return matchingLocations.length > 0 ? matchingLocations : null;
  }

  function searchLocation(
    query,
    locations,
    parentJudetName = null,
    parentName = null
  ) {
    let matchingLocations = [];

    for (const location of locations) {
      const judetName = location.nume ? location.nume : parentJudetName;
      const filtre = judetName
        .toLowerCase()
        .replace(aREG, "s")
        .replace(bREG, "t")
        .replace(cREG, "a")
        .replace(dREG, "a")
        .includes(query);

      const filtreDiacritice = judetName.toLowerCase().includes(query);

      if (filtre || filtreDiacritice) {
        const result = {
          query: location.nume,
          judet: parentName,
          parent: parentJudetName,
          tip: location.tip || null,
        };
        matchingLocations.push(result);
      }

      // Recursively search in municipality, city, and commune levels
      if (location.municipiu) {
        const municipiuResult = searchLocation(
          query,
          location.municipiu,
          location.nume,
          judetName
        );
        if (municipiuResult != null) {
          matchingLocations.push(
            ...municipiuResult.filter((result) => result !== null)
          );
        }

        for (const municipiuLocation of location.municipiu) {
          const localitateResult = searchLocation(
            query,
            municipiuLocation.localitate,
            municipiuLocation.nume,
            judetName
          );

          if (localitateResult != null) {
            matchingLocations.push(
              ...localitateResult.filter((result) => result !== null)
            );
          }

          for (const nestedLocalitate of municipiuLocation.localitate) {
            const nestedLocalitateResults = searchLocation(
              query,
              [nestedLocalitate],
              municipiuLocation.nume,
              judetName
            );

            if (nestedLocalitateResults != null) {
              matchingLocations.push(
                ...nestedLocalitateResults.filter((result) => result !== null)
              );
            }
            if (nestedLocalitate.localitate != undefined) {
              for (const nestedLocalitate2 of nestedLocalitate.localitate) {
                const nestedLocalitateResults2 = searchLocation(
                  query,
                  [nestedLocalitate2],
                  municipiuLocation.nume,
                  judetName
                );
                if (nestedLocalitateResults2 != null) {
                  matchingLocations.push(
                    ...nestedLocalitateResults2.filter(
                      (result) => result !== null
                    )
                  );
                }
              }
            }
          }
        }
      }

      if (location.oras) {
        const orasResult = searchLocation(
          query,
          location.oras,
          location.nume,
          judetName
        );

        if (orasResult != null) {
          matchingLocations.push(
            ...orasResult.filter((result) => result !== null)
          );
        }

        for (const orasLocation of location.oras) {
          const localitateResult = searchLocation(
            query,
            orasLocation.localitate,
            orasLocation.nume,
            judetName
          );

          if (localitateResult != null) {
            matchingLocations.push(
              ...localitateResult.filter((result) => result !== null)
            );
          }

          for (const nestedLocalitate of orasLocation.localitate) {
            const nestedLocalitateResults = searchLocation(
              query,
              [nestedLocalitate],
              orasLocation.nume,
              judetName
            );
            if (nestedLocalitateResults != null) {
              matchingLocations.push(
                ...nestedLocalitateResults.filter((result) => result !== null)
              );
            }
            if (nestedLocalitate.localitate != undefined) {
              for (const nestedLocalitate2 of nestedLocalitate.localitate) {
                const nestedLocalitateResults2 = searchLocation(
                  query,
                  [nestedLocalitate2],
                  orasLocation.nume,
                  judetName
                );
                if (nestedLocalitateResults2 != null) {
                  matchingLocations.push(
                    ...nestedLocalitateResults2.filter(
                      (result) => result !== null
                    )
                  );
                }
              }
            }
          }
        }
      }

      if (location.comuna) {
        const comunaResult = searchLocation(
          query,
          location.comuna,
          location.nume,
          judetName
        );
        if (comunaResult != null) {
          matchingLocations.push(
            ...comunaResult.filter((result) => result !== null)
          );
        }

        for (const comunaLocation of location.comuna) {
          const localitateResult = searchLocation(
            query,
            comunaLocation.localitate,
            comunaLocation.nume,
            judetName
          );

          if (localitateResult != null) {
            matchingLocations.push(
              ...localitateResult.filter((result) => result !== null)
            );
          }

          for (const nestedLocalitate of comunaLocation.localitate) {
            const nestedLocalitateResults = searchLocation(
              query,
              [nestedLocalitate],
              comunaLocation.nume,
              judetName
            );
            if (nestedLocalitateResults != null) {
              matchingLocations.push(
                ...nestedLocalitateResults.filter((result) => result !== null)
              );
            }
            if (nestedLocalitate.localitate != undefined) {
              for (const nestedLocalitate2 of nestedLocalitate.localitate) {
                const nestedLocalitateResults2 = searchLocation(
                  query,
                  [nestedLocalitate2],
                  comunaLocation.nume,
                  judetName
                );
                if (nestedLocalitateResults2 != null) {
                  matchingLocations.push(
                    ...nestedLocalitateResults2.filter(
                      (result) => result !== null
                    )
                  );
                }
              }
            }
          }
        }
      }
    }
    return matchingLocations.length > 0 ? matchingLocations : null;
  }

  // Function to remove duplicates based on judet, parent
  function removeDuplicates(results) {
    const uniqueResults = [];
    const seenResults = new Set();

    if (results != null) {
      for (const result of results) {
        const key = `${result.judet}-${result.parent}-${result.query}`;
        if (
          (result.judet !== result.query && result.query !== result.parent) ||
          (result.judet === null && result.parent === null)
        ) {
          if (!seenResults.has(key)) {
            seenResults.add(key);

            uniqueResults.push(result);
          }
        }
      }
    }
    return uniqueResults;
  }
}

const deleteIcon = document.querySelector(".delete-icon");

deleteIcon.addEventListener("click", () => {
  document.querySelector("#searchInput").style.width = "auto";
  document.querySelector("#searchInput").value = "";
  document.querySelector(".searchResults").innerHTML = "";
  document
    .querySelector(".searchResults")
    .classList.remove("searchResults-display");
});
