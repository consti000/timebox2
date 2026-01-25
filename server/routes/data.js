// ============================================
// 데이터 관련 라우트
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 데이터 저장
router.post('/save', async (req, res) => {
    try {
        const { userId, date, data } = req.body;

        if (!userId || !date) {
            return res.status(400).json({
                success: false,
                message: '사용자 ID와 날짜가 필요합니다.'
            });
        }

        // 데이터 저장 또는 업데이트
        const result = await query(
            `INSERT INTO user_data (user_id, date, data) 
             VALUES ($1, $2, $3::jsonb)
             ON CONFLICT (user_id, date) 
             DO UPDATE SET data = $3::jsonb, updated_at = CURRENT_TIMESTAMP
             RETURNING id, date, updated_at`,
            [userId, date, JSON.stringify(data)]
        );

        res.json({
            success: true,
            message: '데이터가 저장되었습니다.',
            date: date,
            updated_at: result.rows[0].updated_at
        });

    } catch (error) {
        console.error('Save data error:', error);
        res.status(500).json({
            success: false,
            message: '데이터 저장 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 데이터 조회
router.get('/load/:userId/:date?', async (req, res) => {
    try {
        const userId = req.params.userId;
        const date = req.params.date;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: '사용자 ID가 필요합니다.'
            });
        }

        if (date) {
            // 특정 날짜 데이터 조회
            const result = await query(
                'SELECT date, data, created_at, updated_at FROM user_data WHERE user_id = $1 AND date = $2',
                [userId, date]
            );

            if (result.rows.length === 0) {
                return res.json({
                    success: true,
                    date: date,
                    data: null,
                    message: '해당 날짜의 데이터가 없습니다.'
                });
            }

            res.json({
                success: true,
                date: date,
                data: result.rows[0].data,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at
            });
        } else {
            // 모든 데이터 조회
            const result = await query(
                'SELECT date, data, created_at, updated_at FROM user_data WHERE user_id = $1 ORDER BY date DESC',
                [userId]
            );

            const dataMap = {};
            result.rows.forEach(row => {
                dataMap[row.date] = {
                    data: row.data,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                };
            });

            res.json({
                success: true,
                data: dataMap
            });
        }

    } catch (error) {
        console.error('Load data error:', error);
        res.status(500).json({
            success: false,
            message: '데이터 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 데이터 삭제
router.delete('/delete/:userId/:date', async (req, res) => {
    try {
        const userId = req.params.userId;
        const date = req.params.date;

        if (!userId || !date) {
            return res.status(400).json({
                success: false,
                message: '사용자 ID와 날짜가 필요합니다.'
            });
        }

        const result = await query(
            'DELETE FROM user_data WHERE user_id = $1 AND date = $2 RETURNING date',
            [userId, date]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '해당 날짜의 데이터를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '데이터가 삭제되었습니다.',
            date: date
        });

    } catch (error) {
        console.error('Delete data error:', error);
        res.status(500).json({
            success: false,
            message: '데이터 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

module.exports = router;
