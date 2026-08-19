const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const multer = require('multer');
const { db, isPostgres } = require('./database');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@local';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

if (process.env.NODE_ENV === 'production' && (!process.env.DATABASE_URL || !process.env.JWT_SECRET)) {
  throw new Error('DATABASE_URL and JWT_SECRET are required in production');
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signToken(payload) {
  const data = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  try {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'))) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    return payload;
  } catch (e) {
    return null;
  }
}

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',').map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins.includes('*') ? true : allowedOrigins }));
app.use(bodyParser.json());

function init(done) {
  const id = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const schema = [
    `CREATE TABLE IF NOT EXISTS bookings (
        id ${id},
        type TEXT,
        date TEXT,
        time TEXT,
        location TEXT,
        status TEXT,
        people INTEGER,
        sessionLength TEXT,
        notes TEXT,
        options TEXT,
        package TEXT,
        price REAL,
        userId INTEGER,
        userEmail TEXT
      )`,
    `CREATE TABLE IF NOT EXISTS gallery (
        id ${id},
        title TEXT,
        category TEXT,
        description TEXT,
        imageUrl TEXT,
        imageData TEXT,
        imageMime TEXT
      )`,
    `CREATE TABLE IF NOT EXISTS users (
        id ${id},
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`,
    `CREATE TABLE IF NOT EXISTS messages (
        id ${id},
        conversationId TEXT,
        senderRole TEXT,
        text TEXT,
        createdAt TEXT
      )`,
    `CREATE TABLE IF NOT EXISTS surveys (
        id ${id},
        reference TEXT,
        timestamp TEXT,
        name TEXT,
        email TEXT,
        payload TEXT
      )`,
  ];

  const runNext = (index) => {
    if (index === schema.length) return done();
    db.run(schema[index], (error) => {
      if (error) return done(error);
      runNext(index + 1);
    });
  };

  runNext(0);
}

function migrateSchema(done) {
  const migrations = isPostgres
    ? [
        'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS userId INTEGER',
        'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS userEmail TEXT',
        'ALTER TABLE gallery ADD COLUMN IF NOT EXISTS imageUrl TEXT',
        'ALTER TABLE gallery ADD COLUMN IF NOT EXISTS imageData TEXT',
        'ALTER TABLE gallery ADD COLUMN IF NOT EXISTS imageMime TEXT',
      ]
    : [
        'ALTER TABLE bookings ADD COLUMN userId INTEGER',
        'ALTER TABLE bookings ADD COLUMN userEmail TEXT',
        'ALTER TABLE gallery ADD COLUMN imageUrl TEXT',
        'ALTER TABLE gallery ADD COLUMN imageData TEXT',
        'ALTER TABLE gallery ADD COLUMN imageMime TEXT',
      ];
  const runNext = (index) => {
    if (index === migrations.length) return done();
    db.run(migrations[index], (error) => {
      if (error && !/duplicate column name/i.test(error.message || '')) return done(error);
      runNext(index + 1);
    });
  };
  runNext(0);
}

let databaseReady = false;
init((error) => {
  if (error) {
    console.error('Database initialization failed:', error.message);
    return;
  }
  migrateSchema((migrationError) => {
    if (migrationError) {
      console.error('Database migration failed:', migrationError.message);
      return;
    }
    databaseReady = true;
    seedAdmin();
  });
});

app.get('/health', (req, res) => {
  res.status(databaseReady ? 200 : 503).json({ ok: databaseReady, database: isPostgres ? 'postgres' : 'sqlite' });
});

