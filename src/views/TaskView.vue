<template>
  <div v-if="task !== undefined">
    <h1>Task »{{ task.name }}«</h1>

    <div class="btn-group btn-group-block">
      <router-link :to="{ name: 'Home' }" class="btn">
        <i class="icon icon-arrow-left"></i> Home
      </router-link>
      <button class="btn btn-error"
              @click="deleteTask">
        <i class="icon icon-cross"></i> Delete Task
      </button>
    </div>
    <router-link :to="{ name: 'GradeTask', params: { id: task.id } }" class="btn btn-primary btn-block">
      <i class="icon icon-arrow-right"></i> Grade Task
    </router-link>

    <p>
      <label class="form-label">
        Task name:
        <input v-model="taskName"
               class="form-input"
               type="text" />
      </label>
    </p>

    <SubTaskList :task="task" />

    <h2>Import/Export</h2>
    <div v-if="jsonInvalid"
         class="toast toast-error">
      Ungültige Eingabe.
    </div>
    <textarea v-model="taskJson"
              :class="{ 'is-error': jsonInvalid }"
              class="form-input"
              rows="20"
              @click="$event.target.select()"
              @keyup="handleJsonUpdate"></textarea>
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
import {deserialize, serialize} from "serializr";
import {authStore} from "@/store/auth";

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
    const taskJson = ref('')
    let lastJsonValue = ''
    const jsonInvalid = ref(false)

    watchEffect(() => {
      if (task.value === undefined) {
        return
      }
      taskName.value = task.value.name
      taskJson.value = JSON.stringify(serialize(Task, task.value), null, 2)
      jsonInvalid.value = false
    })
    watch(taskName, name => {
      const newTask = Object.assign(new Task(), task.value)
      newTask.lastChanged = new Date()
      newTask.lastChangeClientId = authStore.getClientId()
      newTask.name = name
      taskStore.updateTask(newTask)
    })

    function handleJsonUpdate () {
      if (taskJson.value === lastJsonValue) {
        // no change
        return
      }
      lastJsonValue = taskJson.value
      if (task.value === undefined) {
        return
      }
      let newTask = new Task()
      try {
        newTask = deserialize(Task, JSON.parse(taskJson.value))
      } catch (e) {
        console.warn(e)
        jsonInvalid.value = true
        return
      }
      jsonInvalid.value = false
      newTask.id = task.value.id
      newTask.lastChanged = new Date()
      newTask.lastChangeClientId = authStore.getClientId()
      taskStore.updateTask(newTask)
    }

    return {
      task,
      taskName,
      taskJson,
      jsonInvalid,
      handleJsonUpdate,
      deleteTask () {
        if (!confirm('Really delete task »' + task.value.name + '«?')) {
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
