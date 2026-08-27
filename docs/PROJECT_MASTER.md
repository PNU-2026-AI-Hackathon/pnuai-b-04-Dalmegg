# MiniFarm Labs — Project Master Document

> **Last Updated:** 2026-08-24  
> **Project Phase:** 창의융합해커톤 Final MVP / 최종 발표 준비 단계  
> **Document Role:** 프로젝트 기획·개발·하드웨어·비즈니스·발표 방향을 통합한 Single Source of Truth

---

# 0. 이 문서의 목적

이 문서는 MiniFarm Labs 프로젝트의 전체 방향을 하나의 기준으로 관리하기 위한 통합 문서이다.

다음 내용을 모두 포함한다.

- 프로젝트 배경 및 지정과제
- 문제 정의
- 핵심 아이디어
- 서비스 구조
- 화훼 선정 이유
- 사용자 및 이해관계자
- 사용자 앱
- 관리자 웹
- Backend
- MiniFarm Hardware
- IoT 및 환경 제어
- 데이터 활용
- AI 활용 방향
- 자원순환 기능
- 비즈니스 모델
- 현재 개발 현황
- Final MVP 범위
- 향후 발전 방향
- 최종 시연 시나리오
- 발표 핵심 메시지
- 프로젝트 주요 의사결정
- 미해결 과제

프로젝트에 대한 새로운 중요한 의사결정이 발생하면 이 문서를 우선 업데이트한다.

README, AGENTS.md, 발표자료 등의 내용이 본 문서와 충돌할 경우 **가장 최근에 업데이트된 PROJECT_MASTER.md를 우선 기준으로 삼는다.**

---

# 1. 프로젝트 기본 정보

## 1.1 지정과제

**DRB동일 협력 MiniFarm Labs**

> **도심 유휴 상가 공간을 가변형 스마트팜으로 혁신 전환하고 관리하는 서비스 플랫폼 개발**

기업은 단순한 스마트팜 하드웨어 제작에 한정하지 않고, 해당 생태계를 구축할 수 있는 서비스·비즈니스 모델·소프트웨어·하드웨어 전반의 개발 가능성을 제시하였다.

---

## 1.2 프로젝트 한 문장 정의

> **도심 유휴상가를 공간 맞춤형 가변형 MiniFarm으로 전환하고, 생육 관리부터 생산물의 유통·판매까지 통합 관리하는 도심형 스마트팜 서비스 플랫폼**

---

## 1.3 프로젝트 핵심 키워드

- 도심 유휴상가
- 가변형 MiniFarm
- 스마트팜
- 화훼
- 생육환경 관리
- IoT
- 지역 꽃집
- 지역 상권
- 생산물 유통
- 소비자 플랫폼
- 데이터 기반 운영

---

# 2. 문제 정의

## 2.1 우리가 해결하려는 문제

우리 프로젝트의 문제는 단순히 **“스마트팜을 시작하기 어렵다”**가 아니다.

프로젝트가 바라보는 문제는 크게 다음과 같다.

### 문제 1. 도심 유휴상가의 비효율적 활용

상권 변화와 공실 증가로 인해 도심에는 활용되지 않는 상업 공간이 발생한다.

이러한 공간은 이미

- 전기
- 수도
- 접근성
- 건축물 인프라

등을 갖춘 경우가 많음에도 생산적인 공간으로 충분히 활용되지 못한다.

---

### 문제 2. 기존 스마트팜 구조의 공간 유연성 부족

도심 유휴상가는 각각

- 면적
- 층고
- 내부 구조
- 채광
- 수도 위치
- 전력 환경

등이 다르다.

따라서 획일적인 스마트팜 구조를 그대로 적용하기 어렵다.

도심 상가에 적용하려면 공간 특성에 맞춰 규모와 배치를 변경할 수 있는 **가변형·모듈형 MiniFarm 구조**가 필요하다.

---

### 문제 3. 설치 이후의 운영 시스템 부족

MiniFarm을 설치하는 것만으로 사업이 완성되는 것은 아니다.

실제 운영에는 다음과 같은 과정이 필요하다.

- 재배환경 관리
- 급수 및 시설 관리
- 생산물 관리
- 재고 관리
- 판매처 확보
- 주문 관리
- 운영 데이터 관리

따라서 MiniFarm 하드웨어뿐만 아니라 **지속적으로 운영할 수 있는 관리 플랫폼**이 함께 필요하다.

---

### 문제 4. 생산 이후의 판로 문제

스마트팜에서 작물을 생산하더라도 판매처와 연결되지 않는다면 지속가능한 운영이 어렵다.

우리 프로젝트는 이를 해결하기 위해 MiniFarm의 생산물을

> **지역 꽃집 → 소비자**

와 연결하는 유통 구조를 함께 설계한다.

---

# 3. 핵심 아이디어

우리 프로젝트는 단일 스마트팜 장비가 아니라 다음의 전체 생태계를 구축하는 것을 목표로 한다.

```text
도심 유휴상가
      ↓
공간 맞춤형 가변형 MiniFarm 설치
      ↓
화훼 재배
      ↓
생육환경 모니터링
      ↓
환경 / 급수 제어
      ↓
생산물 관리
      ↓
지역 꽃집 연계
      ↓
소비자 앱을 통한 판매
      ↓
생육·생산·판매 데이터 축적
      ↓
MiniFarm 운영 최적화
```

핵심은 다음과 같다.

> **공간 전환 → 재배 → 관리 → 생산 → 유통 → 판매 → 데이터**

를 하나의 서비스로 연결한다.

---

# 4. 왜 화훼인가?

현재 프로젝트에서는 MiniFarm의 주요 적용 작물로 **화훼**를 중심으로 서비스 모델을 구체화한다.

화훼를 선택한 이유는 단순히 관련 데이터를 확보하기 쉬워서가 아니다.

## 4.1 도심 공간과의 적합성

도심 유휴상가는 대규모 농업 공간에 비해 면적이 제한적이다.

따라서 넓은 재배 면적을 요구하는 저부가가치 작물보다는 상대적으로 작은 공간에서도 상품 가치를 확보할 수 있는 작물이 적합하다.

---

## 4.2 높은 단위면적 가치

화훼는 일반적인 대량 농산물과 비교했을 때 상품 종류와 품질에 따라 상대적으로 높은 부가가치를 만들 수 있다.

이는 도심의 제한된 공간을 활용하는 MiniFarm 모델과 잘 맞는다.

---

## 4.3 도심 내 명확한 소비처

꽃집, 플라워숍, 행사 공간 등 화훼 소비처는 주로 도심에 존재한다.

따라서

> **도심 생산 → 도심 유통 → 도심 소비**

라는 짧은 공급망을 만들 가능성이 있다.

---

## 4.4 신선도가 중요한 상품

화훼는 상품 상태와 신선도가 중요하다.

도심에서 생산하여 가까운 지역 꽃집으로 공급할 경우 장거리 유통에 비해 신선도 측면에서 장점을 만들 수 있다.

---

## 4.5 소비자 서비스와의 연결성

화훼는 소비자 앱을 통한 상품화 및 구매 경험으로 확장하기 쉽다.

이를 통해 MiniFarm의 생산 영역과 소비자 서비스를 자연스럽게 연결할 수 있다.

---

## 4.6 화훼의 프로젝트 내 위치

화훼 자체가 프로젝트의 최종 목적은 아니다.

> **화훼는 도심형 MiniFarm의 사업 가능성과 생산–유통–판매 구조를 구체적으로 검증하기 위한 주요 적용 분야다.**

향후 MiniFarm 환경과 시장성에 적합한 다른 작물로 확장할 수 있다.

---

# 5. 주요 이해관계자

## 5.1 유휴상가 소유자 / 공간 제공자

기존 공실을 새로운 생산 공간으로 전환할 수 있다.

기대 가치:

- 유휴공간 활용
- 공간 가치 향상
- 새로운 임대·운영 모델 가능성

---

## 5.2 MiniFarm 운영자

MiniFarm에서 작물을 재배하고 생산 시설을 운영한다.

필요 기능:

- 생육환경 확인
- 이상 상태 확인
- 급수 및 환경 관리
- 생산량 관리
- 시설 관리

---

## 5.3 플랫폼 관리자

MiniFarm과 유통·판매 과정 전체를 관리한다.

관리 대상:

- MiniFarm
- 사용자
- 꽃집
- 꽃 상품
- 주문
- 재고
- 생산 데이터
- 센서 데이터
- 운영 기록

---

## 5.4 지역 꽃집

MiniFarm에서 생산된 화훼를 공급받거나 플랫폼에서 상품을 판매하는 지역 파트너다.

기대 가치:

- 지역 생산 화훼 확보
- 새로운 공급 채널
- 소비자 접근성 확대

---

## 5.5 소비자

사용자 앱을 통해 지역 꽃집과 꽃 상품을 탐색하고 주문한다.

---

# 6. 전체 서비스 흐름

## 6.1 공간 전환

```text
도심 유휴상가 발굴
      ↓
공간 조건 파악
      ↓
MiniFarm 규모 및 구조 결정
      ↓
가변형 재배 모듈 설치
```

---

## 6.2 재배

```text
재배 작물 선정
      ↓
MiniFarm 재배
      ↓
환경 센서 측정
      ↓
생육 상태 관리
```

---

## 6.3 운영

