import { custom, date, identifier, list, object, serializable } from 'serializr'
import { randomString } from '@/utils'
import { SubtaskComment } from '@/models/subtaskComment'
import { Grading } from '@/models/grading'

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

  ephemeralComment: null | string = null

  calculatePoints (grading: Grading) {
    let text = ''

    const maxPoints = parseFloat(this.maxPoints as unknown as string)
    let points = maxPoints
    if (this.isBonus) {
      // start with 0 points for bonus tasks
      points = 0
    }

    this.comments.forEach(comment => {
      if (grading.commentIds.indexOf(comment.id) >= 0) {
        const commentPoints = parseFloat(comment.points as unknown as string)
        text += comment.text
        if (commentPoints !== 0) {
          text += ' (' + commentPoints.toString() + 'P)'
        }
        text += '\n'

        points += commentPoints
      }
    })

    if (points > maxPoints) {
      console.warn('too many points!')
      points = maxPoints
    } else if (points < 0) {
      points = 0
    }

    text += points.toString() + '/' + this.maxPoints.toString()

    return {
      subtaskText: text,
      subtaskPoints: points
    }
  }
}