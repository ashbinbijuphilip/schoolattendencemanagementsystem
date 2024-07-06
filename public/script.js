let students = [];
let isLoggedIn = false;
let rememberMe = false;


window.addEventListener('load', function() {
  loadData();
  checkRememberedLogin();
  toggleBottomNav();
});

window.addEventListener('resize', toggleBottomNav);

function loadData() {
  try {
    students = JSON.parse(localStorage.getItem('students')) || [];
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Failed to load data. Using empty dataset.');
    students = [];
  }
}

function saveData() {
  try {
      localStorage.setItem('students', JSON.stringify(students));
  } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
  }
}

function checkRememberedLogin() {
  const rememberedUser = localStorage.getItem('rememberedUser');
  if (rememberedUser) {
    const { username, password } = JSON.parse(rememberedUser);
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    document.getElementById('remember-me').checked = true;
    login();
  } else {
    showLoginForm();
  }
}

function showLoginForm() {
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('app-container').style.display = 'none';
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  rememberMe = document.getElementById('remember-me').checked;
  
  if (username === 'admin' && password === 'password') { // Replace with secure authentication
    isLoggedIn = true;
    if (rememberMe) {
      localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
    } else {
      localStorage.removeItem('rememberedUser');
    }
    showDashboard();
    toggleBottomNav();
  } else {
    document.getElementById('login-error').textContent = 'Invalid username or password';
  }
}

function logout() {
  isLoggedIn = false;
  if (!rememberMe) {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('remember-me').checked = false;
  }
  showLoginForm();
  document.getElementById('bottom-nav').style.display = 'none';
}

function showDashboard() {
  if (!isLoggedIn) return;
  
  hideAllSections();
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('app-container').style.display = 'block';
  document.getElementById('dashboard').style.display = 'block';
  
  updateDashboard();
}

function updateDashboard() {
  updateKeyMetrics();
  updateNotifications();
  updateCalendar();
  updateTimeline();
}

function updateKeyMetrics() {
  const totalStudents = students.length;
  const todayAttendance = calculateTodayAttendance();
  
  document.getElementById('total-students').textContent = totalStudents;
  document.getElementById('today-attendance').textContent = `${todayAttendance.toFixed(2)}%`;
}

function calculateTodayAttendance() {
  const today = new Date().toISOString().split('T')[0];
  let presentCount = 0;
  
  students.forEach(student => {
    if (student.attendance && student.attendance[today]) {
      if (student.attendance[today].morning && student.attendance[today].afternoon) {
        presentCount++;
      } else if (student.attendance[today].morning || student.attendance[today].afternoon) {
        presentCount += 0.5;
      }
    }
  });
  
  return students.length > 0 ? (presentCount / students.length) * 100 : 0;
}

function updateNotifications() {
  const notificationsList = document.getElementById('notifications-list');
  notificationsList.innerHTML = '';
  
  const notifications = [
    { message: 'Submit monthly attendance report', deadline: '2023-07-05' },
    { message: 'Parent-teacher meeting', deadline: '2023-07-15' },
  ];
  
  notifications.forEach(notification => {
    const li = document.createElement('li');
    li.textContent = `${notification.message} (Deadline: ${notification.deadline})`;
    notificationsList.appendChild(li);
  });
}

function updateCalendar() {
  const calendarContainer = document.getElementById('calendar-container');
  calendarContainer.innerHTML = '';
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const calendarHeader = document.createElement('h3');
  calendarHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  calendarContainer.appendChild(calendarHeader);
  
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'calendar-grid';
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day-name';
    dayElement.textContent = day;
    calendarGrid.appendChild(dayElement);
  });
  
  for (let i = 0; i < firstDay.getDay(); i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = i;
    
    if (i === currentDate.getDate()) {
      dayElement.classList.add('current-day');
    }
    
    calendarGrid.appendChild(dayElement);
  }
  
  calendarContainer.appendChild(calendarGrid);
}

