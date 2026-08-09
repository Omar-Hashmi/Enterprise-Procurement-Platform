const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const purchaseOrderService = require('../src/services/purchase-order.service');
const auditLogService = require('../src/services/audit-log.service');
const purchaseOrderRepository = require('../src/repositories/purchase-order.repository');
const purchaseRequestRepository = require('../src/repositories/purchase-request.repository');
const quotationRepository = require('../src/repositories/quotation.repository');
const vendorRepository = require('../src/repositories/vendor.repository');

// Helper IDs
const validPurchaseRequestId = '507f1f77bcf86cd799439011';
const validQuotationId = '507f1f77bcf86cd799439012';
const validVendorId = '507f1f77bcf86cd799439013';

// Common stub data
const approvedPurchaseRequest = { _id: validPurchaseRequestId, status: 'Approved' };
const approvedQuotation = {
  _id: validQuotationId,
  status: 'Approved',
  purchaseRequest: validPurchaseRequestId,
  vendor: validVendorId,
};
const activeVendor = { _id: validVendorId, status: 'Active' };

/** Restore all mocks after each test */
function restoreAll() {
  try { mock.method(auditLogService, 'log').mock.restore(); } catch (e) {}
  try { mock.method(purchaseRequestRepository, 'getPurchaseRequestById').mock.restore(); } catch (e) {}
  try { mock.method(quotationRepository, 'getQuotationById').mock.restore(); } catch (e) {}
  try { mock.method(vendorRepository, 'getVendorById').mock.restore(); } catch (e) {}
  try { mock.method(purchaseOrderRepository, 'getAllPurchaseOrders').mock.restore(); } catch (e) {}
  try { mock.method(purchaseOrderRepository, 'createPurchaseOrder').mock.restore(); } catch (e) {}
  try { mock.method(purchaseOrderRepository, 'updatePurchaseOrder').mock.restore(); } catch (e) {}
  try { mock.method(purchaseOrderRepository, 'getPurchaseOrderById').mock.restore(); } catch (e) {}
}

test('Successful PO creation', async () => {
  mock.method(auditLogService, 'log', async () => null);
  mock.method(purchaseRequestRepository, 'getPurchaseRequestById', async () => approvedPurchaseRequest);
  mock.method(quotationRepository, 'getQuotationById', async () => approvedQuotation);
  mock.method(vendorRepository, 'getVendorById', async () => activeVendor);
  mock.method(purchaseOrderRepository, 'getAllPurchaseOrders', async () => []);
  const createdPO = { _id: '507f1f77bcf86cd799439014', poNumber: 'PO-001' };
  mock.method(purchaseOrderRepository, 'createPurchaseOrder', async (data) => createdPO);

  const poData = {
    purchaseRequest: validPurchaseRequestId,
    quotation: validQuotationId,
    vendor: validVendorId,
    poNumber: 'PO-001',
    totalAmount: 1000,
    expectedDeliveryDate: new Date(),
    paymentTerms: 'Net 30',
    remarks: 'Test PO',
  };

  const result = await purchaseOrderService.createPurchaseOrder(poData);
  assert.equal(result, createdPO);
  restoreAll();
});

test('Unapproved Purchase Request rejected', async () => {
  mock.method(auditLogService, 'log', async () => null);
  mock.method(purchaseRequestRepository, 'getPurchaseRequestById', async () => ({ _id: validPurchaseRequestId, status: 'Pending' }));
  mock.method(quotationRepository, 'getQuotationById', async () => approvedQuotation);
  mock.method(vendorRepository, 'getVendorById', async () => activeVendor);
  mock.method(purchaseOrderRepository, 'getAllPurchaseOrders', async () => []);

  const poData = {
    purchaseRequest: validPurchaseRequestId,
    quotation: validQuotationId,
    vendor: validVendorId,
    poNumber: 'PO-002',
    totalAmount: 500,
    expectedDeliveryDate: new Date(),
    paymentTerms: 'Advance',
  };

  await assert.rejects(() => purchaseOrderService.createPurchaseOrder(poData), /Purchase Order can only be created for an Approved Purchase Request/);
  restoreAll();
});

