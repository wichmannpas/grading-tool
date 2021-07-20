import { Store } from './index'
import { randomString } from '@/utils'
import { ensureWebsocket } from '@/websocket'

interface AuthInfo extends Object {
  authDismissed: boolean,
  workingLocally: boolean,
  authFailed: boolean,
  clientId: string,
  authToken: null | string,
  groups: Array<string>
}

class AuthStore extends Store<AuthInfo> {
  protected data (): AuthInfo {
    let clientId = localStorage.getItem('clientId')
    if (clientId === null || clientId.length !== 16) {
      clientId = randomString()
    }

    const authToken = localStorage.getItem('authToken')
    if (authToken !== null) {
      // auth data available, trigger websocket opening (and upon successful open, checkAuth)
      ensureWebsocket()
    }

    return {
      authDismissed: false,
      workingLocally: true,
      authFailed: false,
      clientId,
      authToken,
      groups: []
    }
  }

  getClientId () {
    return this.getState().clientId
  }

  setAuthDismissed (value: boolean) {
    this.state.authDismissed = value
  }

  clearAuthToken () {
    localStorage.removeItem('authToken')
    this.state.authToken = ''
    this.state.workingLocally = true
    this.state.authFailed = true
  }

  setAuthToken (token: string) {
    this.state.authToken = token
    this.state.workingLocally = false
    this.state.authFailed = false

    localStorage.setItem('authToken', token)
  }

  setGroups (groups: Array<string>) {
    this.state.groups.splice(0, this.state.groups.length, ...groups)
  }
}

export const authStore: AuthStore = new AuthStore()
