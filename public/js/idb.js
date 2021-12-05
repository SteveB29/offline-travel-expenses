let db;

const request = indexedDB.open('travel_expenses', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_expense', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadExpenses();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(expense) {
  const transaction = db.transaction(['new_expense'], 'readwrite');
  const expenseObjectStore = transaction.objectStore('new_expense');
  expenseObjectStore.add(expense);
}

function uploadExpenses(event) {
  const transaction = db.transaction(['new_expense'], 'readwrite');
  const expenseObjectStore = transaction.objectStore('new_expense');
  const getAll = expenseObjectStore.getAll();
  
  getAll.onsuccess = function() {
    // checks if there is data stored in indexedDB and adds to database if there is
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
         "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message || serverResponse.errors) {
          throw new Error(serverResponse);
        }
        const transaction = db.transaction(['new_expense'], 'readwrite');
        const expenseObjectStore = transaction.objectStore('new_expense');
        expenseObjectStore.clear();

        populatePage();
      })
      .catch(err => {
        console.log(err);
      });
    }
  };
}

window.addEventListener('online', uploadExpenses);