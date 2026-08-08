// tests/auth.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fetch = require('node-fetch'); // using fetch for HTTP requests
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const app = require('../src/app');
const http = require('http');

let server;
let baseUrl;

test.before(async () => {
  // start server on random port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}/api/auth`;
  // ensure a test user exists
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await User.deleteMany({});
  const hashed = await require('bcrypt').hash('Initial1!', 10);
  await User.create({
    fullName: 'Test User',
    email: 'test@example.com',
    password: hashed,
    role: 'employee',
    department: 'IT',
    phone: '1234567890',
  });
});

test.after(async () => {
  await mongoose.disconnect();
  server.close();
});

async function loginAndGetToken() {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Initial1!' }),
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.token);
  return data.token;
}

test('Change password success', async () => {
  const token = await loginAndGetToken();
  const res = await fetch(`${baseUrl}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: 'Initial1!', newPassword: 'NewPass2@' }),
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.message, 'Password changed successfully');
  // verify new password works
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'NewPass2@' }),
  });
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.ok(loginData.token);
});

test('Change password wrong current password', async () => {
  const token = await loginAndGetToken();
  const res = await fetch(`${baseUrl}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: 'WrongPass', newPassword: 'Another1!' }),
  });
  const data = await res.json();
  assert.equal(res.status, 401);
  assert.match(data.message, /Current password is incorrect/);
});

test('Password reset request generates token', async () => {
  const res = await fetch(`${baseUrl}/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' }),
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.resetToken);
});

test('Password reset with valid token', async () => {
  // request token first
  const reqRes = await fetch(`${baseUrl}/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' }),
  });
  const reqData = await reqRes.json();
  const token = reqData.resetToken;
  const res = await fetch(`${baseUrl}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword: 'Reset1#' }),
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.message, 'Password has been reset successfully');
  // login with new password
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Reset1#' }),
  });
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.ok(loginData.token);
});

test('Password reset with invalid token fails', async () => {
  const res = await fetch(`${baseUrl}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'invalidtoken', newPassword: 'Some1!' }),
  });
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.match(data.message, /Invalid or expired reset token/);
});
