
// JavaScript for portfolio page
const API_URL = 'https://ubsuofrvgbvtryjuzxhb.supabase.co/rest/v1/';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVic3VvZnJ2Z2J2dHJ5anV6eGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Mjc4MDUsImV4cCI6MjA1NjIwMzgwNX0.-SOdP6tT6URg_Z9x-L9j3R4jw-mSNofm4zIiykmcGYA';

// DOM Elements
const studentPhoto = document.getElementById('studentPhoto');
const studentName = document.getElementById('studentName');
const studentCode = document.getElementById('studentCode');
const studentEmail = document.getElementById('studentEmail');
const studentEmailLink = document.getElementById('studentEmailLink');
const studentGithub = document.getElementById('studentGithub');
const studentGithubLink = document.getElementById('studentGithubLink');
const studentDesc = document.getElementById('studentDesc');
const technologiesList = document.getElementById('technologiesList');
const detailsLink = document.getElementById('detailsLink');

// Get student code from URL
const urlParams = new URLSearchParams(window.location.search);
const studentCodeParam = urlParams.get('code');

if (!studentCodeParam) {
  window.location.href = 'index.html';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadStudent();
  loadStudentTechnologies();
  
  // Setup the "Manage Profile" link
  detailsLink.href = `student-details.html?code=${studentCodeParam}`;
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Update active nav pill
        document.querySelectorAll('.nav-pill').forEach(pill => {
          pill.classList.remove('active');
        });
        this.classList.add('active');
        
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Observe sections for nav highlighting
  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          document.querySelectorAll('.nav-pill').forEach(pill => {
            pill.classList.remove('active');
          });
          document.querySelector(`.nav-pill[href="#${id}"]`).classList.add('active');
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach(section => {
      observer.observe(section);
    });
  }
});

// Load student data
async function loadStudent() {
  try {
    const response = await fetch(`${API_URL}student?code=eq.${studentCodeParam}`, {
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
    document.title = `${student.name} - Portfolio`;
    studentName.textContent = student.name;
    studentCode.textContent = student.code;
    
    if (student.email) {
      studentEmail.href = `mailto:${student.email}`;
      studentEmailLink.textContent = student.email;
      studentEmailLink.href = `mailto:${student.email}`;
    } else {
      studentEmail.style.display = 'none';
      document.getElementById('studentEmailCard').style.display = 'none';
    }
    
    if (student.github_link) {
      studentGithub.href = student.github_link;
      studentGithubLink.textContent = student.github_link.replace(/^https?:\/\//, '');
      studentGithubLink.href = student.github_link;
    } else {
      studentGithub.style.display = 'none';
      document.getElementById('studentGithubCard').style.display = 'none';
    }
    
    if (student.photo) {
      studentPhoto.src = student.photo;
    }
    
    studentDesc.textContent = student.description || 'No description available';
    
  } catch (error) {
    console.error('Error loading student:', error);
    alert('Failed to load student details. Redirecting to home page.');
    window.location.href = 'index.html';
  }
}

// Load student's technologies
async function loadStudentTechnologies() {
  try {
    // Using a join-like query to get technology details along with student_technology
    const response = await fetch(
      `${API_URL}student_technology?student_code=eq.${studentCodeParam}&select=*,technology:technology_code(*)`, {
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch student technologies');
    }
    
    const studentTechs = await response.json();
    
    if (studentTechs.length === 0) {
      technologiesList.innerHTML = `
        <div class="text-center p-4">
          <p class="text-muted">No technologies added yet.</p>
        </div>
      `;
      return;
    }
    
    // Sort technologies by level (highest first)
    studentTechs.sort((a, b) => b.level - a.level);
    
    // Render the technologies
    technologiesList.innerHTML = studentTechs.map((item, index) => {
      const tech = item.technology;
      return `
        <div class="tech-card fade-in" style="animation-delay: ${0.1 + index * 0.1}s">
          <img src="${tech.image || 'https://via.placeholder.com/48?text=T'}" 
               alt="${tech.name}" 
               class="tech-image">
          <div class="tech-info">
            <h3 class="font-bold">${tech.name}</h3>
            <div class="star-rating">
              ${renderStars(item.level)}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading student technologies:', error);
    technologiesList.innerHTML = `
      <div class="text-center p-4">
        <p class="text-muted">Failed to load technologies.</p>
      </div>
    `;
  }
}

// Render star rating
function renderStars(level) {
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
