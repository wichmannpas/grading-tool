<template>
  <div>
    <ul>
      <li v-for="(task, i) in tasks"
          :key="i">
        <router-link :to="{ name: 'Task', params: { id: task.id } }">
          »{{ task.name }}«
        </router-link>
      </li>
    </ul>
    <button class="btn btn-block btn-primary"
            @click="addTask">
      <i class="icon icon-plus"></i>
      Add Task
    </button>
    <div v-if="authenticated"
         class="toast">
      Authenticated.
      <template v-if="syncedPrefixes.length > 0">
        Tasks with one of the following prefixes are synchronized:
        <ul>
          <li v-for="(prefix, i) in syncedPrefixes"
              :key="i">
            {{ prefix }}
          </li>
        </ul>
      </template>
      <template v-else>
        This client is not allowed to synchronize any tasks!
      </template>
      <button class="btn btn-block btn-error"
              @click="logout">Remove Authentication
      </button>
    </div>
    <hr />
    <h2>Export</h2>
    <textarea v-model="tasksJson"
              class="form-input"
              readonly
              rows="20"
              @click="$event.target.select()"></textarea>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { taskStore } from '@/store/task'
import { Task } from '@/models/task'
import { authStore } from '@/store/auth'
import { serialize } from 'serializr'
import { logout } from '@/websocket'

export default defineComponent({
  name: 'TaskList',
  setup () {
    taskStore.sortTasks()
    return {
      tasks: taskStore.getState().tasks,
      tasksJson: computed(() => JSON.stringify(
          taskStore.getState().tasks.map(task => serialize(Task, task)), null, 2)),
      authenticated: computed(() => !authStore.getState().workingLocally),
      syncedPrefixes: computed(() => authStore.getState().groups),
      addTask () {
        taskStore.addTask(new Task(authStore.getState().clientId))
      },
      logout () {
        const authToken = authStore.getState().authToken
        if (authToken !== null) {
          logout(authToken)
        }
        authStore.clearAuthToken()
      }
    }
  }
})
</script>
