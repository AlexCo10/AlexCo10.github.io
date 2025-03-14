// JavaScript for student-details.html page
if (!window.location.search) {
  window.location.href = 'index.html';
}

const API_URL = 'https://ubsuofrvgbvtryjuzxhb.supabase.co/rest/v1/';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVic3VvZnJ2Z2J2dHJ5anV6eGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Mjc4MDUsImV4cCI6MjA1NjIwMzgwNX0.-SOdP6tT6URg_Z9x-L9j3R4jw-mSNofm4zIiykmcGYA';

// Get student code from URL
const urlParams = new URLSearchParams(window.location.search);
const studentCode = urlParams.get('code');

// DOM Elements
const studentPhoto = document.getElementById('studentPhoto');
const studentName = document.getElementById('studentName');
const studentCode = document.getElementById('studentCode');
const studentEmail = document.getElementById('studentEmail');
const studentGithub = document.getElementById('studentGithub');
const studentDesc = document.getElementById('studentDesc');
const technologiesList = document.getElementById('technologiesList');
const editStudentBtn = document.getElementById('editStudentBtn');
const addTechnologyBtn = document.getElementById('addTechnologyBtn');
const technologyModal = document.getElementById('technologyModal');
const technologyForm = document.getElementById('technologyForm');
const technologySelect = document.getElementById('technologySelect');
const skillLevel = document.getElementById('skillLevel');
const skillLevelRating = document.getElementById('skillLevelRating');
const closeTechModal = document.getElementById('closeTechModal');
const cancelTechBtn = document.getElementById('cancelTechBtn');
const saveTechnologyBtn = document.getElementById('saveTechnologyBtn');
const techModalTitle = document.getElementById('techModalTitle');
const editTechMode = document.getElementById('editTechMode');
const currentTechCode = document.getElementById('currentTechCode');
const viewPortfolioBtn = document.getElementById('viewPortfolioBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const confirmDialog = document.getElementById('confirmDialog');
const confirmMessage = document.getElementById('confirmMessage');
const closeConfirmDialog = document.getElementById('closeConfirmDialog');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const confirmActionBtn = document.getElementById('confirmActionBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadStudent();
  loadTechnologies();
  loadStudentTechnologies();
  
  // Setup portfolio link
  updatePortfolioLink();
  
  // Setup event listeners
  editStudentBtn.addEventListener('click', () => {
    window.location.href = `index.html?edit=${studentCode}`;
  });
  
  addTechnologyBtn.addEventListener('click', () => openTechModal('add'));
  closeTechModal.addEventListener('click', hideTechModal);
  cancelTechBtn.addEventListener('click', hideTechModal);
  saveTechnologyBtn.addEventListener('click', saveTechnology);
  
  // Star rating setup
  const stars = skillLevelRating.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.getAttribute('data-value'));
      skillLevel.value = value;
      updateStarRating(value);
    });
    
    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.getAttribute('data-value'));
      highlightStars(value);
    });
    
    star.addEventListener('mouseleave', () => {
      const currentValue = parseInt(skillLevel.value) || 0;
      highlightStars(currentValue);
    });
  });
  
  // Confirm dialog setup
  closeConfirmDialog.addEventListener('click', hideConfirmDialog);
  cancelConfirmBtn.addEventListener('click', hideConfirmDialog);
});

// Load student data
async function loadStudent() {
  try {
    const response = await fetch(`${API_URL}student?code=eq.${studentCode}`, {
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch student');
    }
    
    const [student] = await response.json();
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Update the UI with student data
    document.title = `${student.name} - Student Details`;
    studentName.textContent = student.name;
    studentCode.textContent = student.code;
    
    if (student.email) {
      studentEmail.innerHTML = `<i class="bi bi-envelope"></i> <a href="mailto:${student.email}">${student.email}</a>`;
    } else {
      studentEmail.innerHTML = `<i class="bi bi-envelope"></i> <span class="text-muted">No email provided</span>`;
    }
    
    if (student.github_link) {
      studentGithub.innerHTML = `<i class="bi bi-github"></i> <a href="${student.github_link}" target="_blank">GitHub Profile</a>`;
    } else {
      studentGithub.innerHTML = `<i class="bi bi-github"></i> <span class="text-muted">No GitHub profile</span>`;
    }
    
    if (student.photo) {
      studentPhoto.src = student.photo;
    }
    
    studentDesc.textContent = student.description || 'No description available';
    
  } catch (error) {
    console.error('Error loading student:', error);
    showToast('Failed to load student details', 'error');
  }
}

// Load all technologies
async function loadTechnologies() {
  try {
    const response = await fetch(`${API_URL}technology`, {
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch technologies');
    }
    
    const technologies = await response.json();
    
    // Populate the technology select dropdown
    technologySelect.innerHTML = '<option value="">Select a technology...</option>';
    technologies.forEach(tech => {
      const option = document.createElement('option');
      option.value = tech.code;
      option.textContent = tech.name;
      technologySelect.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error loading technologies:', error);
    showToast('Failed to load technologies', 'error');
  }
}

// Load student's technologies
async function loadStudentTechnologies() {
  try {
    // Fetch student technologies with technology details
    const response = await fetch(`${API_URL}student_technology?student_code=eq.${studentCode}&select=*,technology(*)`, {
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch student technologies');
    }
    
    const technologies = await response.json();
    
    if (technologies.length === 0) {
      technologiesList.innerHTML = `
        <tr>
          <td colspan="4" class="text-center p-4">
            <p class="text-muted">No technologies added yet.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    technologiesList.innerHTML = technologies.map(tech => `
      <tr data-tech-code="${tech.technology_code}">
        <td class="text-center">
          <img src="${tech.technology.image || 'https://via.placeholder.com/40'}" 
               alt="${tech.technology.name}" 
               style="width: 40px; height: 40px; border-radius: 50%; display: inline-block; object-fit: contain;">
        </td>
        <td>${tech.technology.name}</td>
        <td>
          <div class="star-rating">
            ${generateStars(tech.level)}
          </div>
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-icon edit-tech-btn" data-tech-code="${tech.technology_code}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-icon delete-tech-btn" data-tech-code="${tech.technology_code}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.edit-tech-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const techCode = btn.getAttribute('data-tech-code');
        openTechModal('edit', techCode);
      });
    });
    
    document.querySelectorAll('.delete-tech-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const techCode = btn.getAttribute('data-tech-code');
        openConfirmDialog(
          `Are you sure you want to remove "${techCode}" from this student's technologies?`,
          () => deleteTechnology(techCode)
        );
      });
    });
    
  } catch (error) {
    console.error('Error loading student technologies:', error);
    showToast('Failed to load technologies', 'error');
  }
}

