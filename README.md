<div align="center">

![P402 Logo](./image.png)

# P402 - Dynamic API Payment Gateway 🚀

> **HTTP 402: Payment Required** - The forgotten status code is now monetizing APIs!

</div>

Transform any API into a revenue-generating asset with automatic payment collection, blockchain authentication, and enterprise-grade proxy infrastructure.

---

## � The Problem

Developers create amazing APIs but struggle to monetize them effectively. Traditional solutions require:
- Complex payment integrations
- Subscription management systems
- Authentication & authorization infrastructure
- Usage tracking & billing systems

**P402 solves all of this with a single proxy layer.**

---

## ✨ What Makes P402 Special?

### 🔐 Blockchain-Native Authentication
- **Solana Wallet Integration**: Sign-in with message signing (no passwords!)
- **Session Management**: Secure JWT-based sessions with automatic expiry
- **Multi-chain Support**: Ethereum, Base Sepolia, and more

### 💰 Instant Monetization
- **One-Click API Registration**: Turn any API into a paid service in seconds
- **Flexible Pricing**: Set per-request pricing in crypto
- **Direct Payments**: Money flows directly to your wallet - no middleman

### 🚀 Enterprise-Grade Proxy
- **Cloudflare Workers**: Global edge computing for ultra-low latency
- **Custom Headers**: Pass authentication tokens securely to upstream APIs
- **Request/Response Forwarding**: Complete transparency with full header & body support
- **Error Handling**: Comprehensive error codes and detailed logging

### 📊 Beautiful Dashboard
- **Real-time Stats**: Track requests, revenue, and API performance
- **Modern UI**: Vue 3 + TypeScript with responsive design
- **One-Pager Experience**: Everything accessible without navigation
- **Dark Theme**: Eye-friendly interface with orange accents

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│  P402 Proxy  │─────▶│  Your API   │
│             │◀─────│   (Worker)   │◀─────│             │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  D1 Database │
                     │   (SQLite)   │
                     └──────────────┘
```

**Tech Stack:**
- **Backend**: Cloudflare Workers + Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vue 3 + TypeScript + Vite
- **Auth**: Solana Web3.js + TweetNaCl
- **Blockchain**: Multi-chain support (Ethereum, Base, Solana)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account
- Solana/Ethereum wallet (Phantom/MetaMask)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd p402

# Install dependencies
npm install

# Setup database
npm run db:create
npm run db:migrate

# Start development servers
npm run dev        # Backend on :8787
cd frontend && npm run dev  # Frontend on :5173
```

**📖 Detailed Setup**: See [SETUP.md](./docs/SETUP.md) for complete instructions

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**SETUP.md**](./docs/SETUP.md) | Complete installation & configuration guide |
| [**FRONTEND_GUIDE.md**](./docs/FRONTEND_GUIDE.md) | Frontend usage & development guide |
| [**DEPLOYMENT_GUIDE.md**](./docs/DEPLOYMENT_GUIDE.md) | Production deployment instructions |
| [**SOLANA_AUTH_GUIDE.md**](./docs/SOLANA_AUTH_GUIDE.md) | Wallet authentication implementation |
| [**CUSTOM_HEADERS_FEATURE.md**](./docs/CUSTOM_HEADERS_FEATURE.md) | Custom header configuration |
| [**ERROR_CODES.md**](./docs/ERROR_CODES.md) | Complete API error reference |
| [**COMPONENTS_GUIDE.md**](./docs/COMPONENTS_GUIDE.md) | Frontend component library |
| [**FRONTEND_SUMMARY.md**](./docs/FRONTEND_SUMMARY.md) | Frontend development summary |

---

## � Usage Examples

### Register Your API

```bash
curl -X POST https://p402.workers.dev/manage/register \
  -H "Content-Type: application/json" \
  -d '{
    "owner_address": "0xYourWalletAddress",
    "api_name": "Weather API",
    "description": "Real-time weather data",
    "target_url": "https://api.weather.com",
    "price": "0.001",
    "network": "base-sepolia",
    "headers": {
      "X-API-Key": "your-upstream-api-key"
    }
  }'
```

### Make Paid Requests

```bash
# Your API is now available at:
curl https://p402.workers.dev/api/{API_ID}/weather/current \
  -H "Authorization: Payment YOUR_PAYMENT_TOKEN"
```

### Manage via Dashboard

1. Visit the dashboard: `https://your-frontend.pages.dev`
2. Connect your wallet (Phantom/MetaMask)
3. View stats, manage APIs, track revenue
4. Copy proxy URLs and integration snippets

---

## 🎨 Features Showcase

### 🔥 Core Features
- ✅ **Dynamic API Registration** - No code changes needed
- ✅ **HTTP 402 Implementation** - Standards-compliant payment flow
- ✅ **Automatic Proxy Routing** - Transparent request forwarding
- ✅ **Custom Header Management** - Secure upstream authentication
- ✅ **Multi-chain Payments** - Ethereum, Base, Solana support
- ✅ **Real-time Analytics** - Request tracking & revenue metrics

### �️ Security
- ✅ **Message Signing Auth** - No password vulnerabilities
- ✅ **Session Management** - Secure JWT with auto-expiry
- ✅ **Rate Limiting** - DDoS protection built-in
- ✅ **Input Validation** - SQL injection & XSS prevention
- ✅ **CORS Configuration** - Secure cross-origin requests

### 🎯 Developer Experience
- ✅ **TypeScript Throughout** - Full type safety
- ✅ **OpenAPI Documentation** - Auto-generated API docs
- ✅ **Error Code Registry** - Detailed error messages
- ✅ **Hot Reload** - Fast development iteration
- ✅ **Test Scripts** - Comprehensive testing suite

---

## 🌟 Use Cases

### API Providers
- Monetize existing free APIs
- Add usage-based pricing to services
- Create tiered access levels
- Track API consumption

### Developers
- Access premium APIs with crypto
- No credit card required
- Pay-as-you-go model
- Transparent pricing

### Enterprises
- Internal API billing
- Department-level cost tracking
- Audit trail for API usage
- Automated accounting

---

## 📈 Roadmap

- [ ] WebSocket support for streaming APIs
- [ ] Advanced analytics & insights
- [ ] Multi-signature wallet support
- [ ] Fiat payment gateway integration
- [ ] Rate limiting per-API
- [ ] API marketplace

---

## 🤝 Contributing

We welcome contributions! See our docs for development guidelines.

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🏆 Built For Hackathon

This project demonstrates:
- ✅ **Innovation**: First HTTP 402 implementation for blockchain payments
- ✅ **Technical Excellence**: Edge computing, multi-chain, modern stack
- ✅ **Practical Value**: Solves real monetization problems
- ✅ **Completeness**: Full-stack with docs, UI, and deployment
- ✅ **Scalability**: Cloudflare Workers = unlimited scale

---

## 📞 Support & Contact

- **Issues**: Open a GitHub issue
- **Documentation**: Check the guides above
- **Demo**: [Live Demo Link](#) *(Add your deployed URL)*

---

<div align="center">

**Built with ❤️ using Cloudflare Workers, Vue 3, and Blockchain**

⭐ Star this repo if you find it useful!

</div>

