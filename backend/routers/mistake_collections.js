const express = require('express');
const db = require('../db');
const router = express.Router();

// 获取错题集列表
router.get('/list', async (req, res) => {
    console.log('请求参数:', req.query); // 添加请求参数日志

    try {
        const { username } = req.query;

        if (!username) {
            console.log('错误: 用户名不能为空');
            return res.status(400).json({
                code: 400,
                message: '用户名不能为空',
                path: '/api/mistake_collections/list'
            });
        }

        console.log('正在查询用户:', username);
        const [userResult] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (userResult.length === 0) {
            console.log('错误: 用户不存在');
            return res.status(404).json({
                code: 404,
                message: '用户不存在',
                path: '/api/mistake_collections/list'
            });
        }

        const userId = userResult[0].id;
        console.log('用户ID:', userId);

        const [collections] = await db.query(`
            SELECT mc.id, mc.name AS title, mc.created_at AS create_time, 
                   COUNT(ms.id) AS question_count
            FROM mistakes_collections mc
            LEFT JOIN mistakes ms ON ms.collection_id = mc.id
            WHERE mc.user_id = ?
            GROUP BY mc.id
            ORDER BY mc.created_at DESC
        `, [userId]);

        console.log('查询结果:', collections);

        res.json({
            code: 200,
            message: '获取成功',
            path: '/api/mistake_collections/list',
            list: collections
        });
    } catch (err) {
        console.error('获取错题集列表错误:', err);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: err.message,
            path: '/api/mistake_collections/list'
        });
    }
});

// 创建错题集
router.post('/create', async (req, res) => {
    try {
        const { username, title } = req.body;

        if (!username || !title ) {
            return res.status(400).json({ code: 400, message: '缺少必填字段' });
        }

        // 查询用户ID
        const [userResult] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ code: 404, message: '用户不存在' });
        }

        const userId = userResult[0].id;

        // 检查是否已有同名错题集
        const [existing] = await db.query(
            'SELECT id FROM mistakes_collections WHERE user_id = ? AND name = ?',
            [userId, title]
        );

        if (existing.length > 0) {
            return res.status(400).json({ code: 400, message: '已存在同名错题集' });
        }

        // 创建错题集
        const [result] = await db.query(
            'INSERT INTO mistakes_collections (user_id, name) VALUES (?, ?)',
            [userId, title]
        );

        res.json({
            code: 200,
            message: '创建成功',
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('创建错题集错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 获取错题集详情
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 查询错题集基本信息
        const [collectionResult] = await db.query(
            'SELECT id, name AS title, description, created_at AS create_time FROM mistakes_collections WHERE id = ?',
            [id]
        );

        if (collectionResult.length === 0) {
            return res.status(404).json({ code: 404, message: '错题集不存在' });
        }

        const collection = collectionResult[0];

        // 查询错题集中的题目数量
        const [countResult] = await db.query(
            'SELECT COUNT(*) AS question_count FROM mistakes WHERE collection_id = ?',
            [id]
        );

        collection.question_count = countResult[0].question_count;

        res.json({
            code: 200,
            message: '获取成功',
            data: collection
        });
    } catch (err) {
        console.error('获取错题集详情错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 更新错题集信息
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subject, description } = req.body;

        if (!title || !subject) {
            return res.status(400).json({ code: 400, message: '标题和科目不能为空' });
        }

        const updateData = {
            name: title,
            subject,
            description: description || null
        };

        const [result] = await db.query(
            'UPDATE mistakes_collections SET ? WHERE id = ?',
            [updateData, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, message: '错题集不存在' });
        }

        res.json({
            code: 200,
            message: '更新成功'
        });
    } catch (err) {
        console.error('更新错题集错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 删除错题集
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 先检查错题集是否存在
        const [checkResult] = await db.query(
            'SELECT id FROM mistakes_collections WHERE id = ?',
            [id]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({ code: 404, message: '错题集不存在' });
        }

        // 使用事务确保数据一致性
        await db.beginTransaction();

        try {
            // 删除错题集中的所有题目
            await db.query(
                'DELETE FROM mistakes WHERE collection_id = ?',
                [id]
            );

            // 删除错题集
            await db.query(
                'DELETE FROM mistakes_collections WHERE id = ?',
                [id]
            );

            await db.commit();

            res.json({
                code: 200,
                message: '删除成功'
            });
        } catch (err) {
            await db.rollback();
            throw err;
        }
    } catch (err) {
        console.error('删除错题集错误:', err);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 错题集中的题目管理
router.get('/questions/:collectionId', async (req, res) => {
    try {
        const { collectionId } = req.params;
        const { keyword, page = 1, pageSize = 10 } = req.query;

        // 基础校验
        if (!collectionId) {
            return res.status(400).json({
                code: 400,
                message: 'collectionId不能为空'
            });
        }

        // 分页查询
        const offset = (page - 1) * pageSize;
        let sql = `
            SELECT * FROM mistakes 
            WHERE collection_id = ? 
            ${keyword ? 'AND question_description LIKE ?' : ''}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        const params = [collectionId];
        if (keyword) params.push(`%${keyword}%`);
        params.push(Number(pageSize), offset);

        const [questions] = await db.query(sql, params);
        const [total] = await db.query(
            'SELECT COUNT(*) as count FROM mistakes WHERE collection_id = ?',
            [collectionId]
        );

        res.json({
            code: 200,
            message: '获取成功',
            list: questions,
            total: total[0].count
        });
    } catch (err) {
        console.error('获取错题列表错误:', err);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
});

module.exports = router;