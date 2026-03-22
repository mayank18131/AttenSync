let isDark = false;
let subjects = [];
let overallChart = null;
let subjectsChart = null;

// Dark mode toggle
function toggleDarkMode() {
    isDark = !isDark;
    document.body.className = isDark ? 'dark' : 'light';
    document.querySelector('.dark-toggle i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// Navigation Tabs Logic
function switchTab(index) {
    // Hide all content areas
    document.querySelectorAll('.content').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
    // Update button styling to show active state
    document.querySelectorAll('.nav-tab').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
}

// Tool 1: Overall Attendance
function resetTool1() {
    document.getElementById('totalLectures').value = '';
    document.getElementById('attendedLectures').value = '';
    document.getElementById('noAttendanceTotal').value = ''; 
    document.getElementById('overallResults').style.display = 'none';
    if (overallChart) {
        overallChart.destroy();
        overallChart = null;
    }
}

function calculateOverallAttendance() {
    const rawTotal = parseInt(document.getElementById('totalLectures').value) || 0;
    let attended = parseInt(document.getElementById('attendedLectures').value) || 0;
    const noAttendance = parseInt(document.getElementById('noAttendanceTotal').value) || 0;
    
    // Deduct "no attendance" lectures from the total
    const total = Math.max(0, rawTotal - noAttendance);
    
    if (total === 0) return;
    
    // Sanity check to prevent negative missed classes if user inputs bad data
    attended = Math.min(attended, total);
    
    const percentage = Math.min(100, Math.round((attended / total) * 100));
    const missed = total - attended;
    
    document.getElementById('percentageCircle').style.setProperty('--percentage', percentage * 3.6 + 'deg');
    document.getElementById('percentageCircle').textContent = percentage + '%';
    
    const badge = document.getElementById('eligibilityBadge');
    if (percentage >= 75) {
        badge.innerHTML = '<span class="badge green"><i class="fas fa-check-circle"></i> Eligible</span>';
    } else {
        badge.innerHTML = '<span class="badge red"><i class="fas fa-times-circle"></i> Not Eligible</span>';
    }
    
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><div class="stat-number">${total}</div><div>Total (Effective)</div></div>
        <div class="stat-card"><div class="stat-number" style="color: #4ade80">${attended}</div><div>Attended</div></div>
        <div class="stat-card"><div class="stat-number" style="color: #f87171">${missed}</div><div>Missed</div></div>
    `;
    
    let advice = '';
    if (percentage < 75) {
        const neededConsecutive = (3 * total) - (4 * attended);
        advice = `<div class="warning-box"><i class="fas fa-exclamation-triangle"></i> You need to attend <strong>${neededConsecutive}</strong> consecutive classes to become eligible!</div>`;
    } else {
        const canBunk = Math.floor((4 * attended - 3 * total) / 3);
        advice = `<div class="success-box"><i class="fas fa-check-circle"></i> You can safely bunk <strong>${canBunk}</strong> more classes!</div>`;
    }
    document.getElementById('smartAdvice').innerHTML = advice;
    
    // Chart
    const ctx = document.getElementById('overallChart').getContext('2d');
    if (overallChart) overallChart.destroy();
    overallChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Attended', 'Missed'],
            datasets: [{
                data: [attended, missed],
                backgroundColor: ['#4ade80', '#f87171'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });
    
    document.getElementById('overallResults').style.display = 'block';
}

// Tool 2: Subjects
function resetTool2() {
    subjects = [];
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectTotal').value = '';
    document.getElementById('subjectAttended').value = '';
    document.getElementById('subjectNoAttendance').value = ''; 
    document.getElementById('subjectSummary').innerHTML = '';
    document.getElementById('subjectsList').innerHTML = '';
    if (subjectsChart) {
        subjectsChart.destroy();
        subjectsChart = null;
    }
}

function addSubject() {
    const name = document.getElementById('subjectName').value.trim();
    const rawTotal = parseInt(document.getElementById('subjectTotal').value) || 0;
    let attended = parseInt(document.getElementById('subjectAttended').value) || 0;
    const noAttendance = parseInt(document.getElementById('subjectNoAttendance').value) || 0;
    
    // Deduct "no attendance" lectures from the total
    const total = Math.max(0, rawTotal - noAttendance);
    
    if (!name || total === 0) return;
    
    // Sanity check
    attended = Math.min(attended, total);
    
    const percentage = Math.min(100, Math.round((attended / total) * 100));
    const missed = total - attended;
    const eligible = percentage >= 75;
    
    subjects.push({ name, total, attended, missed, percentage, eligible });
    
    renderSubjects();
    updateSubjectSummary();
    
    // Clear inputs after adding
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectTotal').value = '';
    document.getElementById('subjectAttended').value = '';
    document.getElementById('subjectNoAttendance').value = '';
}

function renderSubjects() {
    const list = document.getElementById('subjectsList');
    list.innerHTML = subjects.map((sub, index) => `
        <div class="subject-card">
            <div>
                <strong>${sub.name}</strong><br>
                Total: ${sub.total}, Attended: ${sub.attended}, Missed: ${sub.missed}<br>
                <span style="font-size: 24px; font-weight: bold;">${sub.percentage}%</span>
                <span class="badge ${sub.eligible ? 'green' : 'red'}">${sub.eligible ? 'Eligible' : 'Not Eligible'}</span>
            </div>
            <button class="btn-secondary" onclick="removeSubject(${index})" style="background: rgba(248,113,113,0.5);"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function removeSubject(index) {
    subjects.splice(index, 1);
    renderSubjects();
    updateSubjectSummary();
}

function updateSubjectSummary() {
    const totalSubs = subjects.length;
    const eligibleSubs = subjects.filter(s => s.eligible).length;
    document.getElementById('subjectSummary').innerHTML = `
        <h3>Summary</h3>
        Total Subjects: ${totalSubs} | Eligible: ${eligibleSubs} | Not Eligible: ${totalSubs - eligibleSubs}
    `;
    
    if (subjects.length > 0) {
        const ctx = document.getElementById('subjectsChart').getContext('2d');
        if (subjectsChart) subjectsChart.destroy();
        subjectsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjects.map(s => s.name),
                datasets: [{
                    label: 'Attendance %',
                    data: subjects.map(s => s.percentage),
                    backgroundColor: subjects.map(s => s.eligible ? '#4ade80' : '#f87171')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: 'white' } },
                    x: { ticks: { color: 'white' } }
                },
                plugins: { legend: { labels: { color: 'white' } } }
            }
        });
    } else if (subjectsChart) {
        subjectsChart.destroy();
        subjectsChart = null;
    }
}

