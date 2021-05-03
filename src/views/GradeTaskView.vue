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

    <div class="columns">
      <div class="column col-8 col-md-12">
        <GradeSubtask v-for="subtask in task.subtasks"
                      :key="subtask.id"
                      :subtask="subtask"
                      :task="task" />
      </div>
      <div class="column col-4 col-md-12">
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
          <em>{{ remainingSubtasks }}</em> subtasks not yet graded.
        </div>
        <label class="columns total-points">
          <div class="column col-4">
            <strong>Total points:</strong>
          </div>
          <div class="column col-8">
            <input v-model="totalPoints"
                   class="form-input"
                   readonly
                   step="0.5"
                   type="number"
                   @click="$event.target.select()" />
          </div>
        </label>
        <textarea v-model="feedback"
                  :class="{ 'is-error': remainingSubtasks > 0 }"
                  class="form-input feedback-textarea"
                  readonly
                  rows="25"
                  @click="$event.target.select()"></textarea>
      </div>
    </div>
  </div>
  <div v-else>
    <h1>Task Not Found</h1>
  </div>
</template>

<script>
import {computed} from 'vue';
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
    const task = computed(() => {
      const task = taskStore.getTaskById(props.id)
      if (task === undefined) {
        router.push({
          name: 'Home'
        })
      }
      return task
    })

    function createNewGrading () {
      if (task.value === undefined) {
        return
      }
      const newGrading = new Grading()
      newGrading.task = task.value
      gradingStore.setCurrentGrading(newGrading)
    }

    const grading = computed(() => gradingStore.getState().currentGrading)
    if (grading.value.task !== task.value) {
      createNewGrading()
    }

    const feedback = computed(() => {
      if (task.value === undefined) {
        return
      }

      let result = ''
      task.value.subtasks.forEach((subtask, index) => {
        if (index > 0) {
          result += '\n\n'
        }

        result += subtask.name + '\n'
        let points = parseFloat(subtask.maxPoints)

        subtask.comments.forEach(comment => {
          if (grading.value.commentIds.indexOf(comment.id) >= 0) {
            result += comment.text + ' (' + comment.points.toString() + 'P)\n'
            points += comment.points
          }
        })

        if (points > parseFloat(subtask.maxPoints)) {
          console.warn('too many points!')
          points = subtask.maxPoints
        } else if (points < 0) {
          points = 0
        }
        result += points.toString() + '/' + subtask.maxPoints.toString()
      })
      return result
    })
    const totalPoints = computed(() => {
      if (task.value === undefined) {
        return
      }

      let totalPoints = 0
      task.value.subtasks.forEach(subtask => {
        let points = parseFloat(subtask.maxPoints)

        subtask.comments.forEach(comment => {
          if (grading.value.commentIds.indexOf(comment.id) >= 0) {
            points += comment.points
          }
        })

        if (points > parseFloat(subtask.maxPoints)) {
          console.warn('too many points!')
          points = subtask.maxPoints
        } else if (points < 0) {
          points = 0
        }
        totalPoints += points
      })
      return totalPoints
    })

    return {
      task,
      grading,
      feedback,
      totalPoints,
      newGrading: createNewGrading,
      remainingSubtasks: computed(() => {
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
    }
  }
}
</script>
