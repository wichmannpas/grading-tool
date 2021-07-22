<template>
  <div class="modal active">
    <a class="modal-overlay"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a aria-label="Close" class="btn btn-clear float-right" @click="dismissAuth"></a>
        <div class="modal-title h5">Authenticate to Sync With Server</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <p>
            Login to synchronize task data with server.
          </p>
          <div class="form-group">
            <label class="form-label"
                   for="auth-password">Username</label>
            <input id="auth-username"
                   ref="usernameInput"
                   v-model="userData.username"
                   class="form-input"
                   placeholder="Username"
                   type="text"
                   @keyup.enter="login" />
          </div>
          <div class="form-group">
            <label class="form-label"
                   for="auth-password">Password</label>
            <input id="auth-password"
                   v-model="userData.password"
                   class="form-input"
                   placeholder="Password"
                   type="password"
                   @keyup.enter="login" />
          </div>
        </div>
        <div v-if="authFailed"
             class="toast toast-error">
          Authentication failed.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn"
                @click="dismissAuth">Cancel (Work Locally)
        </button>
        <button class="btn btn-primary"
                @click="login">Login
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, Ref } from 'vue'
import { authStore } from '@/store/auth'
import { attemptLogin } from '@/websocket'

export default defineComponent({
  name: 'AuthModal',
  setup () {
    const usernameInput: Ref<HTMLInputElement | null> = ref(null)
    const userData = reactive({
      username: '',
      password: ''
    })

    onMounted(() => {
      if (usernameInput.value === null)
        return
      usernameInput.value.focus()
    })

    return {
      usernameInput,
      userData,
      authFailed: computed(() => authStore.getState().authFailed),
      dismissAuth () {
        authStore.setAuthDismissed(true)
      },
      login () {
        attemptLogin(userData.username, userData.password)
      }
    }
  }
})
</script>
