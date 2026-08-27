# 닮은살걀 소비자 앱

Flutter 기반 소비자 앱입니다. 회원가입·로그인, 꽃집 목록·상세와 재고 기반 꽃 주문·주문 내역, 계란껍질 수거 신청, 꽃꾸 체험 조회·예약·취소, 마이페이지를 FastAPI Backend와 연동합니다.

발표용 Demo Mode는 Mock Repository를 사용하므로 서버 없이 전체 화면과 주문·수거·예약 흐름을 확인할 수 있습니다. 화면 상단에 시연용 데이터임을 표시합니다.

## 발표용 Demo 실행

```bash
flutter pub get
flutter run --dart-define=DEMO_MODE=true
```

Android Studio에서는 Flutter Run Configuration의 `Additional run args`에 다음 값을 입력합니다.

```text
--dart-define=DEMO_MODE=true
```

## 실제 Backend 연결

API 주소는 `/api`를 제외한 Backend Origin을 지정합니다. Android Emulator에서는 다음과 같이 실행합니다.

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

노트북에서 Backend를 실행하고 USB로 연결한 Android 실기기에서 접근할 때는 먼저 Port Reverse를 설정합니다.

```bash
adb reverse tcp:8000 tcp:8000
flutter run --dart-define=API_BASE_URL=http://127.0.0.1:8000
```

이미 외부 서버가 실행 중이면 노트북에 Backend를 다시 띄우거나 Port Reverse를 설정할 필요가 없습니다.

```bash
flutter run --dart-define=API_BASE_URL=http://144.24.71.117:8000
```

배포 서버는 해당 HTTPS Origin을 지정합니다.

```bash
flutter run --dart-define=API_BASE_URL=https://example.com
```

## 검증

```bash
flutter analyze
flutter test -j 1
```

로그인 토큰은 Keychain/Keystore 기반 보안 저장소에 보관되며, 액세스 토큰이 만료되면 리프레시 토큰으로 한 번 갱신합니다.

현재 개발 서버가 HTTP이므로 Android 앱에 평문 통신을 임시 허용했습니다. 운영 배포 전에는 서버를 HTTPS로 전환하고 `android:usesCleartextTraffic="true"`를 제거해야 합니다.
