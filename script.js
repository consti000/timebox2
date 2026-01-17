// 데이터 저장소
let appData = {
    date: '',
    priorities: {
        1: { text: '', completed: false },
        2: { text: '', completed: false },
        3: { text: '', completed: false }
    },
    brainDump: [],
    timeline: {},
    notes: ''
};

// Google Calendar API 설정
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // 사용자가 Google Cloud Console에서 발급받은 Client ID로 변경 필요
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // 사용자가 Google Cloud Console에서 발급받은 API Key로 변경 필요
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let gapiInited = false;
let gisInited = false;
let tokenClient = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    loadData();
    initPriorities();
    initBrainDump();
    initTimeline();
    initNotes();
    initGoogleCalendar();
});

// 요일 가져오기
function getWeekday(date) {
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return weekdays[date.getDay()];
}

// 날짜 형식 변환 함수
function convertDateFormat(inputValue) {
    let year, month, day;
    let datePattern;
    
    // yyyymmdd 형식 확인 (예: 20240115)
    datePattern = /^(\d{4})(\d{2})(\d{2})$/;
    let match = inputValue.match(datePattern);
    
    if (match) {
        year = match[1];
        month = parseInt(match[2], 10);
        day = parseInt(match[3], 10);
    } else {
        // yyyy-mm-dd 형식 확인 (예: 2024-01-15)
        datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
        match = inputValue.match(datePattern);
        
        if (match) {
            year = match[1];
            month = parseInt(match[2], 10);
            day = parseInt(match[3], 10);
        } else {
            return null;
        }
    }
    
    // 유효한 날짜인지 확인
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() == year && 
        date.getMonth() == month - 1 && 
        date.getDate() == day) {
        const weekday = getWeekday(date);
        return `${year}년 ${month}월 ${day}일 ${weekday}`;
    }
    
    return null;
}

// 날짜 초기화
function initDate() {
    const dateElement = document.getElementById('currentDate');
    
    // 저장된 날짜가 있으면 로드, 없으면 빈 값
    dateElement.value = appData.date || '';
    
    // 날짜 입력 이벤트
    dateElement.addEventListener('input', (e) => {
        let inputValue = e.target.value;
        
        // 날짜 형식 변환 시도
        const converted = convertDateFormat(inputValue);
        if (converted) {
            inputValue = converted;
            e.target.value = inputValue;
        }
        
        appData.date = inputValue;
        saveData();
    });
    
    // 포커스 아웃 시에도 변환 시도
    dateElement.addEventListener('blur', (e) => {
        let inputValue = e.target.value;
        const converted = convertDateFormat(inputValue);
        
        if (converted) {
            inputValue = converted;
            e.target.value = inputValue;
            appData.date = inputValue;
            saveData();
        }
    });
}

// Local Storage에서 데이터 로드
function loadData() {
    const saved = localStorage.getItem('timeboxPlanner');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // 데이터 구조 검증
            if (parsed && typeof parsed === 'object') {
                appData = { ...appData, ...parsed };
            }
        } catch (e) {
            console.error('데이터 로드 실패:', e);
            // 사용자에게 알림 (선택사항)
            // alert('저장된 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }
}

// Local Storage에 데이터 저장
function saveData() {
    try {
        localStorage.setItem('timeboxPlanner', JSON.stringify(appData));
    } catch (e) {
        console.error('데이터 저장 실패:', e);
        // LocalStorage 용량 초과 등의 경우 처리
        if (e.name === 'QuotaExceededError') {
            alert('저장 공간이 부족합니다. 일부 데이터를 삭제해주세요.');
        }
    }
}

// Priorities 초기화
function initPriorities() {
    const priorityInputs = document.querySelectorAll('.priority-input');
    const checkButtons = document.querySelectorAll('.check-btn');

    // 입력 필드에 저장된 값 로드
    priorityInputs.forEach(input => {
        const priorityId = input.dataset.priority;
        const data = appData.priorities[priorityId];
        if (data) {
            input.value = data.text;
            if (data.completed) {
                input.classList.add('completed');
                input.parentElement.querySelector('.check-btn').classList.add('completed');
            }
        }

        // 입력 이벤트
        input.addEventListener('input', (e) => {
            appData.priorities[priorityId].text = e.target.value;
            saveData();
        });

        // Enter 키로 다음 입력으로 이동
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextId = parseInt(priorityId) + 1;
                if (nextId <= 3) {
                    document.querySelector(`[data-priority="${nextId}"]`).focus();
                }
            }
        });

        // 드롭 이벤트 추가
        const priorityItem = input.parentElement;
        priorityItem.addEventListener('dragover', handlePriorityDragOver);
        priorityItem.addEventListener('drop', handlePriorityDrop);
        priorityItem.addEventListener('dragleave', handlePriorityDragLeave);
    });

    // 체크 버튼 이벤트
    checkButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const priorityId = btn.dataset.priority;
            const input = document.querySelector(`.priority-input[data-priority="${priorityId}"]`);
            const isCompleted = !appData.priorities[priorityId].completed;

            appData.priorities[priorityId].completed = isCompleted;
            
            if (isCompleted) {
                input.classList.add('completed');
                btn.classList.add('completed');
            } else {
                input.classList.remove('completed');
                btn.classList.remove('completed');
            }
            saveData();
        });
    });
}

