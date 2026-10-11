import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
} from 'axios'

type TokenPair = {
  accessToken: string
  refreshToken: string
}

type StoreLike = {
  getState: () => {
    auth: {
      accessToken: string | null
      refreshToken: string | null
    }
  }
  dispatch: (action: { type: string; payload?: unknown }) => unknown
}

type FailedRequest = {
  resolve: (value: AxiosResponse) => void
  reject: (reason?: unknown) => void
  config: AxiosRequestConfig & { _retry?: boolean }
}

const restAPI = axios.create()

const refreshClient = axios.create()

let store: StoreLike | null = null
let isRefreshing = false
const failedQueue: FailedRequest[] = []

const setAuthorizationHeader = (config: AxiosRequestConfig, token: string) => {
  if (config.headers && 'set' in config.headers) {
    (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`)
    return
  }

  const existing = (config.headers as Record<string, string> | undefined) ?? {}
  config.headers = {
    ...existing,
    Authorization: `Bearer ${token}`,
  } as AxiosRequestHeaders
}

const processQueue = (error: unknown, tokens?: TokenPair) => {
  while (failedQueue.length) {
    const pending = failedQueue.shift()
    if (!pending) {
      continue
    }
    if (error || !tokens) {
      pending.reject(error || new Error('Token refresh failed'))
      continue
    }
    const config = pending.config
    setAuthorizationHeader(config, tokens.accessToken)
    restAPI(config).then(pending.resolve).catch(pending.reject)
  }
}

export const attachStore = (appStore: StoreLike) => {
  store = appStore
}

restAPI.interceptors.request.use((config) => {
  if (!store) {
    return config
  }
  const accessToken = store.getState().auth.accessToken
  if (accessToken) {
    setAuthorizationHeader(config, accessToken)
  }
  return config
})

restAPI.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as AxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (!store) {
      return Promise.reject(error)
    }

    const refreshToken = store.getState().auth.refreshToken
    if (!refreshToken) {
      store.dispatch({ type: 'auth/clearTokens' })
      return Promise.reject(error)
    }

    if (isRefreshing) {
      originalRequest._retry = true
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await refreshClient.post<TokenPair>('/auth/refresh', {
        refreshToken,
      })
      const tokens = response.data
      store.dispatch({
        type: 'auth/setTokens',
        payload: tokens,
      })
      processQueue(null, tokens)
      setAuthorizationHeader(originalRequest, tokens.accessToken)
      return restAPI(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      store.dispatch({ type: 'auth/clearTokens' })
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default restAPI
