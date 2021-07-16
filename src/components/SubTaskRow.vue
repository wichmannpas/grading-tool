<template>
  <tr v-if="subtask !== undefined">
    <td>
      <button class="btn btn-error"
              tabindex="-1"
              @click="deleteSubtask">
        <i class="icon icon-delete"></i>
      </button>
      <button v-if="canMoveUp"
              class="btn btn-link"
              tabindex="-1"
              @click="moveSubtask(-1)">
        <i class="icon icon-arrow-up"></i>
      </button>
      <button v-if="canMoveDown"
              class="btn btn-link"
              tabindex="-1"
              @click="moveSubtask(1)">
        <i class="icon icon-arrow-down"></i>
      </button>
    </td>
    <td>
      <input
          v-model="subtaskName"
          class="form-input"
          type="text" />
    </td>
    <td>
      <ul>
        <li v-for="(comment, i) in subtask.comments"
            :key="i">
          {{ comment.text }} ({{ comment.points }}P)
        </li>
      </ul>
    </td>
    <td class="text-right">
      <input
          v-model="subtaskMaxPoints"
          class="form-input text-right"
          step="0.5"
          type="number" />
    </td>
  </tr>
  <tr v-else />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, watchEffect } from 'vue'
import { SubTask } from '@/models/subtask'
import { Task } from '@/models/task'
import { taskStore } from '@/store/task'
import { authStore } from '@/store/auth'

export default defineComponent({
  name: 'SubTaskRow',
  props: {
    task: Task,
    subtask: SubTask
  },
  setup (props) {
    const subtaskName = ref('')
    const subtaskMaxPoints = ref(0)

    watchEffect(() => {
      if (props.task === undefined || props.subtask === undefined) {
        return
      }
      subtaskName.value = props.subtask.name
      subtaskMaxPoints.value = props.subtask.maxPoints
    })

    watch(subtaskName, name => {
      if (props.subtask !== undefined && subtaskName.value === props.subtask.name) {
        return
      }
      taskStore.updateSubtask(props.task, props.subtask, (newSubtask: SubTask) => {
        newSubtask.name = name
      })
    })
    watch(subtaskMaxPoints, maxPoints => {
      taskStore.updateSubtask(props.task, props.subtask, (newSubtask: SubTask) => {
        newSubtask.maxPoints = maxPoints
      })
    })

    function canMoveComputed (direction: number) {
      return computed(() => {
        // for some reason, TypeScript thinks that props.subtask is possibly undefined despite the check
        // up here; as a workaround, copy its value into a local variable
        const propsTask = props.task as Task | undefined
        const propsSubtask = props.subtask as SubTask | undefined
        if (propsTask === undefined || propsSubtask === undefined) {
          return false
        }
        const subtaskIndex = propsTask.subtasks.findIndex(subtask => subtask.id === propsSubtask.id)
        if (direction > 0) {
          return subtaskIndex < propsTask.subtasks.length - 1
        } else {
          return subtaskIndex > 0
        }
      })
    }

    return {
      subtaskName,
      subtaskMaxPoints,
      canMoveUp: canMoveComputed(-1),
      canMoveDown: canMoveComputed(1),
      deleteSubtask () {
        if (!confirm('Really delete subtask?')) {
          return
        }

        // for some reason, TypeScript thinks that props.subtask is possibly undefined despite the check
        // up here; as a workaround, copy its value into a local variable
        const propsTask = props.task as Task | undefined
        const propsSubtask = props.subtask as SubTask | undefined
        if (propsTask === undefined || propsSubtask === undefined) {
          return
        }
        const newTask = Object.assign(new Task(), propsTask)
        newTask.lastChanged = new Date()
        newTask.lastChangeClientId = authStore.getClientId()
        const subtaskIndex = newTask.subtasks.findIndex(subtask => subtask.id === propsSubtask.id)
        newTask.subtasks.splice(subtaskIndex, 1)
        taskStore.updateTask(newTask)
      },
      moveSubtask (direction: number) {
        // for some reason, TypeScript thinks that props.subtask is possibly undefined despite the check
        // up here; as a workaround, copy its value into a local variable
        const propsTask = props.task as Task | undefined
        const propsSubtask = props.subtask as SubTask | undefined
        if (propsTask === undefined || propsSubtask === undefined) {
          return
        }
        const newTask = Object.assign(new Task(), propsTask)
        newTask.lastChanged = new Date()
        newTask.lastChangeClientId = authStore.getClientId()
        const subtaskIndex = newTask.subtasks.findIndex(subtask => subtask.id === propsSubtask.id)

        const newIndex = subtaskIndex + direction

        if (newIndex < 0 || newIndex >= newTask.subtasks.length) {
          console.warn('new index out of range')
          return
        }

        newTask.subtasks.splice(subtaskIndex, 1)
        newTask.subtasks.splice(newIndex, 0, propsSubtask)
        taskStore.updateTask(newTask)
      }
    }
  }
})
</script>