test('Invalid quotation rejected', async () => {
  mock.method(auditLogService, 'log', async () => null);
  mock.method(purchaseRequestRepository, 'getPurchaseRequestById', async () => approvedPurchaseRequest);
  mock.method(quotationRepository, 'getQuotationById', async () => null);
  mock.method(vendorRepository, 'getVendorById', async () => activeVendor);
  mock.method(purchaseOrderRepository, 'getAllPurchaseOrders', async () => []);

  const poData = {
    purchaseRequest: validPurchaseRequestId,
    quotation: validQuotationId,
    vendor: validVendorId,
    poNumber: 'PO-003',
    totalAmount: 200,
    expectedDeliveryDate: new Date(),
    paymentTerms: 'Net 15',
  };

  await assert.rejects(() => purchaseOrderService.createPurchaseOrder(poData), /Quotation not found/);
  restoreAll();
});

test('Quotation belonging to another Purchase Request rejected', async () => {
  mock.method(auditLogService, 'log', async () => null);
  mock.method(purchaseRequestRepository, 'getPurchaseRequestById', async () => approvedPurchaseRequest);
  const wrongQuotation = { ...approvedQuotation, purchaseRequest: '507f1f77bcf86cd799439099' };
  mock.method(quotationRepository, 'getQuotationById', async () => wrongQuotation);
  mock.method(vendorRepository, 'getVendorById', async () => activeVendor);
  mock.method(purchaseOrderRepository, 'getAllPurchaseOrders', async () => []);

  const poData = {
    purchaseRequest: validPurchaseRequestId,
    quotation: validQuotationId,
    vendor: validVendorId,
    poNumber: 'PO-004',
    totalAmount: 300,
    expectedDeliveryDate: new Date(),
    paymentTerms: 'Net 45',
  };

  await assert.rejects(() => purchaseOrderService.createPurchaseOrder(poData), /Quotation does not belong to this Purchase Request/);
  restoreAll();
});

test('Vendor mismatch rejected', async () => {
  mock.method(auditLogService, 'log', async () => null);
  mock.method(purchaseRequestRepository, 'getPurchaseRequestById', async () => approvedPurchaseRequest);
  mock.method(quotationRepository, 'getQuotationById', async () => approvedQuotation);
  const otherVendor = { _id: '507f1f77bcf86cd799439099', status: 'Active' };
  mock.method(vendorRepository, 'getVendorById', async () => otherVendor);
  mock.method(purchaseOrderRepository, 'getAllPurchaseOrders', async () => []);

  const poData = {
    purchaseRequest: validPurchaseRequestId,
    quotation: validQuotationId,
    vendor: otherVendor._id,
    poNumber: 'PO-005',
    totalAmount: 400,
    expectedDeliveryDate: new Date(),
    paymentTerms: 'Net 60',
  };

  await assert.rejects(() => purchaseOrderService.createPurchaseOrder(poData), /Vendor does not match the quotation vendor/);
  restoreAll();
});

test('Inactive vendor rejected', async () => {
  mock.method(auditLogService, 'log', async () => null);
  mock.method(purchaseRequestRepository, 'getPurchaseRequestById', async () => approvedPurchaseRequest);
  mock.method(quotationRepository, 'getQuotationById', async () => approvedQuotation);
  const inactiveVendor = { _id: validVendorId, status: 'Inactive' };
  mock.method(vendorRepository, 'getVendorById', async () => inactiveVendor);
  mock.method(purchaseOrderRepository, 'getAllPurchaseOrders', async () => []);

  const poData = {
    purchaseRequest: validPurchaseRequestId,
    quotation: validQuotationId,
    vendor: validVendorId,
    poNumber: 'PO-006',
    totalAmount: 600,
    expectedDeliveryDate: new Date(),
    paymentTerms: 'Advance',
  };

  await assert.rejects(() => purchaseOrderService.createPurchaseOrder(poData), /Vendor is not active/);
  restoreAll();
});

