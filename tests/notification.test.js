// tests/notification.test.js
// Tests for Socket.IO based notification system

const test = require('node:test');
const assert = require('node:assert/strict');
const { server, io } = require('../server');
const notificationService = require('../src/services/notification.service');
const jwt = require('jsonwebtoken');
const { io: clientIO } = require('socket.io-client');

function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'mySuperSecretKey123';
  return jwt.sign(payload, secret);
}

let httpServer;
let port;
let clientA, clientB, clientC;

test('Setup server', async () => {
  await new Promise((resolve) => {
    httpServer = server.listen(0, () => {
      port = httpServer.address().port;
      resolve();
    });
  });
});

test('Socket.IO connection with valid JWT', async () => {
  const token = generateToken({ userId: 'userA', role: 'department' });
  clientA = clientIO(`http://localhost:${port}`, { auth: { token }, reconnection: false });
  await new Promise((resolve, reject) => {
    clientA.on('connect', resolve);
    clientA.on('connect_error', reject);
  });
  assert.ok(clientA.connected);
});

test('Connection rejected with missing token', async () => {
  const client = clientIO(`http://localhost:${port}`, { reconnection: false });
  await new Promise((resolve) => {
    client.on('connect_error', (err) => {
      assert.match(err.message, /token missing/);
      resolve();
    });
  });
});

test('Connection rejected with invalid token', async () => {
  const client = clientIO(`http://localhost:${port}`, { auth: { token: 'invalid.token' }, reconnection: false });
  await new Promise((resolve) => {
    client.on('connect_error', (err) => {
      assert.match(err.message, /invalid token/);
      resolve();
    });
  });
});

test('Setup second client (different role)', async () => {
  const token = generateToken({ userId: 'userB', role: 'finance_manager' });
  clientB = clientIO(`http://localhost:${port}`, { auth: { token }, reconnection: false });
  await new Promise((resolve, reject) => {
    clientB.on('connect', resolve);
    clientB.on('connect_error', reject);
  });
  assert.ok(clientB.connected);
});

test('Setup third client (different user)', async () => {
  const token = generateToken({ userId: 'userC', role: 'department' });
  clientC = clientIO(`http://localhost:${port}`, { auth: { token }, reconnection: false });
  await new Promise((resolve, reject) => {
    clientC.on('connect', resolve);
    clientC.on('connect_error', reject);
  });
  assert.ok(clientC.connected);
});

function once(socket, event) {
  return new Promise((resolve) => {
    const handler = (payload) => {
      socket.off(event, handler);
      resolve(payload);
    };
    socket.on(event, handler);
  });
}

// approval.created event to role

test('approval.created event', async () => {
  const p = once(clientB, 'approval.created');
  notificationService.emitToRole('finance_manager', 'approval.created', { approvalId: 'appr123' });
  const payload = await p;
  assert.equal(payload.event, 'approval.created');
  assert.equal(payload.approvalId, 'appr123');
  assert.ok(payload.timestamp);
});

// approval.rejected event to specific user

test('approval.rejected event', async () => {
  const p = once(clientA, 'approval.rejected');
  notificationService.emitToUser('userA', 'approval.rejected', { reason: 'Not valid' });
  const payload = await p;
  assert.equal(payload.event, 'approval.rejected');
  assert.equal(payload.reason, 'Not valid');
  assert.ok(payload.timestamp);
});

// purchase-request.approved event

test('purchase-request.approved event', async () => {
  const p = once(clientA, 'purchase-request.approved');
  notificationService.emitToUser('userA', 'purchase-request.approved', { requestId: 'req1' });
  const payload = await p;
  assert.equal(payload.event, 'purchase-request.approved');
  assert.equal(payload.requestId, 'req1');
});

// purchase-request.status-changed event

test('purchase-request.status-changed event', async () => {
  const p = once(clientA, 'purchase-request.status-changed');
  notificationService.emitToUser('userA', 'purchase-request.status-changed', { requestId: 'req1', newStatus: 'Issued' });
  const payload = await p;
  assert.equal(payload.event, 'purchase-request.status-changed');
  assert.equal(payload.newStatus, 'Issued');
});

// purchase-request.cancelled event

test('purchase-request.cancelled event', async () => {
  const p = once(clientA, 'purchase-request.cancelled');
  notificationService.emitToUser('userA', 'purchase-request.cancelled', { requestId: 'req1' });
  const payload = await p;
  assert.equal(payload.event, 'purchase-request.cancelled');
});

// purchase-order.created event

test('purchase-order.created event', async () => {
  const p = once(clientA, 'purchase-order.created');
  notificationService.emitToUser('userA', 'purchase-order.created', { poId: 'po123' });
  const payload = await p;
  assert.equal(payload.event, 'purchase-order.created');
  assert.equal(payload.poId, 'po123');
});

// purchase-order.status-changed event

test('purchase-order.status-changed event', async () => {
  const p = once(clientA, 'purchase-order.status-changed');
  notificationService.emitToUser('userA', 'purchase-order.status-changed', { poId: 'po123', status: 'Accepted' });
  const payload = await p;
  assert.equal(payload.event, 'purchase-order.status-changed');
  assert.equal(payload.status, 'Accepted');
});

// purchase-order.cancelled event

test('purchase-order.cancelled event', async () => {
  const p = once(clientA, 'purchase-order.cancelled');
  notificationService.emitToUser('userA', 'purchase-order.cancelled', { poId: 'po123' });
  const payload = await p;
  assert.equal(payload.event, 'purchase-order.cancelled');
});

// Ensure userC does not receive userA private events

test('User C does not receive user A events', async () => {
  let received = false;
  const handler = () => { received = true; };
  clientC.on('approval.created', handler);
  notificationService.emitToUser('userA', 'approval.created', { foo: 'bar' });
  await new Promise((r) => setTimeout(r, 200));
  clientC.off('approval.created', handler);
  assert.equal(received, false);
});

// Teardown

test('Teardown', async () => {
  clientA.disconnect();
  clientB.disconnect();
  clientC.disconnect();
  await new Promise((resolve) => httpServer.close(resolve));
});
