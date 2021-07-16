import { date, identifier, serializable } from 'serializr'
import { randomString } from '@/utils'

export class SubtaskComment {
  constructor (newlyAdded: boolean = false) {
    this.newlyAdded = newlyAdded

    this.id = randomString()
  }

  @serializable(identifier())
  id: string = ''

  @serializable(date())
  lastChanged: Date = new Date()

  @serializable
  lastChangeClientId = ''

  @serializable
  text: string = ''

  @serializable
  points: number = 0

  newlyAdded = false
}