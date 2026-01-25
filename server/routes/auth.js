// ============================================
// 인증 관련 라우트
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '아이디와 비밀번호를 입력해주세요.'
            });
        }

        // 데이터베이스에서 사용자 조회
        const result = await query(
            'SELECT id, username, password FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        const user = result.rows[0];

        // 비밀번호 확인 (실제로는 해시화된 비밀번호 비교)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 로그인 성공
        res.json({
            success: true,
            message: '로그인 성공',
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 로그아웃
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: '로그아웃 성공'
    });
});

// 로그인 상태 확인
router.get('/check', (req, res) => {
    // 실제로는 세션 또는 JWT 토큰으로 확인
    res.json({
        authenticated: false,
        message: '인증 상태 확인'
    });
});

module.exports = router;