function updateTimeline() {
  const timelineContainer = document.getElementById('timeline-container');
  timelineContainer.innerHTML = '<h3>Upcoming Events</h3>';
  
  const timelineEvents = [
    { date: '2023-07-01', event: 'New semester begins' },
    { date: '2023-07-15', event: 'Mid-term exams' },
    { date: '2023-07-30', event: 'Sports day' },
  ];
  
  const timeline = document.createElement('ul');
  timeline.className = 'timeline';
  
  timelineEvents.forEach(event => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="date">${event.date}</span> ${event.event}`;
    timeline.appendChild(li);
  });
  
  timelineContainer.appendChild(timeline);
}

function addStudent() {
  if (!isLoggedIn) return;

  const rollNumber = document.getElementById("student-roll-number").value.trim();
  const name = document.getElementById("student-name").value.trim();
  const phone = document.getElementById("student-phone").value.trim();
  const className = document.getElementById("student-class").value.trim();
  const section = document.getElementById("student-section").value.trim();

  const errorElement = document.getElementById("error-message");
  errorElement.textContent = "";

  const studentData = { rollNumber, name, phone, class: className, section };
  const errors = validateStudentData(studentData);

  if (errors.length > 0) {
    errorElement.textContent = errors.join(" ");
    return;
  }

  const existingStudentIndex = students.findIndex(student => student.rollNumber === rollNumber);

  if (existingStudentIndex !== -1) {
    students[existingStudentIndex] = { ...studentData, attendance: students[existingStudentIndex].attendance || {} };
    errorElement.textContent = "Student updated successfully.";
  } else {
    students.push({ ...studentData, attendance: {} });
    errorElement.textContent = "Student added successfully.";
  }

  saveData();
  clearStudentForm();
  updateStudentList();
}

function validateStudentData(student) {
  const errors = [];
  if (!/^\d+$/.test(student.rollNumber)) errors.push("Roll number must be numeric.");
  if (student.name.length < 2) errors.push("Name must be at least 2 characters long.");
  if (!/^\d{10}$/.test(student.phone)) errors.push("Phone number must be 10 digits.");
  if (!student.class) errors.push("Class is required.");
  if (!student.section) errors.push("Section is required.");
  return errors;
}

function clearStudentForm() {
  ["student-roll-number", "student-name", "student-phone", "student-class", "student-section"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("add-edit-student-btn").textContent = "Add Student";
  document.getElementById("add-edit-student-btn").onclick = addStudent;
}

function updateStudentList(studentsToShow = students) {
  if (!isLoggedIn) return;

  const tableBody = document.getElementById("student-table").getElementsByTagName("tbody")[0];
  const studentListDiv = document.getElementById("student-list");
  tableBody.innerHTML = "";

  if (studentsToShow.length === 0) {
    const messageRow = document.createElement("tr");
    const messageCell = document.createElement("td");
    messageCell.colSpan = 6;
    messageCell.textContent = "No students found.";
    messageCell.style.textAlign = "center";
    messageCell.style.padding = "20px";
    messageRow.appendChild(messageCell);
    tableBody.appendChild(messageRow);

    let messageElement = studentListDiv.querySelector(".no-students-message");
    if (!messageElement) {
      messageElement = document.createElement("p");
      messageElement.className = "no-students-message";
      messageElement.style.color = "red";
      messageElement.style.textAlign = "center";
      studentListDiv.insertBefore(messageElement, studentListDiv.firstChild);
    }
    messageElement.textContent = students.length === 0 ? "No students have been added yet." : "No students match your search.";
  } else {
    const messageElement = studentListDiv.querySelector(".no-students-message");
    if (messageElement) {
      messageElement.remove();
    }

    studentsToShow.forEach(student => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="Roll Number">${student.rollNumber}</td>
        <td data-label="Name">${student.name}</td>
        <td data-label="Phone">${student.phone}</td>
        <td data-label="Class">${student.class}</td>
        <td data-label="Section">${student.section}</td>
        <td data-label="Actions">
          <button onclick="editStudent('${student.rollNumber}')">Edit</button>
          <button onclick="deleteStudent('${student.rollNumber}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
}

function searchStudents() {
  if (!isLoggedIn) return;

  const searchText = document.getElementById("search-input").value.trim().toLowerCase();
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchText) ||
    student.rollNumber.toLowerCase().includes(searchText) ||
    student.class.toLowerCase().includes(searchText) ||
    student.section.toLowerCase().includes(searchText)
  );

  updateStudentList(filteredStudents);
}

function editStudent(rollNumber) {
  if (!isLoggedIn) return;

  const student = students.find(s => s.rollNumber === rollNumber);
  if (student) {
    document.getElementById("student-roll-number").value = student.rollNumber;
    document.getElementById("student-name").value = student.name;
    document.getElementById("student-phone").value = student.phone;
    document.getElementById("student-class").value = student.class;
    document.getElementById("student-section").value = student.section;
    
    const addButton = document.getElementById("add-edit-student-btn");
    addButton.textContent = 'Update Student';
    addButton.onclick = addStudent;
  }
  showAddStudent();
}

function deleteStudent(rollNumber) {
  if (!isLoggedIn) return;

  if (confirm('Are you sure you want to delete this student?')) {
    students = students.filter(s => s.rollNumber !== rollNumber);
    saveData();
    updateStudentList();
  }
}

function markAttendance(rollNumber, isPresent) {
  const attendanceDate = document.getElementById("attendance-date").value;
  const attendancePeriod = document.getElementById("attendance-period").value;
  const student = students.find(s => s.rollNumber === rollNumber);
  
  if (!student.attendance) student.attendance = {};
  if (!student.attendance[attendanceDate]) {
      student.attendance[attendanceDate] = { morning: null, afternoon: null };
  }
  
  if (attendancePeriod === 'full') {
      student.attendance[attendanceDate].morning = isPresent;
      student.attendance[attendanceDate].afternoon = isPresent;
  } else {
      student.attendance[attendanceDate][attendancePeriod] = isPresent;
  }
  
  // Update button colors
  const card = document.querySelector(`.attendance-card[data-roll="${rollNumber}"]`);
  if (card) {
      const presentBtn = card.querySelector('.present');
      const absentBtn = card.querySelector('.absent');
      
      presentBtn.classList.toggle('active', isPresent);
      absentBtn.classList.toggle('active', !isPresent);
  }

  // Save data after each attendance marking
  saveData();
}
function updateMarkAttendance() {
  if (!isLoggedIn) return;

  const attendanceList = document.getElementById("attendance-list");
  attendanceList.innerHTML = "";
  const attendanceDate = document.getElementById("attendance-date").value;
  const attendancePeriod = document.getElementById("attendance-period").value;
  const searchText = document.getElementById("attendance-search").value.toLowerCase();

  if (students.length === 0) {
      attendanceList.innerHTML = "<p>No students found.</p>";
      return;
  }

  const filteredStudents = students.filter(student => 
      student.name.toLowerCase().includes(searchText) || 
      student.rollNumber.toLowerCase().includes(searchText)
  );

  filteredStudents.forEach(student => {
      const card = document.createElement("div");
      card.className = "attendance-card";
      card.setAttribute('data-roll', student.rollNumber);

      // Check for saved attendance data
      let morningAttendance = student.attendance?.[attendanceDate]?.morning;
      let afternoonAttendance = student.attendance?.[attendanceDate]?.afternoon;

      let isPresent;
      if (attendancePeriod === 'full') {
          isPresent = morningAttendance && afternoonAttendance;
      } else if (attendancePeriod === 'morning') {
          isPresent = morningAttendance;
      } else {
          isPresent = afternoonAttendance;
      }

      card.innerHTML = `
          <h3>${student.name} (${student.rollNumber})</h3>
          <div class="attendance-buttons">
              <button class="attendance-btn present ${isPresent === true ? 'active' : ''}" onclick="markAttendance('${student.rollNumber}', true)">P</button>
              <button class="attendance-btn absent ${isPresent === false ? 'active' : ''}" onclick="markAttendance('${student.rollNumber}', false)">A</button>
          </div>
      `;
      attendanceList.appendChild(card);
  });
}
function saveAttendance() {
  if (!isLoggedIn) return;

  const attendanceDate = document.getElementById("attendance-date").value;
  if (!attendanceDate) {
      alert("Please select a date.");
      return;
  }

  const attendancePeriod = document.getElementById("attendance-period").value;
  const absentStudents = students.filter(student => {
      if (attendancePeriod === 'full') {
          return student.attendance[attendanceDate]?.morning === false || student.attendance[attendanceDate]?.afternoon === false;
      } else {
          return student.attendance[attendanceDate]?.[attendancePeriod] === false;
      }
  });

  if (absentStudents.length > 0) {
      const absentList = absentStudents.map(student => student.name).join(', ');
      const confirmPopup = document.createElement('div');
      confirmPopup.className = 'confirm-popup';
      confirmPopup.innerHTML = `
          <h3>Confirm Absent Students</h3>
          <p>The following students are marked absent:</p>
          <p>${absentList}</p>
          <button id="confirm-save">Confirm</button>
          <button id="cancel-save">Cancel</button>
      `;
      document.body.appendChild(confirmPopup);

      document.getElementById('confirm-save').addEventListener('click', () => {
          saveData();
          alert(`Attendance for ${attendanceDate} saved successfully.`);
          document.body.removeChild(confirmPopup);
      });

      document.getElementById('cancel-save').addEventListener('click', () => {
          document.body.removeChild(confirmPopup);
      });
  } else {
      saveData();
      alert(`Attendance for ${attendanceDate} saved successfully.`);
  }
}

function markAllPresent() {
  const attendanceDate = document.getElementById("attendance-date").value;
  const attendancePeriod = document.getElementById("attendance-period").value;
  
  students.forEach(student => {
      if (!student.attendance) student.attendance = {};
      if (!student.attendance[attendanceDate]) student.attendance[attendanceDate] = { morning: null, afternoon: null };
      
      if (attendancePeriod === 'full') {
          if (student.attendance[attendanceDate].morning !== false) student.attendance[attendanceDate].morning = true;
          if (student.attendance[attendanceDate].afternoon !== false) student.attendance[attendanceDate].afternoon = true;
      } else {
          if (student.attendance[attendanceDate][attendancePeriod] !== false) {
              student.attendance[attendanceDate][attendancePeriod] = true;
          }
      }
  });
  
  updateMarkAttendance(); // Refresh the display
}
function showAttendanceView() {
  if (!isLoggedIn) return;
  hideAllSections();
  document.getElementById("view-attendance").style.display = "block";
  document.getElementById("view-attendance-date").valueAsDate = new Date();
  updateAttendanceView();
}
function updateAttendanceView() {
  if (!isLoggedIn) return;

  const tableBody = document.getElementById("attendance-view-table").getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";
  const attendanceDate = document.getElementById("view-attendance-date").value;

  if (!attendanceDate) {
    alert("Please select a date to view attendance.");
    return;
  }

  students.forEach(student => {
    const attendance = student.attendance && student.attendance[attendanceDate] ? student.attendance[attendanceDate] : { morning: false, afternoon: false };
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Roll Number">${student.rollNumber}</td>
      <td data-label="Name">${student.name}</td>
      <td data-label="Morning">${attendance.morning ? 'Present' : 'Absent'}</td>
      <td data-label="Afternoon">${attendance.afternoon ? 'Present' : 'Absent'}</td>
    `;
    tableBody.appendChild(row);
  });
}

