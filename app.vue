<template>
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center">

        <header class="text-gray-800 py-4">
      <div class="container mx-auto flex flex-col justify-between items-center">
        <img src="/logo.png" alt="Logo" class="h-48 w-48">
          <h1 class="text-5xl font-semibold mt-4">TrekCheck</h1>
          <h2 class="text-2xl mt-1 mb-3 text-center p-4">Controleer of je de combinatie auto/aanhangwagen mag rijden met jouw rijbewijs.</h2>
      </div>
    </header>

      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
        <div class="-mx-3 md:flex mb-6">
          <div class="md:w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="license-type">
              Rijbewijs
            </label>
            <select v-model="selectedLicense" id="license-type" :disabled="isChecking" class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <option disabled value="">Kies je rijbewijs</option>
              <option v-for="license in licenses" :key="license.type" :value="license.type">
                {{ license.type }}
              </option>
            </select>
          </div>
        </div>
        <div class="-mx-3 md:flex mb-2">
          <div class="md:w-1/2 px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="license-car">
              Kenteken Auto
            </label>
            <input v-model="carLicensePlate" type="text" id="license-car" :disabled="isChecking" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="AB-123-C">
          </div>
          <div class="md:w-1/2 px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="license-caravan">
              Kenteken Aanhangwagen
            </label>
            <input v-model="caravanLicensePlate" type="text" id="license-caravan" :disabled="isChecking" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="XY-456-Z">
          </div>
        </div>
        <div class="mt-4">
          <button 
            v-if="!isChecking" 
            @click="checkVehicles" 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Check Combinatie
          </button>
        </div>
        <div v-if="result !== null" class="mt-4">
          <div class="mb-4">
            <p v-if="result" class="text-green-500 font-bold text-lg">✅ De combinatie is toegestaan!</p>
            <p v-else class="text-red-500 font-bold text-lg">❌ De combinatie is niet toegestaan.</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-700 mb-3">Uitleg:</h3>
            
            <!-- Success messages -->
            <div v-if="validationSuccess.length > 0" class="mb-3">
              <div v-for="success in validationSuccess" :key="success" class="text-green-600 text-sm mb-1">
                {{ success }}
              </div>
            </div>

            <!-- Error messages -->
            <div v-if="validationErrors.length > 0" class="mb-3">
              <div v-for="error in validationErrors" :key="error" class="text-red-600 text-sm mb-1">
                {{ error }}
              </div>
            </div>

            <div class="text-gray-600 text-sm mt-3 pt-3 border-t border-gray-200">
              <strong>Voertuig Informatie:</strong><br>
              <div v-if="carInfo" class="mb-2">
                <strong>Auto:</strong> {{ carInfo.handelsbenaming }} ({{ carInfo.kenteken }}) - {{ carInfo.gewicht }}kg
              </div>
              <div v-if="trailerInfo" class="mb-3">
                <strong>Aanhangwagen:</strong> {{ trailerInfo.handelsbenaming }} ({{ trailerInfo.kenteken }}) - {{ trailerInfo.gewicht }}kg
              </div>
              <strong>Samenvatting:</strong><br>
              Totale gewicht: {{ totalWeight }} kg<br>
              Toegestaan voor rijbewijs {{ selectedLicense }}: {{ allowedWeight }} kg
            </div>
          </div>

          <!-- Reset button onder de uitleg -->
          <div v-if="isChecking" class="mt-4 text-center">
            <button 
              @click="resetForm" 
              class="bg-gray-500 hover:bg-gray-600 text-white font-normal py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline"
            >
              Opnieuw beginnen
            </button>
          </div>
        </div>
      </div>

      <footer class="text-gray-400 text-center text-sm p-4">
        Made with ❤️ by <a href="https://github.com/awatertrevi" class="text-blue-500 hover:text-blue-400" target="_blank" rel="noopener noreferrer">Trevi Awater</a>
        <div class="mt-2">
          Voertuiggegevens geleverd door <a href="https://opendata.rdw.nl/" class="text-blue-500 hover:text-blue-400" target="_blank" rel="noopener noreferrer">RDW Open Data</a>
        </div>
        <div class="mt-2">
            Legal Disclaimer: Deze applicatie is bedoeld voor informatieve doeleinden. Ik ben niet aansprakelijk voor enige fouten of omissies, of voor de resultaten verkregen uit het gebruik van deze informatie.
        </div>
        </footer>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import axios from 'axios';
  import licenses from '@/lib/driving-licenses.js';
  import { validateVehicleCombination } from '@/lib/vehicle-validation.js';
  
  const selectedLicense = ref('');
  const carLicensePlate = ref('');
  const caravanLicensePlate = ref('');
  const result = ref(null);
const totalWeight = ref(0);
const allowedWeight = ref(0);
const validationErrors = ref([]);
const validationSuccess = ref([]);
const isChecking = ref(false);
const carInfo = ref(null);
const trailerInfo = ref(null);

  watch(selectedLicense, (newValue) => {
    if (newValue) {
      const licenseInfo = licenses.find(l => l.type === newValue);
      allowedWeight.value = licenseInfo.maxCombinationWeight;
    }
  });
  
  const fetchVehicleDetails = async (licensePlate) => {
    try {
      const response = await axios.get(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?Kenteken=${licensePlate}`);
      return response.data[0]; // Assumes the first object contains the desired data
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      return null;
    }
  };
  
  const checkVehicles = async () => {
    if (!selectedLicense.value || !carLicensePlate.value || !caravanLicensePlate.value) {
      alert("Vul alle velden in.");
      return;
    }

    const carData = await fetchVehicleDetails(carLicensePlate.value.replace(/-/g, ''));
    const caravanData = await fetchVehicleDetails(caravanLicensePlate.value.replace(/-/g, ''));
    
    if (carData && caravanData) {
      const licenseInfo = licenses.find(l => l.type === selectedLicense.value);
      const validationResult = validateVehicleCombination(carData, caravanData, licenseInfo);
      
      // Update reactive values
      result.value = validationResult.isValid;
      totalWeight.value = validationResult.totalWeight;
      allowedWeight.value = validationResult.allowedWeight;
      validationErrors.value = validationResult.errors;
      validationSuccess.value = validationResult.success;
      carInfo.value = validationResult.carInfo;
      trailerInfo.value = validationResult.trailerInfo;
      isChecking.value = true; // Disable inputs and show reset button
    } else {
      alert("Kon niet alle voertuiggegevens ophalen.");
    }
  };

  const resetForm = () => {
    // Reset all form values to initial state
    selectedLicense.value = '';
    carLicensePlate.value = '';
    caravanLicensePlate.value = '';
    result.value = null;
    totalWeight.value = 0;
    allowedWeight.value = 0;
    validationErrors.value = [];
    validationSuccess.value = [];
    carInfo.value = null;
    trailerInfo.value = null;
    isChecking.value = false;
  };
  </script>
  