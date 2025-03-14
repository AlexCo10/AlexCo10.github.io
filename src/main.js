
// Main JavaScript file for the index page
const API_URL = 'https://ubsuofrvgbvtryjuzxhb.supabase.co/rest/v1/';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVic3VvZnJ2Z2J2dHJ5anV6eGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Mjc4MDUsImV4cCI6MjA1NjIwMzgwNX0.-SOdP6tT6URg_Z9x-L9j3R4jw-mSNofm4zIiykmcGYA';

// DOM Elements
const studentsContainer = document.getElementById('studentsContainer');
const studentModal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const editMode = document.getElementById('editMode');
const studentCode = document.getElementById('studentCode');
const studentName = document.getElementById('studentName');
const studentEmail = document.getElementById('studentEmail');
const studentPhoto = document.getElementById('studentPhoto');
const studentDesc = document.getElementById('studentDesc');
const studentGithub = document.getElementById('studentGithub');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveStudentBtn = document.getElementById('saveStudentBtn');
const addStudentBtn = document.getElementById('addStudentBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Store all students for filtering
let allStudents = [];

// Load students when page loads
window.addEventListener('DOMContentLoaded', loadStudents);

// Setup event listeners
addStudentBtn.addEventListener('click', () => openModal('add'));
closeModal.addEventListener('click', hideModal);
cancelBtn.addEventListener('click', hideModal);
saveStudentBtn.addEventListener('click', saveStudent);

// Search functionality
searchInput.addEventListener('input', handleSearch);
clearSearchBtn.addEventListener('click', clearSearch);

function handleSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  // Show/hide clear button
  clearSearchBtn.style.display = searchTerm ? 'flex' : 'none';
  
  if (!searchTerm) {
    renderStudents(allStudents);
    return;
  }
  
  const filteredStudents = allStudents.filter(student => 
    (student.name && student.name.toLowerCase().includes(searchTerm)) || 
    (student.email && student.email.toLowerCase().includes(searchTerm)) || 
    (student.code && student.code.toLowerCase().includes(searchTerm))
  );
  
  renderStudents(filteredStudents);
}

function clearSearch() {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  renderStudents(allStudents);
  searchInput.focus();
}

// Fetch all students from the API
async function loadStudents() {
  try {
    const response = await fetch(`${API_URL}student`, {
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    
    allStudents = await response.json();
    renderStudents(allStudents);
  } catch (error) {
    console.error('Error loading students:', error);
    showToast('Failed to load students', 'error');
    studentsContainer.innerHTML = `
      <div class="card p-6 text-center">
        <i class="bi bi-exclamation-triangle" style="font-size: 2rem; color: hsl(var(--destructive));"></i>
        <p class="mt-4">Failed to load students. Please try again later.</p>
        <button class="btn btn-primary mt-4" onclick="loadStudents()">Retry</button>
      </div>
    `;
  }
}

// Render students in the UI
function renderStudents(students) {
  if (students.length === 0) {
    studentsContainer.innerHTML = `
      <div class="card p-6 text-center">
        <i class="bi bi-people" style="font-size: 2rem; color: hsl(var(--muted-foreground));"></i>
        <p class="mt-4">No students found. Add your first student!</p>
      </div>
    `;
    return;
  }
  
  studentsContainer.innerHTML = students.map(student => `
    <div class="card" data-code="${student.code}">
      <div class="scale-in" style="animation-delay: ${Math.random() * 0.3}s">
        <div style="padding: 1.5rem; display: flex; justify-content: center;">
          <img src="${student.photo || 'https://via.placeholder.com/150?text=No+Photo'}" 
               alt="${student.name}" 
               class="student-image" style="width: 150px; height: 150px;">
        </div>
        <div class="p-4">
          <h3 class="text-xl font-bold mb-2 text-center">${student.name}</h3>
          <p class="chip text-center" style="display: block; width: fit-content; margin: 0 auto;">${student.code}</p>
          <p class="text-sm text-muted mb-4 mt-2">${truncateText(student.description || 'No description available', 100)}</p>
          <div class="flex justify-between items-center">
            <a href="student-details.html?code=${student.code}" class="btn btn-outline">
              <i class="bi bi-info-circle"></i> Details
            </a>
            <button class="btn btn-icon edit-btn" data-code="${student.code}">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = btn.getAttribute('data-code');
      openModal('edit', code);
    });
  });
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Open the modal for adding or editing a student
async function openModal(mode, code = null) {
  editMode.value = mode;
  
  if (mode === 'add') {
    modalTitle.textContent = 'Add New Student';
    studentForm.reset();
    studentCode.readOnly = false;
  } else {
    modalTitle.textContent = 'Edit Student';
    studentCode.readOnly = true;
    
    try {
      const response = await fetch(`${API_URL}student?code=eq.${code}`, {
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch student');
      }
      
      const [student] = await response.json();
      
      studentCode.value = student.code;
      studentName.value = student.name;
      studentEmail.value = student.email || '';
      studentPhoto.value = student.photo || '';
      studentDesc.value = student.description || '';
      studentGithub.value = student.github_link || '';
      
    } catch (error) {
      console.error('Error loading student:', error);
      showToast('Failed to load student details', 'error');
      return;
    }
  }
  
  studentModal.classList.add('active');
}

// Hide the modal
function hideModal() {
  studentModal.classList.remove('active');
}

// Save student data
async function saveStudent() {
  const code = studentCode.value.trim();
  const name = studentName.value.trim();
  const email = studentEmail.value.trim();
  const photo = studentPhoto.value.trim();
  const description = studentDesc.value.trim();
  const github_link = studentGithub.value.trim();
  
  if (!code || !name) {
    showToast('Student code and name are required', 'error');
    return;
  }
  
  if (code.length > 7) {
    showToast('Student code must be 7 characters or less', 'error');
    return;
  }
  
  const studentData = {
    code,
    name,
    email,
    photo,
    description,
    github_link
  };
  
  const isAdding = editMode.value === 'add';
  
  try {
    const url = `${API_URL}student${isAdding ? '' : '?code=eq.' + code}`;
    const method = isAdding ? 'POST' : 'PATCH';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Prefer': isAdding ? 'return=representation' : 'return=minimal'
      },
      body: JSON.stringify(studentData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to ${isAdding ? 'add' : 'update'} student: ${errorText}`);
    }
    
    hideModal();
    showToast(`Student ${isAdding ? 'added' : 'updated'} successfully`, 'success');
    loadStudents();
    
  } catch (error) {
    console.error('Error saving student:', error);
    showToast(`Failed to ${isAdding ? 'add' : 'update'} student`, 'error');
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  
  if (type === 'error') {
    toastIcon.className = 'bi bi-x-circle';
    toastIcon.style.color = 'hsl(var(--destructive))';
  } else {
    toastIcon.className = 'bi bi-check-circle';
    toastIcon.style.color = 'hsl(var(--primary))';
  }
  
  toast.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    toast.style.transform = 'translateY(150%)';
  }, 3000);
}
