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
    <h3 />
    <h2>Export</h2>
    <div v-if="jsonInvalid"
         class="toast toast-error">
      Ungültige Eingabe.
    </div>
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

export default defineComponent({
  name: 'TaskList',
  setup () {
    taskStore.sortTasks()
    return {
      tasks: taskStore.getState().tasks,
      tasksJson: computed(() => JSON.stringify(
          taskStore.getState().tasks.map(task => serialize(Task, task)), null, 2)),
      addTask () {
        taskStore.addTask(new Task(authStore.getState().clientId))
      }
    }
  }
})
</script>
