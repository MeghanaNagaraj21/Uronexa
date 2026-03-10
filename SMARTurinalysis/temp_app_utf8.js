document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');
    const imagePreview = document.getElementById('image-preview');
    const btnCancel = document.getElementById('btn-cancel');
    const btnAnalyze = document.getElementById('btn-analyze');
    const loadingArea = document.getElementById('loading-area');
    const resultsSection = document.getElementById('results-section');
    const uploadSection = document.querySelector('.upload-section');
    const resultsGrid = document.getElementById('results-grid');
    const btnNewTest = document.getElementById('btn-new-test');

    let selectedFile = null;

    // Trigger file input dialog on click
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    // Handle standard file selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelection(e.target.files[0]);
        }
    });

    function handleFileSelection(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropZone.classList.add('hidden');
            previewArea.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Cancel selection
    btnCancel.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        previewArea.classList.add('hidden');
        dropZone.classList.remove('hidden');
    });

    // Start New Test
    btnNewTest.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        btnCancel.click(); // Reset upload state
    });

    // Analyze Button
    btnAnalyze.addEventListener('click', async () => {
        if (!selectedFile) return;

        // UI State: Loading
        previewArea.classList.add('hidden');
        loadingArea.classList.remove('hidden');

        // Prepare Data
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                renderResults(data.results);

                // Show the debug image processed by OpenCV
                if (data.debug_image_path) {
                    // Update preview with debug image and show it again instead of hiding it
                    imagePreview.src = '/' + data.debug_image_path;
                    previewArea.classList.remove('hidden');
                    btnAnalyze.classList.add('hidden'); // Hide analyze button once analyzed
                    btnCancel.classList.add('hidden'); // Hide cancel button
                } else {
                    uploadSection.classList.add('hidden');
                }

                loadingArea.classList.add('hidden');
                resultsSection.classList.remove('hidden');
            } else {
                alert('Analysis failed: ' + (data.error || 'Unknown error'));
                loadingArea.classList.add('hidden');
                previewArea.classList.remove('hidden');
            }
        } catch (error) {
            alert('Network error occurred during analysis.');
            loadingArea.classList.add('hidden');
            previewArea.classList.remove('hidden');
            console.error(error);
        }
    });

    function renderResults(results) {
        resultsGrid.innerHTML = ''; // clear old results

        // Define the order from top to bottom of a standard stick
        const keys = [
            "Leukocytes", "Nitrite", "Urobilinogen", "Protein", "pH",
            "Blood", "Specific Gravity", "Ketones", "Bilirubin", "Glucose"
        ];

        keys.forEach(key => {
            if (!results[key]) return;
            const res = results[key];

            // Determine styling based on verdict
            let verdictClass = 'verdict-normal';
            if (res.result !== "Negative" && res.result !== "Normal" && res.result !== "Trace") {
                verdictClass = 'verdict-abnormal';
            }

            const itemHTML = `
                <div class="result-item">
                    <div class="color-swatch" style="background-color: ${res.color}"></div>
                    <div class="result-info">
                        <div class="biomarker-name">${key}</div>
                        <div class="biomarker-val">${res.value}</div>
                    </div>
                    <div class="result-verdict ${verdictClass}">${res.result}</div>
                </div>
            `;
            resultsGrid.insertAdjacentHTML('beforeend', itemHTML);
        });
    }
});
