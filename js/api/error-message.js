// js/api/error-message.js

export function displayErrorMessage(message, containerSelector = "#error-message") {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.style.display = "block";
  container.textContent = message;
}

export function removeErrorMessage(containerSelector = "#error-message") {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.style.display = "none";
  container.textContent = "";
}
