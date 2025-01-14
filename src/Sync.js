/* Container */
.p-tabview {
  width: 100%;
  background: white;
}

/* Tab navigation */
.p-tabview-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

/* Tab items */
.p-tabview-nav li {
  margin-right: 2rem;
}

/* Tab links */
.p-tabview-title {
  display: inline-block;
  padding: 0.75rem 0;
  color: #64748b;
  font-weight: 500;
  text-decoration: none;
  position: relative;
  cursor: pointer;
}

/* Active tab state */
.p-tabview-nav li.p-highlight .p-tabview-title {
  color: #6366f1;
}

/* Highlight bar for active tab */
.p-tabview-nav li.p-highlight .p-tabview-title::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #6366f1;
}

/* Content panels container */
.p-tabview-panels {
  position: relative;
  padding: 1rem 0;
}

/* Individual panels */
.p-tabview-panel {
  display: none;
  border-top: 2px solid #6366f1;
  margin-top: -2px;
}

/* Active panel */
.p-tabview-panel.p-tabview-panel-active {
  display: block;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .p-tabview-nav li {
    margin-right: 1rem;
  }
  
  .p-tabview-title {
    padding: 0.5rem 0;
    font-size: 0.875rem;
  }
}
