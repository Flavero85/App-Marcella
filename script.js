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
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = parseInt(urlParams.get('id'));
        let patient = getPatientById(patientId);
        
        const patientNameEl = document.getElementById('patient-name');
        const patientDetailsContainer = document.getElementById('patient-details-container');
        const patientComplaintContainer = document.getElementById('patient-complaint-container');
        const sessionForm = document.getElementById('session-form');
        const sessionList = document.getElementById('session-list');
        const deletePatientBtn = document.getElementById('delete-patient-btn');

        function renderSessions() {
            sessionList.innerHTML = '';
            if (!patient.sessions || patient.sessions.length === 0) {
                sessionList.innerHTML = '<p class="text-gray-500 text-center">Nenhuma sessão registrada.</p>';
                return;
            }
            patient.sessions.slice().reverse().forEach(session => {
                const sessionCard = document.createElement('div');
                sessionCard.className = 'session-card relative p-4 rounded-lg border border-gray-200 animate-fade-in';
                const dataFormatada = new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'});
                sessionCard.innerHTML = `
                    <p class="text-sm font-semibold text-gray-500">${dataFormatada}</p>
                    <p class="mt-2 text-gray-700 whitespace-pre-wrap">${session.note}</p>
                    <button data-session-id="${session.date}" class="delete-session-btn absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                    </button>
                `;
                sessionList.appendChild(sessionCard);
            });
        }

        if (patient) {
            patientNameEl.textContent = patient.name;
            document.title = patient.name;
            patientDetailsContainer.innerHTML = `
                <div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-telephone-fill text-gray-400 flex-shrink-0" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.28 1.465l-2.135 2.135a11.945 11.945 0 0 0 6.014 6.014l2.135-2.135a1.745 1.745 0 0 1 1.465.28l2.305 1.729c.423.329.974.445 1.465.28l.005-.004a1.745 1.745 0 0 1 .163 2.61l-1.01 1.01a1.745 1.745 0 0 1-2.573 0l-2.38-2.379a1.873 1.873 0 0 1-1.14-1.445l-.004-.005c-.244-.79-.588-1.547-.99-2.24l-.005-.009a12.01 12.01 0 0 0-2.24-.99l-.009-.005a1.873 1.873 0 0 1-1.445-1.14l-2.379-2.38a1.745 1.745 0 0 1 0-2.573l1.01-1.01z"/></svg><span>${patient.phone || 'Não informado'}</span></div>
                <div class="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person-badge text-gray-400 flex-shrink-0" viewBox="0 0 16 16"><path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M4.5 0A2.5 2.5 0 0 0 2 2.5v11A2.5 2.5 0 0 0 4.5 16h7a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 11.5 0h-7zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5v-11z"/></svg><span>${patient.age ? patient.age + ' anos' : 'Não informado'}</span></div>
                <div class="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-geo-alt-fill text-gray-400 flex-shrink-0" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg><span class="flex-1">${patient.address || 'Não informado'}</span></div>
                <div class="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart-pulse text-gray-400 flex-shrink-0" viewBox="0 0 16 16"><path d="M10.835 12.184a.5.5 0 0 0-.75.434V14.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1.882a.5.5 0 0 0-.75-.434L11 12.446l-.165-.262z"/><path d="M11.334 3.065a.5.5 0 0 0-.708 0L8.5 5.166l-.826-1.377a.5.5 0 0 0-.858 0L6.002 5.166 4.87 3.065a.5.5 0 0 0-.708.708l1.36 2.267.002.003a.5.5 0 0 0 .858 0L8 4.202l1.834 1.834a.5.5 0 0 0 .708 0l1.36-1.36a.5.5 0 0 0 0-.708l-1.36-1.36zM8 3.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5z"/><path d="M7.5 6.5A.5.5 0 0 1 8 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5zm2 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5z"/><path d="M8.034 0a1.5 1.5 0 0 1 1.06.44l4.5 4.5a1.5 1.5 0 0 1 0 2.12l-4.5 4.5a1.5 1.5 0 0 1-2.12 0l-4.5-4.5a1.5 1.5 0 0 1 0-2.12l4.5-4.5A1.5 1.5 0 0 1 8.034 0zM8 1a.5.5 0 0 0-.354.146l-4.5 4.5a.5.5 0 0 0 0 .708l4.5 4.5a.5.5 0 0 0 .708 0l4.5-4.5a.5.5 0 0 0 0-.708l-4.5-4.5A.5.5 0 0 0 8 1z"/></svg><span>${patient.serviceType}</span></div>`;
            patientComplaintContainer.innerHTML = `<h3 class="font-semibold text-gray-700">Queixa Principal / Objetivos</h3><p class="mt-2 text-gray-600 whitespace-pre-wrap">${patient.mainComplaint || 'Não informado'}</p>`;
            
            renderSessions();

            sessionForm.addEventListener('submit', (e) => { e.preventDefault(); const note = document.getElementById('anotacao').value.trim(); if (!note) return; const newSession = { date: new Date().toISOString(), note: note }; if (!patient.sessions) patient.sessions = []; patient.sessions.push(newSession); let patients = getFromDB('patientsDB_marcella'); const patientIndex = patients.findIndex(p => p.id === patientId); patients[patientIndex] = patient; saveToDB('patientsDB_marcella', patients); renderSessions(); sessionForm.reset(); });
            
            sessionList.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.delete-session-btn');
                if (deleteBtn) {
                    const sessionId = deleteBtn.dataset.sessionId;
                    if (confirm('Tem certeza que deseja excluir esta anotação de sessão?')) {
                        patient.sessions = patient.sessions.filter(s => s.date !== sessionId);
                        let patients = getFromDB('patientsDB_marcella');
                        const patientIndex = patients.findIndex(p => p.id === patientId);
                        patients[patientIndex] = patient;
                        saveToDB('patientsDB_marcella', patients);
                        renderSessions();
                    }
                }
            });

            deletePatientBtn.addEventListener('click', () => {
                if (confirm(`TEM CERTEZA que deseja excluir permanentemente o cliente "${patient.name}"?\n\nTodos os dados e históricos de sessão serão perdidos.`)) {
                    let patients = getFromDB('patientsDB_marcella');
                    patients = patients.filter(p => p.id !== patientId);
                    saveToDB('patientsDB_marcella', patients);
                    alert(`Cliente "${patient.name}" excluído com sucesso.`);
                    window.location.href = 'index.html';
                }
            });
        } else {
            patientNameEl.textContent = 'Cliente não encontrado';
        }
    }
    
    // === LÓGICA DA PÁGINA DE ANOTAÇÕES (notes.html) ===
    if (isNotesPage) {
        const noteForm = document.getElementById('note-form');
        const notesList = document.getElementById('notes-list');
        const noteTitleInput = document.getElementById('note-title');
        const noteContentInput = document.getElementById('note-content');

        function renderNotes() {
            const notes = getFromDB('notesDB_marcella');
            notesList.innerHTML = '';
            if (notes.length === 0) {
                notesList.innerHTML = '<div class="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">Nenhuma anotação salva.</div>';
                return;
            }
            notes.slice().reverse().forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = 'note-card relative bg-white p-6 rounded-xl shadow-md';
                noteCard.innerHTML = `
                    <h3 class="font-bold text-lg text-gray-800">${note.title || 'Anotação'}</h3>
                    <p class="text-gray-500 text-sm mb-4">${new Date(note.id).toLocaleDateString('pt-BR')}</p>
                    <p class="text-gray-700 whitespace-pre-wrap">${note.content}</p>
                    <button data-id="${note.id}" class="delete-btn absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                    </button>
                `;
                notesList.appendChild(noteCard);
            });
        }
        
        noteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newNote = { id: Date.now(), title: noteTitleInput.value.trim(), content: noteContentInput.value.trim() };
            const notes = getFromDB('notesDB_marcella');
            notes.push(newNote);
            saveToDB('notesDB_marcella', notes);
            noteForm.reset();
            renderNotes();
        });

        notesList.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                const noteId = parseInt(e.target.closest('.delete-btn').dataset.id);
                if (confirm('Tem certeza que deseja excluir esta anotação?')) {
                    let notes = getFromDB('notesDB_marcella');
                    notes = notes.filter(note => note.id !== noteId);
                    saveToDB('notesDB_marcella', notes);
                    renderNotes();
                }
            }
        });
        renderNotes();
    }
    
    // === LÓGICA DA PÁGINA DE HORÁRIOS (schedule.html) ===
    if (isSchedulePage) {
        const scheduleBody = document.getElementById('schedule-body');
        const clearButton = document.getElementById('clear-schedule-btn');
        const hours = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
        const days = ["seg", "ter", "qua", "qui", "sex"];

        function renderSchedule() {
            scheduleBody.innerHTML = '';
            const scheduleData = JSON.parse(localStorage.getItem('scheduleDB_marcella')) || {};
            hours.forEach(hour => {
                const row = document.createElement('tr');
                if (hour === "12:00") {
                    row.innerHTML = `<td colspan="6" class="p-2 font-semibold bg-blue-50 text-blue-800">Almoço</td>`;
                } else {
                    row.innerHTML = `<td class="p-3 font-medium bg-gray-50">${hour}</td>`;
                    days.forEach(day => {
                        const cellId = `${day}-${hour.replace(':', '')}`;
                        const cell = document.createElement('td');
                        cell.dataset.id = cellId;
                        const appointmentText = scheduleData[cellId];
                        if (appointmentText) {
                            cell.textContent = appointmentText;
                            cell.classList.add('filled');
                        }
                        row.appendChild(cell);
                    });
                }
                scheduleBody.appendChild(row);
            });
        }

        function saveSchedule(scheduleData) { saveToDB('scheduleDB_marcella', scheduleData); }

        scheduleBody.addEventListener('click', (e) => {
            if (e.target.tagName === 'TD' && e.target.dataset.id) {
                const cell = e.target;
                const cellId = cell.dataset.id;
                const currentContent = cell.textContent;
                const scheduleData = JSON.parse(localStorage.getItem('scheduleDB_marcella')) || {};
                
                if (currentContent) {
                    if (confirm(`Deseja limpar o horário de "${currentContent}"?`)) {
                        cell.textContent = '';
                        cell.classList.remove('filled');
                        delete scheduleData[cellId];
                        saveSchedule(scheduleData);
                    }
                } else {
                    const clientName = prompt("Digite o nome do cliente para este horário:");
                    if (clientName && clientName.trim() !== '') {
                        cell.textContent = clientName.trim();
                        cell.classList.add('filled');
                        scheduleData[cellId] = clientName.trim();
                        saveSchedule(scheduleData);
                    }
                }
            }
        });

        clearButton.addEventListener('click', () => {
            if (confirm("TEM CERTEZA?\nIsso irá apagar TODOS os agendamentos da semana.")) {
                localStorage.removeItem('scheduleDB_marcella');
                renderSchedule();
            }
        });
        renderSchedule();
    }
});
