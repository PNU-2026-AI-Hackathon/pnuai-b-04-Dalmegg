# AI 활용 및 고도화

## 1. 활용한 AI 도구

| 도구 | 활용 목적 |
|---|---|
| Claude Design | 서비스 아이디어와 사용자 흐름을 UI로 시각화하고 React·Tailwind 기반 화면 초안을 설계하는 데 활용 |
| Claude Code | 전체 코드 분석, 오류 원인 탐색, API·DB 로직 구현 보조, 리팩터링 및 테스트 코드 작성에 활용 |
| OpenAI Codex | Flutter 앱의 Backend API 연동, 코드 리뷰, 테스트·빌드 검증, 구현 현황과 기술 문서 정리에 활용 |

AI는 개발자의 의사결정을 대체하는 용도가 아니라 반복 작업을 줄이고 구현·검증 속도를 높이는 보조 도구로 사용했다. 서비스 기획, 기능 우선순위, 데이터 구조와 최종 반영 여부는 팀원이 결정했다.

## 2. 활용 범위

- **UI/UX:** 운영자 Web과 소비자 App의 화면 구조, 상태별 안내 문구, 반응형 UI 초안 작성
- **Backend:** FastAPI Route, Pydantic Schema, SQLAlchemy Model·Service 검토 및 인증·재고·예약·MQTT 처리 보조
- **Frontend 연동:** React Web과 Flutter App의 REST API 연결, JWT 갱신, 오류·Loading·Mock/Fallback 상태 처리
- **테스트·디버깅:** API와 동시성 Test Case 작성, Type Error·Lint·Build Error 분석, 변경 영향 범위 점검
- **문서화:** 실행 방법, API 흐름, 실제 구현 상태와 미구현 범위를 Repository 코드 기준으로 정리

개인정보, 인증 비밀값, 운영 Database 정보는 Prompt에 입력하지 않았으며, AI가 제안한 코드를 검토 없이 배포하지 않았다.

## 3. AI 생성 코드 검증·수정 방식

1. AI 제안 내용을 기존 요구사항, API Contract, Model 및 프로젝트 Convention과 대조했다.
2. 생성 코드를 작은 단위로 반영한 뒤 변경 파일과 `git diff`를 직접 검토했다.
3. Backend는 `pytest`로 인증·주문·재고·예약·채팅·수거·MQTT 기능과 동시성 처리를 검증했다. 최종 확인 결과는 **53 passed, 1 skipped**이며, Skip 1건은 Local MySQL 미가동에 따른 연결 Test다.
4. Web은 `npm run typecheck`, `npm run lint`, `npm run build`를 모두 통과시켜 Type·정적 분석·Production Build를 확인했다.
5. Flutter App은 API Endpoint, JSON Mapping, Token 갱신, Timeout과 사용자 오류 처리를 코드 및 Test Case로 점검했다. 조사 환경에 Flutter SDK·Emulator가 없어 실제 기기 실행은 미검증 항목으로 남겼다.
6. 오류가 확인되면 AI 출력 전체를 그대로 재생성하지 않고 원인을 좁혀 사람이 Route, 상태 관리, 예외 처리와 문구를 수정한 뒤 다시 검증했다.

## 4. 고도화 방향

향후에는 CI에서 Backend·Web·App Test를 자동 실행하고, Test Coverage와 정적 분석 결과를 AI 리뷰의 근거로 활용한다. 또한 AI가 생성한 변경은 Pull Request 단위로 요구사항 추적, 보안 검토, 팀원 승인 절차를 거친 뒤 병합하여 재현성과 신뢰성을 높일 계획이다.