// Brain Dump 초기화
function initBrainDump() {
    const input = document.getElementById('brainDumpInput');
    const addBtn = document.getElementById('addBrainDumpBtn');
    const list = document.getElementById('brainDumpList');

    // 저장된 항목들 렌더링
    renderBrainDumpList();

    // 추가 버튼 클릭
    addBtn.addEventListener('click', addBrainDumpItem);

    // Enter 키로 추가
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addBrainDumpItem();
        }
    });

    function addBrainDumpItem() {
        const text = input.value.trim();
        if (text === '') return;

        const newItem = {
            id: Date.now(),
            text: text,
            completed: false
        };

        appData.brainDump.push(newItem);
        input.value = '';
        saveData();
        renderBrainDumpList();
    }
}

// Brain Dump 리스트 렌더링
function renderBrainDumpList() {
    const list = document.getElementById('brainDumpList');
    list.innerHTML = '';

    appData.brainDump.forEach(item => {
        const li = document.createElement('li');
        li.className = 'brain-dump-item';
        li.draggable = true;
        li.dataset.id = item.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed;
        checkbox.addEventListener('change', () => {
            item.completed = checkbox.checked;
            label.classList.toggle('completed', item.completed);
            saveData();
        });

        const label = document.createElement('label');
        label.textContent = item.text;
        label.classList.toggle('completed', item.completed);
        label.addEventListener('click', (e) => {
            if (e.target === label) {
                checkbox.click();
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            appData.brainDump = appData.brainDump.filter(i => i.id !== item.id);
            saveData();
            renderBrainDumpList();
        });

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(deleteBtn);

        // 드래그 이벤트
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragend', handleDragEnd);

        list.appendChild(li);
    });
}

// Timeline 초기화
function initTimeline() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';

    // 06:00부터 24:00까지 30분 단위로 생성
    for (let hour = 6; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeKey = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const timeBlock = createTimeBlock(timeKey);
            container.appendChild(timeBlock);
        }
    }

    // 드롭 이벤트
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('click', handleTimelineClick);
}

// 타임블록 생성
function createTimeBlock(timeKey) {
    const block = document.createElement('div');
    block.className = 'time-block';
    block.dataset.time = timeKey;

    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = timeKey;

    const content = document.createElement('div');
    content.className = 'time-content';
    
    // 저장된 태스크가 있으면 렌더링
    if (appData.timeline[timeKey] && appData.timeline[timeKey].length > 0) {
        appData.timeline[timeKey].forEach(task => {
            const tag = createTaskTag(task.text, timeKey, task.id, task.selected || false);
            content.appendChild(tag);
        });
    } else {
        content.classList.add('empty');
        content.textContent = '할 일 추가';
    }

    block.appendChild(label);
    block.appendChild(content);
    return block;
}

// 태스크 태그 생성
function createTaskTag(text, timeKey, taskId, selected = false) {
    const tag = document.createElement('div');
    tag.className = 'task-tag';
    tag.dataset.taskId = taskId || Date.now();
    tag.dataset.timeKey = timeKey;
    
    if (selected) {
        tag.classList.add('selected');
    }

    // 체크박스 추가
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = selected;
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        toggleTaskSelection(timeKey, taskId, checkbox.checked);
    });

    // 태스크 텍스트
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = text;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-task';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeTaskFromTimeline(timeKey, tag.dataset.taskId);
    });

    tag.appendChild(checkbox);
    tag.appendChild(taskText);
    tag.appendChild(removeBtn);
    return tag;
}

// 타임라인에 태스크 추가
function addTaskToTimeline(timeKey, text, taskId) {
    if (!appData.timeline[timeKey]) {
        appData.timeline[timeKey] = [];
    }

    const task = {
        id: taskId || Date.now(),
        text: text,
        selected: false
    };

    appData.timeline[timeKey].push(task);
    saveData();
    updateTimeBlock(timeKey);
}

