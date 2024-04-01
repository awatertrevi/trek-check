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
            <select v-model="selectedLicense" id="license-type" class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
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
            <input v-model="carLicensePlate" type="text" id="license-car" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="AB-123-C">
          </div>
          <div class="md:w-1/2 px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="license-caravan">
              Kenteken Aanhangwagen
            </label>
            <input v-model="caravanLicensePlate" type="text" id="license-caravan" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="XY-456-Z">
          </div>
        </div>
        <button @click="checkVehicles" class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Check Combinatie
        </button>
        <div v-if="result !== null" class="mt-4">
          <p v-if="result" class="text-green-500 font-bold">✅ De combinatie is toegestaan!</p>
          <p v-else class="text-red-500 font-bold">❌ De combinatie is niet toegestaan.</p>

          <p class="text-gray-600">
            Totale gewicht: {{ totalWeight }} kg.
            <br />
            Toegestaan voor rijbewijs {{ selectedLicense }}: {{ allowedWeight }} kg.
        </p>
        </div>
      </div>

      <footer class="text-gray-400 text-center text-sm p-4">
        Made with ❤️ by <a href="https://github.com/awatertrevi" class="text-blue-500 hover:text-blue-400" target="_blank" rel="noopener noreferrer">Trevi Awater</a>
        <div>
            Legal Disclaimer: Deze applicatie is bedoeld voor informatieve doeleinden. Ik ben niet aansprakelijk voor enige fouten of omissies, of voor de resultaten verkregen uit het gebruik van deze informatie.
        </div>
        </footer>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  import licenses from '@/lib/driving-licenses.js';
  
  const selectedLicense = ref('');
  const carLicensePlate = ref('');
  const caravanLicensePlate = ref('');
  const result = ref(null);
  const totalWeight = ref(0);
  const allowedWeight = ref(0);

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
      totalWeight.value = parseInt(carData.toegestane_maximum_massa_voertuig) + parseInt(caravanData.toegestane_maximum_massa_voertuig);
      const licenseInfo = licenses.find(l => l.type === selectedLicense.value);
      allowedWeight.value = licenseInfo.maxCombinationWeight;
      result.value = totalWeight.value <= allowedWeight.value;
    } else {
      alert("Kon niet alle voertuiggegevens ophalen.");
    }
  };
  </script>
  