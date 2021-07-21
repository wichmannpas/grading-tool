<template>
  <div>
    <h1>Tasks</h1>
    <TaskList />
  </div>
</template>

<script>
import TaskList from "@/components/TaskList";
import {onMounted} from "vue";

export default {
  name: 'Home',
  components: {TaskList},
  setup () {
    onMounted(() => {
      document.title = 'Korrekturtool'
    })
  }
}
</script>
