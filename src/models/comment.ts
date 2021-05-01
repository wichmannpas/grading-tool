import { identifier, serializable } from 'serializr'
import { randomString } from '@/utils'

export class Comment {
  constructor () {
    this.id = randomString()
  }

  @serializable(identifier())
  id: string = ''

  @serializable
  text: string = ''

  @serializable
  points: number = 0
}