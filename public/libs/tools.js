function autocompleteSearch(type, searchBox, query = "") {
  fetch(`/get_${type}?${type}=${query}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (responseData) {
      if (responseData.length > 0) {
        let arr = [];
        responseData.forEach((item) => {
          arr.push(item);
        });
        arr = [...new Set(arr)];
        searchBox.textContent = "";
        arr.forEach((item) => {
          const row = document.createElement("p");
          row.classList.add("autocomplete_item");
          row.textContent = item;
          searchBox.appendChild(row);
          row.addEventListener("click", (e) => {
            const acBox = e.target.parentElement.previousElementSibling;
            acBox.value = e.target.textContent;
            searchBox.textContent = "";
          });
        });
      }
    });
}
function SearchbarsForeach(group, type) {
  let countdown;
  const runSearch = (e) => {
    clearTimeout(countdown);
    countdown = setTimeout(() => {
      if (e.target.value.length > 1) {
        const text = e.target.value;
        e.target.nextElementSibling.textContent = "";
        autocompleteSearch(type, e.target.nextElementSibling, text);
      }
      if (e.target.value.length < 2) {
        e.target.nextElementSibling.textContent = "";
      }
    }, 500);
  };

  group.forEach((searchBar) => {
    searchBar.addEventListener("input", runSearch);
  });
}
