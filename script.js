// Data Management
let events = JSON.parse(localStorage.getItem('events')) || [];
let guests = JSON.parse(localStorage.getItem('guests')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let venues = JSON.parse(localStorage.getItem('venues')) || [];

// Event Type Images from Unsplash
const eventImages = {
    wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    party: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
    corporate: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
    other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop'
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadDashboard();
    loadEvents();
    loadGuests();
    loadBudget();
    loadVenues();
    setupEventListeners();
    updateEventFilters();
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update active section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Close mobile menu if open
            document.querySelector('.nav-menu').classList.remove('active');
        });
    });
    
    // Mobile menu toggle
    document.querySelector('.mobile-menu-toggle').addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
    });
}

// Dashboard Functions
function loadDashboard() {
    // Update statistics
    document.getElementById('totalEvents').textContent = events.length;
    document.getElementById('totalGuests').textContent = guests.length;
    
    const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
    document.getElementById('upcomingEvents').textContent = upcomingEvents.length;
    
    const totalBudget = events.reduce((sum, event) => sum + parseFloat(event.budget || 0), 0);
    document.getElementById('totalBudget').textContent = `$${totalBudget.toLocaleString()}`;
    
    // Load upcoming events preview
    loadUpcomingEventsPreview();
}

function loadUpcomingEventsPreview() {
    const container = document.getElementById('upcomingEventsList');
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No upcoming events</p>';
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => `
        <div class="event-card">
            <img src="${eventImages[event.type] || eventImages.other}" alt="${event.name}" class="event-image">
            <div class="event-content">
                <span class="event-type">${event.type}</span>
                <h3 class="event-title">${event.name}</h3>
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.date)}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-clock"></i>
                        <span>${event.time}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Event Management
function loadEvents() {
    const container = document.getElementById('eventsList');
    const searchTerm = document.getElementById('eventSearch').value.toLowerCase();
    const typeFilter = document.getElementById('eventTypeFilter').value;
    
    let filteredEvents = events.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm) || 
                             event.location.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || event.type === typeFilter;
        return matchesSearch && matchesType;
    });
    
    if (filteredEvents.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096; grid-column: 1/-1;">No events found</p>';
        return;
    }
    
    container.innerHTML = filteredEvents.map(event => `
        <div class="event-card">
            <img src="${eventImages[event.type] || eventImages.other}" alt="${event.name}" class="event-image">
            <div class="event-content">
                <span class="event-type">${event.type}</span>
                <h3 class="event-title">${event.name}</h3>
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.date)}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-clock"></i>
                        <span>${event.time}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Budget: $${parseFloat(event.budget).toLocaleString()}</span>
                    </div>
                </div>
                <div class="event-actions">
                    <button class="btn btn-sm btn-primary" onclick="editEvent('${event.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openEventModal() {
    document.getElementById('eventModal').classList.add('active');
    document.getElementById('eventForm').reset();
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
}

document.getElementById('eventForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const event = {
        id: Date.now().toString(),
        name: document.getElementById('eventName').value,
        type: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        budget: document.getElementById('eventBudget').value,
        description: document.getElementById('eventDescription').value,
        createdAt: new Date().toISOString()
    };
    
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));
    
    closeEventModal();
    loadEvents();
    loadDashboard();
    updateEventFilters();
    
    showNotification('Event created successfully!', 'success');
});

function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    events = events.filter(e => e.id !== eventId);
    localStorage.setItem('events', JSON.stringify(events));
    
    // Also delete related guests and expenses
    guests = guests.filter(g => g.eventId !== eventId);
    expenses = expenses.filter(e => e.eventId !== eventId);
    localStorage.setItem('guests', JSON.stringify(guests));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    loadEvents();
    loadDashboard();
    loadGuests();
    loadBudget();
    updateEventFilters();
    
    showNotification('Event deleted successfully!', 'success');
}

