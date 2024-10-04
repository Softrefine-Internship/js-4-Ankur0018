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

// Disable future dates in the date picker
const today = new Date().toISOString().split("T")[0];
inputExpenseDate.setAttribute("max", today);

const categoryTotalDisplay = document.createElement("div");
categoryTotalDisplay.id = "category-total";
document.querySelector(".expense-amount").appendChild(categoryTotalDisplay);

const formatDate = function (date) {
  const today = new Date();
  const expenseDate = new Date(date);
  const difference = Math.floor((today - expenseDate) / (1000 * 60 * 60 * 24));

  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";
  return new Date(date).toLocaleDateString("en-IN");
};

const showExpenses = function (filterCategory = "All") {
  expensesTableBody.innerHTML = "";

  const filteredExpenses =
    filterCategory === "All"
      ? expenseData.expenses
      : expenseData.expenses.filter(
          (expense) => expense.category === filterCategory
        );

  filteredExpenses.forEach((exp) => {
    const newRow = `<tr>
                    <td>${exp.name}</td>
                    <td>${exp.amount.toFixed(2)} &#8377;</td>
                    <td>${formatDate(exp.date)}</td>
                    <td>${exp.category}</td>
                    <td><button class="delete-expense" data-name="${
                      exp.name
                    }" data-date="${exp.date}" data-amount="${
      exp.amount
    }" data-category="${exp.category}">Delete</button></td>
                  </tr>`;
    document
      .querySelector("#expenses tbody")
      .insertAdjacentHTML("beforeend", newRow);
  });

  if (filterCategory !== "All") {
    displayCategoryTotal(filterCategory);
    categoryTotalDisplay.style.display = "block";
  } else {
    categoryTotalDisplay.style.display = "none";
  }
};

selectFilterCategory.addEventListener("change", function (e) {
  showExpenses(e.target.value);
});

const saveExpensesToLocalStorage = function () {
  localStorage.setItem("expenses", JSON.stringify(expenseData.expenses));
};

const displayTotalAmount = function () {
  const totalAmount = expenseData.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  expenseData.totalAmount = totalAmount;
  totalAmountDisplay.textContent = totalAmount.toFixed(2);
};

const displayCategoryTotal = function (filterCategory) {
  const categoryTotal = expenseData.expenses
    .filter((exp) => exp.category === filterCategory)
    .reduce((sum, exp) => sum + exp.amount, 0);

  categoryTotalDisplay.innerHTML = `Expense for ${filterCategory}: &#8377; ${categoryTotal.toFixed(
    2
  )}`;

  if (categoryTotal.toFixed(2) == 0.0) {
    const newRow = `<tr> <td class="errorMsgForNoExpense"> No Expenses for ${filterCategory} found !! </td> </tr>`;
    document
      .querySelector("#expenses tbody")
      .insertAdjacentHTML("beforeend", newRow);
  }
};

const updateUI = function () {
  showExpenses(selectFilterCategory.value);
  displayTotalAmount();
  saveExpensesToLocalStorage();
};

const clearInput = function () {
  inputExpenseName.value = "";
  inputExpenseDate.value = "";
  inputExpenseAmount.value = "";
  selectExpenseCategory.value = "Select Category";
};

const addExpense = function () {
  const name = inputExpenseName.value.trim();
  const amount = inputExpenseAmount.value.trim();
  const date = inputExpenseDate.value;
  const category = selectExpenseCategory.value;

  const nameError = document.querySelector(".name-error");
  const amountError = document.querySelector(".amount-error");
  const dateError = document.querySelector(".date-error");
  const categoryError = document.querySelector(".category-error");

  let isValid = true;

  // Existing validation for name, amount, etc...

  if (!date) {
    dateError.textContent = "Please select a valid date.";
    inputExpenseDate.style.border = "2px solid red";
    isValid = false;
  } else {
    // Check if the date is in the future
    const selectedDate = new Date(date);
    const currentDate = new Date(today);

    if (selectedDate > currentDate) {
      dateError.textContent = "Future dates are not allowed.";
      inputExpenseDate.style.border = "2px solid red";
      isValid = false;
    } else {
      dateError.textContent = "";
      inputExpenseDate.style.border = "";
    }
  }

  // Existing validation for category...

  if (isValid) {
    const amountAsNumber = parseFloat(amount);
    const newExpense = { name, amount: amountAsNumber, date, category };
    expenseData.expenses.push(newExpense);
    updateUI();
    clearInput();
  }
};

btnAddExpense.addEventListener("click", function (e) {
  e.preventDefault();
  addExpense();
});

// Accessing modal and overlay elements
const modal = document.createElement("div");
modal.id = "delete-modal";
modal.classList.add("hidden");
modal.innerHTML = `
  <div class="modal-content">
    <h3>Are you sure you want to delete this expense?</h3>
    <button id="confirm-delete">Yes, Delete</button>
    <button id="cancel-delete">Cancel</button>
  </div>
`;
document.body.appendChild(modal);

const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.classList.add("hidden");
document.body.appendChild(overlay);

let expenseToDelete = null;

// Function to open the confirmation modal
const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

// Function to close the modal
const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
  expenseToDelete = null;
};

// Function to delete the expense after confirmation
const deleteExpense = function (name, date, amount, category) {
  expenseData.expenses = expenseData.expenses.filter(
    (exp) =>
      exp.name !== name ||
      exp.date !== date ||
      exp.amount !== amount ||
      exp.category !== category
  );
  updateUI();
};

// Event listener for clicking delete buttons in the table
expensesTableBody.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-expense")) {
    const name = e.target.getAttribute("data-name");
    const date = e.target.getAttribute("data-date");
    const amount = parseFloat(e.target.getAttribute("data-amount"));
    const category = e.target.getAttribute("data-category");

    expenseToDelete = { name, date, amount, category };

    openModal();
  }
});

// Event listener for confirming deletion
document
  .getElementById("confirm-delete")
  .addEventListener("click", function () {
    if (expenseToDelete) {
      deleteExpense(
        expenseToDelete.name,
        expenseToDelete.date,
        expenseToDelete.amount,
        expenseToDelete.category
      );
    }
    closeModal();
  });

document.getElementById("cancel-delete").addEventListener("click", function () {
  closeModal();
});

overlay.addEventListener("click", function () {
  closeModal();
});

initializeCategoriesDropdown();
updateUI();
