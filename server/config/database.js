// ============================================
// PostgreSQL 데이터베이스 연결 설정
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

// 데이터베이스 연결 풀 생성
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'timebox',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // 최대 연결 수
    idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
    connectionTimeoutMillis: 2000, // 연결 타임아웃
});

// 연결 테스트
pool.on('connect', () => {
    console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL 연결 오류:', err);
    // 프로세스를 종료하지 않고 에러만 로깅 (재연결 시도 가능)
    console.error('⚠️  데이터베이스 연결 오류가 발생했습니다. 서버는 계속 실행되지만 데이터베이스 기능이 작동하지 않을 수 있습니다.');
});

// 데이터베이스 쿼리 실행 헬퍼 함수
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📊 쿼리 실행:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ 쿼리 오류:', error);
        throw error;
    }
};

// 트랜잭션 헬퍼 함수
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// 연결 종료
const close = async () => {
    await pool.end();
    console.log('🔌 데이터베이스 연결이 종료되었습니다.');
};

module.exports = {
    pool,
    query,
    transaction,
    close
};