// Tool 3: Total Lectures
let lectureDates = [];

function generateLectureDates() {
    const start = new Date(document.getElementById('startDate').value);
    const end = new Date(document.getElementById('endDate').value);
    const dayCheckboxes = document.querySelectorAll('#tool3 input[type="checkbox"][value]:checked');
    const activeDays = Array.from(dayCheckboxes).map(cb => parseInt(cb.value));
    
    if (isNaN(start) || isNaN(end) || start > end || activeDays.length === 0) {
        alert('Please enter valid dates and select at least one lecture day.');
        return;
    }
    
    lectureDates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (activeDays.includes(d.getDay())) {
            lectureDates.push(new Date(d));
        }
    }
    
    const checkboxesContainer = document.getElementById('holidayCheckboxes');
    checkboxesContainer.innerHTML = lectureDates.map((date, index) => `
        <label style="display: block; margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <input type="checkbox" class="holiday-checkbox" data-index="${index}">
            <span style="margin-left: 10px;">${date.toLocaleDateString('en-US', {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'})}</span>
        </label>
    `).join('');
    
    document.getElementById('holidayList').style.display = 'block';
    document.getElementById('finalResults').style.display = 'none';
}

function calculateFinalLectures() {
    const offCheckboxes = document.querySelectorAll('.holiday-checkbox:checked');
    const offDatesCount = offCheckboxes.length;
    const noAttendance = parseInt(document.getElementById('noAttendance').value) || 0;
    const totalDates = lectureDates.length;
    const offDays = offDatesCount + noAttendance;
    const finalLectures = Math.max(0, totalDates - offDays);
    
    document.getElementById('totalLectureDates').textContent = totalDates;
    document.getElementById('holidayCount').textContent = offDays;
    document.getElementById('finalLectures').textContent = finalLectures;
    document.getElementById('finalResults').style.display = 'block';
}

function resetTool3() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('subjectName3').value = '';
    document.getElementById('noAttendance').value = '0';
    document.querySelectorAll('#tool3 input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('holidayList').style.display = 'none';
    document.getElementById('finalResults').style.display = 'none';
    document.getElementById('holidayCheckboxes').innerHTML = '';
}

// Tool 4: Dream Goal
function resetTool4() {
    document.getElementById('totalSemester').value = '';
    document.getElementById('conductedSoFar').value = '';
    document.getElementById('currentlyAttended').value = '';
    document.getElementById('dreamTarget').value = '75';
    document.getElementById('dreamResults').style.display = 'none';
}

