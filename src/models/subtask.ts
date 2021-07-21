import { custom, date, identifier, list, object, serializable } from 'serializr'
import { randomString } from '@/utils'
import { SubtaskComment } from '@/models/subtaskComment'

export class SubTask {
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

  @serializable
  isBonus = false

  @serializable(custom((value: any) => parseFloat(value), (value: any) => value.toString()))
  maxPoints: number = 0

  @serializable(list(object(SubtaskComment)))
  comments: SubtaskComment[] = []
}