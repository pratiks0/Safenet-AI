console.log("Content script running...");

// 1. Inline HTML for the widget with input type selector for text vs. image
const widgetHTML = `
<div id="toxic-widget-container">
  <div id="toxic-toggle-button">
    <button id="toggle-btn">Open Classifier</button>
  </div>
  <div id="toxic-panel" style="display: none;">
    <div id="toxic-panel-header">
      <span>Toxicity Classifier</span>
      <button id="close-panel">X</button>
    </div>
    <div id="toxic-panel-body">
      <!-- Input Type Selector -->
      <div id="input-type-selector">
         <label><input type="radio" name="inputType" value="text" checked> Text</label>
         <label><input type="radio" name="inputType" value="image"> Image</label>
      </div>
      <!-- Text Input Section -->
      <div id="text-input-section">
         <textarea id="toxic-text-input" placeholder="Enter text..."></textarea>
      </div>
      <!-- Image Input Section -->
      <div id="image-input-section" style="display: none;">
         <input type="file" id="toxic-image-input" accept="image/*">
      </div>
      <button id="toxic-submit">Classify</button>
      <div id="toxic-result"></div>
    </div>
  </div>
</div>
`;

// 2. Inject the widget HTML into the current page
const container = document.createElement('div');
container.innerHTML = widgetHTML;
document.body.appendChild(container);

// 3. Get references to elements
const toggleButton = document.getElementById('toggle-btn');
const panel = document.getElementById('toxic-panel');
const closePanelBtn = document.getElementById('close-panel');
const submitButton = document.getElementById('toxic-submit');
const textInputSection = document.getElementById('text-input-section');
const imageInputSection = document.getElementById('image-input-section');
const toxicTextInput = document.getElementById('toxic-text-input');
const toxicImageInput = document.getElementById('toxic-image-input');
const resultDiv = document.getElementById('toxic-result');
const inputTypeRadios = document.getElementsByName('inputType');

// 4. Toggle panel open/closed when "Open Classifier" is clicked
toggleButton.addEventListener('click', () => {
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    toggleButton.textContent = "Hide Classifier";
  } else {
    panel.style.display = 'none';
    toggleButton.textContent = "Open Classifier";
  }
});

// 5. Close panel with the "X" button
closePanelBtn.addEventListener('click', () => {
  panel.style.display = 'none';
  toggleButton.textContent = "Open Classifier";
});

// 6. Listen for changes in input type and show/hide sections
for (let radio of inputTypeRadios) {
  radio.addEventListener('change', () => {
    if (radio.value === 'text' && radio.checked) {
      textInputSection.style.display = 'block';
      imageInputSection.style.display = 'none';
    } else if (radio.value === 'image' && radio.checked) {
      textInputSection.style.display = 'none';
      imageInputSection.style.display = 'block';
    }
  });
}

// 7. Helper function: Read selected image file as Base64
function readImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // The result includes the data URI header (e.g., "data:image/jpeg;base64,")
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

// 8. Classify button logic
submitButton.addEventListener('click', async () => {
  // Determine input type (text or image)
  let selectedType = "text";
  for (let radio of inputTypeRadios) {
    if (radio.checked) {
      selectedType = radio.value;
      break;
    }
  }
  
  // Prepare request payload
  let payload = { type: selectedType };
  
  if (selectedType === "text") {
    const text = toxicTextInput.value.trim();
    if (!text) {
      resultDiv.textContent = "Please enter some text.";
      return;
    }
    payload.text = text;
  } else if (selectedType === "image") {
    const files = toxicImageInput.files;
    if (!files || files.length === 0) {
      resultDiv.textContent = "Please select an image file.";
      return;
    }
    try {
      const base64Image = await readImageAsBase64(files[0]);
      payload.image = base64Image;
    } catch (error) {
      console.error("Error reading image:", error);
      resultDiv.textContent = "Error processing the image.";
      return;
    }
  }
  
  resultDiv.textContent = "Classifying...";
  
  // Replace with your actual API endpoint
  fetch('https://harm-api.onrender.com/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => {
    console.log("API response status:", response.status);
    return response.json();
  })
  .then(data => {
    console.log("API response data:", data);
    if (data.error) {
      resultDiv.textContent = "Error: " + data.error;
    } else {
      resultDiv.textContent = "Prediction: " + data.label;
    }
  })
  .catch(error => {
    console.error("Error calling the API:", error);
    resultDiv.textContent = "Error during classification.";
  });
});