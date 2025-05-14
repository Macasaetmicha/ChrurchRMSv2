const createTable = (selector, ajaxUrl, columns) => {
    return $(selector).DataTable({
        paging: true,
        searching: true,
        ordering: true,
        ajax: ajaxUrl,
        columns: columns
    });
};

// Setup data table columns
const recordsColumns = [
    {
        data: null,
        render: function (data, type, row) {
            return `
                <button class="btn btn-primary find-btn-rec" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#recordsModal">
                    <i class="fa-solid fa-info fa-fw"></i>
                </button>
                <button class="mt-1 btn btn-primary edit-btn-record edit-btn" id="editRecordBtn" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#editRecordModal">
                    <i class="fa-solid fa-edit fa-fw"></i>
                </button>
                <button class="mt-1 delete-btn-record btn btn-primary delete-btn" data-id="${row.id}" data-page="deleteRecord">
                    <i class="fa-solid fa-trash fa-fw"></i>
                </button>
            `;
        },
        orderable: false,
        searchable: false
    },
    { data: 'first_name' },
    { data: 'middle_name' },
    { data: 'last_name' },
    {
        data: 'birthday',
        render: function (data, type, row) {
            return formatDateToLong(data);
        }
    },
    { data: 'ligitivity' },
    { data: 'birthplace' },
    // { data: 'status' },
    { 
        data: null, 
        render: function(data, type, row) {
            return `${row.address}, ${row.brgy}, ${row.citymun}, ${row.province}`;
        } 
    }
];

const baptismColumns = [
    {
        data: null,
        render: function (data, type, row) {
            return `
                <button class="btn btn-primary find-btn-bapt" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#showBaptModal">
                    <i class="fa-solid fa-info fa-fw"></i>
                </button>
                <button class="mt-1 btn btn-primary edit-btn-baptism edit-btn" id="editBaptismBtn" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#editBaptismModal">
                    <i class="fa-solid fa-edit fa-fw"></i>
                </button>
                <button class="mt-1 delete-btn-bapt btn btn-primary delete-btn" data-id="${row.id}" data-page="deleteBaptism">
                    <i class="fa-solid fa-trash fa-fw"></i>
                </button>
            `;
        },
        orderable: false,
        searchable: false
    },
    {
        data: 'baptism_date',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    { data: 'record.first_name' },
    { data: 'record.middle_name' },
    { data: 'record.last_name' },
    {
        data: 'record.birthday',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return `${row.record.address}, ${row.record.brgy}, ${row.record.citymun}, ${row.record.province}`;
        } 
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return row.father ? `${row.father.first_name} ${row.father.middle_name || ''} ${row.father.last_name}`.trim() : 'N/A';
        }
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return row.mother ? `${row.mother.first_name} ${row.mother.middle_name || ''} ${row.mother.last_name}`.trim() : 'N/A';
        }
    },
    { data: 'priest.name' }
];

const confirmationColumns = [
    {
        data: null,
        render: function (data, type, row) {
            return `
                <button class="btn btn-primary find-btn-conf" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#showConfModal">
                    <i class="fa-solid fa-info fa-fw"></i>
                </button>
                <button class="mt-1 btn btn-primary edit-btn-confirmation edit-btn" id="editConfirmationBtn" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#editConfirmationModal">
                    <i class="fa-solid fa-edit fa-fw"></i>
                </button>
                <button class="mt-1 delete-btn-conf btn btn-primary delete-btn" data-id="${row.id}" data-page="deleteConfirmation">
                    <i class="fa-solid fa-trash fa-fw"></i>
                </button>
            `;
        },
        orderable: false,
        searchable: false
    },
    {
        data: 'confirmation_date',
        render: function (data, type, row) {
            return formatDateToLong(data);
        }
    },
    { data: 'record.first_name' },
    { data: 'record.middle_name' },
    { data: 'record.last_name' },
    {
        data: 'record.birthday',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return `${row.record.address}, ${row.record.brgy}, ${row.record.citymun}, ${row.record.province}`;
        } 
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return row.father ? `${row.father.first_name} ${row.father.middle_name || ''} ${row.father.last_name}`.trim() : 'N/A';
        }
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return row.mother ? `${row.mother.first_name} ${row.mother.middle_name || ''} ${row.mother.last_name}`.trim() : 'N/A';
        }
    },
    { data: 'priest.name' }
];

const weddingColumns = [
    {
        data: null,
        render: function (data, type, row) {
            return `
                <button class="btn btn-primary find-btn-wedd" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#showWeddModal">
                    <i class="fa-solid fa-info fa-fw"></i>
                </button>
                <button class="mt-1 btn btn-primary edit-btn-wedding edit-btn" id="editWeddingBtn" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#editWeddingModal">
                    <i class="fa-solid fa-edit fa-fw"></i>
                </button>
                <button class="mt-1 delete-btn-wedd btn btn-primary delete-btn" data-id="${row.id}" data-page="deleteWedding">
                    <i class="fa-solid fa-trash fa-fw"></i>
                </button>
            `;
        },
        orderable: false,
        searchable: false
    },
    { data: 'wedding_date' },
    { 
        data: null, 
        render: function(data, type, row) {
            return row.groom ? `${row.groom.first_name} ${row.groom.middle_name || ''} ${row.groom.last_name}`.trim() : 'N/A';
        }
    },
    {
        data: 'groom.birthday',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return `${row.groom.address}, ${row.groom.brgy}, ${row.groom.citymun}, ${row.groom.province}`;
        } 
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return row.bride ? `${row.bride.first_name} ${row.bride.middle_name || ''} ${row.bride.last_name}`.trim() : 'N/A';
        }
    },
    {
        data: 'bride.birthday',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return `${row.bride.address}, ${row.bride.brgy}, ${row.bride.citymun}, ${row.bride.province}`;
        } 
    },
    { data: 'priest.name' }
];

