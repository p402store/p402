<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Edit API' : 'Add New API' }}</h2>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label>API Name *</label>
          <input 
            v-model="formData.api_name" 
            type="text" 
            required 
            placeholder="My Awesome API"
          >
        </div>
        
        <div class="form-group">
          <label>Short Description</label>
          <textarea 
            v-model="formData.description" 
            rows="2" 
            placeholder="Brief description for the marketplace..."
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Documentation (Markdown)</label>
          <div class="markdown-editor">
            <div class="editor-tabs">
              <button 
                type="button"
                :class="['tab', { active: activeTab === 'write' }]"
                @click="activeTab = 'write'"
              >
                Write
              </button>
              <button 
                type="button"
                :class="['tab', { active: activeTab === 'preview' }]"
                @click="activeTab = 'preview'"
              >
                Preview
              </button>
            </div>
            <textarea 
              v-if="activeTab === 'write'"
              v-model="formData.documentation" 
              rows="10" 
              placeholder="# API Documentation&#10;&#10;## Endpoints&#10;&#10;### GET /example&#10;Description of your endpoint...&#10;&#10;## Authentication&#10;Explain how to authenticate..."
              class="markdown-input"
            ></textarea>
            <div v-else class="markdown-preview" v-html="markdownPreview"></div>
          </div>
          <small>Use Markdown to document your API endpoints, authentication, examples, etc.</small>
        </div>
        
        <div class="form-group">
          <label>Target URL *</label>
          <input 
            v-model="formData.target_url" 
            type="url" 
            required 
            placeholder="https://api.example.com"
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Price *</label>
            <input 
              v-model="formData.price" 
              type="text" 
              required 
              placeholder="$0.001"
              pattern="\$\d+(\.\d+)?"
            >
            <small>Format: $0.001</small>
          </div>
          
          <div class="form-group">
            <label>Network *</label>
            <select v-model="formData.network" required>
              <option value="solana">Solana</option>
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="base">Base</option>
              <option value="arbitrum">Arbitrum</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Custom Headers (Optional)</label>
          <div class="headers-section">
            <div v-for="(header, index) in headersList" :key="index" class="header-row">
              <input 
                v-model="header.key" 
                type="text" 
                placeholder="Header Name (e.g., X-API-Key)"
                class="header-input"
              >
              <input 
                v-model="header.value" 
                type="text" 
                placeholder="Header Value"
                class="header-input"
              >
              <button type="button" @click="removeHeader(index)" class="btn-icon btn-remove">
                &times;
              </button>
            </div>
            <button type="button" @click="addHeader" class="btn btn-outline btn-sm">
              + Add Header
            </button>
          </div>
          <small>These headers will be sent with every proxied request. Useful for API keys, authentication, etc.</small>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="close" class="btn btn-outline">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Api, ApiFormData } from '../types';

const props = defineProps<{
  show: boolean;
  api?: Api | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: ApiFormData];
}>();

const formData = ref<ApiFormData>({
  api_name: '',
  description: '',
  documentation: '',
  target_url: '',
  price: '$0.001',
  network: 'solana',
  headers: {}
});

const isEdit = ref(false);
const activeTab = ref<'write' | 'preview'>('write');

// Headers management
interface HeaderItem {
  key: string;
  value: string;
}

const headersList = ref<HeaderItem[]>([]);

function addHeader() {
  headersList.value.push({ key: '', value: '' });
}

function removeHeader(index: number) {
  headersList.value.splice(index, 1);
}

function headersListToObject(): Record<string, string> {
  const headers: Record<string, string> = {};
  headersList.value.forEach(h => {
    if (h.key && h.value) {
      headers[h.key] = h.value;
    }
  });
  return headers;
}

function headersObjectToList(headers?: Record<string, string>) {
  if (!headers || Object.keys(headers).length === 0) {
    headersList.value = [];
    return;
  }
  headersList.value = Object.entries(headers).map(([key, value]) => ({ key, value }));
}

