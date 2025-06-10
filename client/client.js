const ws = new WebSocket('ws://localhost:9099');

// Initialize GSAP timeline
let tl;

// Function to setup GSAP animation
function setupAnimation() {
  // Create a timeline
  tl = gsap.timeline();

  // Set initial state for all rectangles - fully rotated to make them invisible
  gsap.set(".rectangle", {
    rotateY: -90, // Start with rectangles rotated -90 degrees (edge-on, opposite direction)
    opacity: 1 // Full opacity, we're using rotation not transparency
  });
}

// Function to normalize different axis value ranges
function normalizeAxisValue(value) {
  // Convert the value to a number
  const numValue = parseFloat(value);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return 0;
  }

  // The AX1 axis uses a range of 0 to 100000
  if (numValue >= 0 && numValue <= 100000) {
    return numValue / 100000;
  }

  // Fallback cases for other potential axis ranges:

  // Case 1: Values between -1 and 1
  if (numValue >= -1 && numValue <= 1) {
    // Map from [-1, 1] to [0, 1]
    return (numValue + 1) / 2;
  }

  // Case 2: Values between 0 and 1
  if (numValue >= 0 && numValue <= 1) {
    return numValue;
  }

  // Case 3: Values between 0 and 100
  if (numValue >= 0 && numValue <= 100) {
    return numValue / 100;
  }

  // If we can't determine the range, clamp between 0 and 1
  return Math.max(0, Math.min(1, numValue));
}

// Function to update the rectangle animations based on axis value
function updateRectanglesAnimation(value) {
  // Normalize the value to a 0-1 range
  const normalizedValue = normalizeAxisValue(value);

  // Calculate how many rectangles should be visible (we have 12 total rectangles)
  const totalRectangles = 12;
  const visibleRectangles = Math.ceil(normalizedValue * totalRectangles);

  console.log(`Normalized value: ${normalizedValue.toFixed(2)}, Visible rectangles: ${visibleRectangles} of ${totalRectangles}`);

  // Calculate the base duration for animations
  const duration = 0.3;

  // Animate each rectangle based on its position
  // We iterate in reverse order (12 to 1) to animate from right to left
  for (let i = totalRectangles; i >= 1; i--) {
    // Use the reversed index for threshold calculation (rect-12 now activates first)
    const reversedIndex = totalRectangles - i + 1;

    // Calculate the activation threshold for this rectangle
    // Rectangle 12 (rightmost) now activates first, rectangle 1 (leftmost) activates last
    const threshold = reversedIndex / totalRectangles;

    // If normalized value is greater than the threshold, show this rectangle
    if (normalizedValue >= threshold - (1/totalRectangles)) {
      // Calculate progress within this rectangle's slice of the range
      const rectProgress = Math.min(1, (normalizedValue - (threshold - (1/totalRectangles))) * totalRectangles);

      // Calculate rotation angle from -90 (edge) to 0 (flat)
      const rotationAngle = -90 + (rectProgress * 90);

      // Animate the rectangle to rotation based on progress
      gsap.to(`.rect-${i}`, {
        rotateY: rotationAngle,
        duration: duration,
        ease: "power2.out"
      });
    } else {
      // Hide rectangles that shouldn't be visible (rotated to edge)
      gsap.to(`.rect-${i}`, {
        rotateY: -90,
        duration: duration,
        ease: "power2.in"
      });
    }
  }
}

// Function to update status display
function updateStatus(message, isError = false) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.style.color = isError ? 'red' : 'green';
}

// Keep track of known axes
const knownAxes = new Set();

// Function to process an axis update
function updateAxis(axisPath, value) {
  // Extract axis name from path (e.g., "/dragonframe/axis/AX1" -> "AX1")
  const axisName = axisPath.split('/').pop();

  // Check if we already have a div for this axis
  if (!knownAxes.has(axisName)) {
    // Create new axis elements
    knownAxes.add(axisName);

    const axisBox = document.createElement('div');
    axisBox.className = 'axis-box';
    axisBox.id = `axis-${axisName}`;

    const axisNameElement = document.createElement('div');
    axisNameElement.className = 'axis-name';
    axisNameElement.textContent = axisName;

    const axisValueElement = document.createElement('div');
    axisValueElement.className = 'axis-value';
    axisValueElement.id = `value-${axisName}`;
    axisValueElement.textContent = value;

    axisBox.appendChild(axisNameElement);
    axisBox.appendChild(axisValueElement);

    // Add to the container
    document.getElementById('axes-container').appendChild(axisBox);
  } else {
    // Just update the existing value
    document.getElementById(`value-${axisName}`).textContent = value;
  }

  // If this is the AX1 axis, update the rectangle animations
  if (axisName === 'AX1') {
    // Log the raw value and calculated normalized value
    const normalizedVal = normalizeAxisValue(value);

    console.log(`AX1 raw value: ${value} (0-50000), normalized: ${normalizedVal.toFixed(4)}`);

    updateRectanglesAnimation(value);
  }
}

ws.onopen = () => {
  console.log('Connected to DragonFrame bridge');
  updateStatus('Connected to DragonFrame bridge');

  // Set up the animation when connection is established
  setupAnimation();
};

ws.onmessage = (event) => {
  const oscMsg = JSON.parse(event.data);
  console.log('Received OSC message:', oscMsg);

  // Update last message time
  updateStatus(`Last message: ${new Date().toLocaleTimeString()}`);

  // Process DragonFrame event
  if (oscMsg.type === 'dragonframe_event' && Array.isArray(oscMsg.data) && oscMsg.data.length >= 2) {
    // Check if it's an axis update
    const axisPath = oscMsg.data[0];
    const axisValue = oscMsg.data[1];

    if (typeof axisPath === 'string' && axisPath.includes('/axis/')) {
      updateAxis(axisPath, axisValue);
    }
  }
};

ws.onclose = () => {
  console.log('Disconnected from bridge');
  updateStatus('Disconnected from bridge - attempting to reconnect...', true);
  // Maybe attempt reconnection after a delay
  setTimeout(() => {
    location.reload();
  }, 5000);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  updateStatus('Connection error', true);
};

// Handle window resize to ensure animation adjusts correctly
window.addEventListener('resize', () => {
  // Update the animation if we have active AX1 data
  const ax1Element = document.getElementById('value-AX1');
  if (ax1Element) {
    const value = ax1Element.textContent;
    updateRectanglesAnimation(value);
  }
});

// Document ready handler to ensure DOM is fully loaded before initializing animations
document.addEventListener('DOMContentLoaded', () => {
  // Initialize animation if we already have a connection
  setupAnimation();
});
