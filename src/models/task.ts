import { identifier, serializable } from 'serializr'
import { randomString } from '@/utils'

export class Task {
  constructor () {
    this.id = randomString()
  }

  @serializable(identifier())
  id: string = ''

  @serializable
  name: string = ''
}