```text
Sensor
   ↓
Controller / MCU
   ↓
Backend
   ↓
Database
   ↓
Admin Web
   ↓
관리자 확인 및 제어
```

---

## 6.4 생산 및 유통

```text
MiniFarm 생산
      ↓
생산물 관리
      ↓
지역 꽃집 연계
      ↓
꽃 상품 등록
```

---

## 6.5 소비자 판매

```text
사용자 App
    ↓
꽃집 목록
    ↓
꽃집 선택
    ↓
꽃 상품 조회
    ↓
상품 선택
    ↓
주문
```

---

# 7. 사용자 앱

## 7.1 목적

사용자 앱은 소비자와 지역 꽃집을 연결하고, MiniFarm에서 생산된 화훼가 실제 소비 시장으로 이어질 수 있도록 하는 접점이다.

---

## 7.2 핵심 UX 원칙

꽃마켓은 **상품 중심 쇼핑몰 구조가 아니라 상점 중심 구조**를 사용한다.

### 올바른 흐름

```text
꽃마켓
  ↓
꽃집 목록
  ↓
꽃집 선택
  ↓
해당 꽃집에서 판매하는 꽃
  ↓
상품 선택
  ↓
주문
```

### 사용하지 않는 기본 구조

```text
꽃 전체 목록
  ↓
상품 선택
  ↓
판매 꽃집 확인
```

즉, 음식 배달 플랫폼과 유사하게 **꽃집을 먼저 선택하고 해당 꽃집의 상품을 확인하는 방식**이다.

---

## 7.3 현재 확인된 주요 기능

Repository의 `app/` 코드를 기준으로 확인한 현재 구현은 다음과 같다.

### 기술 구성

- Flutter / Dart (`sdk: ^3.12.0`)
- `provider` + `ChangeNotifier` 기반 상태 관리
- `dart:io` `HttpClient` 기반 REST API Client
- `go_router` + 5개 하단 Tab Navigation
- Repository Pattern으로 API / Demo Data Source 분리
- `--dart-define=API_BASE_URL=...` 기반 API 주소 설정

### 구현 확인 기능

- 사용자 회원가입 / 로그인 / 로그아웃 / Token 갱신
- Keychain / Keystore 기반 Token 보안 저장과 앱 재실행 시 로그인 유지
- `DEMO_MODE=true` 빌드 옵션으로 실행하는 발표용 Demo Mode
- 꽃집 목록 검색·필터, 꽃집 상세, 꽃집별 상품 조회
- 재고 범위 수량 조절과 복수 상품 주문, 주문 내역 조회
- 계란껍질 수거 신청 및 사용자 수거 내역 조회
- 꽃꾸 체험 프로그램 조회·예약·예약 취소
- 사용자 누적 기여량, CO₂ 절감량, 리워드, 수거·예약·주문 내역 표시

현재 하단 Navigation은 다음 5개 화면으로 구성된다.

```text
홈 / 수거등록 / 꽃마켓 / 체험예약 / 마이
```

### 기획 Flow 대비 현재 차이

7.2의 **꽃집 우선 탐색 원칙은 기획 내용을 변경하지 않고 앱에 구현**했다. `GET /api/shops`로 꽃집 목록을 조회하고, 사용자가 꽃집을 선택하면 `GET /api/flowers?shop_id=...`로 해당 꽃집의 상품만 표시한다.

현재 앱에 연결되지 않은 Backend 확장 기능은 즐겨찾기, 리뷰, 맞춤 부케, 1:1 채팅이다. 수거 사진은 Backend가 외부 `image_url`을 받는 구조일 뿐 앱 전용 업로드 API가 없어 현재 UI 범위에서 제외했다.

---

## 7.4 현재 확인된 API 연동 흐름

현재 `app/lib/core/api_client.dart`와 `app/lib/repositories/`에서 실제 호출하는 endpoint는 다음과 같다.

| 기능 | Method | Endpoint | 인증 |
|---|---|---|---:|
| 회원가입 | POST | `/api/auth/register` | 불필요 |
| 로그인 | POST | `/api/auth/login` | 불필요 |
| Access Token 갱신 | POST | `/api/auth/refresh` | Refresh Token |
| 로그아웃 | POST | `/api/auth/logout` | 필요 |
| 꽃집 목록 | GET | `/api/shops` | 불필요 |
| 꽃집별 꽃 목록 | GET | `/api/flowers?shop_id={id}` | 불필요 |
| 꽃꾸 프로그램 목록 | GET | `/api/programs` | 불필요 |
| 사용자 마이페이지 | GET | `/api/users/me` | 필요 |
| 사용자 수거 내역 | GET | `/api/eco/contributions` | 필요 |
| 수거 신청 | POST | `/api/collections` | 필요 |
| 내 체험 예약 목록 | GET | `/api/reservations` | 필요 |
| 체험 예약 | POST | `/api/reservations` | 필요 |
| 체험 예약 취소 | PATCH | `/api/reservations/{id}/cancel` | 필요 |
| 주문 내역 | GET | `/api/orders` | 필요 |
| 꽃 주문 | POST | `/api/orders` | 필요 |

API Client는 JSON 요청, Bearer Token 첨부, 12초 Timeout, 401 응답 시 Refresh Token을 이용한 1회 재시도를 구현한다.

코드의 기본 API 주소는 `http://localhost:8000`이다. Android Emulator는 `http://10.0.2.2:8000`, 실기기는 접근 가능한 외부 Server Origin을 빌드 시 `API_BASE_URL`로 지정해야 한다. Endpoint에 `/api/...`가 포함되므로 Origin에는 `/api`를 붙이지 않는다.

Access Token과 Refresh Token은 `flutter_secure_storage`를 통해 iOS Keychain / Android Keystore 기반 저장소에 보관하며, 저장된 Refresh Token이 있으면 앱 재실행 시 Session을 복구한다.

## 7.5 App Directory 및 검증 상태

```text
app/lib/
├── core/         # ApiClient, ApiException, TokenStorage
├── features/     # 꽃마켓 목록·상세
├── models/       # Shop, Flower, Program, Collection, Order
├── providers/    # AuthSession, EggBloomState
├── repositories/ # API / Mock Repository
├── screens/      # auth, home, collect, experience, my
├── theme/
└── widgets/
```

- `app/test/app_state_test.dart`: 부분 API 실패 대응, Model 변환, 예약 취소, 주문 상태 테스트
- `app/test/widget_test.dart`: Home, 꽃마켓·체험, 주문 내역, 품절 상태 Widget 테스트
- 2026-08-27 기준 `flutter analyze` 통과, Flutter Test 9개 통과, Android Debug APK Build 성공을 확인했다.
- Android 실기기에서 외부 Server 로그인, 꽃마켓 조회·주문 흐름을 수동 확인했다.
- Android Manifest에 Internet 권한과 개발 Server HTTP 통신 허용이 반영돼 있다. 운영 배포 전 HTTPS 전환이 필요하다.

---

# 8. 관리자 웹

## 8.1 목적

관리자 웹은 MiniFarm과 생산·유통·판매 시스템을 통합 관리하는 운영 인터페이스다.

---

## 8.2 기존 관리 영역

Repository의 `web/` 코드를 기준으로 관리자 웹은 다음 기술로 구현돼 있다.

- React 19 + TypeScript 6
- Vite 8
- Tailwind CSS 4
- React Router 7
- Zustand 5
- Recharts 3
- Lucide React

현재 Route와 화면은 다음과 같다.

| Route | 화면 | 현재 기능 |
|---|---|---|
| `/` | Landing | MiniFarm 서비스 소개 |
| `/login` | Login | 관리자 로그인 |
| `/signup` | Signup | 관리자 가입 후 꽃집 생성 |
| `/dashboard` | Dashboard | 센서·재고·예약·운영 알림 요약 |
| `/sensors` | Sensor Monitoring | 센서 최신값과 최근 이력 Chart |
| `/flowers` | Inventory | 꽃 등록·수정·삭제, 이미지·재고 관리 |
| `/reservations` | Reservations | 체험 예약 검색·조회·상태 변경 |
| `/not-found` | Not Found | 잘못된 경로 처리 |

`/dashboard` 이하 Route는 `RequireAuth`로 보호한다. 관리자 정보, Access Token, Refresh Token, 운영 알림 및 일부 Mock/Fallback 데이터는 Browser `localStorage`를 사용한다.

### 실제 Backend 연동 영역

- 관리자 회원가입 / 로그인 / 내 정보 / Token 갱신 / 로그아웃
- 꽃집 생성 / 조회 / 수정
- 꽃 상품 목록 / 등록 / 수정 / 삭제
- 꽃 이미지 업로드와 재고 수량 변경
- Dashboard Summary
- 관리자 체험 예약 목록과 예약 상태 변경
- 센서 Device 목록, 최신값, 이력 조회

### 현재 Web에 화면이 없는 Backend 영역

- 일반 주문 관리
- 맞춤 부케 주문 관리
- 1:1 채팅
- 계란껍질 수거 승인·통계 전용 화면
- 사용자·리뷰·즐겨찾기 관리

`web/src/api/collections.ts`에는 수거 Summary / Trend / Ranking Client가 있으나, 현재 Router에 연결된 수거 관리 Page는 없다.

---

## 8.3 Final MVP에서 강화해야 할 영역

최종 MVP에서는 **MiniFarm ↔ 관리자 플랫폼 연결**을 강화하는 것이 우선이다.

