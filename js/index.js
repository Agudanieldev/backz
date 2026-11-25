const sideMenu = document.querySelector("aside");
const menuBtn = document.getElementById("menu-btn");
const closeBtn = document.getElementById("close-btn");
const darkMode = document.querySelector(".dark-mode");

if (menuBtn && sideMenu) {
  menuBtn.addEventListener("click", () => {
    sideMenu.style.display = "block";
  });
}

if (closeBtn && sideMenu) {
  closeBtn.addEventListener("click", () => {
    sideMenu.style.display = "none";
  });
}

if (darkMode) {
  darkMode.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode-variables");
    darkMode.querySelector("span:nth-child(1)")?.classList.toggle("active");
    darkMode.querySelector("span:nth-child(2)")?.classList.toggle("active");
  });
}

function copyToClipboard() {
  const copyText = document.getElementById("copyText");
  if (!copyText) return;

  navigator.clipboard
    .writeText(copyText.innerText.trim())
    .then(() => {
      const button = document.getElementById("copyButton");
      if (!button) return;
      button.innerText = "Copied!";
      setTimeout(() => {
        button.innerText = "Copy";
      }, 1700);
    })
    .catch((error) => console.error("Unable to copy:", error));
}

window.copyToClipboard = copyToClipboard;
