<template>
  <label v-if="subtaskComment !== undefined"
         :class="{ active: selected, moving: movingActive === subtaskComment.id }"
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
      <div class="col-7">
        <template v-if="!editing">
          {{ subtaskComment.text }}
        </template>
        <textarea v-if="editing"
                  ref="textInput"
                  v-model="commentTextEdit"
                  class="form-input"
                  rows="4"
                  @keydown.enter="finishEditing" />
      </div>
      <div class="col-1 text-right">
        <template v-if="!editing">
          ({{ subtaskComment.points }}P)
        </template>
        <input v-if="editing"
               v-model="commentPointsEdit"
               class="form-input"
               step="0.5"
               type="number"
               @keydown.enter="finishEditing" />
      </div>
      <div class="col-3 text-right">
        <button v-if="!editing"
                class="btn btn-sm tooltip"
                data-tooltip="Edit comment"
                @click="startEditing(); $event.preventDefault()">
          <i class="icon icon-edit"></i>
        </button>
        <button v-if="editing"
                class="btn btn-sm btn-success tooltip"
                data-tooltip="Finish editing"
                @click="finishEditing">
          <i class="icon icon-check"></i>
        </button>
        <button :disabled="!canMoveUp || movingActive !== null"
                class="btn btn-sm tooltip"
                data-tooltip="Move Up"
                tabindex="-1"
                @click="moveComment(-1); $event.preventDefault()">
          <i class="icon icon-arrow-up"></i>
        </button>
        <button v-if="movingActive !== subtaskComment.id"
                :disabled="movingActive !== null"
                class="btn btn-sm tooltip"
                data-tooltip="Move …"
                tabindex="-1"
                @click="startMoveComment(); $event.preventDefault()">
          <i class="icon icon-resize-vert"></i>
        </button>
        <button v-else
                class="btn btn-sm tooltip"
                data-tooltip="Cancel Move"
                tabindex="-1"
                @click="stopMoveComment(); $event.preventDefault()">
          <i class="icon icon-stop"></i>
        </button>
        <button :disabled="!canMoveDown || movingActive !== null"
                class="btn btn-sm tooltip"
                data-tooltip="Move Down"
                tabindex="-1"
                @click="moveComment(1); $event.preventDefault()">
          <i class="icon icon-arrow-down"></i>
        </button>
        <button class="btn btn-sm btn-error tooltip"
                data-tooltip="Delete comment"
                :disabled="movingActive !== null"
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
import { computed, defineComponent, ref, Ref, watch, watchEffect } from 'vue'
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
    done: Boolean,
    movingActive: String
  },
  setup (props, { emit }) {
    const selected = ref(false)
    const editing = ref(false)
    const commentText = ref('')
    const commentTextEdit = ref('')
    const commentPoints: Ref<number> = ref(0)
    const commentPointsEdit: Ref<number> = ref(0)
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

    watch(selected, value => {
      if (props.subtaskComment === undefined)
        return
      gradingStore.setCurrentGradingCommentActive(props.subtaskComment, value)
      if (value && props.subtaskComment.text.toLocaleLowerCase().replace('.', '') === 'fehlt')
        emit('mark-subtask-done')
    })
    watch(() => gradingStore.getState().currentGrading.commentIds, value => {
      if (props.subtaskComment === undefined) {
        return
      }
      selected.value = value.indexOf(props.subtaskComment.id) >= 0
    })

    function canMoveComputed (direction: number) {
      return computed(() => {
        // for some reason, TypeScript thinks that props.subtask is possibly undefined despite the check
        // up here; as a workaround, copy its value into a local variable
        const propsComment = props.subtaskComment as SubtaskComment | undefined
        const propsSubtask = props.subtask as SubTask | undefined
        if (propsComment === undefined || propsSubtask === undefined) {
          return false
        }
        const commentIndex = propsSubtask.comments.findIndex(comment => comment.id === propsComment.id)
        if (direction > 0) {
          return commentIndex < propsSubtask.comments.length - 1
        } else {
          return commentIndex > 0
        }
      })
    }

    return {
      selected,
      editing,
      commentText,
      commentTextEdit,
      commentPoints,
      commentPointsEdit,
      textInput,
      canMoveUp: canMoveComputed(-1),
      canMoveDown: canMoveComputed(1),
      startEditing () {
        commentTextEdit.value = commentText.value
        commentPointsEdit.value = commentPoints.value
        editing.value = true
        focusTextInput()
      },
      finishEditing (event: Event) {
        let pointsValue = commentPointsEdit.value
        if (typeof pointsValue === 'string') {
          pointsValue = parseFloat(pointsValue)
        }
        if (isNaN(pointsValue)) {
          return
        }

        event.preventDefault()
        editing.value = false

        if (commentText.value === commentTextEdit.value && commentPoints.value === commentPointsEdit.value) {
          // nothing has changed
          return
        }
        taskStore.updateSubtaskComment(props.task, props.subtask, props.subtaskComment, newComment => {
          newComment.text = commentTextEdit.value
          newComment.points = commentPointsEdit.value
        })
        commentText.value = commentTextEdit.value
        commentPoints.value = commentPointsEdit.value
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
      },
      startMoveComment () {
        if (props.subtaskComment === undefined)
          return
        emit('start-move-comment', props.subtaskComment.id)
      },
      moveComment (direction: number) {
        // for some reason, TypeScript thinks that props.subtask is possibly undefined despite the check
        // up here; as a workaround, copy its value into a local variable
        const propsComment = props.subtaskComment as SubtaskComment | undefined
        const propsSubtask = props.subtask as SubTask | undefined
        const propsTask = props.task as Task | undefined
        if (propsComment === undefined || propsSubtask === undefined || propsTask === undefined) {
          return false
        }
        taskStore.updateSubtask(propsTask, propsSubtask, newSubtask => {
          const commentIndex = newSubtask.comments.findIndex(comment => comment.id === propsComment.id)
          const newIndex = commentIndex + direction

          if (newIndex < 0 || newIndex >= newSubtask.comments.length) {
            console.warn('new index out of range for comment')
            return
          }

          newSubtask.comments.splice(commentIndex, 1)
          newSubtask.comments.splice(newIndex, 0, propsComment)
        })
      },
      stopMoveComment () {
        emit('stop-move-comment')
      }
    }
  }
})
</script>