// Generate star rating HTML
function generateStars(level) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= level) {
      stars += '<i class="bi bi-star-fill star filled"></i>';
    } else {
      stars += '<i class="bi bi-star star"></i>';
    }
  }
  return stars;
}

// Open the technology modal for adding or editing
function openTechModal(mode, techCode = null) {
  editTechMode.value = mode;
  
  if (mode === 'add') {
    techModalTitle.textContent = 'Add New Technology';
    technologyForm.reset();
    technologySelect.disabled = false;
  } else {
    techModalTitle.textContent = 'Edit Technology Level';
    currentTechCode.value = techCode;
    technologySelect.value = techCode;
    technologySelect.disabled = true;
  }
  
  technologyModal.classList.add('active');
}

// Hide technology modal
function hideTechModal() {
  technologyModal.classList.remove('active');
}

// Update star rating display
function updateStarRating(value) {
  highlightStars(value);
  skillLevel.value = value;
}

// Highlight stars up to the selected value
function highlightStars(value) {
  const stars = skillLevelRating.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < value) {
      star.className = 'bi bi-star-fill star filled';
    } else {
      star.className = 'bi bi-star star';
    }
  });
}

// Save technology
async function saveTechnology() {
  const isAdding = editTechMode.value === 'add';
  const techCode = isAdding ? technologySelect.value : currentTechCode.value;
  const level = parseInt(skillLevel.value);
  
  if (!techCode) {
    showToast('Please select a technology', 'error');
    return;
  }
  
  if (level < 1 || level > 5) {
    showToast('Skill level must be between 1 and 5', 'error');
    return;
  }
  
  try {
    if (isAdding) {
      // Check if this student already has this technology
      const checkResponse = await fetch(
        `${API_URL}student_technology?student_code=eq.${studentCode}&technology_code=eq.${techCode}`, {
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      if (!checkResponse.ok) {
        throw new Error('Failed to check existing technology');
      }
      
      const existing = await checkResponse.json();
      
      if (existing.length > 0) {
        showToast('This student already has this technology', 'error');
        return;
      }
      
      // Add the technology
      const response = await fetch(`${API_URL}student_technology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          student_code: studentCode,
          technology_code: parseInt(techCode),
          level
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add technology');
      }
      
      showToast('Technology added successfully', 'success');
    } else {
      // Update the technology level
      const response = await fetch(
        `${API_URL}student_technology?student_code=eq.${studentCode}&technology_code=eq.${techCode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          level
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update technology');
      }
      
      showToast('Technology updated successfully', 'success');
    }
    
    hideTechModal();
    loadStudentTechnologies();
    
  } catch (error) {
    console.error('Error saving technology:', error);
    showToast(`Failed to ${isAdding ? 'add' : 'update'} technology`, 'error');
  }
}

// Delete technology
async function deleteTechnology(techCode) {
  try {
    const response = await fetch(
      `${API_URL}student_technology?student_code=eq.${studentCode}&technology_code=eq.${techCode}`, {
      method: 'DELETE',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete technology');
    }
    
    showToast('Technology removed successfully', 'success');
    loadStudentTechnologies();
    
  } catch (error) {
    console.error('Error deleting technology:', error);
    showToast('Failed to remove technology', 'error');
  }
}

// Show confirm dialog
function openConfirmDialog(message, onConfirm) {
  confirmMessage.textContent = message;
  confirmDialog.classList.add('active');
  
  // Set the confirm action
  confirmActionBtn.onclick = () => {
    onConfirm();
    hideConfirmDialog();
  };
}

// Hide confirm dialog
function hideConfirmDialog() {
  confirmDialog.classList.remove('active');
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

// Update portfolio link
function updatePortfolioLink() {
  viewPortfolioBtn.href = `portfolio.html?code=${studentCode}`;
}
