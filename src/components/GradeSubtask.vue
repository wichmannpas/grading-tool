<template>
  <div v-if="subtask !== undefined"
       :class="{ done: done }"
       class="grade-subtask">
    <h3>
      <label :class="{ 'subtask-bonus': subtask.isBonus }"
             class="form-checkbox">
        <input v-model="done"
               type="checkbox" />
        <i class="form-icon"></i>

        <template v-if="subtask.isBonus">Bonus</template>
        Subtask »{{ subtask.name }}« ({{ subtask.maxPoints }}P)
      </label>
    </h3>

    <GradeSubtaskComment v-for="comment in subtask.comments"
                         :key="comment.id"
                         :done="done"
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
import { defineComponent, ref, watch } from 'vue'
import { SubTask } from '@/models/subtask'
import { Task } from '@/models/task'
import GradeSubtaskComment from '@/components/GradeSubtaskComment.vue'
import { taskStore } from '@/store/task'
import { SubtaskComment } from '@/models/subtaskComment'
import { gradingStore } from '@/store/grading'
import { Grading } from '@/models/grading'
import { authStore } from '@/store/auth'

export default defineComponent({
  name: 'GradeSubtask',
  components: { GradeSubtaskComment },
  props: {
    task: Task,
    subtask: SubTask
  },
  setup (props) {
    const done = ref(false)
    watch(done, value => {
      const subtask: SubTask | undefined = props.subtask
      if (subtask === undefined) {
        return
      }
      const grading = Object.assign(new Grading(), gradingStore.getState().currentGrading)
      grading.doneSubtaskIds = [...grading.doneSubtaskIds]
      const index = grading.doneSubtaskIds.indexOf(subtask.id)
      if (value) {
        if (index >= 0)
          return
        grading.doneSubtaskIds.push(subtask.id)
      } else {
        if (index < 0)
          return
        grading.doneSubtaskIds.splice(index, 1)
      }
      gradingStore.setCurrentGrading(grading)
    })
    watch(() => gradingStore.getState().currentGrading.doneSubtaskIds, value => {
      if (props.subtask === undefined) {
        return
      }
      done.value = value.indexOf(props.subtask.id) >= 0
    })
    return {
      done,
      addComment () {
        taskStore.updateSubtask(props.task, props.subtask, newSubtask => {
          const newComment = new SubtaskComment(true)
          newComment.lastChanged = new Date()
          newComment.lastChangeClientId = authStore.getClientId()
          newSubtask.comments.push(newComment)
          gradingStore.setCurrentGradingCommentActive(newComment, true)
        })
      }
    }
  }
})
</script>
