document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropzone');
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

    // --- 3D Magnetic Hover Physics ---
    dropZone.addEventListener('mousemove', (e) => {
        const rect = dropZone.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Max tilt of 10 degrees
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        dropZone.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    dropZone.addEventListener('mouseleave', () => {
        dropZone.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
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
        btnAnalyze.classList.remove('hidden');
        btnCancel.classList.remove('hidden');
    });

    // Start New Test
    btnNewTest.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');

        // Hide holographic overlays
        const stratBox = document.getElementById('clinical-strategy-box');
        const voiceOrb = document.getElementById('voice-orb');
        const docFab = document.getElementById('doctor-fab-container');
        if (stratBox) stratBox.classList.add('hidden');
        if (voiceOrb) voiceOrb.classList.add('hidden');
        if (docFab) docFab.classList.add('hidden');

        btnCancel.click(); // Reset upload state
    });

    // --- Neural Processing Animation ---
    function startNeuralAnimation() {
        const nodes = document.querySelectorAll('.node');
        const conns = document.querySelectorAll('.conn');
        const textElement = document.querySelector('.processing-text');

        let step = 0;
        const processSteps = [
            "Initiating Neural Analysis...",
            "Isolating White Calibration Plate...",
            "Running 1D Matched Spatial Filter...",
            "Targeting Geometric Pad Centers...",
            "Extracting 5x5 Matrix Hue Vectors...",
            "Mapping Diagnostic Confidence Networks..."
        ];

        // Ensure initially clear
        nodes.forEach(n => n.classList.remove('active'));
        conns.forEach(c => c.classList.remove('active'));

        window.neuralInterval = setInterval(() => {
            nodes.forEach(n => n.classList.remove('active'));
            conns.forEach(c => c.classList.remove('active'));

            // Randomly activate 2-3 nodes
            const numNodesToActivate = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numNodesToActivate; i++) {
                const randomNode = Math.floor(Math.random() * nodes.length);
                if (nodes[randomNode]) nodes[randomNode].classList.add('active');
            }

            // Randomly activate 1-2 connections
            const numConnsToActivate = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numConnsToActivate; i++) {
                const randomConn = Math.floor(Math.random() * conns.length);
                if (conns[randomConn]) conns[randomConn].classList.add('active');
            }

            // Rotate text every 2 ticks (1200ms)
            if (step % 2 === 0 && textElement) {
                textElement.innerText = processSteps[Math.floor((step / 2) % processSteps.length)];
            }
            step++;
        }, 600);
    }

    function stopNeuralAnimation() {
        if (window.neuralInterval) clearInterval(window.neuralInterval);
    }

    // --- Web3 State & Config ---
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const ABI = ["function mintRecord(uint256 _riskScore, string memory _ipfsHash) public"];
    let userAccount = null;
    let lastAnalysisScore = 0;
    let lastBiomarkers = null;
    let lastIpfsHash = "bafkreidmq7j3l25m7334...mock";
    let lastTxHash = null;
    let lastTimestamp = null;

    const btnConnect = document.getElementById('btn-connect');
    const btnSecure = document.getElementById('btn-secure-blockchain');
    const txModal = document.getElementById('tx-modal');

    // --- Connect Wallet ---
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = accounts[0];
                btnConnect.innerText = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
                btnConnect.classList.add('connected');
            } catch (err) {
                console.error("Connection failed", err);
            }
        } else {
            alert("MetaMask not detected. Please install the extension.");
        }
    }

    if (btnConnect) btnConnect.addEventListener('click', connectWallet);

    // --- Secure Record On-Chain ---
    async function secureOnBlockchain() {
        if (!userAccount) {
            alert("Please connect your wallet first.");
            return;
        }
        if (lastAnalysisScore === 0) {
            alert("No valid diagnostic data found to secure.");
            return;
        }

        try {
            showTxState('minting');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            // Scale score for solidity integer handling
            const scoreScaled = Math.floor(lastAnalysisScore * 100);

            // Using a mock IPFS hash for this demo
            const mockCID = "bafkreidmq7j3l25m7334...mock";
            lastIpfsHash = mockCID;

            const tx = await contract.mintRecord(scoreScaled, mockCID);

            // Update UI to show we are waiting for confirmation
            document.querySelector('#tx-state-minting p').innerText = "Waiting for block confirmation...";

            const receipt = await tx.wait();

            // Store for manifest
            lastTxHash = receipt.hash;
            lastTimestamp = new Date().toLocaleString();

            // Update the receipt display in index.html
            document.getElementById('display-tx-hash').innerText = receipt.hash;
            document.getElementById('display-block-num').innerText = `#${receipt.blockNumber}`;

            showTxState('success');
        } catch (err) {
            console.error("Blockchain Error", err);
            showTxState('error');
        }
    }

    if (btnSecure) btnSecure.addEventListener('click', secureOnBlockchain);

    function showTxState(state) {
        txModal.classList.remove('hidden');
        document.getElementById('tx-state-minting').classList.add('hidden');
        document.getElementById('tx-state-success').classList.add('hidden');
        document.getElementById('tx-state-error').classList.add('hidden');
        document.getElementById(`tx-state-${state}`).classList.remove('hidden');
    }

    window.closeTxModal = () => {
        txModal.classList.add('hidden');
    };

    // Analyze Button
    btnAnalyze.addEventListener('click', async () => {
        if (!selectedFile) return;

        // UI State: Loading
        previewArea.classList.add('hidden');
        loadingArea.classList.remove('hidden');
        startNeuralAnimation();

        // Prepare Data
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            stopNeuralAnimation();

            if (data.success) {
                // Store results for blockchain submission and AI Copilot
                lastAnalysisScore = data.results.risk_score || 0;
                lastBiomarkers = data.results.biomarkers || data.results;
                window.uronexaData = { score: lastAnalysisScore, biomarkers: lastBiomarkers };

                renderResults(data.results);

                // Show the debug image processed by OpenCV
                if (data.debug_image_path) {
                    imagePreview.src = '/' + data.debug_image_path;
                    previewArea.classList.remove('hidden');
                    btnAnalyze.classList.add('hidden');
                    btnCancel.classList.add('hidden');
                } else {
                    uploadSection.classList.add('hidden');
                }

                loadingArea.classList.add('hidden');
                resultsSection.classList.remove('hidden');

                // Show holographic overlays
                const stratBox = document.getElementById('clinical-strategy-box');
                const voiceOrb = document.getElementById('voice-orb');
                const docFab = document.getElementById('doctor-fab-container');
                if (stratBox) stratBox.classList.remove('hidden');
                if (voiceOrb) voiceOrb.classList.remove('hidden');
                if (docFab) docFab.classList.remove('hidden');
            } else {
                alert('Analysis failed: ' + (data.error || 'Unknown error'));
                loadingArea.classList.add('hidden');
                previewArea.classList.remove('hidden');
            }
        } catch (error) {
            stopNeuralAnimation();
            alert('Network error occurred during analysis.');
            loadingArea.classList.add('hidden');
            previewArea.classList.remove('hidden');
            console.error(error);
        }
    });

    // --- Micro-Hologram Parallax Modal ---
    const biomarkerModal = document.getElementById('biomarker-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content');

    function closeBiomarkerModal() {
        biomarkerModal.classList.add('hidden');
    }

    modalCloseBtn.addEventListener('click', closeBiomarkerModal);
    modalBackdrop.addEventListener('click', closeBiomarkerModal);

    // 3D Parallax Mouse Tracking
    modalContent.addEventListener('mousemove', (e) => {
        const rect = modalContent.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const moveX = ((x - centerX) / centerX); // -1 to 1
        const moveY = ((y - centerY) / centerY);

        // Subtly rotate the entire modal content
        modalContent.style.transform = `perspective(1000px) rotateX(${moveY * -5}deg) rotateY(${moveX * 5}deg)`;

        // Dramatically shift the internal parallax floating elements
        const parallaxElements = document.querySelectorAll('.parallax-element');
        parallaxElements.forEach((el, index) => {
            const depth = (index + 1) * 15; // Deeper layers move more
            el.style.transform = `translate3d(${moveX * depth}px, ${moveY * depth}px, ${depth}px)`;
        });
    });

    modalContent.addEventListener('mouseleave', () => {
        modalContent.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        const parallaxElements = document.querySelectorAll('.parallax-element');
        parallaxElements.forEach((el) => {
            el.style.transform = `translate3d(0px, 0px, 0px)`;
        });
    });

    window.openBiomarkerModal = function (key, biomarkerData) {
        const titleEl = document.getElementById('modal-title');
        const verdictEl = document.getElementById('modal-verdict');
        const descEl = document.getElementById('modal-desc');
        const valueEl = document.getElementById('modal-value');
        const parallaxViewport = document.getElementById('parallax-viewport');

        const verdict = biomarkerData.result || biomarkerData.class || 'Unknown';
        const val = biomarkerData.value || biomarkerData.estimate || '--';
        const color = biomarkerData.color || '#ffffff';

        titleEl.textContent = key;
        verdictEl.textContent = verdict;
        valueEl.textContent = val;

        // Custom clinical snippets per biomarker
        const descriptions = {
            "Leukocytes": "Detects white blood cells indicating potential urinary tract inflammation or infection.",
            "Nitrite": "Indicates presence of Gram-negative bacteria which convert nitrates to nitrites.",
            "Urobilinogen": "A byproduct of bilirubin reduction; elevated levels may indicate liver disease or hemolysis.",
            "Protein": "Screening for proteinuria, an early indicator of kidney disease or glomerular damage.",
            "pH": "Measures urinary acidity. Extremes may indicate metabolic disturbances or risk of kidney stones.",
            "Blood": "Detects intact erythrocytes, hemoglobin, or myoglobin often tracing to renal or urogenital trauma.",
            "Specific Gravity": "Measures kidney's ability to concentrate urine. High levels suggest dehydration.",
            "Ketones": "Detects intermediate products of fat metabolism, typical in fasting, low-carbohydrate diets, or diabetic ketoacidosis.",
            "Bilirubin": "A byproduct of RBC breakdown. Its presence in urine strongly correlates with hepatic or biliary disease.",
            "Glucose": "Screens for glycosuria, heavily associated with poorly controlled diabetes mellitus."
        };

        descEl.textContent = descriptions[key] || "Detailed clinical explanation of the biochemical interaction.";

        // Construct Fake Cellular Animation depending on key using simple SVG particles
        let elementColor = color;
        if (color === '#ffffff' || color === 'rgb(255, 255, 255)') elementColor = '#3b82f6';

        parallaxViewport.innerHTML = `
            <div class="parallax-layer">
                <svg width="100" height="100" viewBox="0 0 100 100" class="parallax-element" style="opacity: 0.2">
                    <circle cx="20" cy="20" r="10" fill="${elementColor}" />
                    <circle cx="80" cy="70" r="15" fill="${elementColor}" />
                </svg>
            </div>
            <div class="parallax-layer">
                <svg width="100" height="100" viewBox="0 0 100 100" class="parallax-element" style="opacity: 0.5">
                    <circle cx="70" cy="30" r="8" fill="${elementColor}" />
                    <circle cx="30" cy="80" r="12" fill="${elementColor}" />
                </svg>
            </div>
            <div class="parallax-layer">
                <svg width="100" height="100" viewBox="0 0 100 100" class="parallax-element" style="opacity: 0.9">
                    <circle cx="50" cy="50" r="25" fill="${elementColor}" />
                </svg>
            </div>
        `;

        // Verdict styling
        verdictEl.className = 'status-badge';
        if (verdict !== "Negative" && verdict !== "Normal" && verdict !== "Trace" && verdict !== "Unknown") {
            verdictEl.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; // Red
            verdictEl.style.color = '#ef4444';
        } else if (verdict === "Trace" || verdict === "Small") {
            verdictEl.style.backgroundColor = 'rgba(245, 158, 11, 0.2)'; // Yellow
            verdictEl.style.color = '#f59e0b';
        } else {
            verdictEl.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; // Green
            verdictEl.style.color = '#10b981';
        }

        biomarkerModal.classList.remove('hidden');
    };

    function renderResults(clinicalData) {
        // 1. Render Risk Score Dashboard
        const riskCircle = document.getElementById('risk-circle');
        const riskScoreVal = document.getElementById('risk-score-val');
        const confidenceBadge = document.getElementById('confidence-badge');
        const clinicalText = document.getElementById('clinical-strategy-text');

        if (clinicalData.risk_score !== undefined) {
            // Animate circular progress
            // Circumference of r=45 is ~283
            const circumference = 2 * Math.PI * 45;
            riskCircle.style.strokeDasharray = circumference;
            const offset = circumference - (clinicalData.risk_score / 100) * circumference;
            // Trigger reflow for animation
            riskCircle.getBoundingClientRect();
            riskCircle.style.strokeDashoffset = offset;

            // Set colors based on risk level
            let strokeColor = '#22c55e'; // Green
            if (clinicalData.risk_score >= 80) strokeColor = '#ef4444'; // Red
            else if (clinicalData.risk_score >= 40) strokeColor = '#f59e0b'; // Yellow
            riskCircle.style.stroke = strokeColor;

            // Update Text
            // Animate number counting up
            let startCount = 0;
            const targetCount = clinicalData.risk_score;
            const duration = 1000;
            const steps = 30;
            const stepTime = Math.abs(Math.floor(duration / steps));

            const timer = setInterval(() => {
                startCount += Math.ceil(targetCount / steps);
                if (startCount >= targetCount) {
                    startCount = targetCount;
                    clearInterval(timer);
                }
                if (riskScoreVal) riskScoreVal.innerText = startCount;
            }, stepTime);

            if (confidenceBadge) {
                confidenceBadge.innerText = `${clinicalData.diagnosis_confidence_percent || 0}% Confident`;
            }
            if (clinicalText) {
                clinicalText.innerHTML = clinicalData.clinical_strategy;
            }
        }

        // 2. Render Biomarker Pad Array as Floating Badges
        const floatingContainer = document.getElementById('floating-badges-container');
        floatingContainer.innerHTML = '';

        // Also clear old results grid just in case
        if (resultsGrid) resultsGrid.innerHTML = '';

        let biomarkers = clinicalData.biomarkers;
        if (!biomarkers) biomarkers = clinicalData;

        const keys = [
            "Leukocytes", "Nitrite", "Urobilinogen", "Protein", "pH",
            "Blood", "Specific Gravity", "Ketones", "Bilirubin", "Glucose"
        ];

        const validKeys = keys.filter(k => biomarkers[k]);
        const numBadges = validKeys.length;

        if (numBadges === 0) {
            floatingContainer.innerHTML = `<div style="text-align: center; color: white; width: 100%;">No valid pads</div>`;
            return;
        }

        // Map biomarkers to organs
        const organMap = {
            "Leukocytes": "bladder",
            "Nitrite": "bladder",
            "Protein": "kidneys",
            "Blood": "kidneys"
        };

        validKeys.forEach((key, index) => {
            const res = biomarkers[key];
            const verdict = res.result || res.class || 'Unknown';
            const val = res.value || res.estimate || '--';

            // Calculate Polar Coordinates (r = 130px to fit better)
            // -Math.PI/2 starts at the top (12 O'clock)
            const angle = (index / numBadges) * (2 * Math.PI) - (Math.PI / 2);
            const radius = 160;  // Restore original radius so center is clear

            // Restore original 10% bounds so it doesn't overlap center 20
            const leftCalc = `clamp(10%, calc(50% + ${Math.cos(angle) * radius}px), 90%)`;
            const topCalc = `clamp(10%, calc(50% + ${Math.sin(angle) * radius}px), 90%)`;

            let borderColor = 'rgba(255, 255, 255, 0.1)';
            let organPulseClass = 'pulse-warning';

            if (verdict !== "Negative" && verdict !== "Normal" && verdict !== "Trace" && verdict !== "Unknown") {
                borderColor = '#ef4444'; // Red for severe
                organPulseClass = 'pulse-danger';
            } else if (verdict === "Trace" || verdict === "Small") {
                borderColor = '#f59e0b'; // Yellow for warning
            }

            const badgeElement = document.createElement('div');
            badgeElement.className = 'floating-badge';
            badgeElement.style.left = leftCalc;
            badgeElement.style.top = topCalc;
            badgeElement.style.borderColor = borderColor;

            badgeElement.innerHTML = `
                <div class="badge-dot" style="background-color: ${res.color || '#fff'}"></div>
                <span>${key}: ${verdict}</span>
            `;

            // Hover Analytics - Pulse Organs
            const targetOrganId = organMap[key];
            if (targetOrganId) {
                badgeElement.addEventListener('mouseenter', () => {
                    const organPath = document.getElementById(targetOrganId);
                    if (organPath) organPath.classList.add(organPulseClass);
                });
                badgeElement.addEventListener('mouseleave', () => {
                    const organPath = document.getElementById(targetOrganId);
                    if (organPath) organPath.classList.remove(organPulseClass);
                });
            }

            // Click to open Holographic Modal
            badgeElement.addEventListener('click', () => {
                if (window.openBiomarkerModal) {
                    window.openBiomarkerModal(key, res);
                }
            });

            floatingContainer.appendChild(badgeElement);
        });
    }

    // =====================================================================
    // --- Empathetic Voice Engine (a11y) ---
    // =====================================================================

    const voiceOrb = document.getElementById('voice-orb');
    const synth = window.speechSynthesis;

    // Biomarkers considered "abnormal" if they have these verdict values
    const ABNORMAL_VERDICTS = new Set([
        'Positive', 'Abnormal', 'High', 'Large', 'Moderate', 'Small', 'Trace',
        '2+', '3+', '++', '+++', 'Present'
    ]);

    /**
     * Builds a human-readable, empathetic summary of clinical results.
     * @param {object} biomarkers - Raw biomarker object keyed by name.
     * @param {number} riskScore  - Numerical risk score (0-100).
     * @returns {string}
     */
    function generateEmpatheticSummary(biomarkers, riskScore) {
        const lines = [];

        // Opening
        lines.push("Hello. Your Uronexa scan is complete.");

        // Separate normal from abnormal biomarkers
        const abnormal = [];
        const keys = [
            "Leukocytes", "Nitrite", "Urobilinogen", "Protein", "pH",
            "Blood", "Specific Gravity", "Ketones", "Bilirubin", "Glucose"
        ];

        if (biomarkers) {
            keys.forEach(key => {
                const data = biomarkers[key];
                if (!data) return;
                const verdict = data.result || data.class || 'Unknown';
                if (ABNORMAL_VERDICTS.has(verdict) ||
                    (verdict !== 'Negative' && verdict !== 'Normal' && verdict !== 'Unknown' && verdict !== 'N/A')) {
                    abnormal.push(key);
                }
            });
        }

        // Biomarker summary
        if (abnormal.length === 0) {
            lines.push("All of your parameters are within normal ranges.");
        } else if (abnormal.length === 1) {
            lines.push(`We detected an elevated reading for ${abnormal[0]}.`);
        } else {
            const last = abnormal.pop();
            lines.push(`We detected elevated levels of ${abnormal.join(', ')}, and ${last}.`);
        }

        // Risk score
        lines.push(`Your clinical risk score is ${riskScore} out of 100.`);

        // Triage call to action based on score
        if (riskScore >= 60) {
            lines.push("Based on these results, please seek medical evaluation as soon as possible.");
        } else if (riskScore >= 30) {
            lines.push("We recommend consulting a healthcare professional for a follow-up.");
        } else {
            lines.push("Continue routine monitoring and stay hydrated.");
        }

        // Web3 CTA
        lines.push("Press the spacebar to secure this record on the blockchain.");

        return lines.join(' ');
    }

    /**
     * Speaks the given text using the Web Speech API.
     * Cancels any in-progress speech before starting.
     * @param {string} text
     */
    function playAudioSummary(text) {
        if (!synth) return;

        // Cancel any ongoing speech first (prevents overlap on double-click)
        synth.cancel();

        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;   // Slightly slower for comprehension
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Visual feedback on the orb
        if (voiceOrb) {
            utterance.onstart = () => voiceOrb.classList.add('voz-speaking');
            utterance.onend = () => voiceOrb.classList.remove('voz-speaking');
            utterance.onerror = () => voiceOrb.classList.remove('voz-speaking');
            utterance.onpause = () => voiceOrb.classList.remove('voz-speaking');
        }

        synth.speak(utterance);
    }

    // --- Bind Voice Orb click ---
    if (voiceOrb) {
        voiceOrb.addEventListener('click', () => {
            // Toggle: if currently speaking, stop
            if (synth && synth.speaking) {
                synth.cancel();
                voiceOrb.classList.remove('voz-speaking');
                return;
            }

            // Generate and speak the empathetic summary
            const summary = generateEmpatheticSummary(lastBiomarkers, lastAnalysisScore);
            playAudioSummary(summary);
        });
    }

    // --- A11y: Spacebar shortcut while results are visible ---
    document.addEventListener('keydown', (e) => {
        const resultsVisible = !resultsSection.classList.contains('hidden');
        // Spacebar (key === ' ') — ignore if user is typing in an input/textarea
        if (e.key === ' ' && resultsVisible &&
            !['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) {
            e.preventDefault(); // Prevent page scroll

            if (synth && synth.speaking) {
                synth.cancel();
                if (voiceOrb) voiceOrb.classList.remove('voz-speaking');
            } else {
                const summary = generateEmpatheticSummary(lastBiomarkers, lastAnalysisScore);
                playAudioSummary(summary);
            }
        }
    });


    // --- Doctor Ready FAB ---
    const btnGenerateKey = document.getElementById('btn-generate-key');
    const clinicalPortal = document.getElementById('clinical-key-portal');

    if (btnGenerateKey && clinicalPortal) {
        btnGenerateKey.addEventListener('click', () => {
            const isHidden = clinicalPortal.classList.contains('hidden');
            if (isHidden) {
                populateClinicalManifest();
                clinicalPortal.classList.remove('hidden');
                clinicalPortal.scrollIntoView({ behavior: 'smooth' });
            } else {
                clinicalPortal.classList.add('hidden');
            }
        });
    }

    function populateClinicalManifest() {
        const biomarkerKeys = [
            "Leukocytes", "Nitrite", "Urobilinogen", "Protein", "pH",
            "Blood", "Specific Gravity", "Ketones", "Bilirubin", "Glucose"
        ];

        // Helper to get biomarker verdict padded for alignment
        function getVerdict(key) {
            if (!lastBiomarkers) return 'PENDING';
            const d = lastBiomarkers[key];
            return d ? (d.result || d.class || 'Negative') : 'N/A';
        }

        const timestamp = lastTimestamp || new Date().toLocaleString();
        const wallet = userAccount || 'GUEST_UNKNOWN_WALLET';
        const txHash = lastTxHash || 'Awaiting On-Chain Verification...';
        const riskScore = lastAnalysisScore;

        // QR Payload: lean plain-text summary (no Unicode, no long hashes)
        const shortWallet = wallet.length > 12 ? wallet.slice(0, 6) + '...' + wallet.slice(-4) : wallet;
        const shortTx = txHash.length > 12 ? txHash.slice(0, 8) + '...' : txHash;

        const qrValue = [
            'URONEXA CLINICAL RECORD',
            `Date: ${timestamp}`,
            `Patient: ${shortWallet}`,
            `TX: ${shortTx}`,
            `Risk: ${riskScore}/100`,
            '--- BIOMARKERS ---',
            `LEU:${getVerdict('Leukocytes')} NIT:${getVerdict('Nitrite')}`,
            `URO:${getVerdict('Urobilinogen')} PRO:${getVerdict('Protein')}`,
            `pH:${getVerdict('pH')} BLD:${getVerdict('Blood')}`,
            `SG:${getVerdict('Specific Gravity')} KET:${getVerdict('Ketones')}`,
            `BIL:${getVerdict('Bilirubin')} GLU:${getVerdict('Glucose')}`,
            'SECURED BY URONEXA LEDGER',
        ].join('\n');

        // 1. Render QR
        const qrDisplay = document.getElementById('qr-code-display');
        qrDisplay.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=L&data=${encodeURIComponent(qrValue)}" alt="Clinical IPFS Key" style="width:100%;height:100%;">`;

        // 2. Populate Manifest panel identifiers
        document.getElementById('manifest-id').innerText = `ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        document.getElementById('manifest-time').innerText = timestamp;
        document.getElementById('manifest-wallet').innerText = wallet;
        document.getElementById('manifest-tx-hash').innerText = txHash;
        document.getElementById('manifest-risk').innerText = riskScore;

        // 3. Populate 10-Biomarker Payload grid
        const payloadContainer = document.getElementById('manifest-payload');
        if (lastBiomarkers) {
            payloadContainer.innerHTML = '';
            biomarkerKeys.forEach(key => {
                const verdict = getVerdict(key);
                const isAbnormal = verdict !== 'Negative' && verdict !== 'Normal' && verdict !== 'N/A';
                const row = document.createElement('div');
                row.className = 'manifest-row';
                row.innerHTML = `» ${key}: <span class="${isAbnormal ? 'bio-cyan' : ''}">[${verdict}]</span>`;
                payloadContainer.appendChild(row);
            });
        }
    }
    // --- Doctor Verification Portal Modal Logic ---
    const btnDoctorTerminal = document.getElementById('btn-doctor-terminal');
    const doctorTerminalModal = document.getElementById('doctor-terminal-modal');
    const terminalClose = document.getElementById('terminal-close');
    const terminalBackdrop = document.getElementById('terminal-backdrop');

    if (btnDoctorTerminal) {
        btnDoctorTerminal.addEventListener('click', () => {
            doctorTerminalModal.classList.remove('hidden');
        });

        // Magnetic Icon Effect
        btnDoctorTerminal.addEventListener('mousemove', (e) => {
            const rect = btnDoctorTerminal.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -20;
            const rotateY = ((x - centerX) / centerX) * 20;

            btnDoctorTerminal.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.15)`;
        });

        btnDoctorTerminal.addEventListener('mouseleave', () => {
            btnDoctorTerminal.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    }

    const closeTerminal = () => doctorTerminalModal.classList.add('hidden');
    if (terminalClose) terminalClose.addEventListener('click', closeTerminal);
    if (terminalBackdrop) terminalBackdrop.addEventListener('click', closeTerminal);

    // --- Doctor Verification Portal Logic ---
    const btnVerify = document.getElementById('btn-verify-data');
    const inputVerifyHash = document.getElementById('input-verify-hash');
    const verifyError = document.getElementById('verify-error');
    const verifyResultsPanel = document.getElementById('verify-results-panel');

    async function verifyOnChainRecord() {
        const txHash = inputVerifyHash.value.trim();

        if (!txHash.startsWith("0x") || txHash.length !== 66) {
            verifyError.innerText = "Invalid Transaction Hash format.";
            verifyError.classList.remove('hidden');
            verifyResultsPanel.classList.add('hidden');
            return;
        }

        verifyError.classList.add('hidden');
        btnVerify.innerText = "Consulting Ledger...";
        btnVerify.disabled = true;

        try {
            // Hardhat Local Provider
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

            // 1. Fetch Transaction
            const tx = await provider.getTransaction(txHash);
            if (!tx) {
                throw new Error("Hash not found on local network.");
            }

            // 2. Decode Input Data
            const contractAbi = ["function mintRecord(uint256 _riskScore, string memory _ipfsHash) public"];
            const iface = new ethers.Interface(contractAbi);
            const decoded = iface.parseTransaction({ data: tx.data });

            if (decoded && decoded.name === "mintRecord") {
                // 3. Get Block for Timestamp
                const block = await provider.getBlock(tx.blockNumber);

                document.getElementById('verify-block-num').innerText = `#${tx.blockNumber}`;
                document.getElementById('verify-risk-score').innerText = Number(decoded.args[0]) / 100;
                document.getElementById('verify-ipfs-hash').innerText = decoded.args[1];
                document.getElementById('verify-timestamp').innerText = new Date(Number(block.timestamp) * 1000).toLocaleString();

                verifyResultsPanel.classList.remove('hidden');
            } else {
                throw new Error("Transaction is not a Uronexa Ledger record.");
            }
        } catch (err) {
            console.error("Verification Error:", err);
            verifyError.innerText = err.message || "Hash not found on local network.";
            verifyError.classList.remove('hidden');
            verifyResultsPanel.classList.add('hidden');
        } finally {
            btnVerify.innerText = "View Decoded Data";
            btnVerify.disabled = false;
        }
    }

    if (btnVerify) btnVerify.addEventListener('click', verifyOnChainRecord);
});
