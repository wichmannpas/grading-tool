<template>
  <div v-if="subtask !== undefined"
       :class="{ done: done }"
       :data-subtask-id="subtask.id"
       class="grade-subtask">
    <h3>
      <label :class="{ 'subtask-bonus': subtask.isBonus }"
             class="form-checkbox">
        <input v-model="done"
               type="checkbox" />
        <i class="form-icon"></i>

        <template v-if="subtask.isBonus">Bonus</template>
        Subtask »{{ subtask.name }}« ({{ currentPoints }}/{{ subtask.maxPoints }}P)
      </label>
    </h3>

    <div class="ephemeral-comment">
      <button v-if="ephemeralComment === null"
              class="btn btn-sm btn-block add-ephemeral-comment"
              @click="addEphemeralComment">
        <i class="icon icon-plus"></i>
        Add Ephemeral Comment (for this single grading only)
      </button>
      <div v-else>
        Ephemeral Comment (for this single grading only)
        <div class="columns">
          <div class="col-9">
            <textarea ref="ephemeralCommentInput"
                      v-model="ephemeralCommentEdit"
                      class="form-input"
                      rows="2" />
          </div>
          <div class="col-1 text-right">
            <input v-model="ephemeralCommentPointsEdit"
                   class="form-input"
                   step="0.5"
                   type="number" />
          </div>
          <div class="col-2">
            <button class="btn btn-sm btn-error tooltip"
                    data-tooltip="Delete ephemeral comment"
                    @click="deleteEphemeralComment">
              <i class="icon icon-delete"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <button v-if="movingActive === null"
            :class="{ 'add-comment': subtask.comments.length > 0 }"
            class="btn btn-sm btn-block"
            @click="addComment(-1)">
      <i class="icon icon-plus"></i>
      Add comment
      <template v-if="subtask.comments.length > 0"> here</template>
    </button>
    <button v-else
            class="btn btn-sm btn-success btn-block move-comment"
            @click="moveCommentHere(-1)">
      <i class="icon icon-resize-horiz"></i>
      Move comment here
    </button>
    <template v-for="(comment, i) in subtask.comments"
              :key="comment.id">
      <GradeSubtaskComment :done="done"
                           :moving-active="movingActive"
                           :subtask="subtask"
                           :subtask-comment="comment"
                           :task="task"
                           @start-move-comment="startMoveComment"
                           @stop-move-comment="movingActive = null"
                           @mark-subtask-done="done = true" />
      <button v-if="movingActive === null"
              class="btn btn-sm btn-block add-comment"
              @click="addComment(i)">
        <i class="icon icon-plus"></i>
        Add comment here
      </button>
      <button v-else
              class="btn btn-sm btn-success btn-block move-comment"
              @click="moveCommentHere(i)">
        <i class="icon icon-resize-horiz"></i>
        Move comment here
      </button>
    </template>
  </div>
  <div v-else />
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue'
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
    function scrollToNextSubtask () {
      if (props.subtask === undefined)
        return
      const subtasks = document.getElementsByClassName('grade-subtask')
      let foundOwn = false
      for (let i = 0; i < subtasks.length; i++) {
        const subtaskElement = subtasks[i] as HTMLElement
        if (subtaskElement.getAttribute('data-subtask-id') === props.subtask.id) {
          foundOwn = true
          continue
        }
        if (foundOwn) {
          const target = subtaskElement.offsetTop - 15
          if (target < 0) {
            return
          }
          window.scrollTo(0, target)
          break
        }
      }
    }

    const ephemeralCommentInput: Ref<HTMLTextAreaElement | null> = ref(null)
    const ephemeralComment = computed(() => {
      if (props.subtask === undefined)
        return null
      return props.subtask.ephemeralComment
    })
    const ephemeralCommentEdit = ref('')
    watch(ephemeralCommentEdit, value => {
      taskStore.updateSubtask(props.task, props.subtask, newSubtask => {
        newSubtask.ephemeralComment = value
      }, true)
    })
    const ephemeralCommentPointsEdit = ref(0)
    watch(ephemeralCommentPointsEdit, value => {
      if (isNaN(parseFloat(value as unknown as string)))
        return
      taskStore.updateSubtask(props.task, props.subtask, newSubtask => {
        newSubtask.ephemeralCommentPoints = value
      }, true)
    })

    const movingActive: Ref<null | string> = ref(null)

    const done = ref(false)
    watch(done, value => {
      if (value) {
        scrollToNextSubtask()
      }

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
      movingActive,
      done,
      currentPoints: computed(() => {
        if (props.subtask === undefined) {
          return 0
        }
        const { subtaskPoints } = props.subtask.calculatePoints(gradingStore.getState().currentGrading)
        return subtaskPoints
      }),
      addComment (afterIndex: number) {
        taskStore.updateSubtask(props.task, props.subtask, newSubtask => {
          const newComment = new SubtaskComment(true)
          newComment.lastChanged = new Date()
          newComment.lastChangeClientId = authStore.getClientId()
          newSubtask.comments.splice(afterIndex + 1, 0, newComment)
          gradingStore.setCurrentGradingCommentActive(newComment, true)
        })
      },
      startMoveComment (commentId: string) {
        if (movingActive.value !== null)
          return
        movingActive.value = commentId
      },
      moveCommentHere (afterIndex: number) {
        if (movingActive.value === null || props.subtask === undefined)
          return
        const comment = props.subtask.comments.find(comment => comment.id === movingActive.value)
        if (comment === undefined)
          return

        // for some reason, TypeScript thinks that props.subtask is possibly undefined despite the check
        // up here; as a workaround, copy its value into a local variable
        const propsSubtask = props.subtask as SubTask | undefined
        const propsTask = props.task as Task | undefined
        if (propsSubtask === undefined || propsTask === undefined)
          return false
        taskStore.updateSubtask(propsTask, propsSubtask, newSubtask => {
          const commentIndex = newSubtask.comments.findIndex(comment => comment.id === movingActive.value)
          let newIndex = afterIndex + 1

          if (commentIndex <= newIndex) {
            // deletion of old copy decrements all following indexes
            newIndex--
          }

          newSubtask.comments.splice(commentIndex, 1)
          newSubtask.comments.splice(newIndex, 0, comment)
        })
        movingActive.value = null
      },
      ephemeralComment,
      ephemeralCommentEdit,
      ephemeralCommentPointsEdit,
      ephemeralCommentInput,
      addEphemeralComment () {
        ephemeralCommentEdit.value = ''
        ephemeralCommentPointsEdit.value = 0
        taskStore.updateSubtask(props.task, props.subtask, newSubtask => {
          newSubtask.ephemeralComment = ''
          newSubtask.ephemeralCommentPoints = 0
        }, true)

        setTimeout(() => {
          if (ephemeralCommentInput.value === null)
            return
          ephemeralCommentInput.value.focus()
        }, 50)
      },
      deleteEphemeralComment () {
        if (!confirm('Delete ephemeral comment?')) {
          return
        }
        taskStore.updateSubtask(props.task, props.subtask, newSubtask => {
          newSubtask.ephemeralComment = null
          newSubtask.ephemeralCommentPoints = null
        }, true)
      }
    }
  }
})
</script>