// Seed initial admin if none exists
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const derived = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256').toString('hex');
  return `${salt}$${iterations}$${derived}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, iterationsStr, derived] = stored.split('$');
    const iterations = parseInt(iterationsStr, 10) || 100000;
    const check = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(derived, 'hex'));
  } catch (e) {
    return false;
  }
}

function seedAdmin() {
  db.get('SELECT * FROM users WHERE email = ?', [DEFAULT_ADMIN_EMAIL], async (err, row) => {
    if (err) return console.error('Admin seed check failed', err.message);
    if (!row) {
      const hash = hashPassword(DEFAULT_ADMIN_PASSWORD);
      db.run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', ['Admin', DEFAULT_ADMIN_EMAIL, hash, 'admin'], function (e) {
        if (e) return console.error('Failed to seed admin', e.message);
        console.log(`Seeded initial admin -> email: ${DEFAULT_ADMIN_EMAIL} / password: ${DEFAULT_ADMIN_PASSWORD}`);
      });
    } else {
      console.log(`Admin user exists -> email: ${DEFAULT_ADMIN_EMAIL}`);
    }
  });
}

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must contain at least 6 characters' });
    // Only allow client registrations from public
    if (role && role === 'admin') return res.status(403).json({ error: 'Admin registration is not allowed' });
    const hash = hashPassword(password);
    db.run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name || '', email, hash, 'client'], function (err) {
      if (err) return res.status(/unique|constraint/i.test(err.message || '') ? 409 : 500).json({ error: /unique|constraint/i.test(err.message || '') ? 'Email is already in use' : err.message });
      const id = this.lastID;
      const user = { id: 'u' + id, name: name || '', email, role: 'client' };
        const token = signToken({ id: id, role: 'client', name: user.name, email, iat: Date.now() });
      res.json({ user, token });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const loginWithUser = (row) => {
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    const match = verifyPassword(password, row.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const user = { id: 'u' + row.id, name: row.name, email: row.email, role: row.role };
    const token = signToken({ id: row.id, role: row.role, name: row.name, email: row.email, iat: Date.now() });
    res.json({ user, token });
  };

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return loginWithUser(row);

    if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const hash = hashPassword(DEFAULT_ADMIN_PASSWORD);
      return db.run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', ['Admin', DEFAULT_ADMIN_EMAIL, hash, 'admin'], function (insertErr) {
        if (insertErr) return res.status(500).json({ error: insertErr.message });
        db.get('SELECT * FROM users WHERE email = ?', [DEFAULT_ADMIN_EMAIL], (findErr, createdRow) => {
          if (findErr) return res.status(500).json({ error: findErr.message });
          return loginWithUser(createdRow);
        });
      });
    }

    return loginWithUser(null);
  });
});

app.put('/auth/password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Current password and a new password of at least 6 characters are required' });
  db.get('SELECT password FROM users WHERE id = ?', [req.user.id], (error, row) => {
    if (error) return res.status(500).json({ error: error.message });
    if (!row || !verifyPassword(currentPassword, row.password)) return res.status(401).json({ error: 'Current password is incorrect' });
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashPassword(newPassword), req.user.id], (updateError) => {
      if (updateError) return res.status(500).json({ error: updateError.message });
      res.json({ ok: true });
    });
  });
});

app.delete('/auth/account', authenticate, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });
  db.get('SELECT password, role FROM users WHERE id = ?', [req.user.id], (error, row) => {
    if (error) return res.status(500).json({ error: error.message });
    if (!row || !verifyPassword(password, row.password)) return res.status(401).json({ error: 'Password is incorrect' });
    const finish = () => db.run('DELETE FROM users WHERE id = ?', [req.user.id], (deleteError) => {
      if (deleteError) return res.status(500).json({ error: deleteError.message });
      res.json({ ok: true });
    });
    if (row.role === 'admin') {
      return db.get('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['admin'], (countError, countRow) => {
        if (countError) return res.status(500).json({ error: countError.message });
        if (Number(countRow.count) <= 1) return res.status(400).json({ error: 'The last administrator cannot delete this account' });
        finish();
      });
    }
    db.run('DELETE FROM bookings WHERE userId = ?', [req.user.id], () => {
      db.run('DELETE FROM messages WHERE conversationId LIKE ?', [`u${req.user.id}:%`], () => finish());
    });
  });
});

// Middleware to authenticate
function authenticate(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = h.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  req.user = payload;
  next();
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  next();
}

// Admin-only endpoint to create admins
app.post('/admin/create-admin', authenticate, adminOnly, async (req, res) => {
  const { name, password } = req.body;
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  // reuse existing hashPassword utility
  const hash = hashPassword(password);
  db.run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name || '', email, hash, 'admin'], function (err) {
    if (err) return res.status(/unique|constraint/i.test(err.message || '') ? 409 : 500).json({ error: /unique|constraint/i.test(err.message || '') ? 'Email is already in use' : err.message });
    const id = this.lastID;
    res.json({ id: 'u' + id, name: name || '', email, role: 'admin' });
  });
});

// Surveys endpoints (public POST, admin GET/export)
app.post('/surveys', (req, res) => {
  const { reference, timestamp, name, email, ...rest } = req.body;
  const ref = reference || ('NS' + Date.now());
  const ts = timestamp || new Date().toISOString();
  const payload = JSON.stringify(rest || {});
  const stmt = db.prepare('INSERT INTO surveys (reference,timestamp,name,email,payload) VALUES (?,?,?,?,?)');
  stmt.run(ref, ts, name || '', email || '', payload, async function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const id = this.lastID;
    // send email via EmailJS (free, no SMTP). Configure via env or use keys found in provided HTML as fallback.
    const EMAILJS_USER = process.env.EMAILJS_USER || 'JsbOdljB-zSYfbcGs';
    const EMAILJS_SERVICE = process.env.EMAILJS_SERVICE || 'service_dji4avl';
    const EMAILJS_TEMPLATE = process.env.EMAILJS_TEMPLATE || 'template_kxv3da';
    const TO_EMAIL = process.env.SURVEY_TO || 'kpehoue@gmail.com';
    const text = `Nouvelle demande: ${ref}\nFrom: ${name} <${email}>\nPayload:\n${payload}`;
    let emailSent = false;
    let emailError = null;
    try {
      const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE,
          template_id: EMAILJS_TEMPLATE,
          user_id: EMAILJS_USER,
          template_params: {
            to_email: TO_EMAIL,
            from_name: name,
            from_email: email,
            subject: `Nouvelle demande ${ref}`,
            message: text,
            reference: ref
          }
        })
      });
      if (resp && resp.ok) {
        emailSent = true;
        console.log('Survey saved and email sent via EmailJS', ref);
      } else {
        emailError = `status:${resp && resp.status}`;
        console.error('EmailJS send returned non-ok', resp && resp.status);
      }
    } catch (e) {
      emailError = e && e.message ? e.message : String(e);
      console.error('EmailJS send failed', emailError);
    }

    res.json({ id: 's' + id, reference: ref, timestamp: ts, emailSent, emailError });
  });
});

app.get('/admin/surveys', authenticate, adminOnly, (req, res) => {
  db.all('SELECT * FROM surveys ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const mapped = rows.map((r) => ({ id: 's' + r.id, reference: r.reference, timestamp: r.timestamp, name: r.name, email: r.email, payload: JSON.parse(r.payload || '{}') }));
    res.json(mapped);
  });
});

app.get('/admin/surveys/export', authenticate, adminOnly, (req, res) => {
  db.all('SELECT * FROM surveys ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // build CSV header
    const headers = ['reference', 'timestamp', 'name', 'email', 'payload'];
    const csv = [headers.join(',')].concat(rows.map((r) => {
      const payload = r.payload ? JSON.stringify(JSON.parse(r.payload)) : '';
      return [r.reference, r.timestamp, r.name, r.email, '"' + payload.replace(/"/g, '""') + '"'].join(',');
    })).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="surveys_export.csv"');
    res.send(csv);
  });
});

// Messages endpoints
app.get('/conversations', authenticate, (req, res) => {
  const query = req.user.role === 'admin'
    ? 'SELECT * FROM messages ORDER BY createdAt DESC'
    : 'SELECT * FROM messages WHERE conversationId LIKE ? ORDER BY createdAt DESC';
  const params = req.user.role === 'admin' ? [] : [`u${req.user.id}:%`];
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const conversations = new Map();
    rows.forEach((row) => {
      if (!conversations.has(row.conversationId)) {
        conversations.set(row.conversationId, {
          id: row.conversationId,
          last: {
            id: 'm' + row.id,
            from: row.senderRole === 'admin' ? 'admin' : 'client',
            text: row.text,
            createdAt: row.createdAt,
            conversationId: row.conversationId,
          },
        });
      }
    });
    res.json(Array.from(conversations.values()));
  });
});

app.get('/conversations/:id/messages', authenticate, (req, res) => {
  const conv = req.params.id;
  if (req.user.role !== 'admin' && !conv.startsWith(`u${req.user.id}:`)) return res.status(403).json({ error: 'Conversation access denied' });
  db.all('SELECT * FROM messages WHERE conversationId = ? ORDER BY id ASC', [conv], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const mapped = rows.map((r) => ({ id: 'm' + r.id, from: r.senderRole === 'admin' ? 'admin' : 'client', text: r.text, createdAt: r.createdAt, conversationId: r.conversationId }));
    res.json(mapped);
  });
});

app.post('/conversations/:id/messages', authenticate, (req, res) => {
  const conv = req.params.id;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' });
  if (req.user.role !== 'admin' && !conv.startsWith(`u${req.user.id}:`)) return res.status(403).json({ error: 'Conversation access denied' });
  const senderRole = req.user.role;
  const createdAt = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO messages (conversationId,senderRole,text,createdAt) VALUES (?,?,?,?)');
  stmt.run(conv, senderRole, text || '', createdAt, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const id = this.lastID;
    res.json({ id: 'm' + id, from: senderRole === 'admin' ? 'admin' : 'client', text: text || '', createdAt, conversationId: conv });
  });
});

app.get('/bookings', authenticate, (req, res) => {
  const query = req.user.role === 'admin' ? 'SELECT * FROM bookings ORDER BY id DESC' : 'SELECT * FROM bookings WHERE userId = ? ORDER BY id DESC';
  const params = req.user.role === 'admin' ? [] : [req.user.id];
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // map id to string keys like b1, b2
    const mapped = rows.map((r) => ({ ...r, id: 'b' + r.id, options: r.options ? JSON.parse(r.options) : [] }));
    res.json(mapped);
  });
});

app.post('/bookings', authenticate, (req, res) => {
  const b = req.body;
  const options = JSON.stringify(b.options || []);
  const stmt = db.prepare(`INSERT INTO bookings (type,date,time,location,status,people,sessionLength,notes,options,package,price,userId,userEmail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const status = b.status || 'pending';
  stmt.run(b.type || '', b.date || '', b.time || '', b.location || '', status, b.people || 1, b.sessionLength || '', b.notes || '', options, b.package || 'Standard', b.price || 0, req.user.id, req.user.email || '', function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const id = this.lastID;
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ ...row, id: 'b' + row.id, options: row.options ? JSON.parse(row.options) : [] });
    });
  });
});

