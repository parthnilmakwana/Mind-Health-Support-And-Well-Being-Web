const journalButton = document.getElementById('openJournalBtn');
const journalModal = document.getElementById('journalModal');
const journalText = document.getElementById('journalText');
const journalHistory = document.getElementById('journalHistory');

let journalData = JSON.parse(localStorage.getItem('moodJournal')) || [];

// Function to update the journal history (last 3 notes)
function updateJournalHistory() {
  journalHistory.innerHTML = '';
  const last3Notes = journalData.slice(-3).reverse();
  last3Notes.forEach(note => {
    const li = document.createElement('li');
    li.textContent = note;
    journalHistory.appendChild(li);
  });
}

// Function to save the journal entry
function saveJournal() {
  const note = journalText.value.trim();
  if (note) {
    journalData.push(note);
    localStorage.setItem('moodJournal', JSON.stringify(journalData));
    journalText.value = '';  // Clear the text area
    updateJournalHistory();  // Update history
  }
}

// Function to toggle the modal (popup)
function toggleJournalModal() {
  if (journalModal.classList.contains('active')) {
    journalModal.classList.remove('active');
  } else {
    // Ensure modal is a direct child of body to avoid ancestor stacking contexts
    if (journalModal.parentElement !== document.body) {
      document.body.appendChild(journalModal);
    }
    journalModal.classList.add('active');
  }
}

// Initialize the journal history when the page loads
updateJournalHistory();
