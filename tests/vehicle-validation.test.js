import { describe, it, expect } from 'vitest'
import { 
  validateVehicleCombination
} from '../lib/vehicle-validation.js'

describe('vehicle-validation', () => {
  // Mock data for testing
  const mockCarData = {
    toegestane_maximum_massa_voertuig: '1500',
    maximum_massa_trekken_ongeremd: '700',
    maximum_trekken_massa_geremd: '1500',
    handelsbenaming: 'CADDY',
    kenteken: 'AB123C'
  }

  const mockCarDataNoTowing = {
    toegestane_maximum_massa_voertuig: '1200',
    maximum_massa_trekken_ongeremd: '',
    maximum_trekken_massa_geremd: ''
  }

  const mockTrailerWithBrakes = {
    toegestane_maximum_massa_voertuig: '1200',
    handelsbenaming: 'HOBBY',
    kenteken: 'XY456Z'
  }

  const mockTrailerWithoutBrakes = {
    toegestane_maximum_massa_voertuig: '600',
    handelsbenaming: 'KNAUS',
    kenteken: 'QW789E'
  }

  const mockHeavyTrailerWithoutBrakes = {
    toegestane_maximum_massa_voertuig: '1000',
  }

  const mockLicenseB = {
    type: 'B',
    maxCombinationWeight: 3500
  }

  const mockLicenseBE = {
    type: 'BE',
    maxCombinationWeight: 7000
  }



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
      expect(result.success).toHaveLength(2) // License weight + towing capacity
      expect(result.carInfo).toEqual({
        handelsbenaming: 'CADDY',
        kenteken: 'AB123C',
        gewicht: 1500
      })
      expect(result.trailerInfo).toEqual({
        handelsbenaming: 'KNAUS',
        kenteken: 'QW789E',
        gewicht: 600
      })
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
      expect(result.success).toHaveLength(2) // License weight + towing capacity
    })

    it('should fail when total weight exceeds license limit', () => {
      const heavyCar = { ...mockCarData, toegestane_maximum_massa_voertuig: '3000' }
      const heavyTrailer = { ...mockTrailerWithBrakes, toegestane_maximum_massa_voertuig: '1000' }
      
      const result = validateVehicleCombination(heavyCar, heavyTrailer, mockLicenseB)
      
      expect(result.isValid).toBe(false)
      expect(result.totalWeight).toBe(4000)
      expect(result.errors).toContain('❌ Totaalgewicht (4000kg) overschrijdt de limiet voor rijbewijs B (3500kg)')
    })

    it('should validate heavy trailer correctly', () => {
      const result = validateVehicleCombination(
        mockCarData, 
        mockHeavyTrailerWithoutBrakes, 
        mockLicenseB
      )
      
      expect(result.isValid).toBe(true)
      expect(result.success).toContain('✅ Auto kan aanhangwagen trekken (1000kg ≤ 1500kg geremd)')
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
      expect(result.errors).toContain('❌ Aanhangwagen te zwaar voor auto (1200kg > 800kg geremd)')
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
      const trailer750kg = {
        toegestane_maximum_massa_voertuig: '750'
      }
      
      const result = validateVehicleCombination(
        mockCarData, 
        trailer750kg, 
        mockLicenseB
      )
      
      expect(result.isValid).toBe(true)
      expect(result.success).toContain('✅ Auto kan aanhangwagen trekken (750kg ≤ 1500kg geremd)')
    })

    it('should validate multiple failure scenarios', () => {
      const heavyCar = { ...mockCarData, toegestane_maximum_massa_voertuig: '3200' }
      const heavyTrailer = {
        toegestane_maximum_massa_voertuig: '1000'
      }
      
      const result = validateVehicleCombination(heavyCar, heavyTrailer, mockLicenseB)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1) // Only weight limit 
      expect(result.totalWeight).toBe(4200)
      expect(result.errors).toContain('❌ Totaalgewicht (4200kg) overschrijdt de limiet voor rijbewijs B (3500kg)')
      expect(result.success).toContain('✅ Auto kan aanhangwagen trekken (1000kg ≤ 1500kg geremd)')
    })
  })
})
