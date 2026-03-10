# 🧬 URONEXA — Clinical AI Diagnostic & Blockchain Ledger

> **Diagnose. Analyze. Secure. On-Chain.**
> 
> Uronexa is a high-fidelity clinical AI platform that uses Computer Vision to analyze urine test strips, generates physician-grade diagnostic reports, and permanently stores results on a decentralized blockchain ledger.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **AI Strip Analysis** | Upload a urine test strip image — OpenCV extracts color from each biomarker pad |
| 📊 **10-Biomarker Readout** | Leukocytes, Nitrite, Urobilinogen, Protein, pH, Blood, Specific Gravity, Ketones, Bilirubin, Glucose |
| ⚕️ **Clinical Risk Score** | Weighted clinical scoring engine outputs 0–100 risk factor with animated display |
| 🏥 **AI Clinical Advisory** | Physician-branded AI advisory card with digital signature and live-pulse status |
| 🔗 **Blockchain Anchoring** | `mintRecord()` on a local Hardhat Ethereum node permanently logs risk score + IPFS CID |
| 🔐 **Secure Clinical Key** | Generates a scannable QR code + detailed "On-Chain Clinical Manifest" receipt |
| 🩺 **Doctor's Terminal** | Decryption terminal to audit any past transaction by pasting a TX hash |
| 🎙️ **Empathetic Voice Engine** | Text-to-speech accessibility assistant — click mic or press **Spacebar** to hear your results |
| 📡 **Holographic Biomarker Badges** | Floating badges orbit a risk dial; hover pulses the anatomy wireframe |
| 🌐 **React Web3 Frontend** | Secondary Vite/React dashboard with MetaMask integration, minting, and verification portal |

---

## 🗂️ Project Structure

```
UronexaC1/
├── SMARTurinalysis/          ← Main Flask App (Port 5000)
│   ├── app.py                  Backend routes + image analysis
│   ├── analyzer.py             CV pipeline + scoring engine
│   ├── requirements.txt        Python dependencies
│   ├── templates/
│   │   └── index.html          Full dashboard UI
│   └── static/
│       ├── app.js              All UI logic + Web3 + Voice Engine
│       └── style.css           Abyssal Clinical Anti-Gravity theme
│
└── uronexa-monorepo/         ← Web3 / Blockchain Layer
    └── apps/
        ├── contracts/
        │   ├── contracts/
        │   │   └── UronexaLedger.sol   Solidity smart contract
        │   ├── scripts/
        │   │   ├── deploy.js           Deploy script
        │   │   └── check_records.js    Query on-chain records
        │   └── hardhat.config.js
        └── web/                        React alternative frontend (Port 5173)
            └── src/
                ├── App.jsx
                └── components/
                    ├── MintingDashboard.jsx
                    ├── DoctorsTerminal.jsx
                    ├── TransactionModal.jsx
                    ├── VerificationPortal.jsx
                    └── Navbar.jsx
```

---

## 🛠️ Prerequisites — Install These First

Before anything else, install the following on your machine:

