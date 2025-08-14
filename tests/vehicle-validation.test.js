import { describe, it, expect } from 'vitest'
import { 
  validateVehicleCombination, 
  requiresBrakes, 
  hasBrakes, 
  validateTowingCapacity 
} from '../lib/vehicle-validation.js'

describe('vehicle-validation', () => {
  // Mock data for testing
  const mockCarData = {
    toegestane_maximum_massa_voertuig: '1500',
    maximum_massa_trekken_ongeremd: '700',
    maximum_trekken_massa_geremd: '1500'
  }

  const mockCarDataNoTowing = {
    toegestane_maximum_massa_voertuig: '1200',
    maximum_massa_trekken_ongeremd: '',
    maximum_trekken_massa_geremd: ''
  }

  const mockTrailerWithBrakes = {
    toegestane_maximum_massa_voertuig: '1200',
    remmen: 'hydraulisch'
  }

  const mockTrailerWithoutBrakes = {
    toegestane_maximum_massa_voertuig: '600',
    remmen: 'geen'
  }

  const mockHeavyTrailerWithoutBrakes = {
    toegestane_maximum_massa_voertuig: '1000',
    remmen: 'geen'
  }

  const mockLicenseB = {
    type: 'B',
    maxCombinationWeight: 3500
  }

  const mockLicenseBE = {
    type: 'BE',
    maxCombinationWeight: 7000
  }

  describe('requiresBrakes', () => {
    it('should return true for trailers over 750kg', () => {
      expect(requiresBrakes(751)).toBe(true)
      expect(requiresBrakes(1000)).toBe(true)
    })

    it('should return false for trailers 750kg or less', () => {
      expect(requiresBrakes(750)).toBe(false)
      expect(requiresBrakes(500)).toBe(false)
    })
  })

  describe('hasBrakes', () => {
    it('should return true when trailer has brakes', () => {
      expect(hasBrakes(mockTrailerWithBrakes)).toBe(true)
      expect(hasBrakes({ remmen: 'pneumatisch' })).toBe(true)
    })

    it('should return false when trailer has no brakes', () => {
      expect(hasBrakes(mockTrailerWithoutBrakes)).toBe(false)
      expect(hasBrakes({ remmen: 'Geen' })).toBe(false)
      expect(hasBrakes({ remmen: 'GEEN' })).toBe(false)
    })

    it('should return false when remmen field is missing', () => {
      expect(hasBrakes({})).toBe(false)
      expect(hasBrakes({ remmen: null })).toBe(false)
    })
  })

  describe('validateTowingCapacity', () => {
    it('should validate braked towing capacity correctly', () => {
      const result = validateTowingCapacity(mockCarData, 1200, true)
      expect(result).toEqual({
        canTow: true,
        maxWeight: 1500,
        type: 'braked'
      })
    })

    it('should validate unbraked towing capacity correctly', () => {
      const result = validateTowingCapacity(mockCarData, 600, false)
      expect(result).toEqual({
        canTow: true,
        maxWeight: 700,
        type: 'unbraked'
      })
    })

    it('should return false when exceeding braked capacity', () => {
      const result = validateTowingCapacity(mockCarData, 1600, true)
      expect(result).toEqual({
        canTow: false,
        maxWeight: 1500,
        type: 'braked'
      })
    })

    it('should return false when exceeding unbraked capacity', () => {
      const result = validateTowingCapacity(mockCarData, 800, false)
      expect(result).toEqual({
        canTow: false,
        maxWeight: 700,
        type: 'unbraked'
      })
    })

    it('should handle missing towing data', () => {
      const result = validateTowingCapacity(mockCarDataNoTowing, 500, false)
      expect(result).toEqual({
        canTow: false,
        maxWeight: 0,
        type: 'unknown'
      })
    })
  })

  describe('validateVehicleCombination', () => {
    it('should validate a valid combination with license B', () => {
      const result = validateVehicleCombination(
        mockCarData, 
        mockTrailerWithoutBrakes, 
        mockLicenseB
      )
      
      expect(result.isValid).toBe(true)
      expect(result.totalWeight).toBe(2100) // 1500 + 600
      expect(result.allowedWeight).toBe(3500)
      expect(result.errors).toHaveLength(0)
      expect(result.success).toHaveLength(3) // License weight, brake requirement, towing capacity
    })

    it('should validate a valid combination with license BE', () => {
      const result = validateVehicleCombination(
        mockCarData, 
        mockTrailerWithBrakes, 
        mockLicenseBE
      )
      
      expect(result.isValid).toBe(true)
      expect(result.totalWeight).toBe(2700) // 1500 + 1200
      expect(result.allowedWeight).toBe(7000)
      expect(result.errors).toHaveLength(0)
      expect(result.success).toHaveLength(3)
    })

    it('should fail when total weight exceeds license limit', () => {
      const heavyCar = { ...mockCarData, toegestane_maximum_massa_voertuig: '3000' }
      const heavyTrailer = { ...mockTrailerWithBrakes, toegestane_maximum_massa_voertuig: '1000' }
      
      const result = validateVehicleCombination(heavyCar, heavyTrailer, mockLicenseB)
      
      expect(result.isValid).toBe(false)
      expect(result.totalWeight).toBe(4000)
      expect(result.errors).toContain('❌ Totaalgewicht (4000kg) overschrijdt de limiet voor rijbewijs B (3500kg)')
    })

    it('should fail when heavy trailer lacks brakes', () => {
      const result = validateVehicleCombination(
        mockCarData, 
        mockHeavyTrailerWithoutBrakes, 
        mockLicenseB
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('❌ Aanhangwagen heeft geen remmen maar weegt meer dan 750kg (1000kg)')
    })

    it('should fail when car cannot tow the trailer', () => {
      const weakCar = { 
        ...mockCarData, 
        maximum_massa_trekken_ongeremd: '400',
        maximum_trekken_massa_geremd: '800'
      }
      
      const result = validateVehicleCombination(
        weakCar, 
        mockTrailerWithBrakes, 
        mockLicenseB
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('❌ Aanhangwagen te zwaar voor auto met remmen (1200kg > 800kg)')
    })

    it('should handle missing data gracefully', () => {
      const result = validateVehicleCombination(null, mockTrailerWithBrakes, mockLicenseB)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Ontbrekende voertuig- of rijbewijsgegevens')
    })

    it('should handle missing towing capacity data', () => {
      const result = validateVehicleCombination(
        mockCarDataNoTowing, 
        mockTrailerWithBrakes, 
        mockLicenseB
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('❌ Geen trekgewicht gegevens beschikbaar voor de auto')
    })

    it('should handle edge case: exactly 750kg trailer', () => {
      const carWithHigherTowing = {
        ...mockCarData,
        maximum_massa_trekken_ongeremd: '800'  // Can tow 750kg
      }
      const trailer750kg = {
        toegestane_maximum_massa_voertuig: '750',
        remmen: 'geen'
      }
      
      const result = validateVehicleCombination(
        carWithHigherTowing, 
        trailer750kg, 
        mockLicenseB
      )
      
      expect(result.isValid).toBe(true)
      expect(result.success).toContain('✅ Aanhangwagen weegt minder dan 750kg (750kg), geen remmen vereist')
    })

    it('should handle edge case: exactly 751kg trailer without brakes', () => {
      const trailer751kg = {
        toegestane_maximum_massa_voertuig: '751',
        remmen: 'geen'
      }
      
      const result = validateVehicleCombination(
        mockCarData, 
        trailer751kg, 
        mockLicenseB
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('❌ Aanhangwagen heeft geen remmen maar weegt meer dan 750kg (751kg)')
    })

    it('should validate multiple failure scenarios', () => {
      const heavyCar = { ...mockCarData, toegestane_maximum_massa_voertuig: '3200' }
      const heavyTrailerNoBreaks = {
        toegestane_maximum_massa_voertuig: '1000',
        remmen: 'geen'
      }
      
      const result = validateVehicleCombination(heavyCar, heavyTrailerNoBreaks, mockLicenseB)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3) // Weight limit + no brakes + towing capacity
      expect(result.totalWeight).toBe(4200)
      expect(result.errors).toContain('❌ Totaalgewicht (4200kg) overschrijdt de limiet voor rijbewijs B (3500kg)')
      expect(result.errors).toContain('❌ Aanhangwagen heeft geen remmen maar weegt meer dan 750kg (1000kg)')
      expect(result.errors).toContain('❌ Aanhangwagen te zwaar voor auto zonder remmen (1000kg > 700kg)')
    })
  })
})
