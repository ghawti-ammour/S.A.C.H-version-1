import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: parseInt(process.env.MYSQLPORT || '3306'),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function getOne<T>(sql: string, params: any[]): Promise<T | null> {
  const [rows] = await db.execute(sql, params);
  return (rows as T[])[0] || null;
}

export async function getAll<T>(sql: string, params: any[]): Promise<T[]> {
  const [rows] = await db.execute(sql, params);
  return rows as T[];
}

export async function run(sql: string, params: any[]): Promise<any> {
  const [result] = await db.execute(sql, params);
  return result;
}

export default db;
