import { create } from 'zustand'
import { getAdminMe, loginAdmin, logoutAdmin, registerAdmin } from '../api/auth'
import { ApiError, clearAuthTokens } from '../api/client'
import { createShop, listShops } from '../api/shops'
import type { AdminUserRead, ShopRead } from '../api/types'
import type { OperatorAccount } from '../mock/operators'

type AuthOperator = Omit<OperatorAccount, 'password'>

export interface OperatorSignupInput {
  email: string
  password: string
  full_name: string
  shop_name: string
  region: string
  address: string
  phone: string
  description: string
}

interface AuthState {
  operator: AuthOperator | null
  loginError: string | null
  signupError: string | null
  isAuthenticating: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (input: OperatorSignupInput) => Promise<boolean>
  logout: () => Promise<void>
  clearLoginError: () => void
  clearSignupError: () => void
}

const CURRENT_OPERATOR_STORAGE_KEY = 'dalmegg.operator'

type LegacyOperatorAccount = Partial<OperatorAccount> & {
  id?: number | string
  name?: string
  organization?: string
  siteName?: string
  siteLocation?: string
}

function normalizeAccount(value: LegacyOperatorAccount): OperatorAccount | null {
  if (!value.email) {
    return null
  }

  return {
    id: Number(value.id) || Date.now(),
    email: value.email,
    password: value.password ?? '',
    full_name: value.full_name ?? value.name ?? '운영자',
    is_active: value.is_active ?? true,
    role: value.role ?? 'admin',
    shop_id: value.shop_id ?? 1,
    shop_name: value.shop_name ?? value.siteName ?? '스마트팜 운영지',
    region: value.region ?? value.organization ?? '부산',
    address: value.address ?? value.siteLocation ?? '',
    phone: value.phone ?? '',
    description: value.description ?? '',
  }
}

function readStoredOperator(): AuthOperator | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedValue = window.localStorage.getItem(CURRENT_OPERATOR_STORAGE_KEY)
    if (!storedValue) {
      return null
    }

    const normalizedAccount = normalizeAccount(JSON.parse(storedValue) as LegacyOperatorAccount)
    return normalizedAccount ? toAuthOperator(normalizedAccount) : null
  } catch {
    window.localStorage.removeItem(CURRENT_OPERATOR_STORAGE_KEY)
    return null
  }
}

function persistOperator(operator: AuthOperator) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CURRENT_OPERATOR_STORAGE_KEY, JSON.stringify(operator))
}

function toAuthOperator(account: OperatorAccount): AuthOperator {
  const { password, ...operator } = account
  return operator
}

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return '이미 등록된 이메일입니다.'
    }

    if (error.status === 401) {
      return '이메일 또는 비밀번호를 다시 확인해주세요.'
    }
  }

  return fallbackMessage
}

async function buildOperatorFromAdmin(admin: AdminUserRead): Promise<AuthOperator> {
  const shops = await listShops()
  const ownedShop = shops.find((shop) => shop.admin_id === admin.id)

  return {
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name ?? '운영자',
    is_active: admin.is_active,
    role: 'admin',
    shop_id: ownedShop?.id ?? 0,
    shop_name: ownedShop?.name ?? '스마트팜 운영지',
    region: ownedShop?.region ?? '',
    address: ownedShop?.address ?? '',
    phone: ownedShop?.phone ?? '',
    description: ownedShop?.description ?? '',
  }
}

function buildOperatorFromShop(admin: AdminUserRead, shop: ShopRead): AuthOperator {
  return {
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name ?? '운영자',
    is_active: admin.is_active,
    role: 'admin',
    shop_id: shop.id,
    shop_name: shop.name,
    region: shop.region,
    address: shop.address,
    phone: shop.phone ?? '',
    description: shop.description ?? '',
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  operator: readStoredOperator(),
  loginError: null,
  signupError: null,
  isAuthenticating: false,
  login: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()

    set({ isAuthenticating: true, loginError: null })

    try {
      await loginAdmin({ email: normalizedEmail, password })
      const admin = await getAdminMe()
      const operator = await buildOperatorFromAdmin(admin)
      persistOperator(operator)
      set({ operator, loginError: null, signupError: null, isAuthenticating: false })
      return true
    } catch (error) {
      clearAuthTokens()
      set({
        loginError: getApiErrorMessage(error, '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'),
        isAuthenticating: false,
      })
      return false
    }
  },
  signup: async (input) => {
    const normalizedEmail = input.email.trim().toLowerCase()

    set({ isAuthenticating: true, signupError: null })

    try {
      const admin = await registerAdmin({
        email: normalizedEmail,
        password: input.password,
        full_name: input.full_name.trim(),
      })
      await loginAdmin({ email: normalizedEmail, password: input.password })
      const shop = await createShop({
        name: input.shop_name.trim(),
        region: input.region.trim(),
        address: input.address.trim(),
        phone: input.phone.trim() || null,
        description: input.description.trim() || null,
      })
      const operator = buildOperatorFromShop(admin, shop)
      persistOperator(operator)
      set({ operator, signupError: null, loginError: null, isAuthenticating: false })
      return true
    } catch (error) {
      clearAuthTokens()
      set({
        signupError: getApiErrorMessage(error, '회원가입 중 문제가 발생했습니다. 입력한 정보를 다시 확인해주세요.'),
        isAuthenticating: false,
      })
      return false
    }
  },
  logout: async () => {
    try {
      await logoutAdmin()
    } catch {
      clearAuthTokens()
    }

    window.localStorage.removeItem(CURRENT_OPERATOR_STORAGE_KEY)
    set({ operator: null, loginError: null, signupError: null, isAuthenticating: false })
  },
  clearLoginError: () => set({ loginError: null }),
  clearSignupError: () => set({ signupError: null }),
}))
