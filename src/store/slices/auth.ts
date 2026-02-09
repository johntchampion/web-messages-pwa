import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import restAPI from '../../util/rest'

const REFRESH_TOKEN_KEY = 'refreshToken'
let isInitializing = false

const saveRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

const loadRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

const clearRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export interface AuthState {
  user: {
    id: string
    verified: boolean
    displayName: string
    username: string
    email: string | null
    profilePicURL: string
  } | null
  accessToken: string | null
  refreshToken: string | null
  isInitializing: boolean
  isLoading: boolean
  error: string | null
}

type Credentials = {
  username: string
  password: string
}

type SignUpData = {
  displayName: string
  username: string
  email?: string | null
  password: string
}

type AuthResponse = {
  user: {
    id: string
    verified: boolean
    displayName: string
    username: string
    email: string | null
    profilePicURL: string
  }
  accessToken: string
  refreshToken: string
  message: string
}

type AsyncThunkConfig = {
  state: RootState
  rejectValue: string
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isInitializing: true,
  isLoading: false,
  error: null,
}

export const initializeAuth = createAsyncThunk<
  AuthResponse | null,
  void,
  AsyncThunkConfig
>('auth/initialize', async (_, { rejectWithValue }) => {
  if (isInitializing) {
    return null
  }

  const savedRefreshToken = loadRefreshToken()

  if (!savedRefreshToken) {
    return null
  }

  isInitializing = true

  try {
    const response = await restAPI.post('/auth/refresh', {
      refreshToken: savedRefreshToken,
    })
    return {
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      message: response.data.message,
    }
  } catch (error: any) {
    // Don't clear it for network errors (offline, connection drops, etc.)
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK'

    if (!isNetworkError) {
      clearRefreshToken()
    }

    return rejectWithValue(isNetworkError ? 'Network error' : 'Session expired')
  } finally {
    isInitializing = false
  }
})

export const logIn = createAsyncThunk<
  AuthResponse,
  Credentials,
  AsyncThunkConfig
>('auth/logIn', async (credentials, { rejectWithValue }) => {
  try {
    const response = await restAPI.put<AuthResponse>('/auth/login', credentials)
    return response.data
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || 'Login failed',
    )
  }
})

export const signUp = createAsyncThunk<
  AuthResponse,
  SignUpData,
  AsyncThunkConfig
>('auth/signUp', async (signUpData, { rejectWithValue }) => {
  try {
    const response = await restAPI.post<AuthResponse>(
      '/auth/signup',
      signUpData,
    )
    return response.data
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || 'Sign up failed',
    )
  }
})

export const refresh = createAsyncThunk<AuthResponse, void, AsyncThunkConfig>(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    const state = getState()
    const refreshToken = state.auth.refreshToken
    if (!refreshToken) {
      return rejectWithValue('Missing refresh token')
    }
    const response = await restAPI.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },
)

export const logOut = createAsyncThunk<void, void, AsyncThunkConfig>(
  'auth/logOut',
  async (_, { getState, rejectWithValue }) => {
    const state = getState()
    const refreshToken = state.auth.refreshToken
    if (!refreshToken) {
      return rejectWithValue('Missing refresh token')
    }
    await restAPI.post('/auth/logout', {
      refreshToken,
    })
  },
)

export const logOutEverywhere = createAsyncThunk<void, void, AsyncThunkConfig>(
  'auth/logOutEverywhere',
  async () => {
    await restAPI.post('/auth/logout-everywhere')
  },
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<AuthResponse>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isLoading = false
      state.error = null
      saveRefreshToken(action.payload.refreshToken)
    },
    updateUserProfile: (
      state,
      action: PayloadAction<{ displayName: string; profilePicURL: string }>,
    ) => {
      if (!state.user) {
        return
      }

      state.user.displayName = action.payload.displayName
      state.user.profilePicURL = action.payload.profilePicURL
    },
    clearTokens: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = null
      clearRefreshToken()
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        saveRefreshToken(action.payload.refreshToken)
      }
      state.isInitializing = false
      state.isLoading = false
    })
    builder.addCase(initializeAuth.rejected, (state, _action) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isInitializing = false
      state.isLoading = false
      state.error = null
    })
    builder.addCase(initializeAuth.pending, (state) => {
      state.isInitializing = true
      state.isLoading = true
    })
    builder.addCase(logIn.fulfilled, (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isLoading = false
      state.error = null
      saveRefreshToken(action.payload.refreshToken)
    })
    builder.addCase(logIn.rejected, (state, action) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = action.payload || 'Login failed'
      clearRefreshToken()
    })
    builder.addCase(logIn.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isLoading = false
      state.error = null
      saveRefreshToken(action.payload.refreshToken)
    })
    builder.addCase(signUp.rejected, (state, action) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = action.payload || 'Sign up failed'
      clearRefreshToken()
    })
    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(refresh.fulfilled, (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isLoading = false
      state.error = null
      saveRefreshToken(action.payload.refreshToken)
    })
    builder.addCase(refresh.rejected, (state, action) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error =
        action.payload || action.error.message || 'Token refresh failed'
      clearRefreshToken()
    })
    builder.addCase(refresh.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(logOut.fulfilled, (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = null
      clearRefreshToken()
    })
    builder.addCase(logOut.rejected, (state, action) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = action.payload || action.error.message || 'Logout failed'
      clearRefreshToken()
    })
    builder.addCase(logOut.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(logOutEverywhere.fulfilled, (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = null
      clearRefreshToken()
    })
    builder.addCase(logOutEverywhere.rejected, (state, action) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = action.error.message || 'Logout everywhere failed'
      clearRefreshToken()
    })
    builder.addCase(logOutEverywhere.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
  },
})

export const { setTokens, clearTokens, updateUserProfile } = authSlice.actions
export default authSlice.reducer
