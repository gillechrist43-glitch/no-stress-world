const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@local';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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

const DB_PATH = process.env.NETLIFY ? '/tmp/no-stress-world.sqlite' : path.join(__dirname, 'db.sqlite');
const app = express();
app.use(cors());
app.use(bodyParser.json());

try {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
} catch (e) {
  console.warn('Could not ensure DB directory exists:', e && e.message ? e.message : e);
}

const db = new sqlite3.Database(DB_PATH);

function init() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        price REAL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        category TEXT,
        description TEXT
      )`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversationId TEXT,
        senderRole TEXT,
        text TEXT,
        createdAt TEXT
      )`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT,
        timestamp TEXT,
        name TEXT,
        email TEXT,
        payload TEXT
      )`
    );
  });
}

init();

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

seedAdmin();

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    // Only allow client registrations from public
    if (role && role === 'admin') return res.status(403).json({ error: 'Admin registration is not allowed' });
    const hash = hashPassword(password);
    db.run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name || '', email, hash, 'client'], function (err) {
      if (err) return res.status(500).json({ error: err.message });
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
  const { email, password } = req.body;
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
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  // reuse existing hashPassword utility
  const hash = hashPassword(password);
  db.run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name || '', email, hash, 'admin'], function (err) {
    if (err) return res.status(500).json({ error: err.message });
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
  db.all('SELECT conversationId, MAX(createdAt) as lastAt FROM messages GROUP BY conversationId ORDER BY lastAt DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((r) => ({ id: r.conversationId })));
  });
});

app.get('/conversations/:id/messages', authenticate, (req, res) => {
  const conv = req.params.id;
  db.all('SELECT * FROM messages WHERE conversationId = ? ORDER BY id ASC', [conv], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const mapped = rows.map((r) => ({ id: 'm' + r.id, from: r.senderRole === 'admin' ? 'admin' : 'client', text: r.text, createdAt: r.createdAt, conversationId: r.conversationId }));
    res.json(mapped);
  });
});

app.post('/conversations/:id/messages', authenticate, (req, res) => {
  const conv = req.params.id;
  const { text } = req.body;
  const senderRole = req.user.role;
  const createdAt = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO messages (conversationId,senderRole,text,createdAt) VALUES (?,?,?,?)');
  stmt.run(conv, senderRole, text || '', createdAt, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const id = this.lastID;
    res.json({ id: 'm' + id, from: senderRole === 'admin' ? 'admin' : 'client', text: text || '', createdAt, conversationId: conv });
  });
});

app.get('/bookings', (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // map id to string keys like b1, b2
    const mapped = rows.map((r) => ({ ...r, id: 'b' + r.id, options: r.options ? JSON.parse(r.options) : [] }));
    res.json(mapped);
  });
});

app.post('/bookings', (req, res) => {
  const b = req.body;
  const options = JSON.stringify(b.options || []);
  const stmt = db.prepare(`INSERT INTO bookings (type,date,time,location,status,people,sessionLength,notes,options,package,price) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const status = b.status || 'pending';
  stmt.run(b.type || '', b.date || '', b.time || '', b.location || '', status, b.people || 1, b.sessionLength || '', b.notes || '', options, b.package || 'Standard', b.price || 0, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const id = this.lastID;
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ ...row, id: 'b' + row.id, options: row.options ? JSON.parse(row.options) : [] });
    });
  });
});

app.put('/bookings/:id/status', (req, res) => {
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

app.get('/gallery', (req, res) => {
  db.all('SELECT * FROM gallery ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const mapped = rows.map((r) => ({ ...r, id: 'g' + r.id }));
    res.json(mapped);
  });
});

app.post('/gallery', (req, res) => {
  const { title, category, description } = req.body;
  const stmt = db.prepare('INSERT INTO gallery (title, category, description) VALUES (?,?,?)');
  stmt.run(title || '', category || '', description || '', function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const id = this.lastID;
    db.get('SELECT * FROM gallery WHERE id = ?', [id], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ ...row, id: 'g' + row.id });
    });
  });
});

app.delete('/gallery/:id', (req, res) => {
  const idParam = req.params.id.replace(/^g/, '');
  db.run('DELETE FROM gallery WHERE id = ?', [idParam], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id });
  });
});

app.get('/dashboard', (req, res) => {
  db.all('SELECT * FROM bookings', (err, rows) => {
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
