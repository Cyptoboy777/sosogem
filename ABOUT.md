# 🪐 About SosuGem Alpha

**SosuGem Alpha** is an institutional-grade, AI-driven crypto research and autonomous trading terminal custom-built for the **SoSoValue Buildathon Wave 2**. The platform consolidates premium financial indexes, real-time market stats, and on-chain news details, allowing users to perform AI-driven research, obtain smart signals, execute spot/perp orders, and manage portfolio allocations within a single premium dashboard.

---

## 🎯 The Vision & Mission

In the current Web3 landscape, traders face two core pain points:
1. **Information Fragmentation:** Research portals (like SoSoValue), trading terminals, news feeds, and wallet dashboards are separate applications. Traders lose critical execution time rotating between tabs.
2. **"Dumb" AI Integration:** Most crypto AI tools are simple wrappers. They answer general queries but cannot retrieve real-time figures, analyze specific account balances, or execute transactions.

**SosuGem Alpha** bridges this gap. It serves as your personal **On-Chain AI Hedge Fund**, bringing together:
*   **Institutional Intelligence:** Direct data consolidation of ETF flows and market indices.
*   **Agentic Execution:** Active Generative AI tool loops that analyze, propose, and route trade operations.
*   **Security & Privacy:** Server-side environment vaulting to ensure private keys are never leaked to client browsers.

---

## ⚡ The Architecture & Core Components

SosuGem Alpha consists of 5 dedicated panels integrated into a single unified client layout:

### 1. Market Intelligence Dashboard
Consolidates and charts institutional-level indexes directly from the SoSoValue API.
*   **Real-time Tickers:** Live prices and 24h shifts of major currencies.
*   **ETF Flows:** Cumulative net inflows and daily volumes for US Bitcoin & Ethereum Spot ETFs.
*   **Sentiment Radar:** Aggregated market sentiment index (Fear & Greed index) and trending assets.

### 2. AI Research Agent Terminal
A premium conversational interface powered by `gemini-2.5-flash`.
*   **Function-Calling Execution Loop:** When asked a question, Gemini dynamically calls server-side tools (`get_market_statistics`, `get_crypto_news`, `get_coin_details`, etc.) to gather data before generating reports.
*   **Zero Fluff Reports:** Gemini formats responses into clean Markdown tables containing entry ranges, targets, and stop-loss coordinates.

### 3. Smart Signals Radar
Algorithmic buying and selling alerts compiled based on real-time market structures.
*   **Execution Cards:** High-probability trade setups detailing direction, risk metrics, and upside projections.
*   **Web3 Transactions:** Integrated MetaMask/Phantom signing modals allowing users to approve order payloads instantly.

### 4. Precision Trade Terminal
A dual-mode spot and perpetual execution interface.
*   **Dynamic Trendlines:** Interactive SVG charts scaled dynamically to match the active asset's spot price.
*   **Gemini Trade Companion:** An on-screen AI co-pilot that watches your input fields (price, size, leverage) to evaluate risk, exposure margins, and liquidation thresholds.

### 5. Portfolio Guardian & Risk Console
A monitoring system designed to protect trading capital.
*   **SVG Weighting Ring:** Interactive visual distribution of current token allocations.
*   **Risk Mitigation Engine:** Flags exposure alerts (e.g. SOL concentration exceeding 35% of total collateral, or perpetual leverage ratios exceeding 10x).

---

## 🔒 Enterprise Security Vault

Typical DApps prompt users to enter API keys directly in client forms, caching them in LocalStorage. This is a severe security risk. 

SosuGem Alpha implements a secure **Server-Side Credentials Vault**:
*   All keys (`GEMINI_API_KEY`, `SOSOVALUE_API_KEY`, etc.) are stored in the server's `.env.local` file.
*   The Settings panel is a read-only dashboard that queries `/api/settings/status` to check connection status.
*   Endpoints are proxied via the Next.js backend server (`/api/sodex/*` and `/api/sosovalue/*`), preventing client-side CORS issues and protecting signature keys.

---

## 🎨 Design Philosophy: Apple-Grade FinTech

SosuGem Alpha is styled with a custom Tailwind CSS v4 dark-mode framework:
*   **Aesthetics:** Deep space black backdrops, backdrop-blur glass panels, and neon accents (cyan, violet, and emerald).
*   **Animations:** Micro-interactions (hover transformations, active tab indicators, sliding panels) powered by Framer Motion.
*   **Typography:** Styled with modern, high-legibility Outfit and monospace fonts.
