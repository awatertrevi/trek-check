/**
 * Vehicle validation utilities for TrekCheck
 * Validates car and trailer combinations based on Dutch driving license regulations
 */

/**
 * Validates if a vehicle combination is allowed based on various criteria
 * @param {Object} carData - Car data from RDW API
 * @param {Object} caravanData - Caravan/trailer data from RDW API
 * @param {Object} licenseInfo - License information with maxCombinationWeight
 * @returns {Object} Validation result with success/error messages
 */
export function validateVehicleCombination(carData, caravanData, licenseInfo) {
  const validationErrors = [];
  const validationSuccess = [];

  if (!carData || !caravanData || !licenseInfo) {
    return {
      isValid: false,
      errors: ['Ontbrekende voertuig- of rijbewijsgegevens'],
      success: [],
      totalWeight: 0,
      allowedWeight: 0
    };
  }

  const carWeight = parseInt(carData.toegestane_maximum_massa_voertuig) || 0;
  const caravanWeight = parseInt(caravanData.toegestane_maximum_massa_voertuig) || 0;
  const carUnbrakedTowing = parseInt(carData.maximum_massa_trekken_ongeremd || 0);
  const carBrakedTowing = parseInt(carData.maximum_trekken_massa_geremd || 0);
  
  const totalWeight = carWeight + caravanWeight;
  const allowedWeight = licenseInfo.maxCombinationWeight;

  // Validation 1: Check license weight limit
  if (totalWeight <= allowedWeight) {
    validationSuccess.push(`✅ Totaalgewicht (${totalWeight}kg) is toegestaan voor rijbewijs ${licenseInfo.type}`);
  } else {
    validationErrors.push(`❌ Totaalgewicht (${totalWeight}kg) overschrijdt de limiet voor rijbewijs ${licenseInfo.type} (${allowedWeight}kg)`);
  }

  // Validation 2: Check if car can pull the trailer
  // Use the higher towing capacity (braked) if available, otherwise unbraked
  const maxTowingCapacity = carBrakedTowing > 0 ? carBrakedTowing : carUnbrakedTowing;
  const towingType = carBrakedTowing > 0 ? 'geremd' : 'ongeremd';
  
  if (maxTowingCapacity > 0) {
    if (caravanWeight <= maxTowingCapacity) {
      validationSuccess.push(`✅ Auto kan aanhangwagen trekken (${caravanWeight}kg ≤ ${maxTowingCapacity}kg ${towingType})`);
    } else {
      validationErrors.push(`❌ Aanhangwagen te zwaar voor auto (${caravanWeight}kg > ${maxTowingCapacity}kg ${towingType})`);
    }
  } else {
    validationErrors.push(`❌ Geen trekgewicht gegevens beschikbaar voor de auto`);
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    success: validationSuccess,
    totalWeight,
    allowedWeight,
    carInfo: {
      handelsbenaming: carData.handelsbenaming || 'Onbekend',
      kenteken: carData.kenteken || 'Onbekend',
      gewicht: carWeight
    },
    trailerInfo: {
      handelsbenaming: caravanData.handelsbenaming || 'Onbekend', 
      kenteken: caravanData.kenteken || 'Onbekend',
      gewicht: caravanWeight
    }
  };
}




