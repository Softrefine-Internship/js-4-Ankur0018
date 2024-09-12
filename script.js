"use strict";

const expenseData = {
  expenses: JSON.parse(localStorage.getItem("expenses")) || [],
  categories: ["Food", "Transport", "Entertainment", "Utilities", "Others"],
  totalAmount: 0,
};

const inputExpenseName = document.getElementById("expense-name");
const inputExpenseAmount = document.getElementById("expense-amount");
const inputExpenseDate = document.getElementById("expense-date");
const selectExpenseCategory = document.getElementById("expense-category");
const selectFilterCategory = document.getElementById("filter-dropdown");
const btnAddExpense = document.getElementById("add-expense");
const expensesTableBody = document.querySelector("#expenses tbody");
const totalAmountDisplay = document.getElementById("total-amount");

const initializeCategoriesDropdown = function () {
  expenseData.categories.forEach((category) => {
    //Adding Options in both Category and Filter Select field

    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    selectExpenseCategory.appendChild(option);

    const filterOption = document.createElement("option");
    filterOption.value = category;
    filterOption.textContent = category;
    selectFilterCategory.appendChild(filterOption);
  });
};

//Showing Expenses function

const showExpenses = function (filterCategory = "All") {
  expensesTableBody.innerHTML = "";

  const filteredExpenses =
    filterCategory == "All"
      ? expenseData.expenses
      : expenseData.expenses.filter(
          (expense) => expense.category === filterCategory
        );

  filteredExpenses.forEach((exp, i) => {
    const newRow = `<tr>
              <td>${exp.name}</td>
              <td>${exp.amount.toFixed(2)} &#8377;</td>
              <td>${new Date(exp.date).toLocaleDateString()}</td>
              <td>${exp.category}</td>
              <td><button class="delete-expense" data-index="${i}">Delete</button></td>
            </tr>`;

    expensesTableBody.insertAdjacentHTML("beforeend", newRow);
  });
};

//Saving Expenses to Local Data
const saveExpensesToLocalStorage = function () {
  localStorage.setItem("expenses", JSON.stringify(expenseData.expenses));
};

// Updating Total Expense and display too

const displayTotalAmount = function () {
  const totalAmount = expenseData.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  expenseData.totalAmount = totalAmount;
  totalAmountDisplay.textContent = totalAmount.toFixed(2);
};

//Updating UI

const updateUI = function () {
  showExpenses(selectFilterCategory.value);
  displayTotalAmount();
  saveExpensesToLocalStorage();
};

//Clear Form Inputs Function

const clearInput = function () {
  inputExpenseName.value = "";
  inputExpenseDate.value = "";
  inputExpenseAmount.value = "";
  selectExpenseCategory.value = "Select Category";
};

//Form Validation and Functionality && Adding expense to the body

const addExpense = function () {
  const name = inputExpenseName.value;
  const amount = +inputExpenseAmount.value;
  const date = inputExpenseDate.value;
  const category = selectExpenseCategory.value;

  if (name && !isNaN(amount) && date && category) {
    const newExpense = {
      name,
      amount,
      date,
      category,
    };

    expenseData.expenses.push(newExpense);
    updateUI();
    clearInput();
  } else {
    alert("Please fill out all fields correctly.");
  }
};

//Events
btnAddExpense.addEventListener("click", function (e) {
  e.preventDefault();
  addExpense();
});

window.onload = function () {
  initializeCategoriesDropdown();
  updateUI();
};
