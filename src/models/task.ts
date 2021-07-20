import { date, identifier, list, object, serializable } from 'serializr'
import { randomString } from '@/utils'
import { SubTask } from '@/models/subtask'
import { authStore } from '@/store/auth'

export class Task {
  constructor (clientId: string = '') {
    this.id = randomString()
    this.lastChangeClientId = clientId
  }

  @serializable(identifier())
  id: string = ''

  @serializable(date())
  lastChanged: Date = new Date()

  @serializable
  lastChangeClientId = ''

  @serializable
  name: string = ''

  @serializable(list(object(SubTask)))
  subtasks: SubTask[] = []

  isSynchronized (): boolean {
    const authState = authStore.getState()
    if (authState.workingLocally) {
      return false
    }
    return authState.groups.find(group => this.name.startsWith(group)) !== undefined
  }
}