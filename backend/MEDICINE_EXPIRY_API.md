# Medicine Expiry Tracking API Documentation

## Overview
The Medicine Expiry Tracking system provides comprehensive functionality for managing medicine batches, tracking expiry dates, and receiving notifications for medicines that are expired, expiring soon, or low in stock.

## API Endpoints

### Medicine Expiry Management

#### 1. Get All Medicine Expiry Records
```
GET /api/medicine-expiry
```
Returns all active medicine expiry records ordered by expiry date.

#### 2. Get Medicine Expiry by ID
```
GET /api/medicine-expiry/{id}
```
Returns a specific medicine expiry record by ID.

#### 3. Create Medicine Expiry Record
```
POST /api/medicine-expiry
Content-Type: application/json

{
  "medicineId": 1,
  "batchNumber": "BATCH001",
  "expiryDate": "2024-12-31",
  "manufactureDate": "2024-01-15",
  "quantity": 100,
  "purchasePrice": 25.50,
  "supplierName": "ABC Pharmaceuticals",
  "status": "ACTIVE",
  "notes": "First batch received"
}
```

#### 4. Update Medicine Expiry Record
```
PUT /api/medicine-expiry/{id}
Content-Type: application/json

{
  "quantity": 80,
  "notes": "Updated after sale"
}
```

#### 5. Delete Medicine Expiry Record
```
DELETE /api/medicine-expiry/{id}
```

### Specialized Queries

#### 6. Get Expired Medicines
```
GET /api/medicine-expiry/expired
```
Returns all medicines that have passed their expiry date.

#### 7. Get Medicines Expiring Soon (30 days)
```
GET /api/medicine-expiry/expiring-soon
```
Returns medicines expiring within 30 days.

#### 8. Get Medicines Near Expiry (7 days)
```
GET /api/medicine-expiry/near-expiry
```
Returns medicines expiring within 7 days.

#### 9. Get Medicine Expiry by Medicine ID
```
GET /api/medicine-expiry/medicine/{medicineId}
```
Returns all expiry records for a specific medicine.

#### 10. Search Medicine Expiry Records
```
POST /api/medicine-expiry/search
Content-Type: application/json

{
  "medicineName": "Paracetamol",
  "batchNumber": "BATCH",
  "supplierName": "ABC",
  "expiryDateFrom": "2024-01-01",
  "expiryDateTo": "2024-12-31",
  "expired": true,
  "expiringSoon": false,
  "nearExpiry": false
}
```

#### 11. Get Dashboard Data
```
GET /api/medicine-expiry/dashboard
```
Returns comprehensive dashboard statistics.

#### 12. Update Status
```
PUT /api/medicine-expiry/{id}/status?status=DISPOSED
```
Updates the status of a medicine expiry record.

#### 13. Bulk Update Status
```
PUT /api/medicine-expiry/bulk-status?ids=1,2,3&status=DISPOSED
```
Updates status for multiple records.

#### 14. Manual Status Update Trigger
```
POST /api/medicine-expiry/update-statuses
```
Manually triggers automatic status updates based on expiry dates.

### Notifications

#### 15. Get All Notifications
```
GET /api/notifications
```
Returns all current notifications (expired, expiring soon, low stock).

#### 16. Get Expired Medicine Notifications
```
GET /api/notifications/expired
```

#### 17. Get Near Expiry Notifications
```
GET /api/notifications/near-expiry
```

#### 18. Get Expiring Soon Notifications
```
GET /api/notifications/expiring-soon
```

#### 19. Get Low Stock Notifications
```
GET /api/notifications/low-stock
```

#### 20. Get Urgent Notification Count
```
GET /api/notifications/urgent-count
```

#### 21. Get Total Notification Count
```
GET /api/notifications/total-count
```

#### 22. Get Notification Summary
```
GET /api/notifications/summary
```

## Data Models

### MedicineExpiryRequest
```json
{
  "medicineId": "Long (required)",
  "batchNumber": "String (required)",
  "expiryDate": "LocalDate (required)",
  "manufactureDate": "LocalDate (required)",
  "quantity": "Integer (required)",
  "purchasePrice": "BigDecimal (optional)",
  "supplierName": "String (optional)",
  "status": "ExpiryStatus (optional)",
  "notes": "String (optional)"
}
```

### MedicineExpiryResponse
```json
{
  "id": "Long",
  "medicineId": "Long",
  "medicineName": "String",
  "batchNumber": "String",
  "expiryDate": "LocalDate",
  "manufactureDate": "LocalDate",
  "quantity": "Integer",
  "purchasePrice": "BigDecimal",
  "supplierName": "String",
  "status": "ExpiryStatus",
  "notes": "String",
  "createdAt": "Instant",
  "updatedAt": "Instant",
  "daysUntilExpiry": "Long",
  "expired": "Boolean",
  "expiringSoon": "Boolean",
  "nearExpiry": "Boolean"
}
```

### ExpiryStatus Enum
- `ACTIVE`: Medicine is active and not expired
- `EXPIRED`: Medicine has passed expiry date
- `EXPIRING_SOON`: Medicine expires within 30 days
- `DISPOSED`: Medicine has been disposed of
- `RECALLED`: Medicine has been recalled

### ExpiryDashboardResponse
```json
{
  "totalMedicines": "Long",
  "activeMedicines": "Long",
  "expiredMedicines": "Long",
  "expiringSoonMedicines": "Long",
  "nearExpiryMedicines": "Long",
  "disposedMedicines": "Long",
  "totalValueAtRisk": "Double",
  "lowStockCount": "Integer"
}
```

### ExpiryNotificationResponse
```json
{
  "id": "Long",
  "message": "String",
  "type": "String (INFO, WARNING, DANGER)",
  "medicineName": "String",
  "batchNumber": "String",
  "medicineId": "Long",
  "expiryRecordId": "Long",
  "timestamp": "LocalDateTime",
  "daysUntilExpiry": "Integer",
  "quantity": "Integer",
  "urgent": "Boolean"
}
```

## Security
All endpoints require ADMIN role authentication. Ensure proper JWT token is provided in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Database Schema
The system adds a new table `medicine_expiry` with the following structure:
- Tracks individual medicine batches
- Links to existing medicine records
- Includes expiry tracking and supplier information
- Supports status management and audit trails

## Usage Examples

### Adding a New Medicine Batch
1. First, ensure the medicine exists in the `medicines` table
2. Create an expiry record with batch details
3. The system will automatically calculate expiry status

### Monitoring Expiring Medicines
1. Use the dashboard endpoint for overview
2. Check notifications for urgent items
3. Use specific endpoints for expired/expiring medicines
4. Set up regular checks using the notification count endpoints

### Managing Disposed Medicines
1. Update status to DISPOSED when medicines are disposed
2. Use bulk update for multiple items
3. Track disposal for audit purposes

This system provides comprehensive medicine expiry tracking with automated notifications and detailed reporting capabilities.