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
    console.log(data.judet);
    search(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Execute the getData function to start the process
getData();

const searchInp = document.querySelector(".searchInp");

// Search-related functions
function search(data) {
  // Get DOM elements
  const searchInput = document.getElementById("searchInput");
  const searchResultsContainer = document.getElementById("searchResults");

  // Example usage:
  searchInput.addEventListener("input", function () {
    // Get the value from the search input and clean it
    const searchedVal = searchInput.value.trim().toLowerCase();

    // Start the search after at least 3 letters
    if (searchedVal.length >= 3) {
      const searchResult = searchLocation(searchedVal, data.judet);
      const searchResultBucuresti = searchMunicipiu(
        searchedVal,
        data.municipiu
      );

      // Check if there are any matching results
      if (searchResult || searchResultBucuresti) {
        const uniqueResults = removeDuplicates(searchResult);
        // Display the results
        displayResults(uniqueResults, searchResultBucuresti);
      } else {
        displayResults([]);
      }
    } else {
      // Display a message when less than 3 letters are entered
      searchResultsContainer.innerHTML =
        "<p>Introdu minim 3 litere ca sa poata functiona searchul</p>";
    }
    // Clear results when the search input is empty
    if (searchedVal.length < 1) {
      searchResultsContainer.innerHTML = "";
    }
  });

  function displayResults(results, resultsBucuresti) {
    // Clear previous results
    searchResultsContainer.innerHTML = "";

    if (
      (results && results.length > 0) ||
      (resultsBucuresti && resultsBucuresti.length > 0)
    ) {
      const ul = document.createElement("ul");
      // Display Bucuresti results
      if (resultsBucuresti) {
        resultsBucuresti.forEach((result) => {
          const li = document.createElement("li");

          if (result.parent != null) {
            li.textContent = `${result.query.toLowerCase()},
          ${result.parent.toLowerCase()}`;
          } else {
            li.textContent = `${result.query.toLowerCase()}, ${result.query.toLowerCase()}`;
          }
          ul.appendChild(li);
        });
      }

      // Display judete results
      if (results) {
        results.forEach((result) => {
          const li = document.createElement("li");

          if (result.judet != null) {
            li.textContent = `${result.query.toLowerCase()}, 
            ${result.judet.toLowerCase()} (${result.parent.toLowerCase()})`;
          } else {
            li.textContent = `${result.query.toLowerCase()}, ${result.query.toLowerCase()}`;
          }
          ul.appendChild(li);
        });
      }

      searchResultsContainer.appendChild(ul);
    } else {
      // Display a message when no results are found
      const p = document.createElement("p");
      p.textContent = "Location not found";
      searchResultsContainer.appendChild(p);
    }
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
      const filtre =
        location.nume
          .replace(aREG, "s")
          .replace(bREG, "t")
          .replace(cREG, "a")
          .replace(dREG, "a") &&
        location.nume
          .toLowerCase()
          .replace(aREG, "s")
          .replace(bREG, "t")
          .replace(cREG, "a")
          .replace(dREG, "a")
          .includes(query) &&
        judetName
          .toLowerCase()
          .replace(aREG, "s")
          .replace(bREG, "t")
          .replace(cREG, "a")
          .replace(dREG, "a")
          .includes(query);

      if (filtre) {
        const result = {
          query: location.nume,
          parent: parentJudetName,
          judet: parentName,
          tip: location.tip || null,
        };
        matchingLocations.push(result);
        // Location found
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
            location.nume,
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
            location.nume,
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
            location.nume,
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
        const key = `${result.judet}-${result.judet}-${result.parent}`;

        if (
          (result.judet !== result.parent && result.judet !== result.query) ||
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
