const express = require('express');
const db = require('../db');
const router = express.Router();

// 获取错题详情（匹配前端apimistakes.detail）
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [question] = await db.query(`
            SELECT 
                id, collection_id, subject, 
                question_description, question_answer, 
                question_type, options, analysis, 
                tags, difficulty, wrong_times,
                created_at
            FROM mistakes 
            WHERE id = ?
        `, [id]);

        if (!question[0]) {
            return res.status(404).json({
                code: 404,
                message: '题目不存在'
            });
        }

        // 转换options JSON字段
        const result = {
            ...question[0],
            options: question[0].options ? JSON.parse(question[0].options) : null
        };

        res.json({
            code: 200,
            message: '获取成功',
            data: result
        });
    } catch (err) {
        console.error('获取题目详情错误:', err);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

// 创建错题（匹配前端apimistakes.create）
router.post('/create', async (req, res) => {
    try {
        const {
            collection_id, subject, question_description,
            question_answer, question_type, options,
            analysis, tags, difficulty
        } = req.body;

        // 基础校验
        if (!collection_id || !subject || !question_description || !question_answer) {
            return res.status(400).json({
                code: 400,
                message: '缺少必填字段'
            });
        }

        // 处理options字段
        const optionsJson = options ? JSON.stringify(options) : null;

        const [result] = await db.query(
            `INSERT INTO mistakes (
                collection_id, subject, question_description,
                question_answer, question_type, options,
                analysis, tags, difficulty
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                collection_id, subject, question_description,
                question_answer, question_type, optionsJson,
                analysis, tags, difficulty
            ]
        );

        res.json({
            code: 200,
            message: '创建成功',
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('创建题目错误:', err);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

// 更新错题（匹配前端apimistakes.update）
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            subject, question_description, question_answer,
            question_type, options, analysis, tags, difficulty
        } = req.body;

        // 检查题目是否存在
        const [existing] = await db.query(
            'SELECT id FROM mistakes WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '题目不存在'
            });
        }

        // 构建更新数据
        const updateData = {
            subject,
            question_description,
            question_answer,
            question_type,
            options: options ? JSON.stringify(options) : null,
            analysis,
            tags,
            difficulty
        };

        // 过滤掉undefined的字段
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        await db.query(
            'UPDATE mistakes SET ? WHERE id = ?',
            [updateData, id]
        );

        res.json({
            code: 200,
            message: '更新成功'
        });
    } catch (err) {
        console.error('更新题目错误:', err);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

// 删除错题（匹配前端apimistakes.delete）
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM mistakes WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: '题目不存在'
            });
        }

        res.json({
            code: 200,
            message: '删除成功'
        });
    } catch (err) {
        console.error('删除题目错误:', err);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

// 增加错题错误次数（匹配前端apimistakes.incrementWrong）
router.post('/increment-wrong/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'UPDATE mistakes SET wrong_times = wrong_times + 1 WHERE id = ?',
            [id]
        );

        res.json({
            code: 200,
            message: '操作成功'
        });
    } catch (err) {
        console.error('增加错误次数错误:', err);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

// 按学科分类查询（匹配前端apimistakes.listBySubject）
router.get('/list-by-subject', async (req, res) => {
    try {
        const { subject } = req.query;

        if (!subject) {
            return res.status(400).json({
                code: 400,
                message: '学科参数不能为空'
            });
        }

        const [questions] = await db.query(
            'SELECT * FROM mistakes WHERE subject = ? ORDER BY created_at DESC',
            [subject]
        );

        res.json({
            code: 200,
            message: '获取成功',
            list: questions
        });
    } catch (err) {
        console.error('按学科查询错误:', err);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

module.exports = router;