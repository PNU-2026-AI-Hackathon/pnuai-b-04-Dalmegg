import {
  Droplets,
  Leaf,
  Recycle,
} from 'lucide-react'
import type {
  CircularActivity,
  CropProgress,
  FarmZone,
  MetricCardData,
  WeeklyEnvironment,
  SensorData,
  SensorHistory,
  FlowerInventory,
  AdminAlert,
  FlowerInventoryItem,
  Reservation,
} from '../types/dashboard'

export const metrics: MetricCardData[] = [
  {
    label: '오늘의 순환 활동량',
    value: '128.4',
    unit: 'kg',
    change: '12.5%',
    trend: 'up',
    icon: Recycle,
    tone: 'amber',
  },
  {
    label: '누적 자원 순환량',
    value: '3,842',
    unit: 'kg',
    change: '8.2%',
    trend: 'up',
    icon: Recycle,
    tone: 'green',
  },
  {
    label: '재배 중인 꽃',
    value: '2,460',
    unit: '주',
    change: '4.1%',
    trend: 'up',
    icon: Leaf,
    tone: 'violet',
  },
  {
    label: '절약한 물',
    value: '18.6',
    unit: 't',
    change: '3.7%',
    trend: 'down',
    icon: Droplets,
    tone: 'blue',
  },
]

export const weeklyEnvironment: WeeklyEnvironment[] = [
  { day: '월', temperature: 23.4, humidity: 67 },
  { day: '화', temperature: 24.1, humidity: 64 },
  { day: '수', temperature: 23.7, humidity: 69 },
  { day: '목', temperature: 25.2, humidity: 62 },
  { day: '금', temperature: 24.6, humidity: 65 },
  { day: '토', temperature: 23.9, humidity: 68 },
  { day: '일', temperature: 24.3, humidity: 66 },
]

export const farmZones: FarmZone[] = [
  { id: 'A', name: 'A동', crop: '튤립', temperature: 24.2, humidity: 66, soilMoisture: 72, status: 'optimal' },
  { id: 'B', name: 'B동', crop: '프리지아', temperature: 25.6, humidity: 61, soilMoisture: 64, status: 'attention' },
  { id: 'C', name: 'C동', crop: '라넌큘러스', temperature: 23.8, humidity: 68, soilMoisture: 76, status: 'optimal' },
]

export const cropProgress: CropProgress[] = [
  { name: '화이트 튤립', variety: 'Snow Crystal', progress: 78, harvestDate: 'D-12', color: '#22c55e' },
  { name: '옐로 프리지아', variety: 'Golden Wave', progress: 62, harvestDate: 'D-21', color: '#f59e0b' },
  { name: '핑크 라넌큘러스', variety: 'Rose Cloud', progress: 45, harvestDate: 'D-34', color: '#ec4899' },
]

export const circularActivities: CircularActivity[] = [
  { id: 1, title: '지역 자원 수거 완료', description: '부산대학교 학생회관 · 36.8kg', time: '10분 전', type: 'collect' },
  { id: 2, title: '칼슘 영양제 생산', description: '금정 순환센터 · 18.2kg', time: '1시간 전', type: 'process' },
  { id: 3, title: 'A동 영양액 공급', description: '튤립 재배존 · 24L', time: '2시간 전', type: 'supply' },
]

export const sensors: SensorData[] = [
  { id: 'temperature', name: '온도', value: 24.2, unit: '°C', normalRange: '20–26°C', status: 'normal', updatedAt: '방금 전' },
  { id: 'humidity', name: '습도', value: 68, unit: '%', normalRange: '60–75%', status: 'normal', updatedAt: '방금 전' },
  { id: 'light', name: '조도', value: 17200, unit: 'lx', normalRange: '', status: 'normal', updatedAt: '1분 전' },
  { id: 'soil', name: '토양수분', value: 42, unit: '%', normalRange: '50–70%', status: 'danger', updatedAt: '방금 전' },
]