권장 관리 화면 예시:

### MiniFarm #01

```text
현재 상태        정상 / 주의 / 관리 필요

온도             24.1℃
습도             62%
토양수분         31%
조도             18,300 lux

급수 상태        OFF
최근 급수        14:32
```

가능한 기능:

- 현재 환경 데이터 표시
- 정상 / 주의 / 이상 상태 표시
- 급수 상태 확인
- 수동 급수
- 최근 센서 기록
- 최근 급수 기록

## 8.4 현재 MiniFarm Dashboard 구현 상태

8.3의 방향 가운데 현재 코드에서 확인되는 기능은 다음과 같다.

- 온도, 습도, 조도, 토양수분 최신값 표시
- 센서별 정상 / 주의 / 위험 판정
- 정상 범위 표시
- 최신 수신 시각 및 10분 이상 수신 지연 판정
- 최근 센서 이력 Line Chart
- 재고 부족 및 예약 대기 수량 표시
- 운영 알림 읽음 / 조치 완료 처리

센서 화면은 Backend의 실제 Device·최신값·이력 API를 우선 호출한다. API 호출 실패 또는 Device 미등록 시 `web/src/mock/dashboard.ts`의 예시값을 표시하고 하드웨어 연결 확인 안내를 노출한다.

현재 Web은 **센서 조회 전용**이다. 수동 급수 Button, Pump 상태 조회, 급수 이력, Backend 제어 Command 호출은 구현돼 있지 않다. 운영 알림의 읽음·조치 완료 상태도 현재 Browser Local Storage에만 저장된다.

## 8.5 Web Directory 및 실행·검증

```text
web/src/
├── api/          # Fetch Client 및 Domain API
├── components/   # Chart, Card, Modal, Logo
├── layouts/      # Public / Dashboard Layout
├── mock/         # API 장애·Demo용 예시 데이터
├── pages/        # 실제 Route 화면
├── routes/       # React Router 구성
├── store/        # Zustand Store
└── types/
```

```bash
cd web
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

`VITE_API_BASE_URL`로 Backend Origin을 지정하며, `VITE_USE_MOCKS=true`일 때 관리자 인증·운영 데이터를 Mock Mode로 사용할 수 있다.

2026-08-24 Repository 조사 시 `typecheck`, `lint`, Production Build가 모두 통과했다. 별도의 Web Unit / Component Test Framework와 CI Workflow는 현재 Repository에 없다.

---

# 9. Backend

## 9.1 역할

Backend는 App, Admin Web, Database 및 향후 MiniFarm Hardware를 연결하는 중심 시스템이다.

개념적 구조:

```text
User App ───────┐
                │
Admin Web ─── Backend ─── Database
                │
                │
          MiniFarm Hardware
```

---

## 9.2 현재 개발 범위

### 기술 스택

- Python 3.10+ (`backend/Dockerfile`은 Python 3.10 사용)
- FastAPI 0.115.6
- Pydantic / Pydantic Settings
- SQLAlchemy 2 Async ORM
- MySQL + `asyncmy`가 기본 Database 구성
- 테스트에서는 SQLite + `aiosqlite` 사용
- JWT: `python-jose`, Password Hash: `passlib[bcrypt]`
- MQTT Client: `aiomqtt`
- Test: `pytest`, `pytest-asyncio`, `httpx`

### Directory Structure

```text
backend/
├── app/
│   ├── api/routes/  # FastAPI endpoint
│   ├── core/        # 설정, JWT, Password
│   ├── crud/        # Database Query
│   ├── db/          # Engine, Session, Base
│   ├── models/      # SQLAlchemy Model
│   ├── mqtt/        # MQTT Listener
│   ├── schemas/     # Pydantic Request / Response
│   └── services/    # Domain Business Logic
├── tests/
├── Dockerfile
├── main.py
└── requirements.txt
```

### 구현 Domain

- 사용자 및 관리자 회원가입·로그인·Token 갱신·로그아웃
- 사용자 / 관리자 JWT 권한 분리와 Token 폐기 목록 관리
- 꽃집 생성·조회·수정
- 꽃 상품·이미지·재고·재고 조정 이력 관리
- 일반 꽃 주문과 관리자 주문 조회
- 꽃꾸 프로그램·예약·예약 상태 관리
- 맞춤 부케 주문
- 사용자 / 관리자 1:1 채팅 REST API 및 WebSocket
- 리뷰와 꽃 즐겨찾기
- 계란껍질 수거 신청·승인·반려, 기여도·리워드·Ranking
- 관리자 Dashboard Summary
- MQTT 센서 Telemetry 수집, 최신값·이력 저장, 관리자 조회

현재 `backend/app/api/router.py`에 등록된 HTTP / WebSocket Route는 총 84개다.

### 주요 Database Model

| 영역 | Model |
|---|---|
| 인증 | `User`, `AdminUser`, `RevokedToken` |
| 매장·상품 | `Shop`, `Flower`, `FlowerStock`, `FlowerStockAdjustment` |
| 주문 | `Order`, `OrderItem`, `BouquetOrder` |
| 체험 | `WorkshopProgram`, `WorkshopBooking` |
| 커뮤니티 | `Review`, `Favorite` |
| 채팅 | `ChatRoom`, `Message` |
| 자원순환 | `EcoContributionLog`, `RewardRedemption` |
| MiniFarm Sensor | `SmartFarmDevice`, `SensorLatest`, `SensorReading`, `SensorMessageLog` |

Schema Migration 도구는 현재 없으며, `CREATE_TABLES_ON_STARTUP=true`일 때 FastAPI 시작 과정에서 SQLAlchemy `Base.metadata.create_all()`을 실행한다.

### API Group

| Prefix | 주요 기능 |
|---|---|
| `/api/auth`, `/api/admin/auth` | 사용자·관리자 인증 |
| `/api/shops` | 꽃집 |
| `/api/flowers` | 꽃·이미지·재고 |
| `/api/orders`, `/api/admin/orders` | 일반 주문 |
| `/api/programs`, `/api/reservations`, `/api/admin/reservations` | 꽃꾸 프로그램·예약 |
| `/api/workshops`, `/api/admin/workshop-bookings` | Workshop 호환 API |
| `/api/bouquet-orders`, `/api/admin/bouquet-orders` | 맞춤 부케 |
| `/api/chat`, `/api/admin/chat` | REST / WebSocket 채팅 |
| `/api/reviews`, `/api/favorites` | 리뷰·즐겨찾기 |
| `/api/eco`, `/api/collections`, `/api/participants` | 수거·기여도·리워드 |
| `/api/dashboard` | 관리자 운영 Summary |
| `/api/admin/sensors` | Sensor Device·최신값·이력 조회 |
| `/health` | Health Check |

---

## 9.3 MiniFarm 관련 추가 API 방향

Final MVP에서 필요한 최소 API는 개념적으로 다음과 같다.

### Farm 상태 조회

```http
GET /api/farms/{farmId}/status
```

예시 Response:

```json
{
  "temperature": 24.1,
  "humidity": 62,
  "soilMoisture": 31,
  "light": 18300,
  "watering": false
}
```

### 급수 요청

```http
POST /api/farms/{farmId}/watering
```

### 센서 데이터 저장

```http
POST /api/farms/{farmId}/sensor-data
```

> 위 API는 설계 방향 예시이며, 실제 구현 여부 및 endpoint는 Backend 코드와 API 명세를 기준으로 한다.

### 현재 실제 구현과의 대응

위 설계 방향은 변경하지 않는다. 다만 현재 Repository의 MiniFarm 연동은 다음 방식으로 구현돼 있다.

#### Sensor 수집

HTTP `POST /api/farms/{farmId}/sensor-data`가 아니라 `MQTT_ENABLED=true`일 때 Backend MQTT Listener가 다음 Topic을 구독한다.

```text
dalmegg/v1/farms/{farm_uid}/devices/{device_uid}/telemetry
```

Payload는 다음 값을 지원한다.

- `message_id`
- `temperature_c`
- `humidity_pct`
- `soil_moisture_pct`
- `light_lux`
- `water_level_pct`
- `measured_at`

`message_id` 중복을 차단하고, Device별 최신값은 `sensor_latest`, 일정 간격의 이력은 `sensor_reading`, 수신 Message ID는 `sensor_message_log`에 저장한다. 기본 이력 저장 간격은 60초다.

#### Sensor 조회

```http
GET /api/admin/sensors/devices
GET /api/admin/sensors/farms/{farm_uid}/devices/{device_uid}/readings/latest
GET /api/admin/sensors/farms/{farm_uid}/devices/{device_uid}/readings?limit=100
```

위 endpoint는 관리자 JWT가 필요하다.

#### 미구현 영역

- `GET /api/farms/{farmId}/status` 형태의 Farm 통합 상태 API
- HTTP 기반 Sensor Data 저장 API
- `POST /api/farms/{farmId}/watering`
- Pump / Relay / Actuator Command Model
- Backend → MQTT 제어 Message 발행
- 급수 상태 및 급수 이력 저장

따라서 현재 연결은 **Hardware → MQTT → Backend → Database → Admin Web 조회**까지 구현됐고, **Admin Web → Backend → Hardware 제어**는 구현되지 않았다.

## 9.4 인증·환경변수·실행·테스트

### 인증

- 사용자와 관리자는 JWT `type` Claim으로 구분한다.
- Access Token과 Refresh Token을 별도로 발급한다.
- Token마다 `jti`를 부여하며 로그아웃·갱신 시 `RevokedToken`으로 폐기 여부를 확인한다.
- Password는 bcrypt Hash로 저장한다.

### 주요 환경변수

| 변수 | 기본값 / 역할 |
|---|---|
| `APP_NAME` | FastAPI App 이름 |
| `API_PREFIX` | 기본 `/api` |
| `DATABASE_URL` | 기본 MySQL Async URL |
| `JWT_SECRET_KEY` | JWT 서명 Key, 운영환경에서 반드시 교체 |
| `JWT_ALGORITHM` | 기본 `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 기본 60분 |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | 기본 14일 |
| `CREATE_TABLES_ON_STARTUP` | 시작 시 Table 자동 생성 여부 |
| `UPLOAD_DIR` | 꽃 이미지 저장 경로 |
| `MQTT_ENABLED` | 기본 `false` |
| `MQTT_HOST`, `MQTT_PORT` | Broker 연결 정보 |
| `MQTT_USERNAME`, `MQTT_PASSWORD` | Broker 인증 정보 |
| `MQTT_TOPIC_PREFIX` | 기본 `dalmegg/v1` |
| `MQTT_HISTORY_INTERVAL_SECONDS` | 기본 60초 |

