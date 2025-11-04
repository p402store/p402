<template>
  <div class="api-detail-page">
    <NavBar @connect="() => {}" />
    
    <div class="container">
      <div v-if="loading" class="loading">Loading API details...</div>
      
      <div v-else-if="!api" class="error-state">
        <div class="error-icon">❌</div>
        <h2>API Not Found</h2>
        <p>The requested API does not exist or has been removed.</p>
        <button @click="$router.push('/marketplace')" class="btn btn-primary">
          Back to Marketplace
        </button>
      </div>
      
      <div v-else class="api-detail-content">
        <!-- Back Button -->
        <button @click="$router.back()" class="back-btn">
          ← Back
        </button>
        
        <!-- Two Column Layout -->
        <div class="detail-grid">
          <!-- Left Column: General Info -->
          <div class="left-column">
            <!-- Header -->
            <div class="api-header">
              <div class="api-title-section">
                <div class="title-row">
                  <h1>{{ api.api_name }}</h1>
                  <span class="network-badge">{{ api.network }}</span>
                </div>
                
                <p v-if="api.description" class="api-description">
                  {{ api.description }}
                </p>
                
                <div class="api-meta">
                  <div class="meta-item">
                    <span class="meta-label">per request</span>
                    <span class="meta-value price">{{ api.price }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">network</span>
                    <span class="meta-value">{{ api.network }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">created</span>
                    <span class="meta-value">{{ formatDate(api.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
           
            
            <!-- Payment Details -->
            <div class="payment-details">
              <h3>💰 Payment Details</h3>
              <div class="payment-info">
                <p>Each request costs <strong class="price-highlight">{{ api.price }}</strong></p>
                <p>Automatically charged via <strong>{{ api.network }}</strong></p>
                <p class="payment-note">Payments are handled automatically through the x402 protocol - no manual payment integration needed!</p>
              </div>
            </div>
            
            <!-- Tags (if available) -->
            <div v-if="parsedTags.length > 0" class="tags-section">
              <h3>Tags</h3>
              <div class="tag-list">
                <span v-for="tag in parsedTags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Documentation & Usage -->
          <div class="right-column">
             <!-- API Endpoint -->
            <div class="endpoint-section">
              <h3>API Endpoint</h3>
              <div class="endpoint-box">
                <div class="endpoint-content">
                  <code>{{ apiEndpoint }}</code>
                </div>
                <button @click="copyEndpoint" class="btn-copy" :class="{ copied }">
                  {{ copied ? '✓' : '📋' }}
                </button>
              </div>
            </div>
            <!-- Documentation -->
            <div v-if="api.documentation" class="documentation-section">
              <h2>Documentation</h2>
              <div class="doc-content" v-html="renderedDocs"></div>
            </div>
            
            <!-- How to Use -->
            <div class="usage-section">
              <h2>Quick Start</h2>
              
              <div class="usage-steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h3>Create a new client from the starter template</h3>
                    <p>Use your favorite package manager:</p>
                    
                    <div class="code-tabs">
                      <div class="code-tab">
                        <h4>npm (npx)</h4>
                        <div class="code-example">
                          <pre><code>npx @payai/x402-fetch-starter my-first-client</code></pre>
                        </div>
                      </div>
                      
                      <div class="code-tab">
                        <h4>pnpm</h4>
                        <div class="code-example">
                          <pre><code>pnpm dlx @payai/x402-fetch-starter my-first-client</code></pre>
                        </div>
                      </div>
                      
                      <div class="code-tab">
                        <h4>bun</h4>
                        <div class="code-example">
                          <pre><code>bunx @payai/x402-fetch-starter my-first-client</code></pre>
                        </div>
                      </div>
                    </div>
                    <p class="step-note">The starter mirrors the upstream example and bootstraps a ready-to-run Fetch client.</p>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h3>Set your environment variables</h3>
                    <p>Open your generated project's <code>.env</code> and set the following:</p>
                    
                    <ul class="env-list">
                      <li><strong>RESOURCE_SERVER_URL:</strong> Base URL of the server to call (e.g., http://localhost:8787)</li>
                      <li><strong>ENDPOINT_PATH:</strong> Path to a paid endpoint (e.g., /api/{{ api.id }})</li>
                      <li><strong>PRIVATE_KEY:</strong> Hex EVM private key of the paying account</li>
                    </ul>
                    
                    <div class="code-example">
                      <pre><code>RESOURCE_SERVER_URL=http://localhost:8787
ENDPOINT_PATH=/api/{{ api.id }}
PRIVATE_KEY=0x...</code></pre>
                    </div>
                    
                    <button @click="copyEndpoint" class="btn btn-primary" style="margin-top: 16px;">
                      {{ copied ? '✓ Copied Endpoint!' : '📋 Copy API Endpoint' }}
                    </button>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h3>Preview the client code</h3>
                    <p>This is the <code>index.ts</code> the starter generates. It loads your env, wraps <code>fetch</code> with x402, calls your endpoint, and logs both the JSON body and the decoded <code>x-payment-response</code> headers.</p>
                    
                    <div class="code-example">
                      <pre><code>import { config } from "dotenv";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { decodeXPaymentResponse, wrapFetchWithPayment } from "x402-fetch";

config();

const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = process.env.RESOURCE_SERVER_URL as string;
const endpointPath = process.env.ENDPOINT_PATH as string;
const url = `${baseURL}${endpointPath}`;

if (!baseURL || !privateKey || !endpointPath) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const account = privateKeyToAccount(privateKey);
const fetchWithPayment = wrapFetchWithPayment(fetch, account);

fetchWithPayment(url, {
  method: "GET",
})
  .then(async response => {
    const body = await response.json();
    console.log(body);

    const paymentResponse = decodeXPaymentResponse(
      response.headers.get("x-payment-response")!
    );
    console.log(paymentResponse);
  })
  .catch(error => {
    console.error(error.response?.data?.error);
  });</code></pre>
                    </div>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <h3>Run the client</h3>
                    <p>Start your client to make x402 payments:</p>
                    
                    <div class="code-example">
                      <pre><code>npm run dev</code></pre>
                    </div>
                    
                    <div class="success-note">
                      <span class="success-icon">✓</span>
                      <span>Your client is now making x402 payments!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
import type { Api } from '../types';

const route = useRoute();
const toast = useToast();

const api = ref<Api | null>(null);
const loading = ref(false);
const copied = ref(false);

const apiEndpoint = computed(() => {
  if (!api.value) return '';
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  return `${baseUrl}/api/${api.value.id}`;
});

const parsedTags = computed(() => {
  if (!api.value) return [];
  const tags = (api.value as any).tags;
  if (!tags) return [];
  
  try {
    return typeof tags === 'string' ? JSON.parse(tags) : tags;
  } catch {
    return [];
  }
});

const renderedDocs = computed(() => {
  if (!api.value?.documentation) return '';
  
  const md = api.value.documentation;
  
  return md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>');
});

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function copyEndpoint() {
  try {
    await navigator.clipboard.writeText(apiEndpoint.value);
    copied.value = true;
    toast.success('Endpoint copied to clipboard!');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    toast.error('Failed to copy endpoint');
    console.error('Failed to copy:', error);
  }
}

async function loadApiDetails() {
  loading.value = true;
  try {
    const apiId = route.params.id as string;
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/public/apis`);
    
    if (response.ok) {
      const data = await response.json();
      const foundApi = data.apis.find((a: Api) => a.id === apiId);
      
      if (foundApi) {
        api.value = foundApi;
      }
    } else {
      toast.error('Failed to load API details');
    }
  } catch (error) {
    toast.error('Failed to load API details');
    console.error('Failed to load API details:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadApiDetails();
});
</script>

<style scoped>
/* API Detail styles in global style.css */
</style>
