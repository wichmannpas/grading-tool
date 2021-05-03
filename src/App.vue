<template>
  <div class="container grid-xl">
    <div v-if="!storageWarningDismissed"
         class="toast">
      <p>
        All data is only stored within the browser's local storage!
        Save the exported JSON data to a file to persist or share it.
        <button class="btn btn-link float-right"
                @click="storageWarningDismissed = !storageWarningDismissed">
          <i class="icon icon-cross"></i>
        </button>
      </p>
    </div>
    <router-view />
  </div>
</template>

<script>
import {ref} from 'vue'

export default {
  name: 'App',
  setup () {
    return {
      storageWarningDismissed: ref(false)
    }
  }
}
</script>
