import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_session.dart';
import '../../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, this.showBackButton = true});

  final bool showBackButton;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('이메일과 비밀번호를 입력해주세요')));
      return;
    }

    final loggedIn = await context.read<AuthSession>().login(
      email: email,
      password: password,
    );
    if (!mounted || !loggedIn) return;

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('로그인되었습니다')));

    if (context.canPop()) {
      context.pop(true);
    } else {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthSession>();
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('로그인'),
        automaticallyImplyLeading: widget.showBackButton,
        backgroundColor: Colors.transparent,
        scrolledUnderElevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 20, 18, 32),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.greenBg,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '로그인',
                  style: textTheme.titleMedium?.copyWith(
                    color: AppColors.foreground,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '수거 등록, 꽃 주문, 체험 예약을 한 번에 이용할 수 있습니다.',
                  style: textTheme.bodySmall?.copyWith(
                    color: AppColors.muted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: '이메일',
              hintText: 'user@test.com',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _passwordController,
            obscureText: true,
            onSubmitted: (_) => _submit(),
            decoration: const InputDecoration(labelText: '비밀번호'),
          ),
          if (auth.errorMessage != null) ...[
            const SizedBox(height: 12),
            Text(
              auth.errorMessage!,
              style: textTheme.bodySmall?.copyWith(
                color: const Color(0xFFD32F2F),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          const SizedBox(height: 18),
          ElevatedButton(
            onPressed: auth.isLoading ? null : _submit,
            child: Text(auth.isLoading ? '로그인 중' : '로그인'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: auth.isLoading ? null : () => context.go('/register'),
            child: const Text('계정이 없나요? 회원가입'),
          ),
        ],
      ),
    );
  }
}
