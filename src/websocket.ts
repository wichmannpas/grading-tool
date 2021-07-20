import { WEBSOCKET_URL } from '@/settings'
import { authStore } from '@/store/auth'
import { taskStore } from '@/store/task'
import { deserialize } from 'serializr'
import { Task } from '@/models/task'

let webs: WebSocket | null = null

let heartbeatInterval: number | null = null

export function ensureWebsocket () {
  return new Promise<WebSocket>(resolve => {
    if (webs !== null && webs.readyState === 1) {
      return resolve(webs)
    }
    if (webs === null || webs.readyState !== 0) {
      webs = new WebSocket(WEBSOCKET_URL)
      webs.onopen = () => {
        if (webs === null) {
          throw new Error('websocket is not working!')
        }
        const authToken = authStore.getState().authToken
        if (authToken !== null) {
          checkAuth(authToken)
        }
        resolve(webs)
      }
      webs.onmessage = event => {
        handleMessage(JSON.parse(event.data))
      }
    } else {
      resolve(webs)
    }

    if (heartbeatInterval === null) {
      heartbeatInterval = window.setInterval(() => sendMessage({
        'command': 'heartbeat'
      }), 60000)
    }
  })
}

function sendMessage (message: Object) {
  ensureWebsocket().then(websocket => {
    websocket.send(JSON.stringify(message))
  })
}

function handleMessage (message: any) {
  if (message.command === 'authSucceeded') {
    authStore.setAuthToken(message.token)
    authStore.setGroups(message.groups)
    syncTasks(true)
  } else if (message.command === 'authFailed') {
    authStore.clearAuthToken()
  } else if (message.command === 'heartbeatResponse') {
    // ignore heartbeat responses (for now)
  } else if (message.command === 'updateTasks') {
    if (message.causedByClient === authStore.getClientId()) {
      return
    }
    taskStore.updateTasks(message.tasks.map((task: any) => deserialize(Task, task)), false)
  } else {
    console.warn('unhandled websocket message:')
    console.warn(message)
  }
}

export function attemptLogin (username: string, password: string) {
  sendMessage({
    command: 'login',
    username,
    password,
    clientId: authStore.getState().clientId
  })
}

export function checkAuth (authToken: string) {
  sendMessage({
    command: 'checkAuth',
    authToken
  })
}

export function logout (authToken: string) {
  sendMessage({
    command: 'logout',
    authToken
  })
}

export function syncTasks (sendAll: boolean = false) {
  const authToken = authStore.getState().authToken
  if (authToken === null) {
    return
  }
  sendMessage({
    command: 'syncTasks',
    authToken,
    sendAll,
    clientId: authStore.getState().clientId,
    tasks: taskStore.getState().tasks
  })
}