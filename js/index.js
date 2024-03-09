const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');

const darkMode = document.querySelector('.dark-mode');

menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
});

darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.toggle('active');
    darkMode.querySelector('span:nth-child(2)').classList.toggle('active');
})


// Orders.forEach(order => {
//     const tr = document.createElement('tr');
//     const trContent = `
//         <td>${order.productName}</td>
//         <td>${order.productNumber}</td>
//         <td>${order.paymentStatus}</td>
//         <td class="${order.status === 'Declined' ? 'danger' : order.status === 'Pending' ? 'warning' : 'primary'}">${order.status}</td>
//         <td class="primary">Details</td>
//     `;
//     tr.innerHTML = trContent;
//     document.querySelector('table tbody').appendChild(tr);
// });

function copyToClipboard() {
    // Select the text to be copied
    var copyText = document.getElementById("copyText");

    // Create a range and select the text
    var range = document.createRange();
    range.selectNode(copyText);

    // Add the selected text to the clipboard
    window.getSelection().removeAllRanges(); // Clear previous selections
    window.getSelection().addRange(range); // Add new range

    // Use modern clipboard API for copying text
    navigator.clipboard.writeText(copyText.innerText)
      .then(function () {
        // Provide user feedback
        document.getElementById("copyButton").innerText = "Copied!";
        
        // Reset button text after a short delay
        setTimeout(function () {
          document.getElementById("copyButton").innerText = "Copy";
        }, 1700);
      })
      .catch(function (err) {
        console.error('Unable to copy text to clipboard', err);
      })
      .finally(function () {
        // Clean up the range to avoid side effects
        window.getSelection().removeAllRanges();
      });
  }


