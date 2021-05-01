import { identifier, serializable } from 'serializr'
import { randomString } from '@/utils'

export class SubtaskComment {
  constructor (newlyAdded: boolean = false) {
    this.newlyAdded = newlyAdded

    this.id = randomString()
  }

  @serializable(identifier())
  id: string = ''

  @serializable
  text: string = ''

  @serializable
  points: number = 0

  newlyAdded = false
}