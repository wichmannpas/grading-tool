import { Store } from './index'
import { Grading } from '@/models/grading'
import { SubtaskComment } from '@/models/subtaskComment'

interface GradingInfo extends Object {
  currentGrading: Grading
}

class GradingStore extends Store<GradingInfo> {
  protected data (): GradingInfo {
    return {
      currentGrading: new Grading()
    }
  }

  setCurrentGrading (grading: Grading) {
    this.state.currentGrading = grading
  }

  setCurrentGradingCommentActive (subtaskComment: SubtaskComment | undefined, active: boolean) {
    if (subtaskComment === undefined) {
      return
    }
    const grading = Object.assign(new Grading(), gradingStore.getState().currentGrading)
    grading.commentIds = [...grading.commentIds]
    const index = grading.commentIds.indexOf(subtaskComment.id)
    if (active) {
      if (index >= 0)
        return
      grading.commentIds.push(subtaskComment.id)
    } else {
      if (index < 0)
        return
      grading.commentIds.splice(index, 1)
    }
    gradingStore.setCurrentGrading(grading)
  }
}

export const gradingStore: GradingStore = new GradingStore()
