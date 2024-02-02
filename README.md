## Documentație ui.orase

### Obiective
1. **Focus la încărcarea paginii**: Se asigură că inputul de căutare primește automat focus-ul la încărcarea paginii.
2. **Interacțiune cu API**: Se obține datele de la un API (https://orase.peviitor.ro/) și se inițiază căutarea.
3. **Căutare și afișare rezultate**: Implementează căutarea în datele primite și afișează rezultatele într-un container.

### Funcționalități și Explicații

1. **Focus la încărcarea paginii**
   ```javascript
   window.onload = function () {
       document.getElementById("searchInput").focus();
   };
   ```
   La încărcarea paginii, funcția asigură că elementul cu id-ul "searchInput" primește focus-ul.

2. **Expresii regulate pentru caractere speciale**
   ```javascript
   const aREG = new RegExp("ș", "g");
   const bREG = new RegExp("ț", "g");
   const cREG = new RegExp("â", "g");
   const dREG = new RegExp("ă", "g");
   ```
   Expresii regulate pentru caracterele speciale "ș", "ț", "â", "ă" care vor fi folosite ulterior în procesul de căutare.

3. **Funcția `getData` - Obținerea datelor de la API**
   ```javascript
   async function getData() {
       try {
           const response = await fetch(`https://orase.peviitor.ro/`);
           const data = await response.json();
           search(data);
       } catch (error) {
           console.error("Error fetching data:", error);
       }
   }
   ```
   Funcția utilizează `fetch` pentru a obține datele de la API, apoi inițiază funcția de căutare (`search`) cu datele obținute.

4. **Funcția de căutare principală `search`**
   - Acest bloc de cod se ocupă de inițializarea evenimentelor și procesul de căutare în datele primite.
   - Evenimentul de input declanșează căutarea numai dacă există cel puțin 3 caractere introduse în câmpul de căutare.
   - Rezultatele căutării sunt afișate în containerul `.searchResults`.

5. **Funcția `displayResults` - Afișare rezultate**
   - Această funcție primește rezultatele căutării și le afișează într-un container.
   - Se verifică dacă există rezultate pentru București (`resultsBucuresti`) și pentru județe (`results`) și le afișează distinct.
   - Dacă nu există rezultate, se afișează un mesaj corespunzător.
   - 
6. **Funcția `customSort` - Sortare personalizată**
   - Această funcție realizează o sortare personalizată a rezultatelor, prioritară în funcție de apropierea potrivirii la început.


7. **Funcțiile de căutare `searchMunicipiu` și `searchLocation`**
   - `searchMunicipiu`: Caută în municipii și sectoarele acestora.
   - `searchLocation`: Caută într-o locație (municipiu, oraș, comună) și recursiv în sublocațiile acesteia.

8. **Funcția `removeDuplicates` - Eliminare duplicați**
   - Elimină rezultatele duplicate pe baza județului, părintelui și numelui locației.

9. **Evenimentul de ștergere a conținutului**
   ```javascript
   const deleteIcon = document.querySelector(".delete-icon");

   deleteIcon.addEventListener("click", () => {
       document.querySelector("#searchInput").value = "";
       document.querySelector(".searchResults").innerHTML = "";
       document.querySelector(".searchResults").classList.remove("searchResults-display");
   });
   ```
   La click pe iconița de ștergere, se șterge conținutul din input și se ascunde containerul de rezultate.

### Notă
- Codul este scris într-un mod modular și organizat pentru a facilita înțelegerea și menținerea acestuia.
- Se utilizează expresii regulate pentru a gestiona corect caracterele speciale în procesul de căutare.
- Funcțiile sunt documentate prin comentarii pentru a oferi o înțelegere mai bună a logicii implementate.