### 실행

```bash
cd backend
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Root의 `docker-compose.yml`은 Mosquitto와 Backend를 실행한다. Database Container는 포함하지 않으므로 `backend/.env`의 외부 MySQL 접속 정보가 별도로 필요하다. Mosquitto 개발 설정은 `1883` Port와 Anonymous 접속을 사용하므로 운영 배포 시 인증·TLS 설정이 필요하다.

### 테스트

- Backend Test 함수: 54개
- 2026-08-24 Python 3.12 / SQLite Test 환경 실행 결과: **53 passed, 1 skipped**
- Skip 1건은 설정된 실제 MySQL에 연결할 수 없을 때 Skip하도록 작성된 Database 연결 Test다.
- 인증, 주문·동시성, 재고, 체험 예약·동시성, 채팅, 수거·리워드, 리뷰, Dashboard, MQTT Sensor 처리 등을 테스트한다.

---

# 10. MiniFarm Hardware

## 10.1 목적

MiniFarm은 도심 유휴상가를 실제 생산 공간으로 전환하는 물리적 시스템이다.

---

## 10.2 핵심 원칙

### 가변성

유휴상가마다 공간 구조가 다르기 때문에 하나의 고정 규격이 아니라 설치 공간에 따라 구성을 조정할 수 있어야 한다.

### 모듈성

필요에 따라 재배 단위의 수와 배치를 변경할 수 있는 구조를 지향한다.

---

## 10.3 주요 구성 요소

예상 또는 현재 사용 범위:

- 재배 모듈
- 화분 또는 재배 베드
- 재배 조명
- 물탱크
- 워터 펌프
- 급수 호스
- 센서
- Controller / MCU
- 전원 장치

실제 최종 하드웨어 구성은 시제품 기준으로 업데이트한다.

---

# 11. 센서 및 IoT

## 11.1 Final MVP에서 우선적으로 활용할 데이터

### 온도

MiniFarm 내부의 재배 환경 온도 측정.

### 습도

공기 중 상대습도 측정.

### 토양수분

급수 필요 여부 판단에 핵심적으로 활용.

### 조도

사용 가능한 센서와 시간이 허용될 경우 추가.

---

## 11.2 데이터 흐름

목표 구조:

```text
Sensor
   ↓
MCU / Controller
   ↓
Backend API
   ↓
Database
   ↓
Admin Web
```

Final MVP에서는 모든 센서를 완벽하게 구현하는 것보다 **실제 데이터가 하나의 end-to-end 흐름으로 이동하는 것을 검증하는 것**을 우선한다.

---

# 12. 환경 및 급수 제어

## 12.1 기본 제어 구조

```text
센서값 측정
    ↓
생육 기준과 비교
    ↓
정상 / 이상 판단
    ↓
필요 시 환경 제어
```

---

## 12.2 급수 예시

```text
토양수분 28%

권장 기준보다 낮음
      ↓
수분 부족 판단
      ↓
급수 필요
      ↓
Pump ON
      ↓
호스를 통한 급수
      ↓
급수 기록 저장
```

---

## 12.3 수동 제어

Final MVP에서는 자동제어가 완전히 안정적이지 않을 경우 관리자 웹의

> **급수 시작**

기능을 통해 직접 제어할 수 있도록 구성하는 것도 유효하다.

발표에서는 안정성이 최우선이다.

---

# 13. 생육 관리 로직

## 13.1 현재 MVP 방향

현재 단계에서는 복잡한 AI 모델보다는 **Rule-based 생육 관리**가 적합하다.

예:

```text
토양수분 >= 적정 최솟값
→ 정상

토양수분 < 적정 최솟값
→ 수분 부족
→ 경고
→ 급수 필요
```

환경별로 적정 범위를 설정하여 판단한다.

---

## 13.2 생육 레시피 개념

작물별로 다음과 같은 기준을 관리할 수 있다.

| 환경 항목 | 권장 범위 | 현재 값 | 상태 |
|---|---|---|---|
| 온도 | 작물별 설정 | Sensor | 정상/주의 |
| 습도 | 작물별 설정 | Sensor | 정상/주의 |
| 토양수분 | 작물별 설정 | Sensor | 정상/주의 |
| 조도 | 작물별 설정 | Sensor | 정상/주의 |

정확한 생육 기준은 최종 선정 작물과 신뢰할 수 있는 재배 자료를 기반으로 결정한다.

---

# 14. 데이터 활용

우리 프로젝트의 장기적인 경쟁력은 단순 센서 데이터 수집이 아니라 **생육·생산·판매 데이터를 하나의 플랫폼에서 연결할 가능성**에 있다.

## 14.1 생육 데이터

- 온도
- 습도
- 토양수분
- 조도
- 급수 횟수
- 재배 기간

---

## 14.2 생산 데이터

- 작물 종류
- 생산량
- 수확 시점
- 품질
- 폐기량

---

## 14.3 판매 데이터

- 상품
- 꽃집
- 주문량
- 판매량
- 판매 시기
- 지역별 수요

---

## 14.4 장기적인 데이터 흐름

```text
환경 데이터
+
생육 데이터
+
생산 데이터
+
판매 데이터
       ↓
운영 분석
       ↓
재배량 / 재배조건 최적화
```

이를 통해 장기적으로 단순히 **“잘 키우는 스마트팜”**에서

> **“얼마나 생산해야 하는지까지 판단하는 MiniFarm 운영 플랫폼”**

으로 발전할 수 있다.

---

# 15. AI 활용 방향

## 15.1 현재 상태

기업 참고자료에서는 다음과 같은 발전 가능성을 제시했다.

- AI 활용 생육 레시피 분석
- 생육 최적화
- 전력비 및 관리비 절감
- 운영 효율화

하지만 해당 내용이 **현재 모두 구현되어 있다는 의미는 아니다.**

---

## 15.2 Final MVP

Final MVP에서는 필요한 경우 다음과 같은 규칙 기반 방식을 사용한다.

```text
작물별 적정 환경
       +
현재 센서 데이터
       ↓
Rule-based 판단
       ↓
환경 상태 / 급수 필요 여부
```

---

## 15.3 향후 AI 발전

충분한 데이터가 확보되면 다음 영역으로 확장할 수 있다.

### 생육 최적화

환경 조건과 성장 결과의 관계 분석.

### 생산량 예측

현재 성장 상태를 바탕으로 생산량 또는 수확 시점 예측.

### 자동 환경 제어

현재 상태뿐만 아니라 미래 변화를 고려한 급수 및 환경 제어.

### 수요 기반 생산계획

판매 데이터를 기반으로 품종별 적정 생산량 결정.

### 에너지 최적화

전력비, 조명, 펌프 사용량 등을 분석하여 운영 비용 최소화.

---

# 16. 생산 및 지역 꽃집 연계

MiniFarm은 단순히 식물을 생산하고 끝나는 구조가 아니다.

생산된 화훼를 **지역 꽃집과 연결**하여 실제 경제 활동으로 이어지게 한다.

```text
MiniFarm
   ↓
화훼 생산
   ↓
지역 꽃집
   ↓
꽃 상품
   ↓
사용자 App
   ↓
소비자
```

이를 통해 MiniFarm은 단순 실험 시설이 아니라 실제 도심 경제 안에서 운영 가능한 모델로 확장된다.

---

# 17. 자원순환 및 계란껍질 기능

## 17.1 배경

프로젝트 개발 과정에서 다음과 같은 자원순환 관련 기능도 개발되었다.

- 계란껍질 수거 신청
- 수거 승인
- 수거량 관리

---

## 17.2 기존 아이디어

초기에는 지역에서 발생하는 부산물 또는 폐자원을 MiniFarm의 재배 과정과 연결하는 **지역 자원순환 구조**도 함께 고려하였다.

개념적으로는 다음과 같다.

```text
지역 부산물
    ↓
수거
    ↓
가공 / 활용
    ↓
