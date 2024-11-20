const API_BASE_URL = 'http://CRUDNet.somee.com/api';

const api = {
    async getAllVehicles() {
        const response = await fetch(`${API_BASE_URL}/Kendaraan`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async getVehicleByNomorRegistrasi(nomorRegistrasi) {
        const response = await fetch(`${API_BASE_URL}/Kendaraan/${nomorRegistrasi}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async createVehicle(vehicleData) {
        const response = await fetch(`${API_BASE_URL}/Kendaraan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vehicleData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async updateVehicle(nomorRegistrasi, vehicleData) {
        const response = await fetch(`${API_BASE_URL}/Kendaraan/${nomorRegistrasi}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vehicleData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async deleteVehicle(nomorRegistrasi) {
        const response = await fetch(`${API_BASE_URL}/Kendaraan/${nomorRegistrasi}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Check if the response has content before parsing JSON
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    },

    async searchVehicles(params) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/Kendaraan/search?${queryString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
};