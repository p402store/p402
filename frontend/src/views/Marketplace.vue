<template>
  <div class="marketplace-page">
    <!-- Navigation Header -->
    <NavBar @connect="connectWallet" />
    
    <div class="container">
      <div class="marketplace-header">
        <h1>API Marketplace</h1>
        <p class="subtitle">Discover and integrate powerful APIs built on Solana</p>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search APIs..." 
            class="search-input"
          >
        </div>
        
        <div class="filter-tags">
          <button 
            :class="['filter-tag', { active: selectedNetwork === 'all' }]"
            @click="selectedNetwork = 'all'"
          >
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
      </div>

      <!-- API Grid -->
      <div v-if="loading" class="loading">Loading APIs...</div>
      
      <div v-else-if="filteredApis.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No APIs Found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <div v-else class="api-grid">
        <div 
          v-for="api in filteredApis" 
          :key="api.id" 
          class="marketplace-card"
          @click="viewApiDetails(api)"
        >
          <div class="card-header">
            <h3>{{ api.api_name }}</h3>
            <span class="network-badge">{{ api.network }}</span>
          </div>
          
          <p class="card-description">
            {{ api.description || 'No description available' }}
          </p>
          
          <div class="card-footer">
            <div class="price-tag">
              <span class="price-label">Price</span>
              <span class="price-value">{{ api.price }}</span>
            </div>
            
            <button class="btn-use" @click.stop="useApi(api)">
              Use API →
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

const networks = ['solana', 'ethereum', 'polygon', 'base', 'arbitrum'];

const filteredApis = computed(() => {
  // Ensure apis.value is an array
  if (!Array.isArray(apis.value)) {
    return [];
  }
  
  let filtered = apis.value
  
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

onMounted(() => {
  loadApis();
});
</script>

<style scoped>
/* Marketplace styles in global style.css */
</style>
