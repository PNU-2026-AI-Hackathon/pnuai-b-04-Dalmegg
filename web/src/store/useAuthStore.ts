import { create } from 'zustand'
import { operatorAccounts, type OperatorAccount } from '../mock/operators'

type AuthOperator = Omit<OperatorAccount, 'password'>

interface AuthState {
  operator: AuthOperator | null
  loginError: string | null
  login: (email: string, password: string) => boolean
  logout: () => void
  clearLoginError: () => void
}

const STORAGE_KEY = 'dalmegg.operator'

function readStoredOperator(): AuthOperator | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    return storedValue ? (JSON.parse(storedValue) as AuthOperator) : null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function toAuthOperator(account: OperatorAccount): AuthOperator {
  const { password, ...operator } = account
  return operator
}

export const useAuthStore = create<AuthState>((set) => ({
  operator: readStoredOperator(),
  loginError: null,
  login: (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    const account = operatorAccounts.find(
      (operatorAccount) =>
        operatorAccount.email.toLowerCase() === normalizedEmail &&
        operatorAccount.password === password,
    )

    if (!account) {
      set({ loginError: '이메일 또는 비밀번호를 다시 확인해주세요.' })
      return false
    }

    const operator = toAuthOperator(account)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(operator))
    set({ operator, loginError: null })
    return true
  },
  logout: () => {
    window.localStorage.removeItem(STORAGE_KEY)
    set({ operator: null, loginError: null })
  },
  clearLoginError: () => set({ loginError: null }),
}))
