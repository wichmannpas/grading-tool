import { identifier, list, object, serializable } from 'serializr'
import { randomString } from '@/utils'
import { SubTask } from '@/models/subtask'

export class Task {
  constructor () {
    this.id = randomString()
  }

  @serializable(identifier())
  id: string = ''

  @serializable
  name: string = ''

  @serializable(list(object(SubTask)))
  subtasks: SubTask[] = []
}