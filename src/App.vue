<template>
  <div class="container grid-xl">
    <div v-if="workingLocally && !storageWarningDismissed"
         class="toast">
      <p>
        All data is only stored within the browser's local storage!
        Save the exported JSON data to a file to persist or share it.
        <a @click="undismissAuth" class="c-hand">Login</a>
        <button class="btn btn-link float-right"
                @click="storageWarningDismissed = !storageWarningDismissed">
          <i class="icon icon-cross"></i>
        </button>
      </p>
    </div>
    <router-view />

    <AuthModal v-if="workingLocally && !authDismissed" />
  </div>
</template>

<script>
import {computed, ref} from 'vue'
import {authStore} from "@/store/auth";
import AuthModal from "@/components/AuthModal";

export default {
  name: 'App',
  components: {AuthModal},
  setup () {
    return {
      storageWarningDismissed: ref(false),
      workingLocally: computed(() => {
        return authStore.getState().workingLocally
      }),
      authDismissed: computed(() => {
        return authStore.getState().authDismissed
      }),
      undismissAuth () {
        authStore.setAuthDismissed(false)
      }
    }
  }
}
</script>
