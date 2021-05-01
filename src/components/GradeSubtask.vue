<template>
  <div v-if="subtask !== undefined">
    <h3>Subtask »{{ subtask.name }}« ({{ subtask.maxPoints }}P)</h3>

    <GradeSubtaskComment v-for="comment in subtask.comments"
                         :key="comment.id"
                         :subtask="subtask"
                         :subtask-comment="comment"
                         :task="task" />

    <button class="btn btn-sm btn-block"
            @click="addComment">
      <i class="icon icon-plus"></i>
      Add comment
    </button>
  </div>
  <div v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SubTask } from '@/models/subtask'
import { Task } from '@/models/task'
import GradeSubtaskComment from '@/components/GradeSubtaskComment.vue'
import { taskStore } from '@/store/task'
import { SubtaskComment } from '@/models/subtaskComment'

export default defineComponent({
  name: 'GradeSubtask',
  components: { GradeSubtaskComment },
  props: {
    task: Task,
    subtask: SubTask
  },
  setup (props) {
    return {
      addComment () {
        taskStore.updateSubtask(props.task, props.subtask, newSubtask => {
          newSubtask.comments.push(new SubtaskComment(true))
        })
      }
    }
  }
})
</script>