function editEvent(eventId) {
    // For simplicity, we'll just delete and recreate
    // In a real app, you'd populate the form with existing data
    showNotification('Edit functionality coming soon!', 'info');
}

// Guest Management
function loadGuests() {
    const tbody = document.getElementById('guestsTableBody');
    const searchTerm = document.getElementById('guestSearch').value.toLowerCase();
    const eventFilter = document.getElementById('guestEventFilter').value;
    
    let filteredGuests = guests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchTerm) || 
                             guest.email.toLowerCase().includes(searchTerm);
        const matchesEvent = !eventFilter || guest.eventId === eventFilter;
        return matchesSearch && matchesEvent;
    });
    
    if (filteredGuests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #718096;">No guests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredGuests.map(guest => {
        const event = events.find(e => e.id === guest.eventId);
        const rsvpClass = `rsvp-${guest.rsvp}`;
        
        return `
            <tr>
                <td>${guest.name}</td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td>${event ? event.name : 'N/A'}</td>
                <td><span class="rsvp-badge ${rsvpClass}">${guest.rsvp}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="sendInvitation('${guest.id}')">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteGuest('${guest.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openGuestModal() {
    document.getElementById('guestModal').classList.add('active');
    document.getElementById('guestForm').reset();
    
    // Populate event dropdown
    const eventSelect = document.getElementById('guestEvent');
    eventSelect.innerHTML = '<option value="">Select Event</option>' + 
        events.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
}

function closeGuestModal() {
    document.getElementById('guestModal').classList.remove('active');
}

document.getElementById('guestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const guest = {
        id: Date.now().toString(),
        name: document.getElementById('guestName').value,
        email: document.getElementById('guestEmail').value,
        phone: document.getElementById('guestPhone').value,
        eventId: document.getElementById('guestEvent').value,
        rsvp: document.getElementById('guestRsvp').value,
        createdAt: new Date().toISOString()
    };
    
    guests.push(guest);
    localStorage.setItem('guests', JSON.stringify(guests));
    
    closeGuestModal();
    loadGuests();
    loadDashboard();
    
    showNotification('Guest added successfully!', 'success');
});

function deleteGuest(guestId) {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    
    guests = guests.filter(g => g.id !== guestId);
    localStorage.setItem('guests', JSON.stringify(guests));
    
    loadGuests();
    loadDashboard();
    
    showNotification('Guest deleted successfully!', 'success');
}

function sendInvitation(guestId) {
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
        showNotification(`Invitation sent to ${guest.email}!`, 'success');
    }
}

// Budget Management
function loadBudget() {
    const totalBudget = events.reduce((sum, event) => sum + parseFloat(event.budget || 0), 0);
    const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const remaining = totalBudget - totalSpent;
    
    document.getElementById('totalBudgetAmount').textContent = `$${totalBudget.toLocaleString()}`;
    document.getElementById('totalSpentAmount').textContent = `$${totalSpent.toLocaleString()}`;
    document.getElementById('remainingAmount').textContent = `$${remaining.toLocaleString()}`;
    
    // Load expenses list
    const expensesList = document.getElementById('expensesList');
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p style="text-align: center; color: #718096;">No expenses recorded</p>';
        return;
    }
    
    expensesList.innerHTML = expenses.map(expense => {
        const event = events.find(e => e.id === expense.eventId);
        
        return `
            <div class="expense-item">
                <div class="expense-info">
                    <h4>${expense.name}</h4>
                    <div class="expense-meta">
                        <span><i class="fas fa-tag"></i> ${expense.category}</span>
                        <span><i class="fas fa-calendar"></i> ${event ? event.name : 'N/A'}</span>
                    </div>
                </div>
                <div>
                    <div class="expense-amount">$${parseFloat(expense.amount).toLocaleString()}</div>
                    <button class="btn btn-sm btn-danger" onclick="deleteExpense('${expense.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openExpenseModal() {
    document.getElementById('expenseModal').classList.add('active');
    document.getElementById('expenseForm').reset();
    
    // Populate event dropdown 
    const eventSelect = document.getElementById('expenseEvent');
    eventSelect.innerHTML = '<option value="">Select Event</option>' + 
        events.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
}