test('Duplicate PO rejected', async () => {
  mock.method(auditLogService, 'log', async () => null);
  mock.method(purchaseRequestRepository, 'getPurchaseRequestById', async () => approvedPurchaseRequest);
  mock.method(quotationRepository, 'getQuotationById', async () => approvedQuotation);
  mock.method(vendorRepository, 'getVendorById', async () => activeVendor);
  const existingPO = { purchaseRequest: validPurchaseRequestId };
  mock.method(purchaseOrderRepository, 'getAllPurchaseOrders', async () => [existingPO]);

  const poData = {
    purchaseRequest: validPurchaseRequestId,
    quotation: validQuotationId,
    vendor: validVendorId,
    poNumber: 'PO-007',
    totalAmount: 700,
    expectedDeliveryDate: new Date(),
    paymentTerms: 'Net 30',
  };

  await assert.rejects(() => purchaseOrderService.createPurchaseOrder(poData), /Purchase Order already exists for this Purchase Request/);
  restoreAll();
});

test('Invalid status transition rejected', () => {
  const result = purchaseOrderService.validatePurchaseOrderStatusTransition('Completed', 'Accepted');
  assert.equal(result.allowed, false);
  assert.match(result.message, /Invalid status transition/i);
});

test('Valid status transition accepted', async () => {
  mock.method(auditLogService, 'log', async () => null);
  const existingPO = { _id: '507f1f77bcf86cd799439015', status: 'Issued' };
  mock.method(purchaseOrderRepository, 'getPurchaseOrderById', async () => existingPO);
  mock.method(purchaseOrderRepository, 'updatePurchaseOrder', async (id, data) => ({ ...existingPO, ...data }));

  const updatedPO = await purchaseOrderService.updatePurchaseOrder(existingPO._id, { status: 'Accepted' });
  assert.equal(updatedPO.status, 'Accepted');
  assert.ok(updatedPO.acceptedAt);
  restoreAll();
});

test('Cancellation', async () => {
  mock.method(auditLogService, 'log', async () => null);
  const existingPO = { _id: '507f1f77bcf86cd799439016', status: 'Issued' };
  mock.method(purchaseOrderRepository, 'getPurchaseOrderById', async () => existingPO);
  mock.method(purchaseOrderRepository, 'updatePurchaseOrder', async (id, data) => ({ ...existingPO, ...data }));

  const cancelledPO = await purchaseOrderService.cancelPurchaseOrder(existingPO._id);
  assert.equal(cancelledPO.status, 'Cancelled');
  assert.ok(cancelledPO.cancelledAt);
  restoreAll();
});

test('Delivery schedule and payment terms persisted', async () => {
  mock.method(auditLogService, 'log', async () => null);
  const po = {
    purchaseRequest: validPurchaseRequestId,
    quotation: validQuotationId,
    vendor: validVendorId,
    poNumber: 'PO-008',
    totalAmount: 800,
    expectedDeliveryDate: new Date('2025-01-01'),
    paymentTerms: 'Net 15',
    remarks: 'Delivery test',
    status: 'Issued',
  };
  mock.method(purchaseOrderRepository, 'createPurchaseOrder', async (data) => data);
  mock.method(purchaseRequestRepository, 'getPurchaseRequestById', async () => approvedPurchaseRequest);
  mock.method(quotationRepository, 'getQuotationById', async () => approvedQuotation);
  mock.method(vendorRepository, 'getVendorById', async () => activeVendor);
  mock.method(purchaseOrderRepository, 'getAllPurchaseOrders', async () => []);

  const created = await purchaseOrderService.createPurchaseOrder(po);
  assert.equal(created.expectedDeliveryDate.toISOString(), new Date('2025-01-01').toISOString());
  assert.equal(created.paymentTerms, 'Net 15');
  restoreAll();
});
