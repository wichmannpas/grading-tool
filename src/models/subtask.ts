import { identifier, list, object, serializable } from 'serializr'
import { randomString } from '@/utils'

export class SubTask {
  constructor () {
    this.id = randomString()
  }

  @serializable(identifier())
  id: string = ''

  @serializable
  name: string = ''

  @serializable
  maxPoints: number = 0

  @serializable(list(object(Comment)))
  comments: Comment[] = []
}