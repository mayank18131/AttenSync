// AttenSync - JavaScript Logic
// Main calculation and UI functionality

// Global variables
let overallPieChart = null;
let subjectPieChart = null;
let subjects = [];

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (newTheme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
    
    // Update charts for new theme
    updateChartsTheme();
});

// Tab switching functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// ============================================
// OVERALL ATTENDANCE CALCULATOR
// ============================================

function calculateOverall() {
    const totalLectures = parseInt(document.getElementById('totalLectures').value) || 0;
    const attendedLectures = parseInt(document.getElementById('attendedLectures').value) || 0;
    
    // Clear previous errors
    document.getElementById('totalError').textContent = '';
    document.getElementById('attendedError').textContent = '';
    
    // Validation
    if (totalLectures <= 0) {
        document.getElementById('totalError').textContent = 'Please enter valid total lectures';
        return;
    }
    
    if (attendedLectures < 0) {
        document.getElementById('attendedError').textContent = 'Attended lectures cannot be negative';
        return;
    }
    
    if (attendedLectures > totalLectures) {
        document.getElementById('attendedError').textContent = 'Attended lectures cannot exceed total lectures';
        return;
    }
    
    // Calculate attendance percentage
    const percentage = (attendedLectures / totalLectures) * 100;
    const missedLectures = totalLectures - attendedLectures;
    
    // Show result section
    document.getElementById('overallResult').style.display = 'block';
    
    // Update percentage display
    document.getElementById('overallPercentage').textContent = percentage.toFixed(1) + '%';
    
    // Update stats
    document.getElementById('overallTotal').textContent = totalLectures;
    document.getElementById('overallAttended').textContent = attendedLectures;
    document.getElementById('overallMissed').textContent = missedLectures;
    
    // Update status badge
    const statusBadge = document.getElementById('overallStatus');
    const requiredSection = document.getElementById('overallRequired');
    const motivationalSection = document.getElementById('overallMotivational');
    
    if (percentage >= 75) {
        statusBadge.className = 'status-badge eligible';
        statusBadge.innerHTML = '<i class="fas fa-check-circle"></i><span>Eligible</span>';
        requiredSection.style.display = 'none';
        motivationalSection.style.display = 'block';
        
        // Motivational messages based on percentage
        let message = '';
        if (percentage >= 95) {
            message = "Outstanding! You're a attendance superstar! 🌟";
        } else if (percentage >= 90) {
            message = "Excellent! Keep up the amazing work! 💪";
        } else if (percentage >= 85) {
            message = "Great job! Your consistency is impressive! 🎉";
        } else if (percentage >= 80) {
            message = "Well done! You're doing fantastic! 👍";
        } else {
            message = "Great job maintaining your attendance! Keep it up! 😊";
        }
        document.getElementById('motivationalMessage').textContent = message;
    } else {
        statusBadge.className = 'status-badge not-eligible';
        statusBadge.innerHTML = '<i class="fas fa-times-circle"></i><span>Not Eligible</span>';
        requiredSection.style.display = 'block';
        motivationalSection.style.display = 'none';
        
        // Calculate required lectures to reach 75%
        const requiredLectures = calculateRequiredLectures(totalLectures, attendedLectures, 75);
        document.getElementById('requiredLectures').textContent = requiredLectures;
    }
    
    // Create/update pie chart
    createOverallPieChart(attendedLectures, missedLectures);
}

function calculateRequiredLectures(total, attended, targetPercentage) {
    // Mathematical formula: Find minimum X such that (Attended + X) / (Total + X) >= target/100
    // (Attended + X) / (Total + X) >= target/100
    // Attended + X >= (target/100) * (Total + X)
    // Attended + X >= (target/100) * Total + (target/100) * X
    // X - (target/100) * X >= (target/100) * Total - Attended
    // X * (1 - target/100) >= (target/100) * Total - Attended
    // X >= [(target/100) * Total - Attended] / (1 - target/100)
    
    const target = targetPercentage / 100;
    const numerator = (target * total) - attended;
    const denominator = 1 - target;
    
    const required = Math.ceil(numerator / denominator);
    return Math.max(0, required);
}

