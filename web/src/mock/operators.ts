export interface OperatorAccount {
  id: number
  email: string
  password: string
  full_name: string
  is_active: boolean
  role: string
  shop_id: number
  shop_name: string
  region: string
  address: string
  phone: string
  description: string
}

export const operatorAccounts: OperatorAccount[] = [
  {
    id: 1,
    email: 'manager@dalmegg.kr',
    password: 'dalmegg1234',
    full_name: '팜 매니저',
    is_active: true,
    role: 'admin',
    shop_id: 1,
    shop_name: '달멕 플라워',
    region: '부산',
    address: '부산광역시 금정구 유휴 상가 리빙랩',
    phone: '010-0000-0000',
    description: '도심 공실 기반 순환형 스마트 플라워팜',
  },
  {
    id: 2,
    email: 'urban@dalmegg.kr',
    password: 'urban1234',
    full_name: '도심팜 운영자',
    is_active: true,
    role: 'admin',
    shop_id: 2,
    shop_name: '서면 유휴공간 재배 모듈',
    region: '부산',
    address: '부산진구 공실 활용 실증지',
    phone: '010-1234-5678',
    description: '유휴공간을 활용한 스마트팜 운영 매장',
  },
]
