let db;

const request = indexedDB.open('travel_expenses', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_expense', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // if (navigator.onLine) {
  //   uploadExpenses();
  // }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(expense) {
  const transaction = db.transaction(['new_expense'], 'readwrite');
  const expenseObjectStore = transaction.objectStore('new_expense');
  expenseObjectStore.add(expense);
}