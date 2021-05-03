import { custom, identifier, list, object, serializable } from 'serializr'
import { randomString } from '@/utils'
import { SubtaskComment } from '@/models/subtaskComment'

export class SubTask {
  constructor () {
    this.id = randomString()
  }

  id: string = ''

  @serializable
  name: string = ''

  @serializable(custom((value: any) => parseFloat(value), (value: any) => value.toString()))
  maxPoints: number = 0

  @serializable(list(object(SubtaskComment)))
  comments: SubtaskComment[] = []
}