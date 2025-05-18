const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, account } = req.body;

    if (!username || !password || !account) {
      return res.status(400).json({ error: '缺少必要字段' });
    }

    // 检查用户名和账号是否已存在
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? OR account = ?',
      [username, account]
    );

    if (rows.length > 0) {
      return res.status(400).json({ error: '用户名或账号已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 使用正确的字段名（create_time → create_time）
    await db.query(
      'INSERT INTO users (username, password, account, created_time) VALUES (?, ?, ?, NOW())',
      [username, hashedPassword, account]
    );

    res.json({ message: '注册成功' });
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});
// 修改密码接口
router.post('/change-password', async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: '参数不完整' });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);
  res.json({ message: '密码修改成功' });
});
// 登录接口
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = rows[0];

  let isPasswordValid = false;
  // 判断数据库中的密码是否为加密格式（bcrypt 密文一般以 $2 开头，长度大于30）
  if (user.password && user.password.startsWith('$2') && user.password.length > 30) {
    isPasswordValid = await bcrypt.compare(password, user.password);
  } else {
    // 数据库的密码出错
    console.error('Invalid password format for user', user.username);
    isPasswordValid = false;
  }

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    message: 'Login success',
    user: {
      id: user.id,
      username: user.username,
      // 可以加其他需要的字段
    }
  });
});
// 获取用户信息接口
router.get('/info', async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: '缺少用户名' });
  }
  const [rows] = await db.query('SELECT username, created_at FROM users WHERE username = ?', [username]);
  if (rows.length === 0) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json({ user: rows[0] });
});
module.exports = router; 