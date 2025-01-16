/**
 * Displays a notification with a given type, content, and duration.
 * Automatically removes the notification after the specified duration.
 */

const bell = document.getElementById('notificationBell');
const count = document.getElementById('notificationCount');
const dropdown = document.getElementById('notificationDropdown');
const notificationList = document.getElementById('notificationList');

let notificationCount = 0;
let swingInterval = null;

// Function to add a new notification
function addNotification(content) {
  notificationCount++;
  count.textContent = notificationCount;

  // Benachrichtigung hinzufügen
  const li = document.createElement('li');
  li.classList.add('notification-item');

  const text = document.createElement('span');
  text.innerHTML = content;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '✖';
  deleteBtn.addEventListener('click', () => deleteNotification(li));

  li.appendChild(text);
  li.appendChild(deleteBtn);
  notificationList.appendChild(li);

  // Glockenschwingen starten
  startBellSwinging();
}

function startBellSwinging() {
  if (!swingInterval) {
    swingInterval = setInterval(() => {
      if (notificationCount > 0) {
        bell.classList.add('swing');
        setTimeout(() => bell.classList.remove('swing'), 500);
      } else {
        stopBellSwinging();
      }
    }, 3000); // Alle 3 Sekunden schwingen
  }
}

bell.addEventListener('click', (e) => {
  e.stopPropagation(); // Verhindert, dass der Dokument-Click das Dropdown sofort schließt
});

document.addEventListener('click', () => {
  if (!dropdown.classList.contains('hidden')) {
      dropdown.classList.add('hidden');
  }
});

function stopBellSwinging() {
  clearInterval(swingInterval);
  swingInterval = null;
}

// Function to delete a notification
function deleteNotification(notificationElement) {
  notificationList.removeChild(notificationElement);
  notificationCount--;
  count.textContent = notificationCount;

  // Dropdown ausblenden, wenn keine Benachrichtigungen mehr vorhanden sind
  if (notificationCount === 0) {
    dropdown.classList.add('hidden');
  }
}

function resetNotification() {
  notificationList.innerHTML = "";
  notificationCount = 0;
  count.textContent = notificationCount;
  dropdown.classList.add('hidden');
}


// Toggle dropdown with animation
bell.addEventListener('click', () => {
  if (dropdown.classList.contains('hidden')) {
    dropdown.classList.remove('hidden');
    dropdown.classList.remove('closing');
    dropdown.classList.add('opening');

    dropdown.addEventListener('animationend', () => {
      dropdown.classList.remove('opening');
    }, { once: true });
  } else {
    dropdown.classList.remove('opening');
    dropdown.classList.add('closing');

    dropdown.addEventListener('animationend', () => {
      dropdown.classList.add('hidden');
      dropdown.classList.remove('closing');
    }, { once: true });
  }
});


function showNotification({ type = "info", content = "", duration = 5000 }) {
  // Obtain the main container for notifications
  const container = document.getElementById("notificationContainer");

  // Create the notification element with dynamic type
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  // Create and set the notification content
  const notificationContent = document.createElement("div");
  notificationContent.className = "content";
  notificationContent.innerHTML = content;

  // Create a close button to manually remove the notification
  const closeButton = document.createElement("button");
  closeButton.className = "close-btn";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => removeNotification(notification);

  // Assemble the notification components
  notification.appendChild(notificationContent);
  notification.appendChild(closeButton);

  // Add the notification to the container
  container.appendChild(notification);

  // Automatically remove the notification after a given duration
  if (duration > 0) {
    setTimeout(() => removeNotification(notification), duration);
  }
}

/**
 * Applies a fade-out animation and removes the notification node
 * from the DOM once the animation is complete.
 */
function removeNotification(notification) {
  notification.style.animation = "fadeOut 0.3s ease-out";
  notification.addEventListener("animationend", () => {
    notification.remove();
  });
}
