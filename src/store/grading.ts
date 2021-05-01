import { Store } from './index'
import { Grading } from '@/models/grading'

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
}

export const gradingStore: GradingStore = new GradingStore()