export const sensorHistory: SensorHistory[] = Array.from({ length: 13 }, (_, index) => {
  const hour = index * 2
  return {
    time: `${String(hour).padStart(2, '0')}:00`,
    temperature: Number((22.4 + Math.sin(index / 2) * 2.3).toFixed(1)),
    humidity: Math.round(66 + Math.cos(index / 2) * 5),
    light: Math.max(0, Math.round(Math.sin((index - 2) / 8 * Math.PI) * 22000)),
    soil: Math.round(58 - index * 1.25 + Math.sin(index) * 2),
  }
})

export const flowerInventory: FlowerInventory[] = [
  { name: '장미', stock_quantity: 320 },
  { name: '튤립', stock_quantity: 245 },
  { name: '해바라기', stock_quantity: 178 },
  { name: '카네이션', stock_quantity: 92 },
]

export const adminAlerts: AdminAlert[] = [
  { id: 1, type: 'sensor', title: '토양수분 위험', message: 'B동 2구역 수분이 정상 범위 아래입니다.', severity: 'danger', is_read: false },
  { id: 2, type: 'reservation', title: '새 체험 예약 접수', message: '플라워팜 체험 4인 예약이 접수되었습니다.', severity: 'info', is_read: false },
  { id: 3, type: 'stock', title: '카네이션 재고 부족', message: '장미 재고가 부족합니다.', severity: 'warning', is_read: true },
]

export const flowerInventoryItems: FlowerInventoryItem[] = [
  { id: 1, shop_id: 1, name: '레드 장미', description: '빨간 장미', color: 'red', price: 4500, image_url: undefined, stock_quantity: 320 },
  { id: 2, shop_id: 1, name: '화이트 튤립', description: '깨끗한 화이트 튤립', color: 'white', price: 3800, image_url: undefined, stock_quantity: 245 },
  { id: 3, shop_id: 1, name: '미니 해바라기', description: '소형 꽃다발용 해바라기', color: 'yellow', price: 5200, image_url: undefined, stock_quantity: 68 },
  { id: 4, shop_id: 1, name: '핑크 카네이션', description: '선물용 핑크 카네이션', color: 'pink', price: 3200, image_url: undefined, stock_quantity: 92 },
  { id: 5, shop_id: 1, name: '라넌큘러스', description: '겹꽃 라넌큘러스', color: 'mixed', price: 5800, image_url: undefined, stock_quantity: 0 },
  { id: 6, shop_id: 1, name: '옐로 프리지아', description: '향이 좋은 노란 프리지아', color: 'yellow', price: 3500, image_url: undefined, stock_quantity: 186 },
]

export const reservations: Reservation[] = [
  { id: 1001, user_id: 11, program_id: 1, participant_count: 2, total_amount: 60000, status: 'confirmed', created_at: '2026-07-06T12:00:00', user_email: 'minji@example.com', user_full_name: '김민지', program_title: '나만의 꽃다발 만들기', shop_id: 1 },
  { id: 1002, user_id: 12, program_id: 2, participant_count: 4, total_amount: 40000, status: 'reserved', created_at: '2026-07-06T13:20:00', user_email: 'seojun@example.com', user_full_name: '이서준', program_title: '스마트팜 견학', shop_id: 1 },
  { id: 1003, user_id: 13, program_id: 3, participant_count: 3, total_amount: 45000, status: 'completed', created_at: '2026-07-05T15:30:00', user_email: 'jiwoo@example.com', user_full_name: '박지우', program_title: '순환 화분 체험', shop_id: 1 },
  { id: 1004, user_id: 14, program_id: 4, participant_count: 1, total_amount: 30000, status: 'cancelled', created_at: '2026-07-04T10:00:00', user_email: 'hayoon@example.com', user_full_name: '최하윤', program_title: '플라워팜 하루 클래스', shop_id: 1 },
  { id: 1005, user_id: 15, program_id: 2, participant_count: 5, total_amount: 50000, status: 'reserved', created_at: '2026-07-03T13:00:00', user_email: 'doyoon@example.com', user_full_name: '정도윤', program_title: '스마트팜 견학', shop_id: 1 },
  { id: 1006, user_id: 16, program_id: 1, participant_count: 2, total_amount: 60000, status: 'no_show', created_at: '2026-07-02T16:00:00', user_email: 'yerin@example.com', user_full_name: '한예린', program_title: '나만의 꽃다발 만들기', shop_id: 1 },
]
