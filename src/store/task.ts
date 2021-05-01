import { Store } from './index'
import { Task } from '@/models/task'
import { deserialize, serialize } from 'serializr'
import { SubTask } from '@/models/subtask'
import { SubtaskComment } from '@/models/subtaskComment'

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

  setTasks (tasks: Task[]) {
    this.state.tasks.splice(0, this.state.tasks.length)
    this.state.tasks.push(...tasks)

    this.updateLocalStorage()
  }

  addTask (task: Task) {
    this.state.tasks.push(task)

    this.updateLocalStorage()
  }

  updateTask (task: Task) {
    const index = this.findTaskIndex(task.id)
    this.state.tasks.splice(index, 1, task)

    this.updateLocalStorage()
  }

  deleteTask (id: string) {
    const index = this.findTaskIndex(id)
    this.state.tasks.splice(index, 1)

    this.updateLocalStorage()
  }

  sortTasks () {
    this.state.tasks.sort((a, b) => a.name.localeCompare(b.name))

    this.updateLocalStorage()
  }

  updateSubtask (task: Task | undefined, subtask: SubTask | undefined, callback: (newSubtask: SubTask) => void) {
    if (task === undefined || subtask === undefined) {
      return
    }
    const newSubtask = Object.assign(new SubTask(), subtask)
    callback(newSubtask)
    const newTask = Object.assign(new Task(), task)
    const subtaskIndex = newTask.subtasks.findIndex(subtask => subtask.id === newSubtask.id)
    newTask.subtasks.splice(subtaskIndex, 1, newSubtask)
    this.updateTask(newTask)
  }

  updateSubtaskComment (task: Task | undefined, subtask: SubTask | undefined, subtaskComment: SubtaskComment | undefined,
                        callback: (newComment: SubtaskComment) => void) {
    if (task === undefined || subtask === undefined || subtaskComment === undefined) {
      return
    }
    const newComment = Object.assign(new SubtaskComment(), subtaskComment)
    callback(newComment)
    this.updateSubtask(task, subtask, newSubtask => {
      const index = newSubtask.comments.findIndex(comment => comment.id === newComment.id)
      newSubtask.comments.splice(index, 1, newComment)
    })
  }
}

export const taskStore: TaskStore = new TaskStore()
