// ============================================
// TimeBox Planner - Express 서버
// ============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// 데이터베이스 연결
const { query } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 미들웨어 설정
// ============================================

// CORS 설정 (프론트엔드와 통신을 위해)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));

// Body Parser 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 제공 (프론트엔드 파일)
app.use(express.static('../'));

// ============================================
// 라우트 설정
// ============================================

// 기본 라우트
app.get('/', (req, res) => {
    res.json({
        message: 'TimeBox Planner API Server',
        version: '1.0.0',
        status: 'running'
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        // 데이터베이스 연결 확인
        await query('SELECT NOW()');
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================
// API 라우트 (추후 확장)
// ============================================

// 인증 관련 라우트
app.use('/api/auth', require('./routes/auth'));

// 데이터 관련 라우트
app.use('/api/data', require('./routes/data'));

// ============================================
// 에러 핸들링
// ============================================

// 404 에러 처리
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// 서버 시작
// ============================================

// 데이터베이스 연결 테스트
async function startServer() {
    try {
        // 데이터베이스 연결 테스트
        await query('SELECT NOW()');
        console.log('✅ 데이터베이스 연결 확인 완료');
    } catch (error) {
        console.error('⚠️  데이터베이스 연결 실패:', error.message);
        console.error('⚠️  서버는 시작되지만 데이터베이스 기능이 작동하지 않을 수 있습니다.');
        console.error('⚠️  .env 파일의 데이터베이스 설정을 확인하세요.');
    }

    app.listen(PORT, () => {
        console.log(`========================================`);
        console.log(`🚀 TimeBox Planner Server`);
        console.log(`========================================`);
        console.log(`📍 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
        console.log(`========================================`);
    });
}

startServer();

module.exports = app;
