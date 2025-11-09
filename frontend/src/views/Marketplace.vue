<template>
  <div class="marketplace-page">
    <!-- Navigation Header -->
    <NavBar @connect="connectWallet" />
    
    <div class="container">
      <!-- Header Section -->
      <div class="marketplace-header">
        <h1 class="page-title">
          <span class="gradient-text">API Marketplace</span>
        </h1>
        <p class="subtitle">Discover and integrate powerful APIs built on blockchain</p>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <svg class="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <div class="stat-content">
            <div class="stat-label">Total APIs</div>
            <div class="stat-value">{{ apis.length }}</div>
          </div>
        </div>
        <div class="stat-card">
          <svg class="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <div class="stat-content">
            <div class="stat-label">Filtered Results</div>
            <div class="stat-value">{{ filteredApis.length }}</div>
          </div>
        </div>
        <div class="stat-card">
          <svg class="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <div class="stat-content">
            <div class="stat-label">Networks</div>
            <div class="stat-value">{{ networks.length }}</div>
          </div>
        </div>
      </div>

      <!-- Search and Filters Card -->
      <div class="filters-card">
        <div class="filters-header">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Search & Filter
          </h3>
          <button v-if="searchQuery || selectedNetwork !== 'all'" @click="resetFilters" class="btn-reset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Reset
          </button>
        </div>
        
        <div class="filters-content">
          <!-- Search Input -->
          <div class="search-input-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search APIs by name or description..." 
              class="search-input"
            />
          </div>
          
          <!-- Network Filter Pills -->
          <div class="filter-tags">
            <button 
              :class="['filter-tag', { active: selectedNetwork === 'all' }]"
              @click="selectedNetwork = 'all'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              All Networks
            </button>
            <button 
              v-for="network in networks" 
              :key="network"
              :class="['filter-tag', { active: selectedNetwork === network }]"
              @click="selectedNetwork = network"
            >
              {{ network }}
            </button>
          </div>

          <!-- Verified Filter Toggle -->
          <div class="verified-filter">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="showVerifiedOnly"
                class="toggle-checkbox"
              />
              <span class="toggle-switch"></span>
              <span class="toggle-text">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Show Verified Only
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading APIs from marketplace...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredApis.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <h3>No APIs Found</h3>
        <p>Try adjusting your search or filters to find what you're looking for</p>
      </div>

      <!-- API Grid -->
      <div v-else class="api-grid">
        <div 
          v-for="api in filteredApis" 
          :key="api.id" 
          class="marketplace-card"
          @click="viewApiDetails(api)"
        >
          <div class="card-header">
            <div class="card-title-section">
              <h3>
                {{ api.api_name }}
                <span v-if="api.verified === 1" class="verified-badge" title="Verified API">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
<path fill="#c8e6c9" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path><path fill="#4caf50" d="M34.586,14.586l-13.57,13.586l-5.602-5.586l-2.828,2.828l8.434,8.414l16.395-16.414L34.586,14.586z"></path>
</svg>
                </span>
              </h3>
              <span class="api-id">#{{ api.id }}</span>
            </div>
            <span class="network-badge">{{ api.network }}</span>
          </div>
          
          <p class="card-description">
            {{ api.description || 'No description available' }}
          </p>
          
          <div class="card-footer">
            <div class="price-section">
              <div class="price-tag">
                <span class="price-label">Price per Request</span>
                <span class="price-value">{{ api.price }}</span>
              </div>
            </div>
            
            <button class="btn-use" @click.stop="useApi(api)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              View Details
            </button>
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
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
import type { Api } from '../types';

const router = useRouter();
const toast = useToast();

const apis = ref<Api[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedNetwork = ref('all');
const showVerifiedOnly = ref(true); // Default olarak verified olanları göster

const networks = ['solana', 'ethereum', 'polygon', 'base', 'arbitrum'];

const filteredApis = computed(() => {
  // Ensure apis.value is an array
  if (!Array.isArray(apis.value)) {
    return [];
  }
  
  let filtered = apis.value
  
  // Filter by verified status
  if (showVerifiedOnly.value) {
    filtered = filtered.filter(api => api.verified === 1);
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(api => 
      api.api_name.toLowerCase().includes(query) ||
      (api.description && api.description.toLowerCase().includes(query))
    );
  }
  
  // Filter by network
  if (selectedNetwork.value !== 'all') {
    filtered = filtered.filter(api => api.network === selectedNetwork.value);
  }
  
  return filtered;
});

async function loadApis() {
  loading.value = true;
  try {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/public/apis`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', data);
      apis.value = data.apis || [];
      console.log('APIs loaded:', apis.value.length);
    } else {
      toast.error(`Failed to load APIs: ${response.statusText}`);
    }
  } catch (error) {
    toast.error('Failed to load APIs. Please try again.');
    console.error('Failed to load APIs:', error);
  } finally {
    loading.value = false;
  }
}

function connectWallet() {
  // Will open wallet modal or redirect to home
  window.location.href = '/#/';
}

function viewApiDetails(api: Api) {
  router.push(`/api/${api.id}`);
}

function useApi(api: Api) {
  // Copy proxy URL or redirect to documentation
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const url = `${baseUrl}/api/${api.id}`;
  navigator.clipboard.writeText(url);
  toast.success('API URL copied to clipboard!');
}

function resetFilters() {
  searchQuery.value = '';
  selectedNetwork.value = 'all';
  showVerifiedOnly.value = true; // Reset to default (verified only)
}

onMounted(() => {
  loadApis();
});
</script>

<style scoped>
.api-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 24px;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .api-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .api-grid {
    grid-template-columns: 1fr;
  }
}

.marketplace-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 280px;
}

.marketplace-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 107, 0, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 107, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.card-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.api-id {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Monaco', 'Courier New', monospace;
}

.network-badge {
  padding: 6px 12px;
  background: rgba(255, 107, 0, 0.15);
  border: 1px solid rgba(255, 107, 0, 0.3);
  border-radius: 6px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  color: #ff8c00;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-description {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  font-size: 14px;
  flex: 1;
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 107, 0, 0.1);
  margin-top: auto;
}

.price-section {
  flex: 1;
}

.price-tag {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.price-value {
  font-size: 20px;
  font-weight: 800;
  color: #ff6b00;
}

.btn-use {
  padding: 10px 16px;
  background: rgba(255, 107, 0, 0.15);
  border: 1px solid rgba(255, 107, 0, 0.3);
  border-radius: 6px;
  color: #ff6b00;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-use:hover {
  background: rgba(255, 107, 0, 0.25);
  border-color: #ff6b00;
  transform: translateX(2px);
}
</style>
