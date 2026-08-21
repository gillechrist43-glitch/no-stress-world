const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

function postgresQuery(sql, params = []) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function normalizeRow(row) {
  if (!row) return row;
  const aliases = {
    sessionlength: 'sessionLength',
    conversationid: 'conversationId',
    senderrole: 'senderRole',
    createdat: 'createdAt',
    imageurl: 'imageUrl',
  };
  return Object.entries(row).reduce((result, [key, value]) => {
    result[aliases[key] || key] = value;
    return result;
  }, {});
}

function createPostgresDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  const query = (sql, params, callback) => {
    pool.query(postgresQuery(sql), params, callback);
  };

  return {
    serialize(callback) {
      callback();
    },
    run(sql, params = [], callback = () => {}) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const insert = /^\s*INSERT\s+INTO/i.test(sql) && !/\bRETURNING\b/i.test(sql);
      query(insert ? `${sql} RETURNING id` : sql, params, (error, result) => {
        const context = { lastID: result && result.rows[0] ? result.rows[0].id : undefined };
        callback.call(context, error);
      });
    },
    get(sql, params = [], callback) {
      query(sql, params, (error, result) => callback(error, result && normalizeRow(result.rows[0])));
    },
    all(sql, params = [], callback) {
      query(sql, params, (error, result) => callback(error, result ? result.rows.map(normalizeRow) : []));
    },
    prepare(sql) {
      return {
        run: (...args) => {
          const callback = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};
          const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          return this.run(sql, params, callback);
        },
      };
    },
  };
}

function createSqliteDatabase() {
  const databasePath = process.env.SQLITE_PATH || (process.env.NETLIFY ? '/tmp/no-stress-world.sqlite' : path.join(__dirname, 'db.sqlite'));
  return new sqlite3.Database(databasePath);
}

module.exports = {
  db: DATABASE_URL ? createPostgresDatabase() : createSqliteDatabase(),
  isPostgres: Boolean(DATABASE_URL),
};