-- Fuel price is no longer a stored setting; completion defaults to a flat rate in app code.
ALTER TABLE "Setting" DROP COLUMN "fuelPricePerLitre";