| Tool | Version | Download |
|---|---|---|
| Python | 3.9+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| MetaMask | Browser Extension | [metamask.io](https://metamask.io/) |

---

## 🚀 Setup Guide — Step by Step

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Saket207/UronexaFinal.git
cd UronexaFinal
```

---

### Step 2 — Setup the AI Backend (Flask)

Open your terminal and run:

```powershell
cd SMARTurinalysis

# Create a Python virtual environment
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\activate

# Install all Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

✅ Flask app is now running at **http://127.0.0.1:5000/**

> ⚠️ Keep this terminal open. The AI backend must stay running for the app to work.

---

### Step 3 — Setup the Blockchain Node (for On-Chain features)

> This is required only if you want to use **"Secure On Blockchain"** or the **Decryption Terminal**.
> You need a second terminal for this.

**Terminal 2 — Start Local Hardhat Blockchain:**
```powershell
cd uronexa-monorepo/apps/contracts

# Install Node dependencies
npm install

# Start the local Ethereum node
npx hardhat node
```

✅ Your local blockchain is running at **http://127.0.0.1:8545**

You will see output like this — **copy one of the Private Keys** shown:
```
Account #0: 0xf39Fd6e51aad88F6f4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> ⚠️ Keep this terminal open. Your blockchain must stay running.

---

### Step 4 — Deploy the Smart Contract

Open a **third terminal:**

```powershell
cd uronexa-monorepo/apps/contracts
npx hardhat run scripts/deploy.js --network localhost
```

You will see:
```
UronexaLedger deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

> **IMPORTANT:** If the address is different from `0x5FbDB2315678afecb367f032d93F642f64180aa3`, update it in:
> - `SMARTurinalysis/static/app.js` → line with `const CONTRACT_ADDRESS = "0x..."`

---

### Step 5 — Configure MetaMask

1. Open MetaMask in your browser
2. Click **Networks** → **Add a network** → **Add a network manually**
3. Fill in:
   - **Network Name**: `Hardhat Localhost`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
4. Click **Save**
5. Click **Import Account** → paste the **Private Key** you copied in Step 3

✅ You now have 10,000 test ETH to use.

---

### Step 6 — Use the App

Open your browser and go to: **http://127.0.0.1:5000/**

**Basic Usage:**
1. Click the dropzone or drag & drop a urine test strip image
2. Click **"Run Neural Analysis"**
3. View your results — risk dial, floating biomarker badges, anatomy wireframe, AI Clinical Advisory

**Web3 Features (requires Steps 3–5):**
1. Click **"Connect Wallet"** in the top right → approve in MetaMask
2. Click **"Secure On Blockchain"** → sign the MetaMask transaction
3. Click **"Generate Secure Clinical Key"** → view QR code + Clinical Manifest receipt
4. Click the **stethoscope icon** in the header → open the Decryption Terminal → paste your TX hash to audit the record

**Accessibility:**
- Click the **blue microphone orb** (bottom right on results screen) for an audio summary
- Press **Spacebar** anywhere on the results screen for the same effect

---

## ⚙️ Optional: React Frontend (Port 5173)

A secondary React UI is included with additional Web3 visualizations.

```powershell
cd uronexa-monorepo/apps/web
npm install
npm run dev
```

Open: **http://localhost:5173/**

---

## 🔍 Checking On-Chain Records

To query all records stored in the smart contract:

```powershell
cd uronexa-monorepo/apps/contracts
npx hardhat run scripts/check_records.js --network localhost
```

To audit a specific transaction, use the **Decryption Terminal** in the app (stethoscope icon) and paste the TX hash.

---

## 🧪 Troubleshooting

| Problem | Fix |
|---|---|
| `ModuleNotFoundError` on `python app.py` | Run `pip install -r requirements.txt` |
| `Transaction reverted: unrecognized selector` | Contract address mismatch — redeploy and update `CONTRACT_ADDRESS` in `app.js` |
| MetaMask says "wrong network" | Switch MetaMask to `Hardhat Localhost` network |
| Nonce error in MetaMask | MetaMask → Settings → Advanced → **Reset Account** |
| QR code not scanning | Make sure you ran an analysis first — the QR populates after scanning |
| Voice not working | Your browser must support `window.speechSynthesis` (Chrome/Edge recommended) |

---

## 🏗️ Tech Stack

**Backend**
- Python 3 / Flask
- OpenCV + NumPy (image processing)
- Custom weighted clinical scoring engine

**Frontend**
- Vanilla HTML / CSS / JavaScript (main app)
- React + Vite (secondary frontend)
- Web Speech API (voice engine)

**Blockchain**
- Solidity (`UronexaLedger.sol`)
- Hardhat local node
- Ethers.js v6
- MetaMask

---

## 📸 UI Theme

**Aesthetic**: *Clinical Anti-Gravity / Abyssal Deep Blue*
- Background: `#050B14`
- Accent Bio-Green: `#00FFA3`
- Accent Cyan: `#00F0FF`
- Glassmorphism cards with `backdrop-filter: blur(20px)`
- Monospace medical receipt typography

---

## 📄 License

MIT License — feel free to fork and build on top of it.

---

**Built by Saket** • Powered by Computer Vision + Decentralized Ledger Technology
