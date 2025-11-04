<template>
  <div class="dashboard-page">
    <!-- Navigation Header -->
    <NavBar @connect="() => {}" />
    
    <div class="container">
      <!-- Stats Overview -->
      <StatsGrid 
        :total-apis="userApis.length"
        :active-apis="activeApisCount"
        :revenue="totalRevenue"
        :requests="totalRequests"
      />

      <!-- API Management -->
      <div class="api-section">
        <div class="section-header">
          <h2>Your APIs</h2>
          <button @click="showAddModal = true" class="btn btn-primary">
            + Add New API
          </button>
        </div>

        <!-- API List -->
        <ApiList
          :apis="userApis"
          :loading="loading"
          @add="showAddModal = true"
          @edit="editApi"
          @delete="deleteApiConfirm"
          @toggle="toggleApiStatus"
          @copy-url="copyProxyUrl"
        />
      </div>
    </div>

    <!-- Add/Edit API Modal -->
    <ApiModal
      :show="showAddModal || !!editingApi"
      :api="editingApi"
      :submitting="submitting"
      @close="closeModal"
      @submit="submitApi"
    />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
import type { Api, ApiFormData } from '../types';
import StatsGrid from '../components/StatsGrid.vue';
import ApiList from '../components/ApiList.vue';
import ApiModal from '../components/ApiModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const userApis = ref<Api[]>([]);
const loading = ref(false);
const showAddModal = ref(false);
const editingApi = ref<Api | null>(null);
const submitting = ref(false);

const activeApisCount = computed(() => {
  return userApis.value.filter(api => api.is_active === 1).length;
});

const totalRevenue = computed(() => {
  return (userApis.value.length * 0.001).toFixed(4);
});

const totalRequests = computed(() => {
  return userApis.value.length * 150;
});

async function loadUserApis() {
  if (!authStore.address) return;
  
  loading.value = true;
  try {
    userApis.value = await apiService.getUserApis(authStore.address);
  } catch (error) {
    toast.error('Failed to load APIs. Please try again.');
    console.error('Failed to load APIs:', error);
  } finally {
    loading.value = false;
  }
}

async function copyProxyUrl(apiId: string) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const url = `${baseUrl}/api/${apiId}`;
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Proxy URL copied to clipboard!');
  } catch (error) {
    toast.error('Failed to copy URL');
    console.error('Failed to copy:', error);
  }
}

async function toggleApiStatus(api: Api) {
  try {
    const newStatus = api.is_active === 1 ? 0 : 1;
    await apiService.toggleApiStatus(api.id, newStatus === 1);
    api.is_active = newStatus;
    toast.success(`API ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    toast.error('Failed to update API status');
    console.error('Failed to toggle status:', error);
  }
}

function editApi(api: Api) {
  editingApi.value = api;
  showAddModal.value = false;
}

async function submitApi(formData: ApiFormData) {
  if (!authStore.address) return;
  
  submitting.value = true;
  try {
    if (editingApi.value) {
      await apiService.updateApi(editingApi.value.id, formData);
      toast.success('API updated successfully');
    } else {
      await apiService.registerApi({
        ...formData,
        owner_address: authStore.address
      });
      toast.success('API registered successfully');
    }
    
    await loadUserApis();
    closeModal();
  } catch (error) {
    toast.error('Failed to save API. Please check your inputs.');
    console.error('Failed to save API:', error);
  } finally {
    submitting.value = false;
  }
}

function closeModal() {
  showAddModal.value = false;
  editingApi.value = null;
}

async function deleteApiConfirm(api: Api) {
  if (!confirm(`Are you sure you want to delete "${api.api_name}"?`)) {
    return;
  }
  
  try {
    await apiService.deleteApi(api.id);
    await loadUserApis();
    toast.success('API deleted successfully');
  } catch (error) {
    toast.error('Failed to delete API');
    console.error('Failed to delete API:', error);
  }
}

onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/');
    return;
  }
  
  await loadUserApis();
});
</script>

<style scoped>
/* Dashboard-specific styles in global style.css */
</style>