const deathColumns = [
    {
        data: null,
        render: function (data, type, row) {
            return `
                <button class="btn btn-primary find-btn-death" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#showDeathModal">
                    <i class="fa-solid fa-info fa-fw"></i>
                </button>
                <button class="mt-1 btn btn-primary edit-btn-death edit-btn" id="editDeathBtn" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#editDeathModal">
                    <i class="fa-solid fa-edit fa-fw"></i>
                </button>
                <button class="mt-1 delete-btn-death btn btn-primary delete-btn" data-id="${row.id}" data-page="deleteDeath">
                    <i class="fa-solid fa-trash fa-fw"></i>
                </button>
            `;
        },
        orderable: false,
        searchable: false
    },
    {
        data: 'death_date',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    { data: 'record.first_name' },
    { data: 'record.middle_name' },
    { data: 'record.last_name' },
    {
        data: 'record.birthday',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return `${row.record.address}, ${row.record.brgy}, ${row.record.citymun}, ${row.record.province}`;
        } 
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return row.father ? `${row.father.first_name} ${row.father.middle_name || ''} ${row.father.last_name}`.trim() : 'N/A';
        }
    },
    { 
        data: null, 
        render: function(data, type, row) {
            return row.mother ? `${row.mother.first_name} ${row.mother.middle_name || ''} ${row.mother.last_name}`.trim() : 'N/A';
        }
    },
    { data: 'priest.name' }
];

const priestColumns = [
    {
        data: null,
        render: function (data, type, row) {
            return `
                <button class="btn btn-primary find-btn-priest" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#showPriestModal">
                    <i class="fa-solid fa-info fa-fw"></i>
                </button>
                <button class="btn btn-primary edit-btn-priest edit-btn" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#editPriestModal">
                    <i class="fa-solid fa-edit fa-fw"></i>
                </button>
                <button class="mt-1 delete-btn-priest btn btn-primary delete-btn" data-id="${row.id}" data-page="deletePriest">
                    <i class="fa-solid fa-trash fa-fw"></i>
                </button>
            `;
        },
        orderable: false,
        searchable: false
    },
    { data: 'name' },
    { data: 'position' },
    { data: 'church' },
    { data: 'status' }
];

const requestColumns = [
    {
        data: null,
        render: function (data, type, row) {
            return `
                <button class="btn btn-primary find-btn-request me-1" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#showRequestModal">
                    <i class="fa-solid fa-info fa-fw"></i>
                </button>
                <button class="btn btn-secondary search-record-btn" 
                        data-ceremony="${row.ceremony}" 
                        data-rec-name="${row.rec_name}" 
                        data-cer-date="${row.cer_date}">
                    <i class="fa-solid fa-magnifying-glass fa-fw"></i>
                </button>
            `;
        },
        orderable: false,
        searchable: false
    },
    {
        data: 'pickup_date',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    { data: 'requestor' },
    { data: 'ceremony' },
    { data: 'rec_name' },
    {
        data: 'cer_date',
        render: function (data, type, row) {
            return data ? formatDateToLong(data) : 'N/A'; 
        }
    },
    {
    data: 'status',
        render: function (data, type, row) {
            return `
                <select class="form-select form-select-sm status-dropdown" data-id="${row.id}">
                    <option value="pending" ${data === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${data === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="ready" ${data === 'ready' ? 'selected' : ''}>Ready</option>
                    <option value="completed" ${data === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${data === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    <option value="rejected" ${data === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            `;
        }
    }

];

const tables = {}; // Store multiple table instances

$(document).ready(function() {
    tables.recordTable = createTable('#recordTable', '/api_db/records', recordsColumns);
    tables.baptismTable = createTable('#baptismTable', '/api_db/baptism', baptismColumns);
    tables.confirmationTable = createTable('#confirmationTable', '/api_db/confirmation', confirmationColumns);
    tables.weddingTable = createTable('#weddingTable', '/api_db/wedding', weddingColumns);
    tables.deathTable = createTable('#deathTable', '/api_db/death', deathColumns);
    tables.priestTable = createTable('#priestTable', '/api_db/priest', priestColumns);
    tables.requestTable = createTable('#requestTable', '/api_db/get-request', requestColumns);

});

// Function to format date to YYYY-MM-DD
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to format date to "MM/DD/YYYY"
function formatDateToMMDDYYYY(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

//function to format date to "yyyy-mm-dd"
function formatFormDate(dateString) {
    let date = new Date(dateString);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0"); 
    let day = String(date.getDate()).padStart(2, "0"); 
    return `${year}-${month}-${day}`;
}

// Function to format date to "Month DD, YYYY"
function formatDateToLong(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function calculateAge(birthday) {
    let birthDate = new Date(birthday);
    let today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    let monthDiff = today.getMonth() - birthDate.getMonth();
    let dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }
    return age;
}

window.formatDate = formatDate;
window.formatDateToLong = formatDateToLong;
window.formatFormDate = formatFormDate;

