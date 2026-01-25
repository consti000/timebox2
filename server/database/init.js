// ============================================
// 데이터베이스 초기화 스크립트
// ============================================

const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function initDatabase() {
    try {
        console.log('📦 데이터베이스 초기화를 시작합니다...');

        // SQL 파일 읽기
        const sqlPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // SQL 실행
        await query(sql);

        console.log('✅ 데이터베이스 초기화가 완료되었습니다.');

        // 기본 사용자 생성 (선택사항)
        const defaultUsername = process.env.DEFAULT_USERNAME || 'admin';
        const defaultPassword = process.env.DEFAULT_PASSWORD || 'password123';

        try {
            await query(
                'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
                [defaultUsername, defaultPassword]
            );
            console.log(`✅ 기본 사용자 생성 완료: ${defaultUsername}`);
        } catch (error) {
            if (error.code !== '23505') { // UNIQUE violation은 무시
                throw error;
            }
            console.log(`ℹ️  사용자 ${defaultUsername}가 이미 존재합니다.`);
        }

    } catch (error) {
        console.error('❌ 데이터베이스 초기화 오류:', error);
        throw error;
    }
}

// 직접 실행 시
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('🎉 초기화 완료!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 초기화 실패:', error);
            process.exit(1);
        });
}

module.exports = initDatabase;
