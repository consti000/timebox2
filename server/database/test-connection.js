// ============================================
// 데이터베이스 연결 테스트 스크립트
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'timebox',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
    });

    try {
        console.log('🔌 데이터베이스 연결 테스트 중...');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Port: ${process.env.DB_PORT || 5432}`);
        console.log(`   Database: ${process.env.DB_NAME || 'timebox'}`);
        console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
        
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ 데이터베이스 연결 성공!');
        console.log(`   현재 시간: ${result.rows[0].current_time}`);
        console.log(`   PostgreSQL 버전: ${result.rows[0].pg_version.split(',')[0]}`);
        
        await pool.end();
        return true;
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error.message);
        
        if (error.message.includes('password') || error.message.includes('authentication')) {
            console.error('\n💡 해결 방법:');
            console.error('   .env 파일의 DB_PASSWORD를 설정하세요.');
            console.error('   PostgreSQL 설치 시 설정한 postgres 사용자의 비밀번호를 입력하세요.');
        } else if (error.message.includes('does not exist')) {
            console.error('\n💡 해결 방법:');
            console.error('   데이터베이스가 존재하지 않습니다.');
            console.error('   다음 명령을 실행하여 데이터베이스를 생성하세요:');
            console.error('   npm run create-db');
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
            console.error('\n💡 해결 방법:');
            console.error('   PostgreSQL 서비스가 실행 중인지 확인하세요.');
            console.error('   PowerShell에서 다음 명령을 실행하세요:');
            console.error('   Get-Service postgresql*');
        }
        
        await pool.end();
        return false;
    }
}

// 직접 실행 시
if (require.main === module) {
    testConnection()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('💥 예상치 못한 오류:', error);
            process.exit(1);
        });
}

module.exports = testConnection;
