<template>
  <div>
    <h1>Tasks</h1>
    <TaskList />
  </div>
</template>

<script>
import TaskList from "@/components/TaskList";

export default {
  name: 'Home',
  components: {TaskList}
}
</script>
