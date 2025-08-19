document.addEventListener('DOMContentLoaded', () => {

    // === IDENTIFICADORES DE PÁGINA ===
    const isIndexPage = document.getElementById('patient-list');
    const isAddPatientPage = document.getElementById('add-patient-form');
    const isPatientDetailsPage = document.getElementById('session-form');
    const isNotesPage = document.getElementById('note-form');
    const isSchedulePage = document.getElementById('schedule-body');

    // === FUNÇÕES GLOBAIS DE BANCO DE DADOS (localStorage) ===
    function getFromDB(key) { return JSON.parse(localStorage.getItem(key)) || []; }
    function saveToDB(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
    function getPatientById(id) { const patients = getFromDB('patientsDB_marcella'); return patients.find(p => p.id === id); }
    
    // === LÓGICA DA PÁGINA DE CADASTRO (add-patient.html) ===
    if (isAddPatientPage) {
        isAddPatientPage.addEventListener('submit', (e) => {
            e.preventDefault();
            const serviceTypeInput = document.querySelector('input[name="serviceType"]:checked');
            const newPatient = {
                id: Date.now(),
                name: document.getElementById('name').value.trim(),
                dob: document.getElementById('dob').value,
                age: document.getElementById('age').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value.trim(),
                serviceType: serviceTypeInput ? serviceTypeInput.value : "Não especificado",
                mainComplaint: document.getElementById('main-complaint').value.trim(),
                sessions: []
            };
            const patients = getFromDB('patientsDB_marcella');
            patients.push(newPatient);
            saveToDB('patientsDB_marcella', patients);
            alert('Cliente salvo com sucesso!');
            window.location.href = 'index.html';
        });
    }

    // === LÓGICA DA PÁGINA INICIAL (index.html) ===
    if (isIndexPage) {
        const patients = getFromDB('patientsDB_marcella');
        if (patients.length === 0) {
            isIndexPage.innerHTML = '<div class="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">Nenhum cliente cadastrado ainda.</div>';
        } else {
            isIndexPage.innerHTML = '';
            patients.sort((a, b) => a.name.localeCompare(b.name)).forEach(patient => {
                const patientCard = document.createElement('a');
                patientCard.href = `patient-details.html?id=${patient.id}`;
                patientCard.className = 'block bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all';
                patientCard.innerHTML = `<div class="flex justify-between items-center"><div><h3 class="text-xl font-bold text-gray-800">${patient.name}</h3><p class="text-gray-500">${patient.serviceType} - ${patient.age ? patient.age + ' anos' : 'Idade não informada'}</p></div><span class="text-blue-600 font-semibold">Ver Histórico &rarr;</span></div>`;
                isIndexPage.appendChild(patientCard);
            });
        }
    }
    
    // === LÓGICA DA PÁGINA DE DETALHES (patient-details.html) ===
    if (isPatientDetailsPage) {
        // ... (código existente da página de detalhes) ...
    }
    
    // === LÓGICA DA PÁGINA DE ANOTAÇÕES (notes.html) ===
    if (isNotesPage) {
        // ... (código existente da página de anotações) ...
    }
    
    // === LÓGICA DA PÁGINA DE HORÁRIOS (schedule.html) ===
    if (isSchedulePage) {
        const monthYearEl = document.getElementById('month-year');
        const calendarBody = document.getElementById('calendar-body');
        const prevMonthBtn = document.getElementById('prev-month-btn');
        const nextMonthBtn = document.getElementById('next-month-btn');
        const clearButton = document.getElementById('clear-schedule-btn');

        let currentDate = new Date();

        function renderCalendar(date) {
            calendarBody.innerHTML = '';
            const year = date.getFullYear();
            const month = date.getMonth();
            const today = new Date();

            const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
            monthYearEl.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;

            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const scheduleData = JSON.parse(localStorage.getItem('scheduleDB_marcella')) || {};

            let dayCounter = 1;
            for (let i = 0; i < 6; i++) { // 6 semanas para cobrir todos os cenários
                const row = document.createElement('tr');
                for (let j = 0; j < 7; j++) {
                    const cell = document.createElement('td');
                    if (i === 0 && j < firstDayOfMonth) {
                        cell.classList.add('other-month');
                    } else if (dayCounter > daysInMonth) {
                        cell.classList.add('other-month');
                    } else {
                        const fullDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
                        cell.dataset.date = fullDateStr;

                        const dayNumberDiv = document.createElement('div');
                        dayNumberDiv.className = 'day-number';
                        dayNumberDiv.textContent = dayCounter;
                        
                        if (dayCounter === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                            cell.classList.add('current-day');
                        }
                        
                        cell.appendChild(dayNumberDiv);

                        // Adiciona agendamentos salvos
                        if (scheduleData[fullDateStr]) {
                            scheduleData[fullDateStr].forEach(appt => {
                                const apptEl = document.createElement('div');
                                apptEl.className = 'appointment';
                                apptEl.textContent = appt;
                                cell.appendChild(apptEl);
                            });
                        }
                        dayCounter++;
                    }
                    row.appendChild(cell);
                }
                calendarBody.appendChild(row);
                if (dayCounter > daysInMonth) break; // Para de criar semanas se o mês acabou
            }
        }

        calendarBody.addEventListener('click', (e) => {
            const cell = e.target.closest('td');
            if (cell && cell.dataset.date) {
                const date = cell.dataset.date;
                const scheduleData = JSON.parse(localStorage.getItem('scheduleDB_marcella')) || {};
                const appointments = scheduleData[date] || [];

                let actionText = "Digite o horário e nome do cliente (ex: 09:00 - Ana Clara).\nPara limpar um horário, digite 'limpar' seguido do horário (ex: limpar 09:00).";
                if (appointments.length > 0) {
                    actionText = `Agendamentos para ${new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}:\n- ${appointments.join('\n- ')}\n\n${actionText}`;
                }

                const response = prompt(actionText);

                if (response) {
                    const lowerResponse = response.toLowerCase();
                    if (lowerResponse.startsWith('limpar')) {
                        const timeToClear = lowerResponse.replace('limpar', '').trim().slice(0, 5);
                        scheduleData[date] = appointments.filter(appt => !appt.startsWith(timeToClear));
                        if (scheduleData[date].length === 0) {
                            delete scheduleData[date];
                        }
                    } else {
                        if (!scheduleData[date]) {
                            scheduleData[date] = [];
                        }
                        scheduleData[date].push(response);
                        scheduleData[date].sort(); // Ordena os horários
                    }
                    saveToDB('scheduleDB_marcella', scheduleData);
                    renderCalendar(currentDate);
                }
            }
        });

        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });
        
        clearButton.addEventListener('click', () => {
            if (confirm("TEM CERTEZA?\nIsso irá apagar TODOS os agendamentos do mês visível.")) {
                const scheduleData = JSON.parse(localStorage.getItem('scheduleDB_marcella')) || {};
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const monthPrefix = `${year}-${month}`;
                
                Object.keys(scheduleData).forEach(key => {
                    if (key.startsWith(monthPrefix)) {
                        delete scheduleData[key];
                    }
                });
                saveToDB('scheduleDB_marcella', scheduleData);
                renderCalendar(currentDate);
            }
        });

        renderCalendar(currentDate);
    }
});
