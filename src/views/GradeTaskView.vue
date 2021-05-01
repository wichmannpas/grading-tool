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
                      :task="task"
                      :subtask="subtask" />
      </div>
      <div class="column col-4 col-md-12">
        TODO: buttons für neue Klausur
        ggf. history speichern (und dann einen Back-button?)
        <textarea class="form-input"
                  disabled
                  @click="$event.target.select()"
                  rows="25"></textarea>
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

    return {
      task,
    }
  }
}
</script>
