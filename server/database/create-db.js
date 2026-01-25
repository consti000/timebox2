// ============================================
// 데이터베이스 생성 스크립트
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

async function createDatabase() {
    // postgres 데이터베이스에 연결 (기본 데이터베이스)
    const adminPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres', // 기본 데이터베이스
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'timebox';

    try {
        console.log(`📦 데이터베이스 '${dbName}' 생성 중...`);

        // 데이터베이스 존재 여부 확인
        const checkResult = await adminPool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (checkResult.rows.length > 0) {
            console.log(`ℹ️  데이터베이스 '${dbName}'가 이미 존재합니다.`);
            await adminPool.end();
            return;
        }

        // 데이터베이스 생성
        await adminPool.query(`CREATE DATABASE ${dbName}`);
        console.log(`✅ 데이터베이스 '${dbName}' 생성 완료!`);

        await adminPool.end();
    } catch (error) {
        console.error('❌ 데이터베이스 생성 오류:', error.message);
        await adminPool.end();
        throw error;
    }
}

// 직접 실행 시
if (require.main === module) {
    createDatabase()
        .then(() => {
            console.log('🎉 완료!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 실패:', error.message);
            console.error('\n💡 다음을 확인하세요:');
            console.error('   1. PostgreSQL 서비스가 실행 중인지 확인');
            console.error('   2. .env 파일의 DB_PASSWORD가 올바른지 확인');
            console.error('   3. DB_USER가 데이터베이스 생성 권한이 있는지 확인');
            process.exit(1);
        });
}

module.exports = createDatabase;
