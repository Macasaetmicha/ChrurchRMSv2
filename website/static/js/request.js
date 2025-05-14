let calendar;

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const dateDisplay = document.getElementById('current-date');
    const eventModal = new bootstrap.Modal(document.getElementById('addEventModal')); // Initialize the modal
    const eventForm = document.getElementById('eventAddForm'); // Reference to the form
    const eventFormEdit = document.getElementById('eventEditForm'); // Reference to the form

    if (!calendarEl) {
        console.error('Element with ID "calendar" not found.');
        return;
    }

    let openDetailDate = null;

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        eventSources: [
        {
            url: '/api_db/get-schedule',
            method: 'GET',
            failure: () => toastr.error("Failed to load schedule events")
        },
        {
            url: '/api_db/get-request',
            method: 'GET',
            failure: () => toastr.error("Failed to load request events"),
            success: function(data) {
                return data.data; // Access the 'data' property and return the events
            }
        }
        ],
        headerToolbar: false,
        height: 'auto',

        datesSet: function(info) {
            const date = new Date(info.view.currentStart);
            const options = { month: 'long', year: 'numeric' };
            dateDisplay.textContent = date.toLocaleDateString(undefined, options);
        },

        dateClick: function(info) {
            const clickedDate = info.dateStr;

            if (openDetailDate === clickedDate) {
                document.querySelectorAll('.fc-custom-detail-row').forEach(el => el.remove());
                openDetailDate = null;
                return;
            }

            document.querySelectorAll('.fc-custom-detail-row').forEach(el => el.remove());

            const clicked = new Date(clickedDate);
            clicked.setHours(0, 0, 0, 0);

            const eventsForDate = calendar.getEvents().filter(event => {
                const start = new Date(event.start);
                let end = new Date(event.end || event.start);

                // If all-day event and end has time 00:00, subtract 1 day for accurate range
                if (event.allDay && end.getHours() === 0 && end.getMinutes() === 0) {
                    end.setDate(end.getDate() - 1);
                }

                // Normalize times for comparison
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                return clicked >= start && clicked <= end;
            });

            const detailRow = document.createElement('tr');
            detailRow.className = 'fc-custom-detail-row';

            const detailCell = document.createElement('td');
            detailCell.colSpan = 7;

            if (eventsForDate.length > 0) {
                // Group events
                const parishEvents = eventsForDate.filter(ev => {
                    return !ev.classNames.includes("event-request") && !ev.classNames.includes("event-holiday");
                });

                const requestEvents = eventsForDate.filter(ev => ev.classNames.includes("event-request"));
                const holidayEvents = eventsForDate.filter(ev => ev.classNames.includes("event-holiday"));

                const formatDate = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const formatTime = (date) => date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

                const formatDateTime = (date) => `${formatDate(date)} (${formatTime(date)})`;

                // Format Parish Events
                let parishItems = '';
                if (parishEvents.length > 0) {
                    const sortedParishEvents = parishEvents.sort((a, b) => a.start - b.start);

                    parishItems = sortedParishEvents.map(ev => {
                        const start = ev.start;
                        const end = ev.end;
                        const description = ev.extendedProps.description || '';

                        let timeDisplay = '';
                        if (start && end) {
                            const isSameDay = start.toDateString() === end.toDateString();
                            if (
                                start.getHours() === 0 && start.getMinutes() === 0 &&
                                end.getHours() === 23 && end.getMinutes() === 59
                            ) {
                                timeDisplay = `All day`;
                            } else if (isSameDay) {
                                timeDisplay = `${formatTime(start)} - ${formatTime(end)}`;
                            } else {
                                timeDisplay = `${formatDateTime(start)} - ${formatDateTime(end)}`;
                            }
                        }

                        return `
                            <li>
                                <em>${timeDisplay}</em> ${ev.title}<br>
                                <small class="text-muted">${description}</small>
                            </li>`;
                    }).join('');
                }


                // Function to convert a string to title case
                const toTitleCase = str => str.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

                // Format Document Requests
                let requestItems = '';
                if (requestEvents.length > 0) {
                    // Group the request events by status
                    const groupedRequests = requestEvents.reduce((groups, ev) => {
                        const status = ev.extendedProps.status || 'Unknown';  // Group by status
                        if (!groups[status]) {
                            groups[status] = [];
                        }
                        groups[status].push(ev);
                        return groups;
                    }, {});

                    // Create HTML for each group
                    for (let status in groupedRequests) {
                        const requests = groupedRequests[status];
                        
                        let requestListItems = '';
                        const sortedRequests = requests.sort((a, b) => new Date(a.start) - new Date(b.start));

                        requestListItems = sortedRequests.map(ev => {
                            const ceremony = ev.extendedProps.ceremony 
                                ? toTitleCase(ev.extendedProps.ceremony) 
                                : '';
                            const recName = ev.extendedProps.rec_name || '';
                            const requestor = ev.extendedProps.requestor || '';
                            const cerDate = ev.extendedProps.cer_date 
                                ? new Date(ev.extendedProps.cer_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                                : '';

                            return ` 
                                <li>
                                    <em>${requestor}</em> – ${ceremony} (${cerDate}) for <strong>${recName}</strong>
                                </li>`;
                        }).join('');

                        // Append the status heading in title case and the request items for that status
                        requestItems += `
                            <em>${toTitleCase(status)}</em>
                            <ul>
                                ${requestListItems}
                            </ul>`;
                    }
                }



                // Format Holidays
                let holidayItems = '';
                if (holidayEvents.length > 0) {
                    holidayItems = holidayEvents.map(ev => {
                        const title = ev.title || 'Holiday';
                        return `
                            <li>
                                <strong>Holiday:</strong> <em>${title}</em>
                            </li>`;
                    }).join('');
                }

                let requestSection = '';
                if (requestItems) {
                    requestSection = `
                        <strong>Documents for Release:</strong>
                        <ul>
                            ${requestItems}
                        </ul>`;
                }

                let holidaySection = '';
                if (holidayItems) {
                    holidaySection = `
                        <strong>Holidays:</strong>
                        <ul>
                            ${holidayItems}
                        </ul>`;
                }

                let scheduleSection = '';
                if (parishItems) {
                    scheduleSection = `
                        <strong>Schedules for ${new Date(clickedDate).toDateString()}:</strong>
                        <ul>
                            ${parishItems}
                        </ul>`;
                }


                // Build the final display
                detailCell.innerHTML = holidaySection + scheduleSection + requestSection;
            } else {
                detailCell.innerHTML = `<em>No schedules for ${new Date(clickedDate).toDateString()}</em>`;
            }



            detailRow.appendChild(detailCell);

            const dayCell = document.querySelector(`.fc-daygrid-day[data-date="${clickedDate}"]`);
            if (dayCell) {
                const row = dayCell.closest('tr');
                if (row && row.parentNode) {
                    row.parentNode.insertBefore(detailRow, row.nextSibling);
                }
            }

            openDetailDate = clickedDate;
        },

        dayCellDidMount: function(info) {
            const day = info.date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

            if (day >= 3 && day <= 5) { // Wednesday to Friday
                info.el.classList.add('highlight-wed-fri');
            }
        },

        eventDidMount: function(info) {
            if (info.event.classNames.includes('event-request')) {
                return; // Prevent double-click from working
            }
            info.el.addEventListener('dblclick', function() {
                const event = info.event;

                // Store for editing later
                currentEvent = event;

                function toInputFormat(date) {
                    if (!date) return '';

                    const pad = n => n.toString().padStart(2, '0');

                    const year = date.getFullYear();
                    const month = pad(date.getMonth() + 1);
                    const day = pad(date.getDate());
                    const hours = pad(date.getHours());
                    const minutes = pad(date.getMinutes());

                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                }

                console.log(event.start)
                console.log(toInputFormat(event.start))


                // Fill the modal with event data
                console.log("Data Passed: ", event)
                document.getElementById('schedId').value = event.id;
                document.getElementById('eventTitleEdit').value = event.title;
                document.getElementById('eventStartEdit').value = toInputFormat(event.start);
                document.getElementById('eventEndEdit').value = toInputFormat(event.end);
                document.getElementById('eventDescriptionEdit').value = event.extendedProps.description;
                document.getElementById('eventCategoryEdit').value = event.extendedProps.category;
                document.getElementById('eventStatusEdit').value = event.extendedProps.status;

                // Show the edit modal
                new bootstrap.Modal(document.getElementById('editEventModal')).show();
            });
        }

    });

    calendar.render();

    // Previous/Next buttons event listeners
    document.getElementById('prevBtn').addEventListener('click', () => {
        calendar.prev();
        openDetailDate = null;
        document.querySelectorAll('.fc-custom-detail-row').forEach(el => el.remove());
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        calendar.next();
        openDetailDate = null;
        document.querySelectorAll('.fc-custom-detail-row').forEach(el => el.remove());
    });

    // New "Go to Current Month" button event listener
    document.getElementById('currentMonthBtn').addEventListener('click', () => {
        calendar.today(); // This will take the calendar to the current month
        openDetailDate = null;
        document.querySelectorAll('.fc-custom-detail-row').forEach(el => el.remove());
    });

    function formatTime(date) {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return new Date(date).toLocaleTimeString([], options);
    }

    // // POPOVER JS
    // const filterButton = document.getElementById('requestPopover');
    // const requestContent = document.getElementById('requestContent').innerHTML;

    // const popover = new bootstrap.Popover(filterButton, {
    //     content: requestContent,
    //     html: true,
    //     sanitize: false,
    //     trigger: 'manual'
    // });

    // let selectedStart = moment().subtract(29, 'days');
    // let selectedEnd = moment();

    // function cb(start, end) {
    //     selectedStart = start;
    //     selectedEnd = end;
    //     $('#requestrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    //     fetchRecordCount(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    // }

    // // Add manual toggle on button click
    // filterButton.addEventListener('click', function () {
    //     const popoverId = filterButton.getAttribute('aria-describedby');
    //     if (popoverId) {
    //         popover.hide();
    //     } else {
    //         popover.show();
    //     }
    // });

    // filterButton.addEventListener('shown.bs.popover', function () {
    //     const $popoverBody = $('.popover-body');

    //     $popoverBody.find('#requestrange').daterangepicker({
    //         startDate: selectedStart,
    //         endDate: selectedEnd,
    //         ranges: {
    //             'Today': [moment(), moment()],
    //             'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    //             'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    //             'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    //             'This Month': [moment().startOf('month'), moment().endOf('month')],
    //             'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    //         }
    //     }, cb);

    //     cb(selectedStart, selectedEnd);
    // });

    // document.addEventListener('click', function (event) {
    //     const popoverId = filterButton.getAttribute('aria-describedby');
    //     const popoverElement = popoverId ? document.getElementById(popoverId) : null;
    //     const isInPopover = popoverElement && popoverElement.contains(event.target);
    //     const isInButton = filterButton.contains(event.target);
    //     const isInDatepicker = $(event.target).closest('.daterangepicker').length > 0;

    //     if (!isInPopover && !isInButton && !isInDatepicker) {
    //         popover.hide();
    //     }
    // });

    // function fetchRequestCount(startDate, endDate) {
    //     $.ajax({
    //         url: `/api_db/get-request-count?start=${startDate}&end=${endDate}`,
    //         type: "GET",
    //         success: function (data) {
    //             $(".reviewCount").text(data.pending || 0);
    //             $(".inprogCount").text(data.processing || 0);
    //             $(".pickupCount").text(data.ready || 0);
    //             $(".rejectCount").text(data.rejected || 0);
    //             $(".cancelCount").text(data.cancelled || 0);
    //             $(".completeCount").text(data.completed || 0);
    //         },
    //         error: function () {
    //             console.error("Error fetching record count.");
    //         }
    //     });
    // }

    // fetchRequestCount(selectedStart.format('YYYY-MM-DD'), selectedEnd.format('YYYY-MM-DD'));

    const allDayCheckbox = document.getElementById('allDayCheckbox');
    const allDayCheckboxEdit = document.getElementById('allDayCheckboxEdit');
    const startInput = document.getElementById('eventStart');
    const endInput = document.getElementById('eventEnd');
    const startInputEdit = document.getElementById('eventStartEdit');
    const endInputEdit = document.getElementById('eventEndEdit');

    document.getElementById('addEventModal').addEventListener('hidden.bs.modal', function () {
        const allDayCheckbox = document.getElementById('allDayCheckbox');
        allDayCheckbox.checked = false;
        // Reset form
        eventForm.reset();

        // Re-enable the end date field if the checkbox is unchecked
        endInput.disabled = false;

        // Reset the all-day checkbox
        allDayCheckbox.checked = false;

        // Clear any previously set values for start and end date
        startInput.value = '';
        endInput.value = '';
    });

    document.getElementById('editEventModal').addEventListener('hidden.bs.modal', function () {
        // Reset form
        eventFormEdit.reset();

        // Re-enable the end date field if the checkbox is unchecked
        endInputEdit.disabled = false;

        // Reset the all-day checkbox
        allDayCheckboxEdit.checked = false;

        // Clear any previously set values for start and end date
        startInputEdit = '';
        endInputEdit = '';
    });

    

    if (!allDayCheckbox || !allDayCheckboxEdit || !startInput || !endInput || !startInputEdit || !endInputEdit) {
        console.warn("Some form elements were not found in the DOM.");
        return;
    }

    function formatToDatetimeLocal(dateObj) {
        const pad = (n) => String(n).padStart(2, '0');
        const year = dateObj.getFullYear();
        const month = pad(dateObj.getMonth() + 1);
        const day = pad(dateObj.getDate());
        const hours = pad(dateObj.getHours());
        const minutes = pad(dateObj.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    allDayCheckbox.addEventListener('change', function () {
        if (this.checked && startInput.value) {
            const startDate = new Date(startInput.value);
            startDate.setHours(0, 0); // Set start to 00:00
            startInput.value = formatToDatetimeLocal(startDate);

            const endDate = new Date(startDate);
            endDate.setHours(23, 59); // Set end to 23:59
            endInput.value = formatToDatetimeLocal(endDate);

        } else {
            endInput.disabled = false;
        }
    });

    allDayCheckboxEdit.addEventListener('change', function () {
        if (this.checked && startInputEdit.value) {
            const startDate = new Date(startInputEdit.value);
            startDate.setHours(0, 0); // Set start to 00:00
            startInputEdit.value = formatToDatetimeLocal(startDate);

            const endDate = new Date(startDate);
            endDate.setHours(23, 59); // Set end to 23:59
            endInputEdit.value = formatToDatetimeLocal(endDate);

        } else {
            endInputEdit.disabled = false;
        }
    });

    startInput.addEventListener('change', function () {
        if (allDayCheckbox.checked && startInput.value) {
            const startDate = new Date(startInput.value);
            startDate.setHours(0, 0); // Ensure start at 00:00
            startInput.value = formatToDatetimeLocal(startDate);

            const endDate = new Date(startDate);
            endDate.setHours(23, 59); // End of same day
            endInput.value = formatToDatetimeLocal(endDate);
        }
    });  
    
    $("#eventAddForm").on("submit", function (event) {
        event.preventDefault();
    
        let isValid = true; 
        let missingFields = []; 
    
        $(this).find("[required]").each(function () {
            let value = $(this).val();
            
            if (!value || value.trim() === "") { 
                isValid = false;
                missingFields.push($(this).attr("name"));
                $(this).addClass("error-highlight");
            } else {
                $(this).removeClass("error-highlight");
            }
        });
        
    
        if (!isValid) {
            event.preventDefault(); 
            toastr.warning("Please fill in the required fields: " + missingFields.join(", "));
            return false;
        }

        // Add to BOTH submit handlers before AJAX call
        const start = new Date($(this).find("[name='eventStart']").val());
        const end = new Date($(this).find("[name='eventEnd']").val());

        if (end <= start) {
            toastr.warning("End date/time must be later than Start date/time.");
            return false;
        }


        let formData = $(this).serialize();
        console.log("Data being sent:", formData); 
        
        $.ajax({
            type: "POST",
            url: "/submit-schedule",  
            data: formData, 
            success: function (response) {
                console.log("Server Response:", response);

                if (response.message && response.type) {
                    toastr[response.type](response.message); 

                    if (response.type === "success") {

                        $("#eventAddForm")[0].reset();

                        $("#addEventModal").modal("hide");

                        // Close any open detail row
                        document.querySelectorAll('.fc-custom-detail-row').forEach(el => el.remove());

                        // Clear the openDetailDate variable if it's being used globally
                        if (typeof openDetailDate !== "undefined") {
                            openDetailDate = null;
                        }

                        calendar.refetchEvents();  
                    }
                } else {
                    toastr.error("Unexpected response format!");
                }

            },
            error: function (xhr) {
                console.error("AJAX Error:", xhr);

                let errorMessage = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : "An error occurred while submitting the event.";
                toastr.error(errorMessage);
            }
        });
    }); 

    $("#eventEditForm").on("submit", function (event) {
        event.preventDefault();
        
        let isValid = true; 
        let missingFields = []; 
    
        // Check if all required fields are filled
        $(this).find("[required]").each(function () {
            let value = $(this).val();
            
            if (!value || value.trim() === "") { 
                isValid = false;
                missingFields.push($(this).attr("name"));
                $(this).addClass("error-highlight");
            } else {
                $(this).removeClass("error-highlight");
            }
        });
        
        // If validation fails, show a warning
        if (!isValid) {
            event.preventDefault(); 
            toastr.warning("Please fill in the required fields: " + missingFields.join(", "));
            return false;
        }

        // Add to BOTH submit handlers before AJAX call
        const start = new Date($(this).find("[name='eventStartEdit']").val());
        const end = new Date($(this).find("[name='eventEndEdit']").val());

        if (end <= start) {
            toastr.warning("End date/time must be later than Start date/time.");
            return false;
        }

    
        // Serialize the form data for submission
        let formData = $(this).serialize();
        console.log("Data being sent:", formData); 

        const schedId = $("#schedId").val();

        console.log("Edit: ", schedId)
    
        // Send the data via AJAX to edit the priest record
        $.ajax({
            type: "PUT",
            url: `/edit-schedule/${schedId}`, 
            data: formData,
            success: function (response) {
                console.log("Server Response:", response);
    
                if (response.message && response.type) {
                    toastr[response.type](response.message); 
    
                    if (response.type === "success") {
                        
                        $("#eventEditForm")[0].reset();

                        $("#editEventModal").modal("hide");

                        // Close any open detail row
                        document.querySelectorAll('.fc-custom-detail-row').forEach(el => el.remove());

                        // Clear the openDetailDate variable if it's being used globally
                        if (typeof openDetailDate !== "undefined") {
                            openDetailDate = null;
                        }

                        calendar.refetchEvents(); 
                    } 
                } else {
                    toastr.error("Unexpected response format!");
                }
            },
            error: function (xhr) {
                console.error("AJAX Error:", xhr);
                
                let errorMessage = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : "An error occurred while editing the priest record.";
                toastr.error(errorMessage);
            }
        });
    });

    document.getElementById('deleteEventBtn').addEventListener("click", function(event) {
        console.log("Delete Pressed");

        event.preventDefault();
        
        const schedId = $("#schedId").val();

        Swal.fire({
            title: `Delete Event?`,
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.isConfirmed) {
    
                $.ajax({
                    type: "DELETE",
                    url: `/delete-schedule/${schedId}`,
                    success: function(response) {
                        console.log("Record deleted successfully:", response);
                        Swal.fire('Deleted!', 'The record has been deleted.', 'success');
                        $("#editEventModal").modal("hide");

                        calendar.refetchEvents(); 
                    },
                    error: function(xhr) {
                        console.error("Error deleting record:", xhr);
                        Swal.fire('Error!', 'There was an issue deleting the record.', 'error');
                    }
                });
            }
        });
    });


    const helpTooltip = new bootstrap.Tooltip(document.getElementById('calendarHelpIcon'), {
        title: `
            <div>
                <div><span class="tooltip-box active-event">Active</span></div>
                <div><span class="tooltip-box canceled-event">Canceled</span></div>
                <div><span class="tooltip-box postponed-event">Postponed</span></div>
                <div><span class="tooltip-box holiday-event">Holiday</span></div>

                <hr class="my-1">
                <div><span class="circle-indicator bg-success me-1"></span>Parish Activity</div>
                <div><span class="circle-indicator bg-warning me-1"></span>Request</div>
            </div>
        `,
        html: true,
        placement: 'left',
    });

    document.getElementById("toggleCalendarBtn").addEventListener("click", function () {
        const calendar = document.getElementById("calendarContainer");
        const request = document.getElementById("requestContainer");

        if (calendar.style.display === "none") {
            // Show calendar
            calendar.style.display = "block";
            calendar.classList.add("col-lg-5");
            request.classList.remove("col-lg-12");
            request.classList.add("col-lg-7");
        } else {
            // Hide calendar
            calendar.style.display = "none";
            calendar.classList.remove("col-lg-5");
            request.classList.remove("col-lg-7");
            request.classList.add("col-lg-12");
        }
    });

    $('#requestTable').on('change', '.status-dropdown', function () {
        const newStatus = $(this).val();
        const requestId = $(this).data('id');

        $.ajax({
            url: `/update-request-status/${requestId}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ status: newStatus }),
            success: function (response) {
                console.log("Server Response:", response);
    
                if (response.message && response.type) {
                    toastr[response.type](response.message); 
    
                    if (response.type === "success") {
                      $('#requestTable').DataTable().ajax.reload(); 
                    } 
                } else {
                    toastr.error("Unexpected response format!");
                }
            },
            error: function (xhr) {
                console.error("AJAX Error:", xhr);
                
                let errorMessage = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : "An error occurred while editing the priest record.";
                toastr.error(errorMessage);
            }
        });
    });

    $(document).on('click', '.search-record-btn', function () {
        const ceremony = $(this).data('ceremony');
        const recName = $(this).data('rec-name');
        const cerDate = $(this).data('cer-date');

        $.ajax({
            url: '/api_db/search-record',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                ceremony: ceremony,
                rec_name: recName,
                cer_date: cerDate
            }),
            success: function (response) {
                if (response.found) {
                    // Redirect to record detail or display info
                    window.location.href = response.url;  // You can define this on the backend
                } else {
                    alert("No matching record found.");
                }
            },
            error: function () {
                alert("An error occurred while searching for the record.");
            }
        });
    });



});
