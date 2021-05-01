import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import GradeTaskView from '../views/GradeTaskView.vue'
import TaskView from '../views/TaskView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/task/:id',
    name: 'Task',
    component: TaskView,
    props: true
  },
  {
    path: '/task/:id/grade',
    name: 'GradeTask',
    component: GradeTaskView,
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
