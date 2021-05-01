<template>
  <div v-if="task !== undefined">
    <h1>Task „{{ task.name }}“</h1>

    <p>
      <router-link :to="{ name: 'Home' }" class="btn">
        <i class="icon icon-arrow-left"></i> Back
      </router-link>
      <button class="btn btn-error"
              @click="deleteTask">
        <i class="icon icon-cross"></i> Delete Task
      </button>
      <router-link :to="{ name: 'Home' }" class="btn btn-primary">
        <i class="icon icon-arrow-right"></i> Grade Task
      </router-link>
    </p>

    <p>
      <input v-model="taskName"
             class="form-input"
             type="text" />
    </p>

    <SubTaskList :task="task" />
  </div>
  <div v-else>
    <h1>Task Not Found</h1>
  </div>
</template>

<script>
import {computed, ref, watch, watchEffect} from 'vue';
import {taskStore} from "@/store/task";
import router from "@/router";
import {Task} from "@/models/task";
import SubTaskList from "@/components/SubTaskList";

export default {
  name: 'TaskView',
  components: {SubTaskList},
  props: {
    id: String
  },
  setup (props) {
    const taskName = ref('')
    const task = computed(() => {
      const task = taskStore.getTaskById(props.id)
      if (task === undefined) {
        router.push({
          name: 'Home'
        })
      }
      return task
    })

    watchEffect(() => {
      if (task.value === undefined) {
        return
      }
      taskName.value = task.value.name
    })
    watch(taskName, name => {
      const newTask = Object.assign(new Task(), task.value)
      newTask.name = name
      taskStore.updateTask(newTask)
    })
    return {
      task,
      taskName,
      deleteTask () {
        if (!confirm('Really delete task „' + task.value.name + '“?')) {
          return
        }

        taskStore.deleteTask(task.value.id)

        router.push({
          name: 'Home'
        })
      }
    }
  }
}
</script>
