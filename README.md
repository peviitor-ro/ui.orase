<h3 align="center">Căutare Locații: România</h3>

<div align="center">
   
  [![Status](https://img.shields.io/badge/status-active-success.svg)]() 
  [![GitHub Issues](https://img.shields.io/github/issues/peviitor-ro/ui.orase.svg)](https://github.com/peviitor-ro/ui.orase/issues)
  [![GitHub Pull Requests](https://img.shields.io/github/issues-pr/peviitor-ro/ui.orase.svg)](https://github.com/peviitor-ro/ui.orase/pulls)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/peviitor-ro/ui.orase/blob/main/LICENSE)
  
</div>

## 🌍 Documentație ui.orase

## 📄 Descriere Proiect
Acest proiect constă într-un motor de căutare creat pentru identificarea orașelor, satelor și localităților din România, folosind un API endpoint specific. Utilizatorii pot introduce numele unei locații într-un câmp de căutare, iar apoi vor primi rezultate relevante despre acea locatie sau locații similare din întreaga țară.

## 🛠️ Tehnologii folosite
Tehnologiile principale utilizate în acest proiect sunt:
- <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="html5" width="18"/> HTML: Structura de bază a paginii web.
- <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" alt="css3" width="18"/> CSS: Stilizarea și formatarea paginii pentru o experiență vizuală plăcută.
- <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="15"/> JavaScript: Logica de programare pentru gestionarea evenimentelor, interacțiunea cu API-ul și afișarea rezultatelor.

## Design
https://www.figma.com/design/89A95fEUgMbRi7nK1XqeLN/peviitor---UI_API_ORASE?node-id=0-1&p=f&t=qJoDApzIS7vA6oU9-0


## 🎯 Obiective
1. **🔍 Focus la încărcarea paginii**: Se asigură că inputul de căutare primește automat focus-ul la încărcarea paginii.
2. **🔄 Interacțiune cu API**: Se obțin datele de la un API (https://orase.peviitor.ro/) și se inițiază căutarea.
3. **🔎 Căutare și afișare rezultate**: Implementează căutarea în datele primite și afișează rezultatele într-un container.

## 📚 Referințe API

### API Endpoint
- Proiectul utilizează API-ul de căutare al localităților din România, disponibil la următoarea adresă:
  - Endpoint: https://orase.peviitor.ro/
  - Acesta furnizează datele necesare pentru căutarea orașelor, satelor și localităților din România.

### 🌐 Exemplu de răspuns
- Răspunsul obținut de la API este un obiect JSON care conține informații despre judete, orase, comune. Structura datelor ar putea fi reprezentată astfel:

Exemplu de răspuns JSON:
```json
{
  "proiect": "LEGE nr. 2 din 16 februarie 1968",
  "url": "https://legislatie.just.ro/Public/DetaliiDocument/189",
  "nume": "România",
  "judet": [
    {
      "nume": "Alba",
      "minicipiu": [
        {
          "nume": "Alba Iulia",
          "localitate": [
            {
              "nume": "ALBA IULIA",
              "tip": "oras"
            },
            {
              "nume": "Bărăbanț",
              "tip": "sat"
            }
          ]
        },
        // ... alte municipii
      ],
      "oras": [
        {
          "nume": "Abrud",
          "localitate": [
            {
              "nume": "Abrud",
              "tip": "oras"
            },
            {
              "nume": "Abrud-Sat",
              "tip": "sat"
            }
          ]
        },
        // ... alte orase
      ],
      "comuna": [
        {
          "nume": "Albac",
          "localitate": [
            {
              "nume": "Albac",
              "tip": "sat"
            },
            {
              "nume": "Bărăști",
              "tip": "sat"
            }
          ]
        },
        // ... alte comune
      ]
    },
    // ... alte județe
  ],
  "municipiu": {
    "nume": "BUCUREȘTI",
    "sector": [
      // ... sectoarele Bucureștiului
    ]
  }
}
```

## 🚀 Descărcare și Instalare

### 1. Descarcă Ultimul Release
- Accesează [pagina de releases](https://github.com/peviitor-ro/ui.orase/releases) pe GitHub.
- Alege ultima versiune de release.
- Descarcă fișierul arhivă.

### 2. Extrage Arhiva
- Deschide arhiva descărcată.
- Extrage conținutul într-un folder din calculatorul tău.

### 3. Deschide Pagina HTML în Browser
- Intră în folderul unde a fost extras proiectului.
- Deschideți fișierul index.html într-un browser web pentru a vedea aplicația.

## 🎛️ Funcționalități și Explicații

1. **👁️ Focus la încărcarea paginii**
   ```javascript
   window.onload = function () {
       document.getElementById("searchInput").focus();
   };
   ```
   La încărcarea paginii, funcția asigură că elementul cu id-ul "searchInput" primește focus-ul.

2. **🔤 Expresii regulate pentru caractere speciale**
   ```javascript
   const aREG = new RegExp("ș", "g");
   const bREG = new RegExp("ț", "g");
   const cREG = new RegExp("â", "g");
   const dREG = new RegExp("ă", "g");
   ```
   Expresii regulate pentru caracterele speciale "ș", "ț", "â", "ă" care vor fi folosite ulterior în procesul de căutare.

3. **🔄 Funcția `fetchData` - Obținerea datelor de la API**
   ```javascript
   async function fetchData() {
       try {
           const response = await fetch(`https://orase.peviitor.ro/`);
           const data = await response.json();
            performSearch(data);
            renderDropdown(data);
       } catch (error) {
           console.error("Error fetching data:", error);
       }
   }
   ```
   Funcția utilizează `fetch` pentru a obține datele de la API, apoi inițiază funcția de căutare (`performSearch`) cu datele obținute.

4. **🔢 Funcția `renderDropdown`**
   - Afișare meniu dropdown cu toate judetele
   - La click pe un judet, functia `displaySelectedData` este apelata pentru a afisa toate locatiile (municipii, orase, comune) din acel judet

     **Funcționalități cheie:**
      1. **🌐Generare meniu dropdown:**
            - Se realizează sortarea alfabetică a datelor și apoi se afișează acestea în meniul dropdown.
            - La click pe câmpul de căutare și dacă acesta este gol, meniul dropdown va afișa județele Romaniei.

      2. **🔍Afișarea inițială:**
            - Se afișează toate județele.
            - Dacă utilizatorul dă click pe un judet, se apelează funcția displaySelectedData care afișează toate locațiile din acel judet și adaugă butonul "Înapoi".

      3. **🔙Generare buton de înapoi:**
            - Se adaugă un buton de "Înapoi" pentru a permite utilizatorului să revină la nivelul anterior din meniul dropdown.


5. **🔍 Funcția de căutare principală `performSearch`**
   - Acest bloc de cod se ocupă de inițializarea evenimentelor și procesul de căutare în datele primite.
   - Evenimentul de input declanșează căutarea numai dacă există cel puțin 3 caractere introduse în câmpul de căutare.
   - Rezultatele căutării sunt afișate în containerul `.searchResults`.

     **Funcționalități cheie:**
      1. **📊 Funcția `displayResults` - Afișare rezultate**
            - Această funcție primește rezultatele căutării și le afișează într-un container.
            - Se verifică dacă există rezultate pentru București (`resultsBucuresti`) și pentru județe (`results`) și le afișează distinct.
            - Dacă nu există rezultate, se afișează un mesaj corespunzător.

      2. **🔄 Funcția `customSort` - Sortare personalizată**
            - Această funcție realizează o sortare personalizată a rezultatelor, prioritară în funcție de apropierea potrivirii la început.

      3. **🔍 Funcțiile de căutare `searchMunicipiu` și `searchLocation`**
            - `searchMunicipiu`: Caută în municipii și sectoarele acestora.
            - `searchLocation`: Caută într-o locație (municipiu, oraș, comună) și recursiv în sublocațiile acesteia.

      4. **🗑️ Funcția `removeDuplicates` - Eliminare duplicați**
            - Elimină rezultatele duplicate pe baza județului, părintelui și numelui locației.

7. **🧹 Evenimentul de ștergere a conținutului**
   ```javascript
   const deleteIcon = document.querySelector(".delete-icon");

   deleteIcon.addEventListener("click", () => {
       document.querySelector("#searchInput").value = "";
       document.querySelector(".searchResults").innerHTML = "";
       document.querySelector(".searchResults").classList.remove("searchResults-display");
   });
   ```
   La click pe iconița de ștergere, se șterge conținutul din input și se ascunde containerul de rezultate.

### 📝 Notă
- Codul este scris într-un mod modular și organizat pentru a facilita înțelegerea și menținerea acestuia.
- Se utilizează expresii regulate pentru a gestiona corect caracterele speciale în procesul de căutare.
- Funcțiile sunt documentate prin comentarii pentru a oferi o înțelegere mai bună a logicii implementate.
