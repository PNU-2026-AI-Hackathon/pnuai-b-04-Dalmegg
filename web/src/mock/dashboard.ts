import {
  Droplets,
  Egg,
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
  CollectionData,
  FlowerInventory,
  AdminAlert,
  FlowerInventoryItem,
  Reservation,
  CollectionRanking,
} from '../types/dashboard'

export const metrics: MetricCardData[] = [
  {
    label: '오늘 수거한 계란껍질',
    value: '128.4',
    unit: 'kg',
    change: '12.5%',
    trend: 'up',
    icon: Egg,
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
  { id: 1, title: '계란껍질 수거 완료', description: '부산대학교 학생회관 · 36.8kg', time: '10분 전', type: 'collect' },
  { id: 2, title: '칼슘 영양제 생산', description: '금정 순환센터 · 18.2kg', time: '1시간 전', type: 'process' },
  { id: 3, title: 'A동 영양액 공급', description: '튤립 재배존 · 24L', time: '2시간 전', type: 'supply' },
]

export const sensors: SensorData[] = [
  { id: 'temperature', name: '온도', value: 24.2, unit: '°C', normalRange: '20–26°C', status: 'normal', updatedAt: '방금 전' },
  { id: 'humidity', name: '습도', value: 68, unit: '%', normalRange: '60–75%', status: 'normal', updatedAt: '방금 전' },
  { id: 'light', name: '조도', value: 17200, unit: 'lx', normalRange: '15,000–25,000lx', status: 'warning', updatedAt: '1분 전' },
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

export const collectionStats: CollectionData[] = [
  { day: '6/14', amount: 82 },
  { day: '6/15', amount: 96 },
  { day: '6/16', amount: 78 },
  { day: '6/17', amount: 114 },
  { day: '6/18', amount: 108 },
  { day: '6/19', amount: 126 },
  { day: '6/20', amount: 142 },
]

export const flowerInventory: FlowerInventory[] = [
  { name: '장미', stock: 320, target: 400 },
  { name: '튤립', stock: 245, target: 300 },
  { name: '해바라기', stock: 178, target: 250 },
  { name: '카네이션', stock: 92, target: 280 },
]

export const adminAlerts: AdminAlert[] = [
  { id: 1, title: '토양수분 위험', description: 'B동 2구역 수분이 정상 범위 아래입니다.', time: '5분 전', type: 'sensor' },
  { id: 2, title: '새 체험 예약 접수', description: '플라워팜 체험 4인 예약이 접수되었습니다.', time: '24분 전', type: 'reservation' },
  { id: 3, title: '카네이션 재고 부족', description: '안전 재고 100주 아래로 감소했습니다.', time: '1시간 전', type: 'inventory' },
]

export const flowerInventoryItems: FlowerInventoryItem[] = [
  { id: 1, name: '레드 장미', stock: 320, price: 4500, status: 'sufficient' },
  { id: 2, name: '화이트 튤립', stock: 245, price: 3800, status: 'sufficient' },
  { id: 3, name: '미니 해바라기', stock: 68, price: 5200, status: 'low' },
  { id: 4, name: '핑크 카네이션', stock: 92, price: 3200, status: 'low' },
  { id: 5, name: '라넌큘러스', stock: 0, price: 5800, status: 'soldout' },
  { id: 6, name: '옐로 프리지아', stock: 186, price: 3500, status: 'sufficient' },
]

export const reservations: Reservation[] = [
  { id: 1001, customerName: '김민지', phone: '010-2345-6712', programName: '나만의 꽃다발 만들기', date: '2026-06-21', time: '14:00', participants: 2, status: 'confirmed', note: '튤립을 좋아합니다.' },
  { id: 1002, customerName: '이서준', phone: '010-8831-0024', programName: '스마트팜 견학', date: '2026-06-22', time: '11:00', participants: 4, status: 'pending', note: '어린이 2명 포함' },
  { id: 1003, customerName: '박지우', phone: '010-3321-8291', programName: '계란껍질 화분 체험', date: '2026-06-23', time: '15:30', participants: 3, status: 'confirmed', note: '없음' },
  { id: 1004, customerName: '최하윤', phone: '010-9253-1178', programName: '플라워팜 하루 클래스', date: '2026-06-24', time: '10:00', participants: 1, status: 'cancelled', note: '개인 일정으로 취소' },
  { id: 1005, customerName: '정도윤', phone: '010-5571-4408', programName: '스마트팜 견학', date: '2026-06-25', time: '13:00', participants: 5, status: 'pending', note: '단체 방문' },
  { id: 1006, customerName: '한예린', phone: '010-1172-9840', programName: '나만의 꽃다발 만들기', date: '2026-06-27', time: '16:00', participants: 2, status: 'confirmed', note: '기념일 방문' },
]

export const collectionRanking: CollectionRanking[] = [
  { rank: 1, name: '김민준', amount: 286.4, points: 28640 },
  { rank: 2, name: '박서연', amount: 254.8, points: 25480 },
  { rank: 3, name: '이도현', amount: 231.2, points: 23120 },
  { rank: 4, name: '최지아', amount: 198.7, points: 19870 },
  { rank: 5, name: '정우진', amount: 176.5, points: 17650 },
  { rank: 6, name: '윤하은', amount: 164.1, points: 16410 },
  { rank: 7, name: '강시우', amount: 151.8, points: 15180 },
  { rank: 8, name: '한유나', amount: 143.2, points: 14320 },
  { rank: 9, name: '송지호', amount: 129.6, points: 12960 },
  { rank: 10, name: '오채원', amount: 118.3, points: 11830 },
]

export const monthlyCollectionTrend = [
  { month: '1월', amount: 412 },
  { month: '2월', amount: 528 },
  { month: '3월', amount: 684 },
  { month: '4월', amount: 742 },
  { month: '5월', amount: 896 },
  { month: '6월', amount: 1042 },
]
