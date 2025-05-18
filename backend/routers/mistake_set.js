const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// 获取错题列表
router.get('/questions', async (req, res) => {
    try {
        const { username, subject, chapter } = req.query;

        if (!username) {
            return res.status(400).json({ code: 400, message: '用户名不能为空' });
        }

        let sql = 'SELECT id, subject, chapter, question_description, question_type, create_time FROM mistake_set WHERE username = ?';
        const params = [username];

        if (subject) {
            sql += ' AND subject = ?';
            params.push(subject);
        }

        if (chapter && chapter !== '选择章节') {
            sql += ' AND chapter = ?';
            params.push(chapter);
        }

        sql += ' ORDER BY create_time DESC';

        const [results] = await db.query(sql, params);

        res.json({
            code: 200,
            message: '获取成功',
            list: results
        });
    } catch (err) {
        console.error('获取错题列表错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 获取单个错题详情
router.get('/question/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [results] = await db.query(
            'SELECT * FROM mistake_set WHERE id = ?',
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ code: 404, message: '题目不存在' });
        }

        const question = results[0];
        // 解析JSON格式的选项
        if (question.options) {
            question.options = JSON.parse(question.options);
        }

        res.json({
            code: 200,
            message: '获取成功',
            data: question
        });
    } catch (err) {
        console.error('获取错题详情错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 添加错题
router.post('/question', async (req, res) => {
    try {
        const {
            username,
            subject,
            chapter,
            question_description,
            question_answer,
            question_type,
            options
        } = req.body;

        // 验证必填字段
        if (!username || !subject || !chapter || !question_description || !question_answer || !question_type) {
            return res.status(400).json({ code: 400, message: '缺少必填字段' });
        }

        // 如果是选择题，验证选项
        if (question_type === '选择题' && (!options || Object.keys(options).length < 2)) {
            return res.status(400).json({ code: 400, message: '选择题必须提供至少两个选项' });
        }

        const insertData = {
            username,
            subject,
            chapter,
            question_description,
            question_answer,
            question_type,
            options: question_type === '选择题' ? JSON.stringify(options) : null
        };

        const [result] = await db.query('INSERT INTO mistake_set SET ?', insertData);

        res.json({
            code: 200,
            message: '添加成功',
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('添加错题错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 更新错题
router.put('/question/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            subject,
            chapter,
            question_description,
            question_answer,
            question_type,
            options
        } = req.body;

        // 验证必填字段
        if (!subject || !chapter || !question_description || !question_answer || !question_type) {
            return res.status(400).json({ code: 400, message: '缺少必填字段' });
        }

        // 如果是选择题，验证选项
        if (question_type === '选择题' && (!options || Object.keys(options).length < 2)) {
            return res.status(400).json({ code: 400, message: '选择题必须提供至少两个选项' });
        }

        const updateData = {
            subject,
            chapter,
            question_description,
            question_answer,
            question_type,
            options: question_type === '选择题' ? JSON.stringify(options) : null
        };

        const [result] = await db.query('UPDATE mistake_set SET ? WHERE id = ?', [updateData, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, message: '题目不存在' });
        }

        res.json({
            code: 200,
            message: '更新成功'
        });
    } catch (err) {
        console.error('更新错题错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 删除错题
router.delete('/question/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM mistake_set WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, message: '题目不存在' });
        }

        res.json({
            code: 200,
            message: '删除成功'
        });
    } catch (err) {
        console.error('删除错题错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 搜索错题
router.get('/search', async (req, res) => {
    try {
        const { username, keyword } = req.query;

        if (!username || !keyword) {
            return res.status(400).json({ code: 400, message: '用户名和关键词不能为空' });
        }

        const [results] = await db.query(
            'SELECT id, subject, chapter, question_description, question_type, create_time FROM mistake_set WHERE username = ? AND question_description LIKE ?',
            [username, `%${keyword}%`]
        );

        res.json({
            code: 200,
            message: '搜索成功',
            list: results
        });
    } catch (err) {
        console.error('搜索错题错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

module.exports = router;