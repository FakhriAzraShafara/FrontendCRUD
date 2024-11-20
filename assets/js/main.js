$(document).ready(function() {
    loadVehicles();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    $('#addNewBtn').click(showForm);
    $('#cancelBtn').click(hideFormAndReset);
    $('#searchBtn').click(performSearch);
    $('#addEditForm').submit(handleFormSubmit);
}

// Data Loading Functions
async function loadVehicles() {
    showLoading();
    try {
        const vehicles = await api.getAllVehicles();
        renderVehicleTable(vehicles);
    } catch (error) {
        showToast('error', 'Error loading vehicles: ' + error.message);
        renderEmptyTable();
    } finally {
        hideLoading();
    }
}

async function performSearch() {
    const searchParams = {
        nomorRegistrasi: $('#searchRegistration').val().trim(),
        namaPemilik: $('#searchOwner').val().trim()
    };

    if (!searchParams.nomorRegistrasi && !searchParams.namaPemilik) {
        showToast('warning', 'Minimal satu parameter pencarian harus diisi');
        return;
    }

    showLoading();
    try {
        const response = await api.searchVehicles(searchParams);
        if (response.success) {
            renderVehicleTable(response.data);
            if (response.data.length === 0) {
                showToast('info', 'Tidak ada data yang ditemukan');
            } else {
                showToast('success', `Ditemukan ${response.data.length} data kendaraan`);
            }
        } else {
            showToast('error', response.message);
        }
    } catch (error) {
        showToast('error', 'Error searching vehicles: ' + error.message);
        renderEmptyTable();
    } finally {
        hideLoading();
    }
}

// Form Handling Functions
async function handleFormSubmit(e) {
    e.preventDefault();
    const nomorRegistrasi = $('#registrationNumber').val();
    const vehicleData = {
        nomorRegistrasi: nomorRegistrasi,
        namaPemilik: $('#ownerName').val(),
        alamat: $('#ownerAddress').val(),
        merkKendaraan: $('#vehicleBrand').val(),
        tahunPembuatan: parseInt($('#manufacturingYear').val()),
        kapasitasSilinder: parseInt($('#cylinderCapacity').val()),
        warnaKendaraan: $('#vehicleColor').val(),
        bahanBakar: $('#fuelType').val()
    };

    try {
        if ($('#vehicleId').val()) {
            await updateVehicle(nomorRegistrasi, vehicleData);
        } else {
            await createVehicle(vehicleData);
        }
        hideFormAndReset();
        await loadVehicles();
    } catch (error) {
        showToast('error', 'Error saving vehicle: ' + error.message);
    }
}

async function createVehicle(vehicleData) {
    try {
        await api.createVehicle(vehicleData);
        showToast('success', 'Vehicle created successfully');
    } catch (error) {
        throw new Error('Failed to create vehicle: ' + error.message);
    }
}

async function updateVehicle(nomorRegistrasi, vehicleData) {
    try {
        await api.updateVehicle(nomorRegistrasi, vehicleData);
        showToast('success', 'Vehicle updated successfully');
    } catch (error) {
        throw new Error('Failed to update vehicle: ' + error.message);
    }
}

// Detail View Functions
function showVehicleDetail(nomorRegistrasi) {
    api.getVehicleByNomorRegistrasi(nomorRegistrasi)
        .then(vehicle => {
            renderVehicleDetail(vehicle);
            $('#vehicleDetail').show();
            $('#dataTable').hide();
            $('#searchForm').hide();
            $('#vehicleForm').hide();
        })
        .catch(error => {
            showToast('error', 'Error loading vehicle details: ' + error.message);
        });
}

function renderVehicleDetail(vehicle) {
    if (!document.getElementById('vehicleDetail')) {
        const detailHTML = `
            <div id="vehicleDetail" class="card shadow-sm mb-4" style="display: none;">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-car me-2"></i>Detail Data Kendaraan
                    </h5>
                    <button type="button" class="btn-close" aria-label="Close" onclick="hideDetail()"></button>
                </div>
                <div class="card-body">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <div class="detail-item">
                                <label class="text-muted mb-1">Nomor Registrasi</label>
                                <p class="fw-bold mb-3" id="detailNomorRegistrasi"></p>
                            </div>
                            <div class="detail-item">
                                <label class="text-muted mb-1">Nama Pemilik</label>
                                <p class="fw-bold mb-3" id="detailNamaPemilik"></p>
                            </div>
                            <div class="detail-item">
                                <label class="text-muted mb-1">Alamat</label>
                                <p class="fw-bold mb-3" id="detailAlamat"></p>
                            </div>
                            <div class="detail-item">
                                <label class="text-muted mb-1">Merk Kendaraan</label>
                                <p class="fw-bold mb-3" id="detailMerkKendaraan"></p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="detail-item">
                                <label class="text-muted mb-1">Tahun Pembuatan</label>
                                <p class="fw-bold mb-3" id="detailTahunPembuatan"></p>
                            </div>
                            <div class="detail-item">
                                <label class="text-muted mb-1">Kapasitas Silinder</label>
                                <p class="fw-bold mb-3" id="detailKapasitasSilinder"></p>
                            </div>
                            <div class="detail-item">
                                <label class="text-muted mb-1">Warna Kendaraan</label>
                                <p class="fw-bold mb-3" id="detailWarnaKendaraan"></p>
                            </div>
                            <div class="detail-item">
                                <label class="text-muted mb-1">Bahan Bakar</label>
                                <p class="fw-bold mb-3" id="detailBahanBakar"></p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 text-end">
                        <button type="button" class="btn btn-secondary me-2" onclick="hideDetail()">
                            <i class="fas fa-times me-2"></i>Tutup
                        </button>
                        <button type="button" class="btn btn-primary" onclick="editVehicle('${vehicle.nomorRegistrasi}')">
                            <i class="fas fa-edit me-2"></i>Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.container').insertAdjacentHTML('beforeend', detailHTML);
    }

    // Populate detail fields
    $('#detailNomorRegistrasi').text(vehicle.nomorRegistrasi || '-');
    $('#detailNamaPemilik').text(vehicle.namaPemilik || '-');
    $('#detailAlamat').text(vehicle.alamat || '-');
    $('#detailMerkKendaraan').text(vehicle.merkKendaraan || '-');
    $('#detailTahunPembuatan').text(vehicle.tahunPembuatan || '-');
    $('#detailKapasitasSilinder').text(vehicle.kapasitasSilinder ? `${vehicle.kapasitasSilinder} cc` : '-');
    $('#detailWarnaKendaraan').text(vehicle.warnaKendaraan || '-');
    $('#detailBahanBakar').text(vehicle.bahanBakar || '-');

    // Update edit button
    $('#vehicleDetail .btn-primary').attr('onclick', `editVehicle('${vehicle.nomorRegistrasi}')`);
}

// Delete Functions
async function deleteVehicle(nomorRegistrasi) {
    if (!document.getElementById('deleteConfirmationModal')) {
        createDeleteModal();
    }

    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    document.getElementById('deleteRegistrationNumber').textContent = nomorRegistrasi;
    document.getElementById('confirmDeleteBtn').setAttribute('data-nomor-registrasi', nomorRegistrasi);
    modal.show();
}

function createDeleteModal() {
    const modalHTML = `
        <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-labelledby="deleteConfirmationModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="deleteConfirmationModalLabel">
                            <i class="fas fa-exclamation-triangle me-2"></i>Konfirmasi Penghapusan
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <i class="fas fa-trash-alt text-danger" style="font-size: 4rem;"></i>
                        </div>
                        <p class="text-center fs-5">Anda yakin ingin menghapus data kendaraan dengan nomor registrasi:</p>
                        <p class="text-center fw-bold fs-4" id="deleteRegistrationNumber"></p>
                        <p class="text-center text-muted">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Batal
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                            <i class="fas fa-trash-alt me-2"></i>Hapus Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
        const nomorRegistrasi = this.getAttribute('data-nomor-registrasi');
        try {
            await api.deleteVehicle(nomorRegistrasi);
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
            modal.hide();
            await loadVehicles();
            showToast('success', 'Data kendaraan berhasil dihapus');
        } catch (error) {
            showToast('error', 'Gagal menghapus data kendaraan: ' + error.message);
        }
    });
}

