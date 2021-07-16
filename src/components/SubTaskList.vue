<template>
  <div>
    <h2>Subtasks</h2>

    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th></th>
          <th>
            Name
          </th>
          <th>
            Comments
          </th>
          <th class="text-right">
            Max. Points
          </th>
        </tr>
      </thead>
      <SubTaskRow v-for="subtask in task.subtasks"
                  :key="subtask.id"
                  :subtask="subtask"
                  :task="task" />
    </table>
    <button class="btn btn-block btn-primary"
            @click="addSubTask">
      <i class="icon icon-plus"></i>
      Add Subtask
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Task } from '@/models/task'
import { taskStore } from '@/store/task'
import { SubTask } from '@/models/subtask'
import SubTaskRow from '@/components/SubTaskRow.vue'
import { authStore } from '@/store/auth'

export default defineComponent({
  name: 'SubTaskList',
  components: { SubTaskRow },
  props: {
    task: Task
  },
  setup (props) {
    return {
      addSubTask () {
        if (props.task === undefined) {
          console.warn('SubTaskList did not receive a task prop!')
          return
        }

        const newTask = Object.assign(new Task(), props.task)
        newTask.lastChanged = new Date()
        newTask.lastChangeClientId = authStore.getClientId()
        newTask.subtasks.push(new SubTask(authStore.getClientId()))
        taskStore.updateTask(newTask)
      }
    }
  }
})
</script>
