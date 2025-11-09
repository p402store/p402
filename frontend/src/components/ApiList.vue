<template>
  <div v-if="loading" class="loading">Loading APIs...</div>
  <div v-else-if="apis.length === 0" class="empty-state">
    <div class="empty-icon">📦</div>
    <h3>No APIs Yet</h3>
    <p>Get started by adding your first API</p>
    <button @click="$emit('add')" class="btn btn-primary">
      Add Your First API
    </button>
  </div>
  <div v-else class="api-list">
    <div v-for="api in apis" :key="api.id" class="api-list-item">
      <div class="api-main-info">
        <div class="api-title-section">
          <h3>
            {{ api.api_name }}
            <span v-if="api.verified === 1" class="verified-badge" title="Verified API">
             <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
              <path fill="#c8e6c9" d="M44,24c0,11-9,20-20,20S4,35,4,24S13,4,24,4S44,13,44,24z"></path><polyline fill="none" stroke="#4caf50" stroke-miterlimit="10" stroke-width="4" points="14,24 21,31 36,16"></polyline>
              </svg>
            </span>
          </h3>
          <span class="api-network">{{ api.network }}</span>
        </div>
        <p class="api-description">{{ api.description || 'No description' }}</p>
      </div>
      
      <div class="api-info-grid">
        <div class="info-item target-url-item">
          <span class="info-label">Target URL</span>
          <div class="info-value info-url" :title="api.target_url">
            {{ api.target_url }}
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">Price</span>
          <span class="info-value info-price">{{ api.price }}</span>
        </div>
        <div class="info-item proxy-url-item">
          <span class="info-label">Proxy URL</span>
          <code class="info-proxy" @click="$emit('copy-url', api.id)" :title="getProxyUrl(api.id)">
            {{ getProxyUrl(api.id) }}
          </code>
        </div>
      </div>
      
      <div class="api-list-actions">
        <label class="switch">
          <input 
            type="checkbox" 
            :checked="api.is_active === 1"
            @change="$emit('toggle', api)"
          >
          <span class="slider"></span>
        </label>
        <button @click="$emit('edit', api)" class="btn btn-outline btn-sm">
          Edit
        </button>
        <button @click="$emit('delete', api)" class="btn btn-danger btn-sm">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Api } from '../types';

defineProps<{
  apis: Api[];
  loading: boolean;
}>();

defineEmits<{
  add: [];
  edit: [api: Api];
  delete: [api: Api];
  toggle: [api: Api];
  'copy-url': [apiId: string];
}>();

function getProxyUrl(apiId: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  return `${baseUrl}/api/${apiId}`;
}
</script>

<style scoped>

</style>
