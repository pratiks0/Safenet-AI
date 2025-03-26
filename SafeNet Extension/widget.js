// widget.js
document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById('toggle-btn');
    const panel = document.getElementById('toxic-panel');
    const closePanelBtn = document.getElementById('close-panel');
    const submitButton = document.getElementById('toxic-submit');
    const inputField = document.getElementById('toxic-input');
    const resultDiv = document.getElementById('toxic-result');
  
    // Toggle panel visibility
    toggleButton.addEventListener('click', () => {
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
        toggleButton.textContent = "Hide Classifier";
      } else {
        panel.style.display = 'none';
        toggleButton.textContent = "Open Classifier";
      }
    });
  
    // Close panel with "X" button
    closePanelBtn.addEventListener('click', () => {
      panel.style.display = 'none';
      toggleButton.textContent = "Open Classifier";
    });
  
    // Classification logic
    submitButton.addEventListener('click', function() {
      const text = inputField.value.trim();
      if (!text) {
        resultDiv.textContent = "Please enter some text.";
        return;
      }
      resultDiv.textContent = "Classifying...";
  
      // Replace with your actual API endpoint, e.g. "https://myflaskapi.onrender.com/classify"
      fetch('https://harm-api.onrender.com/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          resultDiv.textContent = "Error: " + data.error;
        } else {
          // data.label is your predicted category
          resultDiv.textContent = "Prediction: " + data.label;
        }
      })
      .catch(error => {
        console.error("Error calling the API:", error);
        resultDiv.textContent = "Error during classification.";
      });
    });
  });
  