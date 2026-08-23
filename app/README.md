# Egg Bloom 소비자 앱

Flutter 기반 소비자 앱입니다. 회원가입·로그인 후 꽃 조회와 주문, 계란껍질 수거 신청, 꽃꾸 체험 조회·예약, 마이페이지 조회 기능을 FastAPI 백엔드와 연동합니다.

서버에 연결할 수 없을 때는 화면 확인용 데모 데이터를 표시합니다. 데모 상품의 주문·수거 신청·체험 예약은 서버에 전송되지 않습니다.

## 실행

Android 에뮬레이터에서 로컬 백엔드(`localhost:8000`)를 사용할 때 기본 API 주소는 `http://10.0.2.2:8000/api`입니다.

```bash
flutter pub get
flutter run
```

다른 서버는 빌드 시 지정합니다.

```bash
flutter run --dart-define=API_BASE_URL=https://example.com/api
```

iOS 시뮬레이터 또는 실기기에서는 해당 기기에서 접근 가능한 HTTPS 주소를 지정해야 합니다.

## 검증

```bash
flutter analyze
flutter test
```

현재 인증 토큰은 앱 실행 중에만 유지됩니다. 운영 배포 전에는 Keychain/Keystore 기반 보안 저장소를 연결해야 합니다.
