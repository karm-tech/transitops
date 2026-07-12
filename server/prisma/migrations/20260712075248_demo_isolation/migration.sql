-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseCategory" TEXT NOT NULL,
    "licenseExpiry" DATETIME NOT NULL,
    "contact" TEXT,
    "safetyScore" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Driver" ("contact", "createdAt", "id", "licenseCategory", "licenseExpiry", "licenseNumber", "name", "safetyScore", "status") SELECT "contact", "createdAt", "id", "licenseCategory", "licenseExpiry", "licenseNumber", "name", "safetyScore", "status" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
CREATE UNIQUE INDEX "Driver_licenseNumber_isDemo_key" ON "Driver"("licenseNumber", "isDemo");
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "note" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,
    "tripId" TEXT,
    CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "category", "date", "id", "note", "tripId", "vehicleId") SELECT "amount", "category", "date", "id", "note", "tripId", "vehicleId" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE TABLE "new_FuelLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "liters" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,
    CONSTRAINT "FuelLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FuelLog" ("cost", "date", "id", "liters", "vehicleId") SELECT "cost", "date", "id", "liters", "vehicleId" FROM "FuelLog";
DROP TABLE "FuelLog";
ALTER TABLE "new_FuelLog" RENAME TO "FuelLog";
CREATE TABLE "new_Maintenance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "cost" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "vehicleId" TEXT NOT NULL,
    CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Maintenance" ("closedAt", "cost", "description", "id", "openedAt", "status", "type", "vehicleId") SELECT "closedAt", "cost", "description", "id", "openedAt", "status", "type", "vehicleId" FROM "Maintenance";
DROP TABLE "Maintenance";
ALTER TABLE "new_Maintenance" RENAME TO "Maintenance";
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Notification" ("createdAt", "id", "message", "read", "type") SELECT "createdAt", "id", "message", "read", "type" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "cargoWeightKg" INTEGER NOT NULL,
    "plannedDistanceKm" REAL NOT NULL,
    "finalOdometer" INTEGER,
    "fuelConsumed" REAL,
    "revenue" REAL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "dispatchedAt" DATETIME,
    "completedAt" DATETIME,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("cargoWeightKg", "code", "completedAt", "createdAt", "destination", "dispatchedAt", "driverId", "finalOdometer", "fuelConsumed", "id", "plannedDistanceKm", "revenue", "source", "status", "vehicleId") SELECT "cargoWeightKg", "code", "completedAt", "createdAt", "destination", "dispatchedAt", "driverId", "finalOdometer", "fuelConsumed", "id", "plannedDistanceKm", "revenue", "source", "status", "vehicleId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
CREATE UNIQUE INDEX "Trip_code_isDemo_key" ON "Trip"("code", "isDemo");
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "maxLoadKg" INTEGER NOT NULL,
    "odometer" INTEGER NOT NULL DEFAULT 0,
    "acquisitionCost" REAL NOT NULL DEFAULT 0,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Vehicle" ("acquisitionCost", "createdAt", "id", "maxLoadKg", "name", "odometer", "regNumber", "region", "status", "type") SELECT "acquisitionCost", "createdAt", "id", "maxLoadKg", "name", "odometer", "regNumber", "region", "status", "type" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_regNumber_isDemo_key" ON "Vehicle"("regNumber", "isDemo");
CREATE TABLE "new_VehicleDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,
    CONSTRAINT "VehicleDocument_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VehicleDocument" ("docType", "fileName", "filePath", "id", "uploadedAt", "vehicleId") SELECT "docType", "fileName", "filePath", "id", "uploadedAt", "vehicleId" FROM "VehicleDocument";
DROP TABLE "VehicleDocument";
ALTER TABLE "new_VehicleDocument" RENAME TO "VehicleDocument";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