// UI Rendering Functions
function renderVehicleTable(vehicles) {
    const tbody = $('#vehicleTableBody');
    tbody.empty();

    if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
        renderEmptyTable();
        return;
    }

    vehicles.forEach((vehicle, index) => {
        tbody.append(`
            <tr>
                <td>${index + 1}</td>
                <td>${vehicle.nomorRegistrasi || '-'}</td>
                <td>${vehicle.namaPemilik || '-'}</td>
                <td>${vehicle.merkKendaraan || '-'}</td>
                <td>${vehicle.tahunPembuatan || '-'}</td>
                <td>${vehicle.kapasitasSilinder ? vehicle.kapasitasSilinder + ' cc' : '-'}</td>
                <td>${vehicle.warnaKendaraan || '-'}</td>
                <td>${vehicle.bahanBakar || '-'}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-info me-1" onclick="showVehicleDetail('${vehicle.nomorRegistrasi}')">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button class="btn btn-sm btn-primary me-1" onclick="editVehicle('${vehicle.nomorRegistrasi}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${vehicle.nomorRegistrasi}')">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </td>
            </tr>
        `);
    });
}

function renderEmptyTable() {
    const tbody = $('#vehicleTableBody');
    tbody.empty();
    tbody.append(`
        <tr>
            <td colspan="9" class="text-center">
                <div class="py-4">
                    <i class="fas fa-database text-muted mb-3" style="font-size: 3rem;"></i>
                    <p class="text-muted mb-0">Tidak ada data yang tersedia</p>
                </div>
            </td>
        </tr>
    `);
}

