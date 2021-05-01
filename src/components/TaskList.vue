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
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { taskStore } from '@/store/task'
import { Task } from '@/models/task'

export default defineComponent({
  name: 'TaskList',
  setup () {
    taskStore.sortTasks()
    return {
      tasks: taskStore.getState().tasks,
      addTask () {
        taskStore.addTask(new Task())
      }
    }
  }
})
</script>