MiniFarm 재배 자원
```

---

## 17.3 현재 위치

**Status: Secondary / Re-evaluation**

최종 MVP의 중심 메시지는 다음이다.

> **유휴상가 → MiniFarm → 생육 관리 → 생산 → 지역 꽃집 → 소비자**

따라서 자원순환 요소가 전체 프로젝트 메시지를 복잡하게 만들 경우 최종 발표의 핵심 기능에서는 제외하고 **추가 확장 가능성**으로 제시한다.

단, 이미 구현된 기능을 명시적인 결정 없이 삭제하지 않는다.

---

# 18. 기업 참고자료와의 연결

기업 참고자료는 특정 기능을 모두 구현하라는 고정된 요구사항이라기보다 MiniFarm 생태계의 발전 가능성을 제시한 참고 방향으로 해석한다.

## 18.1 MiniFarm 활용 수익창출

기업 참고 방향:

> 소규모 도심 농업 연계 수익 다각화

우리 프로젝트:

```text
MiniFarm 생산
   ↓
지역 꽃집
   ↓
소비자 판매
```

---

## 18.2 생육 모니터링

기업 참고 방향:

> 실시간 생육환경 모니터링 및 시각화

우리 프로젝트:

```text
Sensor
 ↓
Backend
 ↓
Admin Web
```

---

## 18.3 스마트팜 환경 제어

기업 참고 방향:

> 생육 레시피 기반 관리 및 AI 활용 가능성

우리 프로젝트 Final MVP:

```text
작물 생육 기준
    +
Sensor 데이터
    ↓
환경 상태 판단
    ↓
급수 등 환경 제어
```

---

## 18.4 운영 효율화

기업 참고 방향:

> 전력비 및 관리비 절감 / 자원 최적화

우리 프로젝트:

현재는 데이터를 축적할 수 있는 기반을 구축하고 향후

- 물 사용량
- 전력
- 급수 기록
- 성장 결과
- 생산량

을 분석하여 운영 최적화로 발전한다.

---

# 19. 비즈니스 모델

우리 프로젝트는 단일 수익원보다 MiniFarm 생태계 전체에서 다양한 비즈니스 가능성을 가진다.

## 19.1 MiniFarm 구축

유휴상가를 MiniFarm으로 전환하는 구축 서비스.

잠재 고객:

- 유휴상가 소유주
- 공간 운영 사업자
- 지자체
- 기업
- 도심 농업 사업자

---

## 19.2 운영 관리 플랫폼

설치된 MiniFarm을 관리할 수 있는 소프트웨어 서비스.

기능:

- 환경 모니터링
- 이상 상태 관리
- 생산 관리
- 시설 관리
- 데이터 분석

장기적으로 구독형 SaaS 형태도 검토 가능하다.

---

## 19.3 생산물 판매

MiniFarm에서 생산한 화훼를 지역 꽃집 등에 공급한다.

---

## 19.4 플랫폼 거래

소비자 앱을 통해 꽃집의 상품을 판매하고 거래를 연결한다.

장기적으로 플랫폼 수수료 모델 등을 고려할 수 있다.

---

## 19.5 전체 비즈니스 구조

```text
MiniFarm 구축
      +
운영 관리
      +
화훼 생산
      +
지역 유통
      +
소비자 플랫폼
```

---

# 20. 프로젝트 차별점

## 20.1 유휴상가 특화

새로운 농업 시설을 만드는 것이 아니라 **이미 존재하지만 사용되지 않는 도심 공간**을 활용한다.

---

## 20.2 가변형 MiniFarm

서로 다른 상가의 구조에 적용할 수 있는 공간 맞춤형 구조를 지향한다.

---

## 20.3 스마트팜에서 끝나지 않음

일반적인 스마트팜 프로젝트가

```text
재배
→ 센서
→ 자동 제어
```

에 집중한다면, 우리 프로젝트는

```text
공간 전환
→ 재배
→ 관리
→ 생산
→ 유통
→ 판매
→ 데이터
```

까지 연결한다.

---

## 20.4 지역 상권 연결

MiniFarm이 기존 지역 꽃집을 대체하는 것이 아니라 **지역 꽃집을 유통 파트너로 연결**한다.

---

## 20.5 Hardware + Software + Business

프로젝트가 다음 영역을 하나로 묶는다.

- Physical Space
- Smart Farm Hardware
- IoT
- Backend
- Admin Web
- Consumer App
- Business Model

---

# 21. 개발 아키텍처

Repository 기준 현재 개발 아키텍처는 다음과 같다.

```text
┌──────────────────────┐       HTTP/JSON + JWT       ┌──────────────────────┐
│ Flutter User App     │ ──────────────────────────▶ │                      │
│ Provider + ApiClient │                              │                      │
└──────────────────────┘                              │                      │
                                                      │   FastAPI Backend    │
┌──────────────────────┐       HTTP/JSON + JWT       │                      │
│ React Admin Web      │ ──────────────────────────▶ │                      │
│ Zustand + Fetch      │                              └──────────┬───────────┘
└──────────────────────┘                                         │
                                                                 │ SQLAlchemy Async
                                                                 ▼
                                                       ┌──────────────────────┐
                                                       │ MySQL                │
                                                       │ SQLite in Test       │
                                                       └──────────────────────┘

┌──────────────────────┐        MQTT QoS 1            ┌──────────────────────┐
│ MiniFarm Sensor      │ ──────────────────────────▶  │ Mosquitto :1883      │
│ Device code 미포함   │                               └──────────┬───────────┘
└──────────────────────┘                                          │ Subscribe
                                                                  ▼
                                                       ┌──────────────────────┐
                                                       │ Backend MQTT Listener│
                                                       │ Sensor 저장 Service  │
                                                       └──────────────────────┘
