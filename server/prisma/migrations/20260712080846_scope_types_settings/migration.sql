-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "depotName" TEXT NOT NULL DEFAULT 'TransitOps Depot',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "distanceUnit" TEXT NOT NULL DEFAULT 'km',
    "rbacMatrix" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_Setting" ("currency", "depotName", "distanceUnit", "id", "rbacMatrix") SELECT "currency", "depotName", "distanceUnit", "id", "rbacMatrix" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
CREATE UNIQUE INDEX "Setting_isDemo_key" ON "Setting"("isDemo");
CREATE TABLE "new_VehicleType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_VehicleType" ("createdAt", "id", "name") SELECT "createdAt", "id", "name" FROM "VehicleType";
DROP TABLE "VehicleType";
ALTER TABLE "new_VehicleType" RENAME TO "VehicleType";
CREATE UNIQUE INDEX "VehicleType_name_isDemo_key" ON "VehicleType"("name", "isDemo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
