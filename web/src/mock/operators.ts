export interface OperatorAccount {
  id: string
  email: string
  password: string
  name: string
  role: string
  organization: string
  siteName: string
  siteLocation: string
}

export const operatorAccounts: OperatorAccount[] = [
  {
    id: 'operator-busan-01',
    email: 'manager@dalmegg.kr',
    password: 'dalmegg1234',
    name: '팜 매니저',
    role: '운영 관리자',
    organization: '닮은살걀 운영팀',
    siteName: '부산 공실 스마트팜 1호점',
    siteLocation: '부산광역시 유휴 상가 리빙랩',
  },
  {
    id: 'operator-demo-02',
    email: 'urban@dalmegg.kr',
    password: 'urban1234',
    name: '도심팜 운영자',
    role: '시설 관리자',
    organization: '도심 재생 스마트팜',
    siteName: '서면 유휴공간 재배 모듈',
    siteLocation: '부산진구 공실 활용 실증지',
  },
]
