* Custom styling for the active tab underline */
.p-tabview-nav li.p-highlight .p-tabview-title {
    position: relative; /* Ensure the title can position its children */
}

/* Adding space between the title and the hr */
.p-tabview-nav li.p-highlight .p-tabview-title:after {
    content: ""; /* Create a pseudo-element */
    position: absolute;
    left: -10%; /* Align slightly to the left */
    right: -10%; /* Align slightly to the right */
    bottom: -18px; /* Position it slightly below the title */
    height: 2.5px; /* Height of the hr */
    background-color: #6366f1; /* Use the color from the lara-light-indigo theme */
    transition: 2s cubic-bezier(.35,0,.25,1); /* Smooth transition for position */
    border-radius: 5px;
}

/* Style for the hr element itself */
.p-tabview .p-tabview-content hr {
    margin-top: 10px; /* Space between the title and the hr */
    margin-bottom: 20px; /* Optional: Add margin below the hr if needed */
    border: none; /* Remove default border */
    border-top: 3px solid #6366f1; /* Color matching the lara-light-indigo theme */
    width: calc(100% + 30px); /* Ensure hr takes full width and overflows */
    transition: 2s cubic-bezier(.35,0,.25,1); /* Add a transition effect for width */
}