// Form State Management Functions
function showForm() {
    $('#vehicleForm').show();
    $('#dataTable').hide();
    $('#searchForm').hide();
    $('#registrationNumber').prop('disabled', false);
}

function hideForm() {
    $('#vehicleForm').hide();
    $('#dataTable').show();
    $('#searchForm').show();
}

function hideFormAndReset() {
    hideForm();
    clearForm();
}

function clearForm() {
    $('#vehicleId').val('');
    $('#addEditForm')[0].reset();
    $('#registrationNumber').prop('disabled', false);
}

function hideDetail() {
    $('#vehicleDetail').hide();
    $('#dataTable').show();
    $('#searchForm').show();
}

function editVehicle(nomorRegistrasi) {
    api.getVehicleByNomorRegistrasi(nomorRegistrasi)
        .then(vehicle => {
            showForm();
            populateForm(vehicle);
            $('#registrationNumber').prop('disabled', true);
        })
        .catch(error => {
            showToast('error', 'Error loading vehicle details: ' + error.message);
        });
}

function populateForm(vehicle) {
    $('#vehicleId').val(vehicle.nomorRegistrasi);
    $('#registrationNumber').val(vehicle.nomorRegistrasi);
    $('#manufacturingYear').val(vehicle.tahunPembuatan);
    $('#ownerName').val(vehicle.namaPemilik);
    $('#cylinderCapacity').val(vehicle.kapasitasSilinder);
    $('#vehicleBrand').val(vehicle.merkKendaraan);
    $('#vehicleColor').val(vehicle.warnaKendaraan);
    $('#ownerAddress').val(vehicle.alamat);
    $('#fuelType').val(vehicle.bahanBakar);
}

function showToast(type, message) {
    if (!document.getElementById('toastContainer')) {
        const toastContainer = `
            <div class="toast-container position-fixed bottom-0 end-0 p-3">
                <div id="notificationToast" class="toast align-items-center text-white border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            <i class="fas fa-${getToastIcon(type)} me-2"></i>
                            <span id="toastMessage"></span>
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastContainer);
    }

    const toastElement = document.getElementById('notificationToast');
    const toast = new bootstrap.Toast(toastElement);
    
    toastElement.className = `toast align-items-center text-white border-0 bg-${getToastClass(type)}`;
    document.getElementById('toastMessage').textContent = message;
    
    toast.show();
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

function getToastClass(type) {
    switch(type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'info';
    }
}

function showLoading() {
    $('#loadingSpinner').fadeIn(300);
    $('#vehicleTableBody').addClass('table-loading');
    $('#searchBtn').prop('disabled', true);
    $('#addNewBtn').prop('disabled', true);
}

function hideLoading() {
    $('#loadingSpinner').fadeOut(300);
    $('#vehicleTableBody').removeClass('table-loading');
    $('#searchBtn').prop('disabled', false);
    $('#addNewBtn').prop('disabled', false);
}

// Expose functions to global scope for inline event handlers
window.editVehicle = editVehicle;
window.deleteVehicle = deleteVehicle;