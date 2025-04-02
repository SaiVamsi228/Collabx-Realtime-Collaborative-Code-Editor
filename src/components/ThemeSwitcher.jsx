// This function toggles the dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Example of a button to toggle dark mode
return (
  <button onClick={toggleDarkMode}>
    Toggle Dark Mode
  </button>
);
