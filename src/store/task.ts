import { Store } from './index'
import { Task } from '@/models/task'
import { deserialize, serialize } from 'serializr'
import { SubTask } from '@/models/subtask'
import { SubtaskComment } from '@/models/subtaskComment'
import { syncTasks } from '@/websocket'
import { authStore } from '@/store/auth'

interface TaskInfo extends Object {
  tasks: Task[]
}

class TaskStore extends Store<TaskInfo> {
  protected data (): TaskInfo {
    const tasks: Task[] = []
    const storedTasks = localStorage.getItem('tasks')
    if (storedTasks !== null) {
      const parsedStoredTasks = JSON.parse(storedTasks)
      tasks.push(...parsedStoredTasks.map((storedTask: Object) => deserialize(Task, storedTask)))
    }
    return {
      tasks
    }
  }

  private updateLocalStorage () {
    localStorage.setItem('tasks', JSON.stringify(this.state.tasks.map(task => serialize(task))))
  }

  private findTaskIndex (id: string): number {
    const index = this.state.tasks.findIndex(task => task.id === id)
    if (index < 0) {
      throw new Error('id ' + id + ' not found')
    }
    return index
  }

  getTaskById (id: string) {
    return this.state.tasks.find(task => task.id === id)
  }

  setTasks (tasks: Task[], sync: boolean = true) {
    this.state.tasks.splice(0, this.state.tasks.length)
    this.state.tasks.push(...tasks)

    this.updateLocalStorage()
    syncTasks()
  }

  updateTasks (tasks: Task[], sync: boolean = true) {
    tasks.forEach(task => {
      const index = this.state.tasks.findIndex(t => t.id === task.id)
      if (index !== -1) {
        // merge ephemeral comments into updated version of task
        this.state.tasks[index].subtasks.forEach(subtask => {
          if (subtask.ephemeralComment === null)
            return
          for (let j = 0; j < task.subtasks.length; j++) {
            if (task.subtasks[j].id === subtask.id) {
              task.subtasks[j].ephemeralComment = subtask.ephemeralComment
              task.subtasks[j].ephemeralCommentPoints = subtask.ephemeralCommentPoints
              break
            }
          }
        })
        this.state.tasks.splice(index, 1, task)
      } else {
        this.state.tasks.push(task)
      }
    })

    this.updateLocalStorage()
    if (sync) {
      syncTasks()
    }
  }

  addTask (task: Task) {
    this.state.tasks.push(task)

    this.updateLocalStorage()
    syncTasks()
  }

  updateTask (task: Task, sync: boolean = true) {
    const index = this.findTaskIndex(task.id)
    this.state.tasks.splice(index, 1, task)

    this.updateLocalStorage()
    if (sync)
      syncTasks(false, [task])
  }

  deleteTask (id: string) {
    const index = this.findTaskIndex(id)
    this.state.tasks.splice(index, 1)

    this.updateLocalStorage()
    // no sync needed here, deletion of tasks is not propagated to server
    // TODO: add some kind of explicit deletion of tasks and store a list with the ids of deleted tasks
    //  on the server
  }

  sortTasks () {
    this.state.tasks.sort((a, b) => a.name.localeCompare(b.name))

    this.updateLocalStorage()
  }

  updateSubtask (task: Task | undefined, subtask: SubTask | undefined, callback: (newSubtask: SubTask) => void, sync: boolean = true) {
    if (task === undefined || subtask === undefined) {
      return
    }
    const newSubtask = Object.assign(new SubTask(), subtask)
    newSubtask.lastChanged = new Date()
    newSubtask.lastChangeClientId = authStore.getClientId()
    callback(newSubtask)
    const newTask = Object.assign(new Task(), task)
    const subtaskIndex = newTask.subtasks.findIndex(subtask => subtask.id === newSubtask.id)
    newTask.subtasks.splice(subtaskIndex, 1, newSubtask)
    this.updateTask(newTask, sync)
  }

  updateSubtaskComment (task: Task | undefined, subtask: SubTask | undefined, subtaskComment: SubtaskComment | undefined,
                        callback: (newComment: SubtaskComment) => void, sync: boolean = true) {
    if (task === undefined || subtask === undefined || subtaskComment === undefined) {
      return
    }
    const newComment = Object.assign(new SubtaskComment(), subtaskComment)
    newComment.lastChanged = new Date()
    newComment.lastChangeClientId = authStore.getClientId()
    callback(newComment)
    this.updateSubtask(task, subtask, newSubtask => {
      const index = newSubtask.comments.findIndex(comment => comment.id === newComment.id)
      newSubtask.comments.splice(index, 1, newComment)
    }, sync)
  }
}

export const taskStore: TaskStore = new TaskStore()
