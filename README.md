# 🪐 SosuGem Alpha — Premium On-Chain AI Hedge Fund

SosuGem Alpha is an elite, production-ready AI-powered crypto research and autonomous trading terminal built for the **SoSoValue Buildathon Wave 2**. It integrates Google Gemini, SoSoValue indices, and SoDEX execution routes under a dark-mode glassmorphic user interface.

## 🚀 Key Features

*   **Premium Landing Dashboard:** Live ticker updates, spot ETF inflow cards (BTC & ETH), aggregate system status indicator, and on-chain news.
*   **AI Research Terminal:** Multi-turn chat interface leveraging Google Gemini. Supports automatic tool calling to retrieve coin metrics and index summaries.
*   **Smart Signals Radar:** High-probability trade setups detailing entry, target, and stop ranges. Includes a one-click EIP-712 signed execution route.
*   **Trading Terminal:** Live SVG candlestick trends, real-time depth order book, open position trackers, and the **Gemini Trade Companion** risk advisor.
*   **Portfolio Guardian:** Dynamic asset weighting allocation rings and automated risk logs flagging concentration warnings.
*   **Client Keychain Settings:** Secure local key management. Saves private keys inside the client's localized browser storage context.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js 15 (App Router) + TypeScript
*   **Styling:** Tailwind CSS v4 + Framer Motion (premium micro-animations)
*   **AI Models:** Google Gemini 2.5 (Flash)
*   **Web3 Integration:** viem / wagmi connection emulation for Phantom & MetaMask
*   **Data Providers:** SoSoValue API & SoDEX Trading API

---

## ⚙️ Setup & Installation

### 1. Clone & Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and add your fallback credentials:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 How to Get API Keys

### 1. Google Gemini API
1. Visit the [Google AI Studio Console](https://aistudio.google.com/).
2. Click **Create API Key** and copy the generated token.

### 2. SoSoValue API
1. Navigate to the [SoSoValue Portal](https://sosovalue.xyz/) and access the Developer Dashboard.
2. Generate a free **Demo Beta API Key** (standard rate limit: 20 calls/minute).
3. For enterprise tier limits, send an email to `api@sosovalue.com`.

### 3. SoDEX Trading API
1. Open [SoDEX Trading Portal](https://sodex.com).
2. Go to **Account Settings** -> **API Management**.
3. Create a new API Key Pair. Save both the **API Key** and **Secret Key**.

---

## 💡 Buildathon Submission Tips for Judges

*   **Real-Time Data Integration:** The application is powered exclusively by real-time live data directly from the APIs. Mock parameters are disabled to ensure raw, genuine portfolio stats, tickers, and AI research reports.
*   **API Configuration Screen:** If API keys are missing on launch, a premium, customized key configuration warning panel appears in place of the page content. This guides the user to set up keys in the Settings tab or `.env.local` to start querying.
*   **Exacting UI Precision:** Custom glassmorphic blur ratios, customized scrollbars, Outfit display typography, and sliding Framer Motion entries create a premium Apple-grade fintech experience.