// Simple markdown to HTML converter
const markdownPreview = computed(() => {
  const md = formData.value.documentation || '';
  
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

watch(() => props.api, (newApi) => {
  if (newApi) {
    isEdit.value = true;
    formData.value = {
      api_name: newApi.api_name,
      description: newApi.description,
      documentation: newApi.documentation || '',
      target_url: newApi.target_url,
      price: newApi.price,
      network: newApi.network as any,
      headers: newApi.headers || {}
    };
    headersObjectToList(newApi.headers);
  } else {
    isEdit.value = false;
    resetForm();
  }
}, { immediate: true });

function resetForm() {
  formData.value = {
    api_name: '',
    description: '',
    documentation: '',
    target_url: '',
    price: '$0.001',
    network: 'solana',
    headers: {}
  };
  headersList.value = [];
  activeTab.value = 'write';
}

function close() {
  resetForm();
  emit('close');
}

function handleSubmit() {
  // Convert headers list to object before submitting
  formData.value.headers = headersListToObject();
  emit('submit', formData.value);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 10, 0.95) 100%);
  border: 2px solid rgba(255, 107, 0, 0.4);
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(255, 107, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 2px solid rgba(255, 107, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%);
}

.modal-header h2 {
  font-size: 28px;
  font-weight: 800;
  color: #ff6b00;
  margin: 0;
}

.close-btn {
  background: rgba(255, 107, 0, 0.1);
  border: 1px solid rgba(255, 107, 0, 0.3);
  color: #ff6b00;
  font-size: 28px;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 300;
}

.close-btn:hover {
  background: rgba(255, 107, 0, 0.2);
  border-color: rgba(255, 107, 0, 0.5);
  transform: rotate(90deg);
}

.modal-form {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 107, 0, 0.3);
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #ff6b00;
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.15);
}

.form-group small {
  display: block;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.markdown-editor {
  border: 2px solid rgba(255, 107, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.5);
}

.editor-tabs {
  display: flex;
  border-bottom: 2px solid rgba(255, 107, 0, 0.3);
  background: rgba(0, 0, 0, 0.3);
}

.tab {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab.active {
  background: rgba(255, 107, 0, 0.1);
  color: #ff6b00;
  border-bottom: 2px solid #ff6b00;
}

.tab:hover:not(.active) {
  background: rgba(255, 107, 0, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.markdown-input {
  border: none !important;
  border-radius: 0 !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  min-height: 300px;
}

.markdown-input:focus {
  box-shadow: none !important;
}

.markdown-preview {
  padding: 16px 20px;
  min-height: 300px;
  color: rgba(255, 255, 255, 0.9);
  overflow-y: auto;
  line-height: 1.8;
}

.markdown-preview :deep(h1) {
  font-size: 28px;
  color: #ff6b00;
  margin: 24px 0 16px;
  font-weight: 800;
  border-bottom: 2px solid rgba(255, 107, 0, 0.3);
  padding-bottom: 8px;
}

.markdown-preview :deep(h2) {
  font-size: 22px;
  color: #ff8c00;
  margin: 20px 0 12px;
  font-weight: 700;
}

.markdown-preview :deep(h3) {
  font-size: 18px;
  color: #ff8c00;
  margin: 16px 0 10px;
  font-weight: 600;
}

.markdown-preview :deep(p) {
  margin: 12px 0;
}

.markdown-preview :deep(code) {
  background: rgba(255, 107, 0, 0.1);
  color: #ff8c00;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.markdown-preview :deep(pre) {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 107, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-preview :deep(pre code) {
  background: none;
  color: rgba(255, 255, 255, 0.9);
  padding: 0;
}

.markdown-preview :deep(a) {
  color: #ff6b00;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 107, 0, 0.3);
  transition: all 0.3s ease;
}

.markdown-preview :deep(a:hover) {
  border-bottom-color: #ff6b00;
}

.markdown-preview :deep(strong) {
  color: #ff8c00;
  font-weight: 700;
}

.markdown-preview :deep(em) {
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.headers-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 8px;
}

.header-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 107, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.header-input:focus {
  outline: none;
  border-color: #ff6b00;
  box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
}

.header-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.btn-icon {
  padding: 8px 12px;
  background: transparent;
  border: 1px solid rgba(255, 107, 0, 0.3);
  border-radius: 6px;
  color: #ff6b00;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.btn-icon:hover {
  background: rgba(255, 107, 0, 0.1);
  border-color: #ff6b00;
}

.btn-remove {
  color: #ff4444;
  border-color: rgba(255, 68, 68, 0.3);
}

.btn-remove:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: #ff4444;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
  align-self: flex-start;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 107, 0, 0.2);
}

.form-actions .btn {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 0, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  border: 2px solid #ff6b00;
  color: #ff6b00;
}

.btn-outline:hover {
  background: rgba(255, 107, 0, 0.1);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
