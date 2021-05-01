import { identifier, list, object, optional, primitive, serializable } from 'serializr'
import { randomString } from '@/utils'
import { Task } from '@/models/task'

export class Grading {
  constructor () {
    this.id = randomString()
  }

  @serializable(identifier())
  id: string = ''

  @serializable(optional(object(Task)))
  task: Task | undefined = undefined

  @serializable(list(primitive()))
  doneSubtaskIds: string[] = []

  @serializable(list(primitive()))
  commentIds: string[] = []
}