function createOverallPieChart(attended, missed) {
    const ctx = document.getElementById('overallPieChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (overallPieChart) {
        overallPieChart.destroy();
    }
    
    const isDarkMode = body.getAttribute('data-theme') === 'dark';
    const textColor = isDarkMode ? '#dfe6e9' : '#2d3436';
    
    overallPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Attended', 'Missed'],
            datasets: [{
                data: [attended, missed],
                backgroundColor: [
                    'rgba(0, 184, 148, 0.8)',
                    'rgba(225, 112, 85, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 184, 148, 1)',
                    'rgba(225, 112, 85, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 20,
                        font: {
                            family: 'Poppins',
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Attendance Overview',
                    color: textColor,
                    font: {
                        family: 'Poppins',
                        size: 18,
                        weight: '600'
                    },
                    padding: {
                        bottom: 20
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}

function resetOverall() {
    document.getElementById('totalLectures').value = '';
    document.getElementById('attendedLectures').value = '';
    document.getElementById('totalError').textContent = '';
    document.getElementById('attendedError').textContent = '';
    document.getElementById('overallResult').style.display = 'none';
    
    if (overallPieChart) {
        overallPieChart.destroy();
        overallPieChart = null;
    }
}

// ============================================
// SUBJECT-WISE ATTENDANCE CALCULATOR
// ============================================

function addSubject() {
    const subjectName = document.getElementById('subjectName').value.trim();
    const subjectTotal = parseInt(document.getElementById('subjectTotal').value) || 0;
    const subjectAttended = parseInt(document.getElementById('subjectAttended').value) || 0;
    
    // Clear previous errors
    document.getElementById('subjectError').textContent = '';
    
    // Validation
    if (!subjectName) {
        document.getElementById('subjectError').textContent = 'Please enter subject name';
        return;
    }
    
    if (subjectTotal <= 0) {
        document.getElementById('subjectError').textContent = 'Please enter valid total lectures';
        return;
    }
    
    if (subjectAttended < 0) {
        document.getElementById('subjectError').textContent = 'Attended lectures cannot be negative';
        return;
    }
    
    if (subjectAttended > subjectTotal) {
        document.getElementById('subjectError').textContent = 'Attended lectures cannot exceed total';
        return;
    }
    
    // Check if subject already exists
    if (subjects.some(s => s.name.toLowerCase() === subjectName.toLowerCase())) {
        document.getElementById('subjectError').textContent = 'Subject already added';
        return;
    }
    
    // Add subject to array
    const subject = {
        id: Date.now(),
        name: subjectName,
        total: subjectTotal,
        attended: subjectAttended,
        percentage: (subjectAttended / subjectTotal) * 100
    };
    
    subjects.push(subject);
    
    // Clear input fields
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectTotal').value = '';
    document.getElementById('subjectAttended').value = '';
    
    // Render subjects list
    renderSubjects();
    
    // Calculate overall statistics
    calculateSubjectOverall();
}

function renderSubjects() {
    const container = document.getElementById('subjectsList');
    
    if (subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>No subjects added yet. Add your first subject above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = subjects.map(subject => {
        const percentage = subject.percentage.toFixed(1);
        const isEligible = percentage >= 75;
        const required = isEligible ? 0 : calculateRequiredLectures(subject.total, subject.attended, 75);
        
        return `
            <div class="subject-item" id="subject-${subject.id}">
                <div class="subject-info">
                    <div class="subject-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="subject-details">
                        <h4>${subject.name}</h4>
                        <p>Total: ${subject.total} | Attended: ${subject.attended} | Missed: ${subject.total - subject.attended}</p>
                        ${!isEligible ? `<p style="color: var(--warning-color); margin-top: 5px;">Need ${required} more lecture(s) for 75%</p>` : ''}
                    </div>
                </div>
                <div class="subject-stats">
                    <div class="subject-percentage">
                        <div class="percentage">${percentage}%</div>
                        <div class="label">Attendance</div>
                    </div>
                    <div class="subject-status ${isEligible ? 'eligible' : 'not-eligible'}">
                        ${isEligible ? '<i class="fas fa-check"></i> Eligible' : '<i class="fas fa-times"></i> Not Eligible'}
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteSubject(${subject.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');
}

function deleteSubject(id) {
    subjects = subjects.filter(s => s.id !== id);
    renderSubjects();
    calculateSubjectOverall();
}

function calculateSubjectOverall() {
    if (subjects.length === 0) {
        document.getElementById('subjectResult').style.display = 'none';
        return;
    }
    
    document.getElementById('subjectResult').style.display = 'block';
    
    // Calculate overall statistics
    const totalLectures = subjects.reduce((sum, s) => sum + s.total, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const overallPercentage = (totalAttended / totalLectures) * 100;
    
    const eligibleCount = subjects.filter(s => s.percentage >= 75).length;
    const notEligibleCount = subjects.length - eligibleCount;
    
    // Update overall display
    document.getElementById('subjectOverallPercentage').textContent = overallPercentage.toFixed(1) + '%';
    
    const statusBadge = document.getElementById('subjectOverallStatus');
    if (overallPercentage >= 75) {
        statusBadge.className = 'status-badge eligible';
        statusBadge.innerHTML = '<i class="fas fa-check-circle"></i><span>Eligible</span>';
    } else {
        statusBadge.className = 'status-badge not-eligible';
        statusBadge.innerHTML = '<i class="fas fa-times-circle"></i><span>Not Eligible</span>';
    }
    
    // Update stats
    document.getElementById('totalSubjects').textContent = subjects.length;
    document.getElementById('eligibleSubjects').textContent = eligibleCount;
    document.getElementById('notEligibleSubjects').textContent = notEligibleCount;
    
    // Create/update pie chart
    createSubjectPieChart(subjects);
}

function createSubjectPieChart(subjectsData) {
    const ctx = document.getElementById('subjectPieChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (subjectPieChart) {
        subjectPieChart.destroy();
    }
    
    const isDarkMode = body.getAttribute('data-theme') === 'dark';
    const textColor = isDarkMode ? '#dfe6e9' : '#2d3436';
    
    // Prepare data for chart
    const labels = subjectsData.map(s => s.name);
    const percentages = subjectsData.map(s => s.percentage);
    
    // Color palette for subjects
    const colors = [
        'rgba(108, 92, 231, 0.8)',
        'rgba(0, 184, 148, 0.8)',
        'rgba(225, 112, 85, 0.8)',
        'rgba(253, 203, 110, 0.8)',
        'rgba(116, 185, 255, 0.8)',
        'rgba(223, 249, 251, 0.8)',
        'rgba(255, 159, 243, 0.8)',
        'rgba(85, 239, 196, 0.8)'
    ];
    
    subjectPieChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Attendance Percentage',
                data: percentages,
                backgroundColor: percentages.map(p => p >= 75 ? 'rgba(0, 184, 148, 0.8)' : 'rgba(225, 112, 85, 0.8)'),
                borderColor: percentages.map(p => p >= 75 ? 'rgba(0, 184, 148, 1)' : 'rgba(225, 112, 85, 1)'),
                borderWidth: 2,
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Subject-wise Attendance',
                    color: textColor,
                    font: {
                        family: 'Poppins',
                        size: 18,
                        weight: '600'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Poppins',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Poppins',
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const subject = subjectsData[context.dataIndex];
                            const required = subject.percentage >= 75 ? 0 : 
                                calculateRequiredLectures(subject.total, subject.attended, 75);
                            let label = `Attendance: ${context.parsed.y.toFixed(1)}%`;
                            if (required > 0) {
                                label += ` (Need ${required} more for 75%)`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Poppins',
                            size: 12
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Poppins',
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function resetSubjects() {
    subjects = [];
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectTotal').value = '';
    document.getElementById('subjectAttended').value = '';
    document.getElementById('subjectError').textContent = '';
    document.getElementById('subjectResult').style.display = 'none';
    renderSubjects();
    
    if (subjectPieChart) {
        subjectPieChart.destroy();
        subjectPieChart = null;
    }
}

// ============================================
// THEME AND CHART UPDATES
// ============================================

function updateChartsTheme() {
    // Recreate charts with new theme colors
    if (document.getElementById('overallResult').style.display !== 'none') {
        const totalLectures = parseInt(document.getElementById('totalLectures').value) || 0;
        const attendedLectures = parseInt(document.getElementById('attendedLectures').value) || 0;
        if (totalLectures > 0) {
            createOverallPieChart(attendedLectures, totalLectures - attendedLectures);
        }
    }
    
    if (subjects.length > 0) {
        createSubjectPieChart(subjects);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Allow Enter key to trigger calculations
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (e.target.id === 'totalLectures' || e.target.id === 'attendedLectures') {
            calculateOverall();
        } else if (e.target.id === 'subjectAttended') {
            addSubject();
        }
    }
});

// Initialize empty state for subjects
renderSubjects();