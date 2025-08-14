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

  // Validation 2: Check brake requirements
  // If trailer > 750kg, it must have brakes (legally required), so we assume it has them
  // If trailer <= 750kg, brakes are not required
  const trailerNeedsBrakes = caravanWeight > 750;
  const trailerHasBrakes = trailerNeedsBrakes ? true : hasBrakes(caravanData);
  
  if (trailerNeedsBrakes) {
    validationSuccess.push(`✅ Aanhangwagen heeft verplichte remmen (gewicht: ${caravanWeight}kg > 750kg)`);
  } else {
    validationSuccess.push(`✅ Aanhangwagen weegt minder dan 750kg (${caravanWeight}kg), geen remmen vereist`);
  }

  // Validation 3: Check if car can pull the trailer
  if (trailerHasBrakes && carBrakedTowing > 0) {
    if (caravanWeight <= carBrakedTowing) {
      validationSuccess.push(`✅ Auto kan aanhangwagen met remmen trekken (${caravanWeight}kg ≤ ${carBrakedTowing}kg)`);
    } else {
      validationErrors.push(`❌ Aanhangwagen te zwaar voor auto met remmen (${caravanWeight}kg > ${carBrakedTowing}kg)`);
    }
  } else if (!trailerHasBrakes && carUnbrakedTowing > 0) {
    if (caravanWeight <= carUnbrakedTowing) {
      validationSuccess.push(`✅ Auto kan aanhangwagen zonder remmen trekken (${caravanWeight}kg ≤ ${carUnbrakedTowing}kg)`);
    } else {
      validationErrors.push(`❌ Aanhangwagen te zwaar voor auto zonder remmen (${caravanWeight}kg > ${carUnbrakedTowing}kg)`);
    }
  } else {
    validationErrors.push(`❌ Geen trekgewicht gegevens beschikbaar voor de auto`);
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    success: validationSuccess,
    totalWeight,
    allowedWeight
  };
}

/**
 * Checks if a trailer requires brakes based on its weight
 * @param {number} trailerWeight - Weight of the trailer in kg
 * @returns {boolean} True if brakes are required
 */
export function requiresBrakes(trailerWeight) {
  return trailerWeight > 750;
}

/**
 * Checks if a trailer has brakes based on RDW data
 * @param {Object} trailerData - Trailer data from RDW API
 * @returns {boolean} True if trailer has brakes
 */
export function hasBrakes(trailerData) {
  if (!trailerData || !trailerData.remmen) {
    return false;
  }
  return trailerData.remmen.toLowerCase() !== 'geen';
}

/**
 * Validates if a car can tow a specific trailer weight
 * @param {Object} carData - Car data from RDW API
 * @param {number} trailerWeight - Weight of the trailer in kg
 * @param {boolean} trailerHasBrakes - Whether the trailer has brakes
 * @returns {Object} Validation result
 */
export function validateTowingCapacity(carData, trailerWeight, trailerHasBrakes) {
  const carUnbrakedTowing = parseInt(carData.maximum_massa_trekken_ongeremd || 0);
  const carBrakedTowing = parseInt(carData.maximum_trekken_massa_geremd || 0);

  if (trailerHasBrakes && carBrakedTowing > 0) {
    return {
      canTow: trailerWeight <= carBrakedTowing,
      maxWeight: carBrakedTowing,
      type: 'braked'
    };
  } else if (!trailerHasBrakes && carUnbrakedTowing > 0) {
    return {
      canTow: trailerWeight <= carUnbrakedTowing,
      maxWeight: carUnbrakedTowing,
      type: 'unbraked'
    };
  }

  return {
    canTow: false,
    maxWeight: 0,
    type: 'unknown'
  };
}
