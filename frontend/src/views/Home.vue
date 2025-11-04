<template>
  <div class="app">
    <!-- Navigation -->
    <NavBar @connect="showWalletModal = true" />

    <!-- Hero Section - Always show on home -->
    <HeroSection 
      :is-authenticating="authStore.isAuthenticating"
      @connect="showWalletModal = true"
    />

    <!-- How It Works Section -->
    <section class="how-it-works">
      <div class="container">
        <h2 class="section-title">How It Works</h2>
        <p class="section-subtitle">Monetize your APIs in 3 simple steps with automatic payments</p>
        
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-icon">1</div>
            <h3>Register Your API</h3>
            <p>Connect your wallet and add your API endpoint with a price per request</p>
          </div>
          
          <div class="step-card">
            <div class="step-icon">2</div>
            <h3>Get Proxy URL</h3>
            <p>Receive a unique proxy URL that handles authentication and payment automatically</p>
          </div>
          
          <div class="step-card">
            <div class="step-icon">3</div>
            <h3>Earn Instantly</h3>
            <p>Get paid for every request made to your API via blockchain micropayments</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Payment Flow Section -->
    <section class="payment-flow">
      <div class="container">
        <h2 class="section-title">Automatic Payment Flow</h2>
        <p class="section-subtitle">Seamless micropayments with x402 protocol</p>
        
        <div class="flow-diagram">
          <div class="flow-step">
            <div class="flow-icon">🔑</div>
            <h4>Client Request</h4>
            <p>User makes API request with payment header</p>
          </div>
          
          <div class="flow-arrow">→</div>
          
          <div class="flow-step">
            <div class="flow-icon">⚡</div>
            <h4>x402 Verification</h4>
            <p>Protocol verifies payment signature on-chain</p>
          </div>
          
          <div class="flow-arrow">→</div>
          
          <div class="flow-step">
            <div class="flow-icon">💰</div>
            <h4>Payment Transfer</h4>
            <p>Funds transferred directly to your wallet</p>
          </div>
          
          <div class="flow-arrow">→</div>
          
          <div class="flow-step">
            <div class="flow-icon">✅</div>
            <h4>API Response</h4>
            <p>Client receives data after successful payment</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits">
      <div class="container">
        <h2 class="section-title">Why Choose P402?</h2>
        
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon">⚡</div>
            <h3>Instant Payments</h3>
            <p>Receive payments immediately for each API call with blockchain speed</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">🔒</div>
            <h3>Secure & Trustless</h3>
            <p>No middleman - payments go directly from consumer to provider</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">💎</div>
            <h3>Micropayments</h3>
            <p>Charge per request with prices as low as $0.0001</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">🌐</div>
            <h3>Multi-Chain Support</h3>
            <p>Works with Solana, Ethereum, Polygon, Base, and Arbitrum</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">🚀</div>
            <h3>Zero Setup</h3>
            <p>No payment integration needed - just add your API endpoint</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">📊</div>
            <h3>Real-time Analytics</h3>
            <p>Track usage, revenue, and performance in your dashboard</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="tech-stack">
      <div class="container">
        <h2 class="section-title">Built With Cutting-Edge Technology</h2>
        
        <div class="tech-categories">
          <div class="tech-category">
            <h3>Blockchain</h3>
            <div class="tech-items">
              <div class="tech-item">
                <span class="tech-emoji">◎</span>
                <span>Solana</span>
              </div>
              <div class="tech-item">
                <span class="tech-emoji">Ξ</span>
                <span>Ethereum</span>
              </div>
              <div class="tech-item">
                <span class="tech-emoji">⬡</span>
                <span>Polygon</span>
              </div>
            </div>
          </div>
          
          <div class="tech-category">
            <h3>Protocol</h3>
            <div class="tech-items">
              <div class="tech-item">
                <span class="tech-emoji">🔐</span>
                <span>x402 Payment Protocol</span>
              </div>
              <div class="tech-item">
                <span class="tech-emoji">💳</span>
                <span>PayAI Network</span>
              </div>
            </div>
          </div>
          
          <div class="tech-category">
            <h3>Infrastructure</h3>
            <div class="tech-items">
              <div class="tech-item">
                <span class="tech-emoji">☁️</span>
                <span>Cloudflare Workers</span>
              </div>
              <div class="tech-item">
                <span class="tech-emoji">🗄️</span>
                <span>D1 Database</span>
              </div>
              <div class="tech-item">
                <span class="tech-emoji">⚙️</span>
                <span>Hono Framework</span>
              </div>
            </div>
          </div>
          
          <div class="tech-category">
            <h3>Frontend</h3>
            <div class="tech-items">
              <div class="tech-item">
                <span class="tech-emoji">🖼️</span>
                <span>Vue 3</span>
              </div>
              <div class="tech-item">
                <span class="tech-emoji">⚡</span>
                <span>Vite</span>
              </div>
              <div class="tech-item">
                <span class="tech-emoji">🎨</span>
                <span>TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Monetize Your APIs?</h2>
          <p>Join the future of API monetization with automatic blockchain payments</p>
          <button @click="showWalletModal = true" class="btn btn-primary btn-large">
            Get Started Now
          </button>
        </div>
      </div>
    </section>

    <!-- Wallet Selection Modal -->
    <WalletModal 
      :show="showWalletModal" 
      @close="showWalletModal = false"
      @select="onWalletSelect"
    />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '../stores/auth';
import NavBar from '../components/NavBar.vue';
import WalletModal from '../components/WalletModal.vue';
import HeroSection from '../components/HeroSection.vue';
import Footer from '../components/Footer.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const showWalletModal = ref(false);

async function onWalletSelect() {
  try {
    await authStore.connectWallet();
    toast.success('Wallet connected successfully!');
    // Redirect to dashboard after successful connection
    router.push('/dashboard');
  } catch (error) {
    toast.error('Failed to connect wallet. Please try again.');
    console.error('Connection error:', error);
  }
}

onMounted(async () => {
  await authStore.checkSession();
  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});
</script>

