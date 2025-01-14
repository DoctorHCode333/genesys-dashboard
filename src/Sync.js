/* Base styles for tab container */
.p-tabview {
  position: relative;
  width: 100%;
}

/* Tab navigation styles */
.p-tabview-nav {
  position: relative;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0;
  padding: 0;
  list-style: none;
  display: flex;
}

/* Individual tab header */
.p-tabview-nav li {
  position: relative;
  margin: 0;
  padding: 0;
  flex: 0 1 auto;
}

/* Tab title styling */
.p-tabview-nav .p-tabview-title {
  padding: 0.75rem 1rem;
  color: #6b7280;
  transition: color 0.2s ease;
  display: block;
  cursor: pointer;
}

/* Active tab styling */
.p-tabview-nav li.p-highlight .p-tabview-title {
  color: #6366f1;
}

/* Animated underline indicator */
.p-tabview-nav li.p-highlight::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #6366f1;
  transform-origin: left center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tab content panel */
.p-tabview-panels {
  position: relative;
  padding: 1.25rem 0;
  overflow: hidden; /* Prevent panel overflow */
}

/* Individual tab panel */
.p-tabview-panel {
  position: relative;
  opacity: 0;
  transform: translateY(10px);
  transition: 
    opacity 0.3s ease,
    transform 0.3s ease;
  padding-top: 2px; /* Add space for HR */
}

/* Active panel */
.p-tabview-panel.p-tabview-panel-active {
  opacity: 1;
  transform: translateY(0);
}

/* HR styling within panels */
.p-tabview-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: -1rem;
  right: -1rem;
  height: 2px;
  background-color: #6366f1;
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active panel HR animation */
.p-tabview-panel.p-tabview-panel-active::before {
  transform: scaleX(1);
}

/* Optional: Scrollable tabs support */
.p-tabview-scrollable .p-tabview-nav-container {
  overflow-x: auto;
  scrollbar-width: thin;
}

/* Optional: Custom scrollbar styling */
.p-tabview-scrollable .p-tabview-nav-container::-webkit-scrollbar {
  height: 5px;
}

.p-tabview-scrollable .p-tabview-nav-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 2.5px;
}

/* Optional: Responsive adjustments */
@media (max-width: 640px) {
  .p-tabview-nav .p-tabview-title {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