```

## 21.1 Component별 실제 구현

| Component | 기술 | 코드 위치 | 역할 |
|---|---|---|---|
| User App | Flutter, Provider, `dart:io` HttpClient | `app/` | 사용자 인증, 꽃집·꽃·체험 조회, 주문·예약·수거 |
| Admin Web | React, TypeScript, Vite, Zustand, Recharts | `web/` | 관리자 인증, Dashboard, 센서, 재고, 예약 |
| Backend | FastAPI, Pydantic, SQLAlchemy Async | `backend/` | REST/WebSocket API, Domain Logic, DB |
| MQTT Broker | Eclipse Mosquitto 2 | `docker-compose.yml`, `mosquitto.conf` | Sensor Telemetry Broker |
| Database | MySQL 기본, SQLite Test | Backend 환경변수 / Test Fixture | 서비스 데이터 저장 |
| Upload Storage | Local File System + FastAPI StaticFiles | `backend/uploads`, `/uploads` | 꽃 이미지 저장·제공 |

## 21.2 주요 데이터 흐름

### 사용자 구매

```text
Flutter App
→ POST /api/auth/login
→ GET /api/shops
→ GET /api/flowers?shop_id={id}
→ POST /api/orders
→ Order / OrderItem 저장
→ FlowerStock 차감
→ GET /api/orders로 주문 내역 표시
```

### 체험 예약

```text
Flutter App
→ GET /api/programs
→ POST /api/reservations
→ WorkshopBooking 저장
→ WorkshopProgram.booked_count 반영
→ PATCH /api/reservations/{id}/cancel로 예약 취소
```

### 센서 모니터링

```text
MiniFarm Sensor Device
→ MQTT telemetry Topic
→ Mosquitto
→ `MQTT_ENABLED=true`인 FastAPI Process의 MQTT Listener
→ SmartFarmDevice / SensorLatest / SensorReading 저장
→ Admin Web이 /api/admin/sensors/* 조회
```

### 관리자 운영

```text
React Admin Web
→ 관리자 JWT 인증
→ Dashboard / Sensor / Flower / Reservation API
→ 실제 데이터 표시
→ API 장애 또는 데이터 부재 시 일부 화면은 Mock Data 표시
```

## 21.3 Infrastructure 현재 범위

- Docker Compose에는 `backend`, `mosquitto` Service가 있다.
- Backend는 `8000`, Mosquitto는 `1883` Port를 공개한다.
- Database, Admin Web, Flutter App, Nginx는 Docker Compose에 포함되지 않는다.
- Cloud 배포 Manifest, Reverse Proxy 설정, CI/CD Workflow는 Repository에서 확인되지 않는다.
- Hardware Firmware, 회로도, Pin Assignment는 Repository에 포함되지 않는다.
- Sensor 수집 경로는 구현됐지만 Actuator 제어 경로는 없다.

---

# 22. 개발 영역별 책임

현재 개발은 크게 다음 영역으로 나누어 진행한다.

## Backend

- API
- Business Logic
- Database
- 인증 및 권한
- App / Web 연동
- 향후 Hardware 데이터 처리

---

## Frontend — Web

- 관리자 기능
- 운영 데이터 표시
- MiniFarm Monitoring
- 생산 / 주문 등 관리

---

## Frontend — App

- 소비자 서비스
- 꽃집 탐색
- 꽃 상품 탐색
- 주문

---

## Hardware

- MiniFarm 구조
- 센서
- 급수
- MCU
- Backend 연동

---

# 23. 현재 구현 현황

> 아래 상태는 2026-08-27 Repository의 실제 소스와 실행 가능한 검증 결과를 기준으로 한다. 물리적 Hardware는 Repository 밖의 상태를 판단하지 않고 별도로 표시한다.

상태 표시:

- ✅ 구현 확인
- 🟡 개발 중 / 통합 확인 필요
- 🔵 계획
- ⚪ 보류 / 재검토

| 영역 | 기능 | 상태 |
|---|---|---:|
| App | 회원가입 / 로그인 / Token 갱신 | ✅ 코드 구현 |
| App | 발표용 Demo Mode | ✅ 코드 구현 |
| App | 꽃집 목록·상세 / 꽃집별 상품 Flow | ✅ API 연동·실기기 확인 |
| App | 재고 기반 복수 상품 주문 / 주문 내역 | ✅ API 연동·실기기 확인 |
| App | 수거 신청 / 내 수거 내역 | ✅ 코드 구현 |
| App | 체험 목록 / 예약 / 예약 취소 | ✅ API 연동 |
| App | 마이페이지 기여도·리워드·예약 표시 | ✅ 코드 구현 |
| App | Token 보안 저장 / 로그인 유지 | ✅ Keychain / Keystore 기반 |
| App | 채팅 / 맞춤 부케 / 리뷰 / 즐겨찾기 | 🔵 미연동 |
| App | Flutter Analyze / Test / Android Build | ✅ Analyze 통과·Test 9개·Debug APK Build |
| Backend | 회원가입 / 로그인 | ✅ |
| Backend | 사용자 / 관리자 권한 | ✅ |
| Backend | 꽃집 관리 | ✅ |
| Backend | 꽃 상품 관리 | ✅ |
| Backend | 주문 관리 | ✅ |
| Backend | 재고 / 재고 조정 이력 | ✅ |
| Backend | 체험 프로그램 / 예약 | ✅ |
| Backend | 맞춤 부케 / 채팅 / WebSocket | ✅ |
| Backend | 리뷰 / 즐겨찾기 | ✅ |
| Backend | 계란껍질 수거 관련 기능 | ✅ |
| Backend | MQTT Sensor 수집 / 최신값 / 이력 | ✅ |
| Backend | Test Suite | ✅ 53 passed / 1 skipped |
| Web | 관리자 가입 / 로그인 / 꽃집 생성 | ✅ |
| Web | MiniFarm Dashboard | ✅ 조회 기능 |
| Web | Sensor 최신값 / 이력 Chart | ✅ 실제 API + Mock Fallback |
| Web | 꽃·이미지·재고 CRUD | ✅ |
| Web | 체험 예약 조회 / 상태 변경 | ✅ |
| Web | 주문 / 채팅 / 수거 관리 화면 | 🔵 미구현 |
| Web | Typecheck / Lint / Production Build | ✅ 통과 |
| Hardware | MiniFarm Prototype | ⚪ Repository에서 확인 불가 |
| IoT | 환경 Sensor 측정 Firmware | ⚪ Repository에 소스 없음 |
| IoT | Sensor → MQTT → Backend | ✅ Backend 수신부 구현 |
| IoT | Backend → Web | ✅ Sensor 조회 구현 |
| Control | 급수 Pump / Relay Firmware | ⚪ Repository에 소스 없음 |
| Control | Web 기반 급수 제어 | 🔵 미구현 |
| AI | ML 생육 모델 | ⚪ 향후 |
| AI | 에너지 최적화 | ⚪ 향후 |

### 현재 통합 경계

```text
구현 확인:
App ↔ Backend REST API
Web ↔ Backend REST API
Sensor MQTT → Backend 저장 → Web 조회

미구현 또는 실행 검증 필요:
Web → Backend → Pump 제어
실제 Hardware Firmware 및 Pin 연결
실제 MySQL을 포함한 전체 Docker / 배포 구성
```

---

# 24. Final MVP 범위

현재는 최종 발표 직전이므로 프로젝트 범위를 확대하지 않는다.

## MUST

최종적으로 반드시 안정화해야 한다.

- 기존 App 핵심 흐름
- 기존 Backend
- 기존 Web
- MiniFarm Prototype
- App ↔ Backend 연결
- Web ↔ Backend 연결
- 발표 시연 안정성

---

## SHOULD

가능하면 Final MVP에서 구현한다.

- MiniFarm 센서값 수집
- Backend 센서 데이터 처리
- 관리자 Web 환경 데이터 표시
- 생육 상태 표시
- 실제 급수 시연

---

## COULD

시간이 남는 경우.

- 환경 데이터 그래프
- 급수 기록
- 환경 이상 알림
- Rule-based 자동 급수

---

## NOT NOW

현재 새로 시작하지 않는다.

- 복잡한 Machine Learning 모델
- 생육 예측 AI
- 전력 최적화 AI
- 다품종 정교한 생육모델
- 전체 Architecture 재설계
- Framework Migration
- 대규모 UI 재설계
- 새로운 대규모 비즈니스 기능
- Digital Twin

---

# 25. 최종 4일 전략

## D-4 ~ D-3: 개발

목표:

> **MiniFarm과 소프트웨어를 실제로 연결한다.**

우선순위:

1. 센서값 확보
2. Backend 전송
3. Admin Web 표시
4. Pump 제어
5. 기존 App / Web / Backend 안정화

---

## D-2: 통합 및 테스트

- 전체 서비스 Flow 테스트
- 발표용 계정 / 데이터 준비
- Hardware 장시간 테스트
- Pump 누수 확인
- 네트워크 환경 점검
- 서버 상태 확인
- API 오류 확인
- Demo 실패 시 Backup Scenario 마련

---

## D-1: 발표 준비

개발 범위를 더 늘리지 않는다.

집중 영역:

- PPT
- 발표 대본
- 시연 순서
- Demo 영상
- 전시 부스
- Banner
- 예상 질문
- 팀원 역할 분담

---

# 26. 최종 Demo Scenario

발표에서는 기능을 각각 보여주기보다 **하나의 서비스 흐름으로 연결해서 보여준다.**

## STEP 1. 문제

도심에 활용되지 않는 유휴상가가 존재한다.

---

## STEP 2. 공간 전환

해당 공간에 가변형 MiniFarm을 설치한다.

---

## STEP 3. 재배

MiniFarm에서 화훼를 재배한다.

---

## STEP 4. Monitoring

센서가 현재 MiniFarm의 환경을 측정한다.

예:

```text
온도       24.1℃
습도       62%
토양수분   28%
```

---

## STEP 5. 이상 상태 확인

관리자 웹:

```text
토양수분 28%

⚠ 수분 부족
```

---

## STEP 6. 급수

관리자 제어 또는 Rule-based 조건으로 Pump가 동작한다.

실제 MiniFarm의 급수 호스에서 물이 공급된다.

---

## STEP 7. 생산

관리되는 MiniFarm에서 화훼가 생산된다.

---

## STEP 8. 지역 꽃집 연계

생산된 화훼를 지역 꽃집과 연결한다.

---

## STEP 9. 사용자 앱

사용자가 Flower Market에 접속한다.

```text
꽃집 목록
  ↓
꽃집 선택
  ↓
꽃 상품
```

---

## STEP 10. 주문

소비자가 원하는 꽃을 선택하고 주문한다.

---

## STEP 11. 데이터 축적

전체 운영 과정에서

- 환경
- 생산
- 판매

데이터가 축적된다.

향후 이를 활용해 MiniFarm 운영을 최적화한다.

---

# 27. Demo Backup Strategy

해커톤에서는 실제 시스템이 완벽하게 구현되어 있더라도 현장 네트워크나 하드웨어 문제로 시연이 실패할 수 있다.

따라서 반드시 Backup을 준비한다.

## Level 1

실시간 실제 시연.

## Level 2

센서 일부는 실제 데이터, 나머지는 저장된 데이터 사용.

## Level 3

미리 촬영한 정상 동작 영상 사용.

다음 자료는 발표 전에 반드시 확보한다.

- 센서 값이 변하는 영상
- Admin Web 화면
- Pump 작동 영상
- App 주문 흐름
- 전체 MiniFarm 동작 영상

---

# 28. 발표에서 구현 상태 표현 원칙

과장하지 않는다.

## 실제 완료

> 구현했습니다.

## 일부 동작

> 프로토타입을 제작했습니다.

## 구현 중

> 현재 연동을 진행하고 있습니다.

## 미구현

> 향후 데이터가 축적되면 확장할 계획입니다.

특히 다음 기능은 실제 구현되지 않았다면 현재 기능처럼 표현하지 않는다.

- AI 생육 최적화
- AI 전력 절감
- 생산량 예측
- 완전 자동 생육 제어

---

# 29. 최종 발표 핵심 메시지

## Message 1

> **우리는 단순한 스마트팜을 만든 것이 아니라, 유휴상가가 실제 MiniFarm으로 운영될 수 있는 생태계를 구축했습니다.**

---

## Message 2

> **유휴공간의 전환부터 생육 관리, 생산, 유통, 소비까지 하나의 플랫폼으로 연결합니다.**

---

## Message 3

> **MiniFarm을 지역 꽃집과 연결하여 도심 생산이 실제 지역 소비로 이어지게 합니다.**

---

## Message 4

> **향후 생육·생산·판매 데이터가 축적되면 데이터 기반 MiniFarm 운영 최적화 플랫폼으로 발전할 수 있습니다.**

---

# 30. 프로젝트를 설명하는 표현

## 기본형

> **도심 유휴상가를 가변형 MiniFarm으로 전환하고, 생육 관리부터 생산물 유통·판매까지 연결하는 스마트팜 운영 플랫폼**

---

## 짧은 소개

> **비어 있는 도심 상가를 생산하고 수익을 만드는 MiniFarm으로 전환합니다.**

---

## 기업과의 연결을 강조하는 버전

> **유휴상가의 MiniFarm 전환부터 생육·운영 관리, 생산물 유통까지 연결하는 도심형 스마트팜 서비스 생태계**

---

# 31. 프로젝트 주요 의사결정

## Decision 01 — 유휴상가가 프로젝트의 출발점

**결정**

프로젝트의 핵심 문제는 단순히 스마트팜 진입장벽이 아니라 **활용되지 않는 도심 유휴상가를 어떻게 생산적인 공간으로 전환하고 지속적으로 운영할 것인가**이다.

---

## Decision 02 — 화훼 중심 적용

**결정**

현재 MiniFarm의 주요 적용 작물은 화훼로 설정한다.

**이유**

- 도심 환경
- 공간 효율
- 상품 가치
- 지역 꽃집
- 도심 유통
- 소비자 서비스

와 연결하기 적합하기 때문이다.

---

## Decision 03 — Flower Market은 꽃집 중심 UX

**결정**

사용자 앱은

```text
꽃집 → 꽃 상품 → 주문
```

구조를 사용한다.

**이유**

지역 꽃집이라는 실제 유통 주체를 서비스의 중요한 구성원으로 유지하기 위함이다.

---

## Decision 04 — Final MVP에서 AI 모델을 무리하게 개발하지 않음

**결정**

Final MVP에서는 필요하면 Rule-based 생육 로직을 사용한다.

**이유**

- 데이터 부족
- 남은 개발 시간
- 실제 Demo 안정성
- AI 모델의 신뢰성

을 고려했을 때 새로운 ML 모델보다 end-to-end 시스템을 완성하는 것이 가치가 크다.

---

## Decision 05 — MiniFarm ↔ Platform 연결 우선

**결정**

최종 개발에서 새로운 앱 기능보다

```text
Sensor
→ Backend
→ Admin Web
→ Control
→ MiniFarm
```

연결을 우선한다.

**이유**

현재 App / Web / Backend와 Hardware가 각각 존재하더라도 연결되지 않으면 서로 다른 프로젝트처럼 보일 가능성이 있기 때문이다.

---

## Decision 06 — 자원순환 기능은 보조 요소

계란껍질 수거 등 자원순환 요소는 기존 구현을 유지하되 최종 프로젝트 메시지를 복잡하게 만들 경우 핵심 발표에서는 제외한다.

---

# 32. 개발 원칙

현재는 Final MVP 단계다.

따라서 개발자는 다음 원칙을 따른다.

## 우선순위

1. 기존 기능 보존
2. End-to-end 연결
3. Demo 안정성
4. 작은 변경
5. 실제 동작
6. 그 이후 UI 개선

---

## 금지

명시적인 요청 없이 다음 작업을 진행하지 않는다.

- 전체 코드 대규모 Refactoring
- API 임의 변경
- Database 전체 재설계
- Framework 교체
- 인증 방식 변경
- 새로운 ML Model
- 필요하지 않은 Dependency 추가
- 기존 기능 삭제
- 디자인 시스템 전체 변경

---

# 33. 개발 문서 업데이트 규칙

다음 사항이 변경되면 반드시 PROJECT_MASTER.md를 업데이트한다.

- 프로젝트 문제 정의
- 핵심 서비스 Flow
- 주요 사용자
- 작물 선정
- Hardware 구성
- API
- Database Model
- 앱 핵심 UX
- Web 기능
- IoT 연결 방식
- Final MVP 범위
- 구현 완료 상태
- 주요 Business Model
- 발표 메시지

---

# 34. Open Questions

현재 추가 결정 또는 검증이 필요한 내용.

## 작물

- 최종 시연용 화훼 품종은 무엇인가?
- 선정 품종의 실내 생육조건은 무엇인가?
- Final Demo에 실제 재배 작물을 사용할 것인가?

---

## Hardware

- 최종 사용 MCU는 무엇인가?
- 센서 종류와 모델은 무엇인가?
- Pump를 실제 Backend/Web에서 제어할 것인가?
- 자동급수까지 구현할 것인가?
- 수동급수를 Final Demo 기본값으로 할 것인가?

---

## Web

- MiniFarm Dashboard를 어느 수준까지 구현할 것인가?
- 실시간 그래프가 필요한가?
- Farm 다중 관리는 Final MVP 범위인가?

---

## Backend

- Hardware 통신 endpoint 최종 구조
- SensorData 저장 방식
- Farm Domain Model
- 급수 Command 방식
- 실시간 데이터 전달 방식

---

## Business

- MiniFarm 운영 주체를 누구로 정의할 것인가?
- 화훼 생산물의 실제 소유 및 공급 구조는 어떻게 되는가?
- 지역 꽃집과의 거래 구조는 B2B 공급인가, 플랫폼 중개인가?
- 유휴상가 소유자에게 제공하는 구체적인 가치와 수익 구조는 무엇인가?

---

## 자원순환

- 계란껍질 기능을 최종 발표에서 언급할 것인가?
- 실제 MiniFarm 재배와 연결 가능한가?

---

# 35. Repository 분석 후 보완할 항목

2026-08-24 실제 Repository 분석 결과를 기록한다. 이 항목은 기획 방향이 아니라 현재 코드와 실행 환경의 사실을 설명한다.

## Backend

### 확인 결과

| 항목 | Repository 기준 내용 |
|---|---|
| Language | Python 3.10+ |
| Framework | FastAPI 0.115.6 |
| Validation / Settings | Pydantic, Pydantic Settings |
| ORM | SQLAlchemy 2 Async |
| Database | MySQL + asyncmy, Test는 SQLite + aiosqlite |
| Authentication | JWT Access / Refresh Token, User / Admin Token Type 분리, bcrypt |
| Realtime | Chat WebSocket, Sensor MQTT Listener |
| File | 꽃 이미지 Local Upload + `/uploads` Static Mount |
| Test | pytest + pytest-asyncio + httpx |

### Directory

```text
backend/app/api/routes    HTTP / WebSocket Endpoint
backend/app/core         환경설정, JWT, Password
backend/app/crud         Query / Persistence
backend/app/db           Engine / Async Session / Declarative Base
backend/app/models       SQLAlchemy Model
backend/app/schemas      Pydantic Schema
backend/app/services     Business Logic
backend/app/mqtt         MQTT Listener
backend/tests            API / Service / 동시성 Test
```

### Database 및 주요 Model

총 22개 SQLAlchemy Model Class가 확인된다.

```text
User, AdminUser, RevokedToken
Shop, Flower, FlowerStock, FlowerStockAdjustment
Order, OrderItem, BouquetOrder
WorkshopProgram, WorkshopBooking
Review, Favorite
ChatRoom, Message
EcoContributionLog, RewardRedemption
SmartFarmDevice, SensorLatest, SensorReading, SensorMessageLog
```

현재 Alembic 등 Migration 도구는 없다. App Startup의 `create_all()`에 의존하므로 운영 DB Schema 변경 전략을 추가해야 한다.

### API

`/api` 아래 84개 HTTP / WebSocket Route가 등록돼 있다. 상세 Group은 9.2의 API Group 표를 기준으로 한다. FastAPI 기본 OpenAPI가 활성화돼 있으므로 서버 실행 시 `/docs`, `/redoc`, `/openapi.json`을 사용할 수 있다.

### 인증

- 일반 사용자: `/api/auth/*`
- 관리자 전용: `/api/admin/auth/*`
- 공통 `/api/auth/login`은 관리자 Email이 존재하면 Admin Token을, 아니면 User Token을 발급한다.
- 보호 API는 `HTTPBearer`와 Token `type`을 확인한다.
- 로그아웃과 Refresh Rotation 시 Token `jti`를 `revoked_token`에 기록한다.

### 환경변수

설정은 `backend/.env`를 읽는다. 필요한 변수는 9.4의 환경변수 표를 기준으로 한다. Repository에는 실제 `.env`와 `.env.example`이 포함되지 않는다.

### 실행

```bash
cd backend
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

MQTT까지 실행하려면 Root에서 `docker compose up --build`를 사용할 수 있으나, 별도 MySQL과 `backend/.env`가 필요하다.

### Test

```bash
cd backend
pytest -q
```

2026-08-24 실행 결과는 `53 passed, 1 skipped`다. 실제 MySQL 연결 Test 1개만 Local Database 미가동으로 Skip됐고 나머지 API·Service·동시성·MQTT Test는 통과했다.

---

## Web

### 확인 결과

| 항목 | Repository 기준 내용 |
|---|---|
| Framework | React 19 + TypeScript 6 + Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| State | Zustand 5 + Component Local State |
| Chart | Recharts 3 |
| API | Browser Fetch 기반 공통 `apiRequest` |
| Token Storage | Browser Local Storage |

### Directory

```text
web/src/api          API Client / Domain API
web/src/components   공통 UI와 Chart
web/src/layouts      Public / Authenticated Layout
web/src/mock         Demo / Fallback Data
web/src/pages        Route Page
web/src/routes       Router / Auth Guard
web/src/store        Zustand Store
web/src/types        API / 화면 Type
```

### State Management

- `useAuthStore`: 관리자·꽃집 Profile, 로그인·가입·로그아웃
- `useFarmStore`: 선택 Zone과 Sidebar UI 상태
- `useNotificationStore`: 운영 알림 읽음·조치 상태
- 인증 Token, 운영자 Profile, Mock Inventory, 알림 일부는 Local Storage 사용

### API Layer

- `VITE_API_BASE_URL` + `/api/...` 경로
- JSON과 Multipart FormData 지원
- Bearer Access Token 자동 첨부
- 401 시 Admin Refresh Token으로 갱신 후 재시도
- 상대 이미지 경로를 Backend Origin과 결합

### 주요 화면

Landing, Login, Signup, Dashboard, Sensor Monitoring, Flower Inventory, Reservations, Not Found가 구현돼 있다.

Dashboard·Sensor·Inventory·Reservations·Auth에는 실제 API 실패 시 Mock/Local Data를 사용하는 경로가 남아 있다. Demo 안정성에는 도움이 되지만 실제 연결 여부를 숨길 수 있으므로 화면의 Live / Fallback 표시를 유지해야 한다.

### 실행 / Build

```bash
cd web
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

2026-08-24 `typecheck`, `lint`, `build`가 통과했다. 자동화 Test와 `.github/workflows` 기반 CI는 없다.

---

## App

### 확인 결과

| 항목 | Repository 기준 내용 |
|---|---|
| Framework | Flutter / Dart SDK `^3.12.0` |
| State | Provider + 단일 `EggBloomState(ChangeNotifier)` |
| API | `dart:io` `HttpClient` 기반 `ApiClient` + Domain Repository |
| Navigation | `go_router` 인증 Gate + 5개 Tab |
| Authentication | User JWT Access / Refresh Token |
| Token Storage | `flutter_secure_storage` Keychain / Keystore |
| Demo | `DEMO_MODE=true` + 내장 Mock Repository |
| Target | Android, iOS, Web, macOS, Linux, Windows Scaffold 포함 |

### Directory

```text
app/lib/core         ApiClient, ApiException, TokenStorage
app/lib/features     Market 목록·상세
app/lib/models       API / 화면 Model
app/lib/providers    AuthSession, EggBloomState
app/lib/repositories API / Mock Repository
app/lib/screens      Auth, Home, Collect, Experience, My
app/lib/theme        Material Theme
app/lib/widgets      공통 Widget
app/test             State / Model / Widget Test
```

### Repository Pattern

사용자, 수거, 꽃, 주문, 체험, 예약, 꽃집을 API / Mock Repository로 분리했다.

```text
Screen / Widget
→ EggBloomState
→ Domain Repository
→ ApiClient 또는 Mock Data
→ FastAPI
```

### Navigation

- `AuthGate`: 저장된 Session 여부에 따라 Auth Screen / Main Navigator 분기
- Main Navigator: 홈, 수거등록, 꽃마켓, 체험예약, 마이
- `go_router`로 로그인·회원가입·꽃마켓 상세·주문 내역 Route를 관리한다.

### Authentication / API Client

- 회원가입 후 자동 로그인
- Access / Refresh Token 발급
- Bearer Header 첨부
- 401 시 Refresh 후 1회 재시도
- 12초 Timeout 및 사용자용 Error Message
- Token을 Keychain / Keystore 기반 보안 저장소에 보관하고 앱 재실행 시 Session 복구

### 주요 Screen과 연결 기능

| Screen | 기능 |
|---|---|
| Auth | 회원가입, 로그인, 로그아웃, Session 복구 |
| Home | 기여도, 추천 꽃, 추천 체험 |
| Collect | 수거 장소·중량·메모 신청 |
| Market | 꽃집 목록·상세, 꽃집별 상품, 재고 확인, 복수 상품 주문 |
| Experience | 프로그램 목록, 예약, 예약 취소 |
| My / Orders | 기여도·CO₂·Point·수거·예약·주문 내역 |

꽃마켓은 7.2의 기획대로 `꽃집 목록 → 꽃집 상세 → 해당 꽃집의 상품 → 주문`으로 연결된다.

### Build / Run

```bash
cd app
flutter pub get
flutter analyze
flutter test -j 1
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

Android Emulator에서 Host의 `localhost:8000`은 `10.0.2.2:8000`으로 접근한다. 실기기에서는 접근 가능한 Server Origin을 `API_BASE_URL`로 지정한다. 2026-08-27에 Flutter Analyze, Test 9개, Android Debug APK Build와 외부 Server 실기기 핵심 흐름을 확인했다.

---

## Hardware

### Repository 확인 결과

| 항목 | 확인 결과 |
|---|---|
| MCU Firmware | 소스 없음 |
| Sensor Driver / Measurement Code | 소스 없음 |
| Pump Control Code | 소스 없음 |
| Relay Control Code | 소스 없음 |
| Hardware Diagram | 파일 없음 |
| Pin Assignment | 문서 없음 |
| CAD / PCB / 회로 파일 | 파일 없음 |
| Hardware Test | 없음 |

물리적 Prototype의 존재 여부는 Repository만으로 판단할 수 없다.

### Backend가 기대하는 Hardware 통신 규격

- 방식: MQTT
- Broker: Mosquitto, 기본 Port `1883`
- Topic: `dalmegg/v1/farms/{farm_uid}/devices/{device_uid}/telemetry`
- QoS: Backend Subscribe 기준 1
- Payload: JSON Sensor Telemetry
- 지원값: 온도, 습도, 토양수분, 조도, 물탱크 수위, 측정시각

Backend는 Sensor Message를 받을 수 있지만 Hardware 인증, Device Provisioning, MQTT TLS, Command Topic, Pump/Relay 제어 Payload는 정의돼 있지 않다.

### 실제 연결을 위해 추가로 필요한 산출물

- MCU와 Board 모델 확정
- Sensor 모델과 보정 방식
- Pump·Relay 전압 및 Fail-safe 정의
- Pin Assignment
- Telemetry JSON 예시와 전송 주기
- Device ID 발급·인증 방식
- MQTT TLS / 계정 설정
- 급수 Command Topic과 ACK 규격
- Firmware Source 및 Hardware 통합 Test

---

# 36. Final Success Criteria

Final MVP의 성공 기준은 기능 개수가 아니다.

다음 질문에 **YES**라고 답할 수 있으면 프로젝트가 성공적으로 연결된 것이다.

### 1.

유휴상가를 왜 MiniFarm으로 전환하는지 설명할 수 있는가?

### 2.

왜 화훼를 선택했는지 설명할 수 있는가?

### 3.

실제 MiniFarm Prototype을 보여줄 수 있는가?

### 4.

MiniFarm의 상태를 Software에서 확인할 수 있는가?

### 5.

가능하다면 실제 환경 제어를 보여줄 수 있는가?

### 6.

생산물이 어떻게 지역 꽃집으로 연결되는지 설명할 수 있는가?

### 7.

사용자가 App에서 상품을 구매하는 Flow를 보여줄 수 있는가?

### 8.

Hardware, Backend, Web, App이 왜 하나의 프로젝트인지 설명할 수 있는가?

### 9.

현재 구현과 향후 계획을 명확하게 구분할 수 있는가?

### 10.

우리 프로젝트가 단순한 스마트팜 제작 프로젝트와 무엇이 다른지 설명할 수 있는가?

---

# 37. 최종 프로젝트 구조 요약

```text
                [도심 유휴상가]
                       │
                       ▼
              [가변형 MiniFarm]
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        [화훼 재배]        [Sensor / IoT]
             │                   │
             │                   ▼
             │              [Backend]
             │                   │
             │                   ▼
             │             [Admin Web]
             │                   │
             │              환경 모니터링
             │              환경 / 급수 제어
             │
             ▼
        [화훼 생산]
             │
             ▼
        [지역 꽃집]
             │
             ▼
         [User App]
             │
             ▼
          [소비자]
             │
             ▼
       [주문 / 판매 데이터]
             │
             └─────────────┐
                           ▼
                 [운영 데이터 축적]
                           │
                           ▼
               [향후 데이터 기반 최적화]
```

---

# 38. 가장 중요한 프로젝트 원칙

> **MiniFarm Hardware, 관리자 Web, Backend, 사용자 App을 각각 별도의 기능으로 생각하지 않는다.**

이들은 모두 다음 하나의 문제를 해결하기 위해 존재한다.

> **도심의 유휴공간을 실제로 생산하고 운영되며 수익을 만들 수 있는 MiniFarm으로 전환하는 것.**

따라서 모든 새로운 기능과 의사결정은 다음 질문을 기준으로 판단한다.

> **“이 기능이 유휴상가 MiniFarm의 구축·운영·생산·유통 과정에 실제로 필요한가?”**

필요성이 명확하지 않다면 Final MVP 범위에 추가하지 않는다.

---

# 39. Documentation Rule

`PROJECT_MASTER.md`는 MiniFarm Labs 프로젝트의 **Single Source of Truth**다.

중요한 변경이 발생하면 코드만 수정하지 말고 본 문서를 함께 업데이트한다.

특히 다음 변경은 반드시 기록한다.

- 기획 변경
- 서비스 구조 변경
- API 변경
- Hardware 변경
- Database 변경
- 핵심 기능 추가·삭제
- 구현 상태 변경
- Final MVP 범위 변경
- 프로젝트의 주요 의사결정

`AGENTS.md`는 이 문서를 기반으로 AI Coding Agent의 행동 규칙을 정의한다.

`README.md`는 본 문서를 기반으로 외부 사용자가 프로젝트를 빠르게 이해할 수 있도록 요약한다.