// 태스크 선택 토글
function toggleTaskSelection(timeKey, taskId, selected) {
    if (appData.timeline[timeKey]) {
        const task = appData.timeline[timeKey].find(t => t.id == taskId);
        if (task) {
            task.selected = selected;
            saveData();
            
            // UI 업데이트
            const tag = document.querySelector(`[data-task-id="${taskId}"][data-time-key="${timeKey}"]`);
            if (tag) {
                tag.classList.toggle('selected', selected);
            }
        }
    }
}

// 타임라인에서 태스크 제거
function removeTaskFromTimeline(timeKey, taskId) {
    if (appData.timeline[timeKey]) {
        appData.timeline[timeKey] = appData.timeline[timeKey].filter(t => t.id != taskId);
        if (appData.timeline[timeKey].length === 0) {
            delete appData.timeline[timeKey];
        }
        saveData();
        updateTimeBlock(timeKey);
    }
}

// 타임블록 업데이트
function updateTimeBlock(timeKey) {
    const block = document.querySelector(`[data-time="${timeKey}"]`);
    if (!block) return;

    const content = block.querySelector('.time-content');
    content.innerHTML = '';
    content.classList.remove('empty');

    if (appData.timeline[timeKey] && appData.timeline[timeKey].length > 0) {
        appData.timeline[timeKey].forEach(task => {
            const tag = createTaskTag(task.text, timeKey, task.id, task.selected || false);
            content.appendChild(tag);
        });
    } else {
        content.classList.add('empty');
        content.textContent = '할 일 추가';
    }
}

// Notes 초기화
function initNotes() {
    const textarea = document.getElementById('notesTextarea');
    textarea.value = appData.notes || '';

    textarea.addEventListener('input', (e) => {
        appData.notes = e.target.value;
        saveData();
    });
}

// 드래그 앤 드롭
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const timeBlock = e.target.closest('.time-block');
    if (timeBlock) {
        timeBlock.style.backgroundColor = '#e8f4f8';
    }
}

// Priority 드래그 오버 핸들러
function handlePriorityDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    const priorityItem = e.currentTarget;
    priorityItem.style.backgroundColor = '#e8f4f8';
    priorityItem.style.borderColor = '#3498db';
}

// Priority 드래그 리브 핸들러
function handlePriorityDragLeave(e) {
    const priorityItem = e.currentTarget;
    priorityItem.style.backgroundColor = '';
    priorityItem.style.borderColor = '';
}

// Priority 드롭 핸들러
function handlePriorityDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const priorityItem = e.currentTarget;
    priorityItem.style.backgroundColor = '';
    priorityItem.style.borderColor = '';
    
    if (!draggedElement) return;
    
    const brainDumpItem = draggedElement.closest('.brain-dump-item');
    if (brainDumpItem) {
        const label = brainDumpItem.querySelector('label');
        const text = label.textContent.trim();
        
        if (text && !label.classList.contains('completed')) {
            const priorityId = priorityItem.dataset.id;
            const input = priorityItem.querySelector('.priority-input');
            
            // 입력 필드에 텍스트 설정
            input.value = text;
            appData.priorities[priorityId].text = text;
            appData.priorities[priorityId].completed = false;
            
            // 완료 상태 초기화
            input.classList.remove('completed');
            priorityItem.querySelector('.check-btn').classList.remove('completed');
            
            saveData();
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    const timeBlock = e.target.closest('.time-block');
    if (!timeBlock || !draggedElement) return;

    timeBlock.style.backgroundColor = '';

    const timeKey = timeBlock.dataset.time;
    const brainDumpItem = draggedElement.closest('.brain-dump-item');
    
    if (brainDumpItem) {
        const label = brainDumpItem.querySelector('label');
        const text = label.textContent.trim();
        
        if (text && !label.classList.contains('completed')) {
            addTaskToTimeline(timeKey, text);
        }
    }
}

// 타임라인 클릭으로 태스크 추가
function handleTimelineClick(e) {
    const timeBlock = e.target.closest('.time-block');
    if (!timeBlock || e.target.closest('.task-tag')) return;

    const timeKey = timeBlock.dataset.time;
    const text = prompt('할 일을 입력하세요:');
    
    if (text && text.trim()) {
        addTaskToTimeline(timeKey, text.trim());
    }
}

// 타임블록에서 드래그오버 효과 제거
document.addEventListener('dragleave', (e) => {
    const timeBlock = e.target.closest('.time-block');
    if (timeBlock) {
        timeBlock.style.backgroundColor = '';
    }
});

// Google Calendar 초기화
function initGoogleCalendar() {
    const syncBtn = document.getElementById('syncCalendarBtn');
    if (!syncBtn) return;

    // API 키가 설정되지 않은 경우 처리
    if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' || API_KEY === 'YOUR_GOOGLE_API_KEY') {
        syncBtn.disabled = true;
        syncBtn.textContent = '📅 API 키 설정 필요';
        syncBtn.title = 'Google Calendar API 키를 설정해주세요.';
        return;
    }

    // Google API 초기화
    if (typeof gapi !== 'undefined') {
        gapi.load('client', initializeGapiClient);
    }
    
    // Google Identity Services 초기화
    if (typeof google !== 'undefined' && google.accounts) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // 나중에 설정
        });
    }

    syncBtn.addEventListener('click', handleCalendarSync);
}