function calculateDreamGoal() {
    const totalSemester = parseInt(document.getElementById('totalSemester').value) || 0;
    const conductedSoFar = parseInt(document.getElementById('conductedSoFar').value) || 0;
    const currentlyAttended = parseInt(document.getElementById('currentlyAttended').value) || 0;
    const dreamTarget = parseFloat(document.getElementById('dreamTarget').value) || 75;
    
    const remaining = totalSemester - conductedSoFar;
    if (remaining <= 0) {
        document.getElementById('dreamAdvice').innerHTML = '<span style="color: #f87171">Semester lectures completed!</span>';
        document.getElementById('dreamResults').style.display = 'block';
        return;
    }
    
    const targetAttended = Math.ceil((dreamTarget / 100) * totalSemester);
    const remainingNeeded = Math.max(0, targetAttended - currentlyAttended);
    const mustAttend = Math.ceil((remainingNeeded / remaining) * 100);
    
    if (remainingNeeded > remaining) {
        document.getElementById('dreamAdvice').innerHTML = `<span style="color: #f87171">Impossible! You needed ${remainingNeeded - remaining} more attendances than remaining classes.</span>`;
    } else {
        document.getElementById('dreamAdvice').innerHTML = `<span style="color: #4ade80">Attend ${mustAttend}% of remaining ${remaining} classes (about ${remainingNeeded} classes).</span>`;
    }
    document.getElementById('dreamResults').style.display = 'block';
}

// Tool 5: Email Draft
function setReason(reason) {
    document.querySelectorAll('.btn-reason').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'rgba(255,255,255,0.2)';
        btn.style.border = '1px solid rgba(255,255,255,0.3)';
    });
    event.target.classList.add('active');
    event.target.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    event.target.style.border = 'none';
    
    const details = document.getElementById('additionalDetails');
    const label = document.getElementById('additionalLabel');
    if (reason === 'custom') {
        details.style.display = 'block';
        label.style.display = 'block';
    } else {
        details.style.display = 'none';
        label.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const presentBtn = document.querySelector('.btn-reason[onclick="setReason(\'present\')"]');
    if (presentBtn) {
        presentBtn.classList.add('active');
        presentBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        presentBtn.style.border = 'none';
    }
});

function resetTool5() {
    document.querySelectorAll('#tool5 input, #tool5 textarea').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = el.defaultChecked;
        else el.value = el.defaultValue || '';
    });
    document.getElementById('emailPreview').style.display = 'none';
    document.getElementById('additionalDetails').style.display = 'none';
    document.getElementById('additionalLabel').style.display = 'none';
    
    // Reset buttons back to default state safely without relying on event.target
    const customBtn = document.querySelector('.btn-reason[onclick="setReason(\'custom\')"]');
    const presentBtn = document.querySelector('.btn-reason[onclick="setReason(\'present\')"]');
    
    customBtn.classList.remove('active');
    customBtn.style.background = 'rgba(255,255,255,0.2)';
    customBtn.style.border = '1px solid rgba(255,255,255,0.3)';
    
    presentBtn.classList.add('active');
    presentBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    presentBtn.style.border = 'none';
}

function generateEmailDraft() {
    const fields = {
        fullName: document.getElementById('fullName').value,
        enrollmentNo: document.getElementById('enrollmentNo').value,
        rollNo: document.getElementById('rollNo').value,
        course: document.getElementById('course').value,
        division: document.getElementById('division').value,
        facultyEmail: document.getElementById('facultyEmail').value,
        courseSubject: document.getElementById('courseSubject').value,
        lectureDate: document.getElementById('lectureDate').value,
        reason: document.querySelector('.btn-reason.active').getAttribute('onclick').match(/'([^']+)'/)[1],
        details: document.getElementById('additionalDetails').value
    };
    
    if (!fields.facultyEmail || !fields.courseSubject || !fields.lectureDate) {
        alert('Please fill faculty email, subject, and date.');
        return;
    }
    
    let reasonText = '';
    if (fields.reason === 'present') {
        reasonText = 'I was present during the lecture but was mistakenly marked absent.';
    } else {
        reasonText = fields.details || 'Please correct my attendance.';
    }
    
    const body = `Dear Professor,

I am ${fields.fullName} (Enrollment: ${fields.enrollmentNo}, Roll No: ${fields.rollNo}), a student of ${fields.course} ${fields.division}.

I am writing to request a correction of my attendance for the ${fields.courseSubject} lecture on ${fields.lectureDate}.

${reasonText}

I would be grateful if you could update my attendance record accordingly.

Thank you for your understanding.

Best regards,
${fields.fullName}
${fields.course} ${fields.division}
Enrollment: ${fields.enrollmentNo}`;

    document.getElementById('draftBody').textContent = body;
    document.getElementById('emailPreview').style.display = 'block';
}
