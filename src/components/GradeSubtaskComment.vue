<template>
  <label v-if="subtaskComment !== undefined"
         :class="{ active: selected }"
         class="subtask-comment">
    <div class="columns">
      <div class="col-1">
        <span class="form-checkbox form-inline">
          <input v-model="selected"
                 :disabled="done"
                 type="checkbox" />
          <i class="form-icon"></i>
        </span>
      </div>
      <div class="col-8">
        <template v-if="!editing">
          {{ subtaskComment.text }}
        </template>
        <textarea v-if="editing"
                  ref="textInput"
                  v-model="commentText"
                  class="form-input"
                  rows="4"
                  @keydown.enter="editing = false; $event.preventDefault()" />
      </div>
      <div class="col-1">
        <template v-if="!editing">
          ({{ subtaskComment.points }}P)
        </template>
        <input v-if="editing"
               v-model="commentPoints"
               class="form-input"
               step="0.5"
               type="number"
               @keydown.enter="editing = false" />
      </div>
      <div class="col-2 text-right">
        <button v-if="!editing"
                class="btn btn-sm tooltip"
                data-tooltip="Edit comment"
                @click="startEditing(); $event.preventDefault()">
          <i class="icon icon-edit"></i>
        </button>
        <button v-if="editing"
                class="btn btn-sm btn-success tooltip"
                data-tooltip="Finish editing"
                @click="editing = false; $event.preventDefault()">
          <i class="icon icon-check"></i>
        </button>
        <button class="btn btn-sm btn-error tooltip"
                data-tooltip="Delete comment"
                @click="deleteComment(); $event.preventDefault()">
          <i class="icon icon-delete"></i>
        </button>
      </div>
    </div>
    <span class="float-right">
    </span>
  </label>
  <div v-else></div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch, watchEffect } from 'vue'
import { SubtaskComment } from '@/models/subtaskComment'
import { taskStore } from '@/store/task'
import { SubTask } from '@/models/subtask'
import { Task } from '@/models/task'
import { gradingStore } from '@/store/grading'

export default defineComponent({
  name: 'GradeSubtaskComment',
  props: {
    task: Task,
    subtask: SubTask,
    subtaskComment: SubtaskComment,
    done: Boolean
  },
  setup (props) {
    const selected = ref(false)
    const editing = ref(false)
    const commentText = ref('')
    const commentPoints: Ref<number> = ref(0)
    const textInput: Ref<null | HTMLTextAreaElement> = ref(null)

    function focusTextInput () {
      setTimeout(() => {
        if (textInput.value === null) {
          return
        }
        textInput.value.focus()
      }, 50)
    }

    watchEffect(() => {
      if (props.subtaskComment === undefined) {
        return
      }
      commentText.value = props.subtaskComment.text
      commentPoints.value = props.subtaskComment.points

      if (props.subtaskComment.newlyAdded) {
        editing.value = true
        selected.value = true
        taskStore.updateSubtaskComment(props.task, props.subtask, props.subtaskComment, newComment => {
          newComment.newlyAdded = false
        })
        focusTextInput()
      }
    })

    watch(commentText, value => {
      if (props.subtaskComment !== undefined && commentText.value === props.subtaskComment.text) {
        return
      }
      taskStore.updateSubtaskComment(props.task, props.subtask, props.subtaskComment, newComment => {
        newComment.text = value
      })
    })
    watch(commentPoints, value => {
      if (typeof value === 'string') {
        value = parseFloat(value)
      }
      if (isNaN(value)) {
        return
      }
      taskStore.updateSubtaskComment(props.task, props.subtask, props.subtaskComment, newComment => {
        newComment.points = value
      })
    })

    watch(selected, value => gradingStore.setCurrentGradingCommentActive(props.subtaskComment, value))
    watch(() => gradingStore.getState().currentGrading.commentIds, value => {
      if (props.subtaskComment === undefined) {
        return
      }
      selected.value = value.indexOf(props.subtaskComment.id) >= 0
    })

    return {
      selected,
      editing,
      commentText,
      commentPoints,
      textInput,
      startEditing () {
        editing.value = true
        focusTextInput()
      },
      deleteComment () {
        const subtaskComment: SubtaskComment | undefined = props.subtaskComment
        if (subtaskComment === undefined) {
          return
        }

        if (!confirm('Delete comment?')) {
          return
        }

        taskStore.updateSubtask(props.task, props.subtask, newSubtask => {
          const index = newSubtask.comments.findIndex(comment => comment.id === subtaskComment.id)
          newSubtask.comments.splice(index, 1)
        })
      }
    }
  }
})
</script>