// GAPI 클라이언트 초기화
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    updateSyncButton();
}

// 동기화 버튼 상태 업데이트
function updateSyncButton() {
    const syncBtn = document.getElementById('syncCalendarBtn');
    if (!syncBtn) return;
    
    if (gapi.client.getToken()) {
        syncBtn.textContent = '📅 캘린더에 추가';
        syncBtn.disabled = false;
    } else {
        syncBtn.textContent = '📅 캘린더 연동';
        syncBtn.disabled = false;
    }
}

// 캘린더 동기화 처리
function handleCalendarSync() {
    const token = gapi.client.getToken();
    
    if (!token) {
        // 인증 필요
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                alert('인증에 실패했습니다: ' + resp.error);
                return;
            }
            await syncTimelineToCalendar();
        };
        
        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    } else {
        // 이미 인증됨
        syncTimelineToCalendar();
    }
}

// 타임라인을 구글 캘린더에 동기화
async function syncTimelineToCalendar() {
    const syncBtn = document.getElementById('syncCalendarBtn');
    
    // 날짜 확인
    const dateStr = appData.date;
    if (!dateStr) {
        alert('먼저 날짜를 입력해주세요.');
        return;
    }

    // 날짜 파싱 (yyyy년 mm월 dd일 형식 또는 yyyy-mm-dd 형식)
    let year, month, day;
    const datePattern1 = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;
    const datePattern2 = /(\d{4})-(\d{2})-(\d{2})/;
    const datePattern3 = /(\d{4})(\d{2})(\d{2})/;
    
    let match = dateStr.match(datePattern1);
    if (match) {
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
    } else {
        match = dateStr.match(datePattern2);
        if (match) {
            year = parseInt(match[1]);
            month = parseInt(match[2]);
            day = parseInt(match[3]);
        } else {
            match = dateStr.match(datePattern3);
            if (match) {
                year = parseInt(match[1]);
                month = parseInt(match[2]);
                day = parseInt(match[3]);
            } else {
                alert('날짜 형식을 인식할 수 없습니다. yyyy-mm-dd 또는 yyyymmdd 형식으로 입력해주세요.');
                return;
            }
        }
    }

    // 타임라인 데이터 수집
    const events = [];
    const timeline = appData.timeline;
    
    for (const [timeKey, tasks] of Object.entries(timeline)) {
        if (!tasks || tasks.length === 0) continue;
        
        const [hour, minute] = timeKey.split(':').map(Number);
        const startDate = new Date(year, month - 1, day, hour, minute);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30분 후
        
        // 선택된 태스크만 필터링
        const selectedTasks = tasks.filter(task => task.selected);
        
        selectedTasks.forEach((task, index) => {
            // 여러 태스크가 있으면 시간을 약간 분산
            const taskStartDate = new Date(startDate.getTime() + index * 5 * 60 * 1000);
            const taskEndDate = new Date(taskStartDate.getTime() + 30 * 60 * 1000);
            
            events.push({
                summary: task.text,
                start: {
                    dateTime: taskStartDate.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                    dateTime: taskEndDate.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
            });
        });
    }

    if (events.length === 0) {
        alert('선택된 할 일이 없습니다. 캘린더에 추가할 할 일을 선택해주세요.');
        return;
    }

    // 버튼 비활성화
    syncBtn.disabled = true;
    syncBtn.textContent = '동기화 중...';

    try {
        // 각 이벤트를 캘린더에 추가
        let successCount = 0;
        let failCount = 0;

        for (const event of events) {
            try {
                const request = gapi.client.calendar.events.insert({
                    calendarId: 'primary',
                    resource: event,
                });
                
                await request;
                successCount++;
            } catch (error) {
                console.error('이벤트 추가 실패:', error);
                failCount++;
            }
        }

        if (successCount > 0) {
            alert(`성공: ${successCount}개의 일정이 구글 캘린더에 추가되었습니다.${failCount > 0 ? `\n실패: ${failCount}개` : ''}`);
        } else {
            alert('일정 추가에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('캘린더 동기화 오류:', error);
        alert('캘린더 동기화 중 오류가 발생했습니다: ' + error.message);
    } finally {
        syncBtn.disabled = false;
        updateSyncButton();
    }
}

