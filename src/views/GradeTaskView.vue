<template>
  <div v-if="task !== undefined">
    <h1>Grade Task »{{ task.name }}«</h1>

    <p>
      <router-link :to="{ name: 'Task', params: { id: task.id } }" class="btn">
        <i class="icon icon-edit"></i> Edit Task
      </router-link>
      <router-link :to="{ name: 'Home' }" class="btn">
        <i class="icon icon-arrow-left"></i> Home
      </router-link>
    </p>

    <div ref="gradeMainColumns"
         class="columns">
      <div class="column col-8 col-md-12">
        <GradeSubtask v-for="subtask in task.subtasks"
                      :key="subtask.id"
                      :subtask="subtask"
                      :task="task" />
      </div>
      <div :class="{ 'stick-to-top': stickToTop }"
           class="column grade-feedback-column col-4 col-md-12">
        <!-- TODO: ggf. history speichern (und dann einen Back-button?) //-->
        <div class="btn-group btn-group-block">
          <button class="btn"
                  @click="newGrading">
            <i class="icon icon-cross"></i>
            New Grading
          </button>
        </div>
        <div v-if="remainingSubtasks > 0"
             class="toast toast-warning">
          {{ remainingSubtasks }} subtasks not yet graded.
        </div>
        <label class="columns total-points">
          <div class="column col-4">
            <strong>Total points:</strong>
          </div>
          <div class="column col-8">
            <input v-model="feedback.totalPoints"
                   class="form-input"
                   readonly
                   step="0.5"
                   type="number"
                   @click="$event.target.select()" />
          </div>
        </label>
        <textarea ref="feedbackTextDisplay"
                  v-model="feedback.text"
                  :class="{ 'is-error': remainingSubtasks > 0 }"
                  class="form-input feedback-textarea"
                  readonly
                  rows="30"
                  @click="$event.target.select()"></textarea>
      </div>
    </div>
  </div>
  <div v-else>
    <h1>Task Not Found</h1>
  </div>
</template>

<script>
import {computed, onBeforeMount, onUnmounted, onMounted, ref, Ref, watch} from 'vue';
import {taskStore} from "@/store/task";
import router from "@/router";
import GradeSubtask from "@/components/GradeSubtask";
import {gradingStore} from "@/store/grading";
import {Grading} from "@/models/grading";

export default {
  name: 'GradeTaskView',
  components: {GradeSubtask},
  props: {
    id: String
  },
  setup (props) {
    const feedbackTextDisplay = ref(null)
    const task = computed(() => {
      const task = taskStore.getTaskById(props.id)
      if (task === undefined) {
        router.push({
          name: 'Home'
        })
      }
      return task
    })

    const stickToTop = ref(false)
    const gradeMainColumns = ref(null)

    function handleScroll () {
      let container = gradeMainColumns
      if (container.value === null) {
        // component not yet there
        return
      }

      const fontSize = parseFloat(getComputedStyle(container.value).fontSize)

      let top = container.value.offsetTop
      let windowTop = window.scrollY
      // 3em margin for stickyness
      windowTop += 3 * fontSize

      stickToTop.value = windowTop > top
    }

    onBeforeMount(() => {
      window.addEventListener('scroll', handleScroll)
    })
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    function updateTitle () {
      if (task.value === undefined) {
        return
      }
      document.title = task.value.name
    }

    onMounted(updateTitle)
    watch(task, updateTitle)

    function createNewGrading () {
      if (task.value === undefined) {
        return
      }
      const newGrading = new Grading()
      newGrading.task = task.value
      gradingStore.setCurrentGrading(newGrading)
      window.scrollTo(0, 0)
      task.value.subtasks.forEach(subtask => {
        if (subtask.ephemeralComment !== null || subtask.ephemeralCommentPoints !== null) {
          taskStore.updateSubtask(task.value, subtask, newSubtask => {
            newSubtask.ephemeralComment = null
            newSubtask.ephemeralCommentPoints = null
          }, false)
        }
      })
    }

    const grading = computed(() => gradingStore.getState().currentGrading)
    if (grading.value.task !== task.value) {
      createNewGrading()
    }

    const feedback = computed(() => {
      if (task.value === undefined) {
        return
      }

      let totalPoints = 0
      let text = ''
      task.value.subtasks.forEach((subtask, index) => {
        if (index > 0) {
          text += '\n\n'
        }

        if (subtask.name.trim() !== '')
          text += subtask.name + '\n'

        const {subtaskText, subtaskPoints} = subtask.calculatePoints(grading.value)
        text += subtaskText


        totalPoints += subtaskPoints
      })
      return {
        totalPoints,
        text
      }
    })

    const remainingSubtasks = computed(() => {
      if (task.value === undefined) {
        return 0
      }
      const subtaskIds = task.value.subtasks.map(subtask => subtask.id)
      grading.value.doneSubtaskIds.forEach(doneSubtaskId => {
        const index = subtaskIds.indexOf(doneSubtaskId)
        if (index < 0) {
          console.warn('subtask not found in all subtasks array!')
          return
        }
        subtaskIds.splice(index, 1)
      })
      return subtaskIds.length
    })
    watch(remainingSubtasks, value => {
      if (feedbackTextDisplay.value === null) {
        return
      }
      if (value === 0) {
        feedbackTextDisplay.value.focus()
        feedbackTextDisplay.value.select()
        document.execCommand('copy')
        setTimeout(() => {
          feedbackTextDisplay.value.focus()
          feedbackTextDisplay.value.select()
        }, 50)
      }
    })

    return {
      task,
      grading,
      feedback,
      feedbackTextDisplay,
      newGrading: createNewGrading,
      remainingSubtasks,
      gradeMainColumns,
      stickToTop
    }
  }
}
</script>