function generateAttendanceReport() {
  if (!isLoggedIn) return;

  const startDate = document.getElementById("report-start-date").value;
  const endDate = document.getElementById("report-end-date").value;
  
  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  let report = "Roll Number,Name,Date,Morning,Afternoon\n";
  
  students.forEach(student => {
    for (let date in student.attendance) {
      if (date >= startDate && date <= endDate) {
        const attendance = student.attendance[date];
        report += `${student.rollNumber},${student.name},${date},${attendance.morning ? 'Present' : 'Absent'},${attendance.afternoon ? 'Present' : 'Absent'}\n`;
      }
    }
  });

  const blob = new Blob([report], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'attendance_report.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showAddStudent() {
  if (!isLoggedIn) return;
  hideAllSections();
  document.getElementById("add-student").style.display = "block";
}

function showStudentList() {
  if (!isLoggedIn) return;
  hideAllSections();
  document.getElementById("student-list").style.display = "block";
  updateStudentList();
}

function showMarkAttendance() {
  if (!isLoggedIn) return;
  hideAllSections();
  document.getElementById("mark-attendance").style.display = "block";
  document.getElementById("attendance-date").valueAsDate = new Date();
  document.getElementById("attendance-period").value = 'full'; // Reset period to full day
  updateMarkAttendance();
}
function showReports() {
  if (!isLoggedIn) return;
  hideAllSections();
  document.getElementById("reports").style.display = "block";
}

function hideAllSections() {
  const sections = ["dashboard", "add-student", "student-list", "mark-attendance", "view-attendance", "reports"];
  sections.forEach(section => {
    document.getElementById(section).style.display = "none";
  });
}

document.getElementById("delete-all-data").addEventListener("click", function() {
  if (!isLoggedIn) return;

  if (confirm("Are you sure you want to delete all saved data? This action cannot be undone.")) {
    localStorage.removeItem('students');
    students = [];
    updateStudentList();
    alert("All saved data has been deleted.");
  }
});

function initApp() {
  updateStudentList();
  document.getElementById("attendance-date").valueAsDate = new Date();
  document.getElementById("view-attendance-date").valueAsDate = new Date();
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("report-start-date").value = today;
  document.getElementById("report-end-date").value = today;
}

document.querySelector('.dropbtn').addEventListener('click', function(e) {
  e.stopPropagation();
  document.querySelector('.dropdown-content').style.display = 
    document.querySelector('.dropdown-content').style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', function(e) {
  if (!e.target.matches('.dropbtn')) {
    document.querySelector('.dropdown-content').style.display = 'none';
  }
});

document.getElementById('attendance-period').addEventListener('change', updateMarkAttendance);
document.getElementById('attendance-search').addEventListener('input', updateMarkAttendance);

window.addEventListener('load', function() {
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('app-container').style.display = 'none';
});

window.addEventListener('beforeunload', function() {
  saveData();
});

function toggleBottomNav() {
  const bottomNav = document.getElementById('bottom-nav');
  if (window.innerWidth <= 768 && isLoggedIn) {
    bottomNav.style.display = 'flex';
  } else {
    bottomNav.style.display = 'none';
  }
}

// Initialize the application
initApp()

// Additional helper functions

function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("attendance-date").addEventListener('change', updateMarkAttendance);
});