function closeExpenseModal() {
    document.getElementById('expenseModal').classList.remove('active');
}

document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const expense = {
        id: Date.now().toString(),
        name: document.getElementById('expenseName').value,
        amount: document.getElementById('expenseAmount').value,
        category: document.getElementById('expenseCategory').value,
        eventId: document.getElementById('expenseEvent').value,
        createdAt: new Date().toISOString()
    };
    
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    closeExpenseModal();
    loadBudget();
    
    showNotification('Expense added successfully!', 'success');
});

function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    expenses = expenses.filter(e => e.id !== expenseId);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    loadBudget();
    
    showNotification('Expense deleted successfully!', 'success');
}

// Venue Management
function loadVenues() {
    const container = document.getElementById('venuesList');
    
    if (venues.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096; grid-column: 1/-1;">No venues/vendors added yet</p>';
        return;
    }
    
    container.innerHTML = venues.map(venue => {
        const stars = '★'.repeat(venue.rating) + '☆'.repeat(5 - venue.rating);
        
        return `
            <div class="venue-card">
                <div class="venue-header">
                    <div>
                        <h3>${venue.name}</h3>
                        <span class="venue-type-badge">${venue.type}</span>
                    </div>
                    <div class="venue-rating">${stars}</div>
                </div>
                <div class="venue-details">
                    <div><i class="fas fa-phone"></i> ${venue.contact}</div>
                    <div><i class="fas fa-envelope"></i> ${venue.email}</div>
                    <div><i class="fas fa-dollar-sign"></i> ${venue.price || 'Price not set'}</div>
                </div>
                <div class="event-actions" style="margin-top: 1rem;">
                    <button class="btn btn-sm btn-primary" onclick="contactVenue('${venue.id}')">
                        <i class="fas fa-phone"></i> Contact
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVenue('${venue.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openVenueModal() {
    document.getElementById('venueModal').classList.add('active');
    document.getElementById('venueForm').reset();
}

function closeVenueModal() {
    document.getElementById('venueModal').classList.remove('active');
}

document.getElementById('venueForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const venue = {
        id: Date.now().toString(),
        name: document.getElementById('venueName').value,
        type: document.getElementById('venueType').value,
        contact: document.getElementById('venueContact').value,
        email: document.getElementById('venueEmail').value,
        price: document.getElementById('venuePrice').value,
        rating: parseInt(document.getElementById('venueRating').value),
        createdAt: new Date().toISOString()
    };
    
    venues.push(venue);
    localStorage.setItem('venues', JSON.stringify(venues));
    
    closeVenueModal();
    loadVenues();
    
    showNotification('Venue/Vendor added successfully!', 'success');
});

function deleteVenue(venueId) {
    if (!confirm('Are you sure you want to delete this venue/vendor?')) return;
    
    venues = venues.filter(v => v.id !== venueId);
    localStorage.setItem('venues', JSON.stringify(venues));
    
    loadVenues();
    
    showNotification('Venue/Vendor deleted successfully!', 'success');
}

function contactVenue(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
        showNotification(`Contacting ${venue.name} at ${venue.contact}`, 'info');
    }
}

// Helper Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showNotification(message, type = 'success') {
    // Create notification element 
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateEventFilters() {
    // Update guest event filter
    const guestEventFilter = document.getElementById('guestEventFilter');
    guestEventFilter.innerHTML = '<option value="">All Events</option>' + 
        events.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    // Search and filter listeners
    document.getElementById('eventSearch').addEventListener('input', loadEvents);
    document.getElementById('eventTypeFilter').addEventListener('change', loadEvents);
    document.getElementById('guestSearch').addEventListener('input', loadGuests);
    document.getElementById('guestEventFilter').addEventListener('change', loadGuests);
    
    // Modal close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Add fade out animation 
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);