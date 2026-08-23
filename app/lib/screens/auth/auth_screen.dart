import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/egg_bloom_state.dart';
import '../../theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  bool _isSignup = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final name = _nameController.text.trim();
    if (email.isEmpty || password.isEmpty || (_isSignup && name.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('필수 정보를 모두 입력해주세요.')),
      );
      return;
    }
    if (_isSignup && password.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('비밀번호는 8자 이상이어야 합니다.')),
      );
      return;
    }
    final state = context.read<EggBloomState>();
    if (_isSignup) {
      await state.register(email: email, password: password, fullName: name);
    } else {
      await state.login(email: email, password: password);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<EggBloomState>();
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('🌱', textAlign: TextAlign.center, style: TextStyle(fontSize: 54)),
                  const SizedBox(height: 10),
                  const Text(
                    'Egg Bloom',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _isSignup ? '순환형 플라워팜에 참여하세요' : '나의 자원순환 기록을 이어가세요',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppTheme.mutedText),
                  ),
                  const SizedBox(height: 28),
                  if (_isSignup) ...[
                    TextField(
                      controller: _nameController,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(labelText: '이름'),
                    ),
                    const SizedBox(height: 12),
                  ],
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(labelText: '이메일'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    onSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      labelText: '비밀번호',
                      suffixIcon: IconButton(
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                      ),
                    ),
                  ),
                  if (state.lastError != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      state.lastError!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                    ),
                  ],
                  const SizedBox(height: 18),
                  ElevatedButton(
                    onPressed: state.isBusy ? null : _submit,
                    child: state.isBusy
                        ? const SizedBox.square(
                            dimension: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(_isSignup ? '회원가입하고 시작하기' : '로그인'),
                  ),
                  TextButton(
                    onPressed: state.isBusy
                        ? null
                        : () => setState(() => _isSignup = !_isSignup),
                    child: Text(_isSignup ? '이미 계정이 있어요' : '처음이신가요? 회원가입'),
                  ),
                  const Divider(height: 28),
                  OutlinedButton(
                    onPressed: state.isBusy ? null : state.continueAsGuest,
                    child: const Text('데모 데이터로 둘러보기'),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '실서버 주소는 --dart-define=API_BASE_URL=... 로 설정할 수 있습니다.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10, color: AppTheme.mutedText),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