app.put('/bookings/:id/status', authenticate, adminOnly, (req, res) => {
  const idParam = req.params.id.replace(/^b/, '');
  const { status } = req.body;
  db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, idParam], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM bookings WHERE id = ?', [idParam], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ ...row, id: 'b' + row.id, options: row.options ? JSON.parse(row.options) : [] });
    });
  });
});

function mapGalleryRow(row) {
  return {
    ...row,
    id: 'g' + row.id,
    imageUrl: row.imageData ? `data:${row.imageMime || 'image/jpeg'};base64,${row.imageData}` : row.imageUrl || '',
  };
}

app.get('/gallery', authenticate, (req, res) => {
  db.all('SELECT * FROM gallery ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const mapped = rows.map(mapGalleryRow);
    res.json(mapped);
  });
});

app.post('/gallery', authenticate, adminOnly, upload.single('image'), (req, res) => {
  const { title, category, description } = req.body;
  if (!title || !category || !req.file) return res.status(400).json({ error: 'Title, category and an image file are required' });
  const imageData = req.file.buffer.toString('base64');
  const stmt = db.prepare('INSERT INTO gallery (title, category, description, imageData, imageMime) VALUES (?,?,?,?,?)');
  stmt.run(title, category, description || '', imageData, req.file.mimetype, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const id = this.lastID;
    db.get('SELECT * FROM gallery WHERE id = ?', [id], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json(mapGalleryRow(row));
    });
  });
});

app.delete('/gallery/:id', authenticate, adminOnly, (req, res) => {
  const idParam = req.params.id.replace(/^g/, '');
  db.run('DELETE FROM gallery WHERE id = ?', [idParam], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id });
  });
});

app.get('/dashboard', authenticate, (req, res) => {
  const query = req.user.role === 'admin' ? 'SELECT * FROM bookings' : 'SELECT * FROM bookings WHERE userId = ?';
  const params = req.user.role === 'admin' ? [] : [req.user.id];
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = rows.length;
    const pending = rows.filter((r) => r.status === 'pending').length;
    const confirmed = rows.filter((r) => r.status === 'confirmed').length;
    const completedRows = rows.filter((r) => r.status === 'completed');
    const completed = completedRows.length;
    const revenue = completedRows.reduce((s, r) => s + (r.price || 0), 0);
    const packageRevenue = {};
    rows.forEach((r) => {
      const pkg = r.package || 'Standard';
      packageRevenue[pkg] = (packageRevenue[pkg] || 0) + (r.price || 0);
    });
    res.json({ totalBookings: total, pending, confirmed, completed, revenue, packageRevenue });
  });
});

const PORT = process.env.PORT || 4004;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
