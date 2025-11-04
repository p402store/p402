<template>
  <nav class="navbar">
    <div class="nav-content">
      <div class="nav-brand" @click="$router.push('/')">
        <img src="/logo.png" alt="P402 Logo" class="brand-logo" />
      </div>
      
      <div class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
        <button @click="navigateTo('/')" class="nav-link">
          Home
        </button>
        <button @click="navigateTo('/marketplace')" class="nav-link">
          Marketplace
        </button>
        <button @click="navigateTo('/dashboard')" class="nav-link">
          Dashboard
        </button>
        <button @click="navigateTo('/documentation')" class="nav-link">
          Documentation
        </button>
        
        <!-- Mobile actions inside menu -->
        <div class="mobile-nav-actions">
          <button v-if="!isAuthenticated" @click="handleConnect" class="btn btn-primary">
            Sign In
          </button>
          <template v-else>
            <button @click="navigateTo('/dashboard')" class="btn btn-outline">
              Dashboard
            </button>
            <button @click="handleLogout" class="btn btn-danger">
              Logout
            </button>
          </template>
        </div>
      </div>
      
      <div class="nav-actions desktop-actions">
        <button v-if="!isAuthenticated" @click="handleConnect" class="btn btn-primary">
          Sign In
        </button>
        <template v-else>
          <button @click="$router.push('/dashboard')" class="btn btn-outline">
            Dashboard
          </button>
          <button @click="handleLogout" class="btn btn-danger">
            Logout
          </button>
        </template>
      </div>

      <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ 'open': mobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const emit = defineEmits<{
  connect: [];
}>();

function handleConnect() {
  emit('connect');
  mobileMenuOpen.value = false;
}

async function handleLogout() {
  await authStore.disconnectWallet();
  mobileMenuOpen.value = false;
  router.push('/');
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function navigateTo(path: string) {
  router.push(path);
  mobileMenuOpen.value = false;
}
</script>

<style scoped>
.navbar {
  background: rgba(0, 0, 0, 0.95);
  border-bottom: 2px solid rgba(255, 107, 0, 0.3);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.nav-brand:hover {
  transform: translateY(-2px);
}

.brand-logo {
  height: 60px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(255, 107, 0, 0.6));
}

.brand-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 8px rgba(255, 107, 0, 0.6));
}

.brand-text {
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 600;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-family: inherit;
}

.nav-link:hover {
  color: #ff6b00;
  background: rgba(255, 107, 0, 0.1);
}

.nav-actions {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 101;
}

.mobile-menu-btn span {
  width: 25px;
  height: 3px;
  background: #ff6b00;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.mobile-menu-btn.open span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.mobile-menu-btn.open span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.open span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

.mobile-nav-actions {
  display: none;
}

@media (max-width: 768px) {
  .nav-content {
    padding: 16px 20px;
    gap: 16px;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .desktop-actions {
    display: none !important;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.98);
    backdrop-filter: blur(20px);
    border-left: 2px solid rgba(255, 107, 0, 0.3);
    flex-direction: column;
    padding: 80px 30px 30px;
    gap: 8px;
    transition: right 0.3s ease;
    overflow-y: auto;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
  }

  .nav-links.mobile-open {
    right: 0;
  }

  .nav-link {
    width: 100%;
    text-align: left;
    padding: 14px 20px;
    font-size: 18px;
  }

  .mobile-nav-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 107, 0, 0.2);
  }

  .mobile-nav-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .brand-logo {
    height: 50px;
  }

  .brand-text {
    font-size: 24px;
  }

  .brand-icon {
    font-size: 28px;
  }

  .nav-actions {
    gap: 8px;
  }

  .nav-actions .btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>
