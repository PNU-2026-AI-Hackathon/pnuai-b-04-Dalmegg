# BLOOM:IN 관리자 웹

MiniFarm 운영자가 센서 상태, 꽃 상품과 재고, 체험 예약을 관리하는 React 기반 웹 애플리케이션입니다. 실제 FastAPI를 우선 사용하며 일부 화면은 서버 연결 실패 또는 데모 모드에서 Mock Data를 표시합니다.

## 주요 기능

- 관리자 회원가입·로그인과 꽃집 생성·수정
- 운영 Dashboard와 센서 최신값·이력 Chart, 15초 주기 자동 갱신
- Dashboard의 펌프·조명 수동 ON/OFF 및 AI 기준 관리 자동화 ON/OFF
- 꽃 상품 CRUD, 이미지 Upload, 재고 조정
- 체험 예약 검색·조회·상태 변경
- Access Token 자동 첨부와 401 응답 시 Refresh Token 갱신
- 반응형 Layout과 운영 알림 상태 저장

## 기술 구성

- React 19, TypeScript 6, Vite 8
- Tailwind CSS 4
- React Router 7
- Zustand 5
- Recharts 3

## 실행

Node.js와 npm이 설치된 환경에서 다음 명령을 실행합니다.

```bash
cd web
npm install
npm run dev
```

Local Backend를 사용할 때 `web/.env.local`을 생성합니다.

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCKS=false
```

`VITE_API_BASE_URL`을 비워 두면 현재 Web Origin을 사용합니다. `VITE_USE_MOCKS=true`로 설정하면 관리자 인증과 일부 운영 데이터를 서버 없이 확인할 수 있습니다.

## 주요 경로

| 경로 | 기능 |
|---|---|
| `/` | 서비스 소개 |
| `/login`, `/signup` | 관리자 인증 |
| `/dashboard` | 운영 현황 |
| `/sensors` | 센서 Monitoring |
| `/flowers` | 꽃 상품·재고 관리 |
| `/reservations` | 체험 예약 관리 |

## 농장 장치 제어

Dashboard는 가장 최근에 수신된 센서 장치를 제어 대상으로 선택합니다. 원격 Backend의 아래 API를 사용하며, 자동화 ON 시 현재 센서값에 대한 자동화 판단을 즉시 실행하고 이후 새 센서 측정값마다 다시 실행합니다.

| 기능 | API |
| --- | --- |
| 자동화 상태 조회·설정 | `GET` / `PATCH /api/admin/farms/{farm_uid}/devices/{device_uid}/automation` |
| 자동화 판단 실행 | `POST /api/admin/farms/{farm_uid}/devices/{device_uid}/automation/run` |
| 펌프 명령 | `POST /api/v1/farms/{farm_uid}/devices/{device_uid}/pump` |
| 조명 명령 | `POST /api/v1/farms/{farm_uid}/devices/{device_uid}/led` |

수동 명령이 성공하면 Dashboard에는 마지막 성공 명령 상태를 표시하고 브라우저에 보관합니다. 이 표시는 장치가 telemetry로 별도 실행 결과를 보내기 전까지 **마지막 명령 상태**이며, 실제 물리 상태 확인은 장치의 상태 telemetry 또는 ACK가 필요합니다.

## 검증

```bash
npm run typecheck
npm run lint
npm run build
```

Backend 실행 방법과 전체 구현 범위는 [프로젝트 통합 기준 문서](../docs/PROJECT_MASTER.md)를 참고합니다.
