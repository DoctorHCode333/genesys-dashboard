import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import { OverlayPanel } from "primereact/overlaypanel";
import { useDispatch } from "react-redux";
//import { setFetchedData, setFilters } from "../Redux/actions";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./custom-style.css";

const PopupDoc = (props) => {

  const toast = useRef(null);
  const op = useRef(null);

  const { globalFilters, filters, dateRange , setFilters} = props
  
  const [selectedLOB, setSelectedLOB] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState([]);
  const [selectedInteractionReason, setSelectedInteractionReason] = useState([]);

  const [LOB, setLOB] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [interactionReasons, setInteractionReasons] = useState([]);

  const dispatch = useDispatch();

  // Load the global filter options (i.e., what will be shown in dropdowns)
  useEffect(() => {
    if (globalFilters && globalFilters.lob.length > 0) {
      console.log("globalFilters",globalFilters);
        
      setLOB(globalFilters.lob || []); // Safely handle empty globalFilters
      setDeviceTypes(globalFilters.deviceType|| []);
      setInteractionReasons(globalFilters.interactionReason|| []);
    } else {
      // Handle empty globalFilters by setting dropdown options to empty
      setLOB([]);
      setDeviceTypes([]);
      setInteractionReasons([]);
    }
  }, [globalFilters]);

  // Function to clear all user-selected filter selections
  const clearSelections = () => {
    setSelectedLOB([]);
    setSelectedDeviceType([]);
    setSelectedInteractionReason([]);

    // Reset filters state to empty arrays
    dispatch(
      setFilters({
        lob: [],
        deviceType: [],
        interactionReason: [],
      })
    );
  };

  // Function to apply user-selected filters and update Redux state
  const applySelections = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      // Show error if date range is not selected
      toast.current.show({
        severity: "error",
        summary: "Invalid Date Range",
        detail: "Please select a valid date range",
      });
      return;
    }

    const filterData = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      lob: selectedLOB.length > 0 ? selectedLOB : [],
      deviceType: selectedDeviceType.length > 0 ? selectedDeviceType : [],
      interactionReason: selectedInteractionReason.length > 0 ? selectedInteractionReason : [],
    };

    // Dispatch the selected filters to the Redux store
    dispatch(setFilters(filterData));
    //dispatch(setFetchedData([])); // Replace with the actual fetched data based on applied filters
  };

  // When user manually opens/closes the panel
  const onOverlayToggle = (e) => {
    op.current.toggle(e);
  };


if(LOB.length>0 || deviceTypes.length>0 || interactionReasons.length>0){

    console.log(LOB,deviceTypes);
    
  return (
    <div className="card flex flex-column align-items-center w-sm">
      <Toast ref={toast} />
      <Button type="button" icon="pi pi-filter-fill" onClick={onOverlayToggle} />

      <OverlayPanel
        ref={op}
        showCloseIcon={false}
        ariaCloseLabel="false"
        closeOnEscape
        dismissable={false}
        className="mr-5"
      >
        <div className="flex justify-end pb-1">
          <Button type="button" onClick={onOverlayToggle}>
            Close
          </Button>
        </div>

        {/* LOB Filter */}
        <MultiSelect
          value={selectedLOB}
          onChange={(e) => setSelectedLOB(e.value)}
          options={LOB}
          optionLabel="label"
          filter
          placeholder="LOB"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1 font-semibold text-lg border md:64 text-orange-500 bg-gray-200"
          showSelectAll={false}
          //disabled={LOB.length === 0} // Disable if no options
        />
        <br />

        {/* Device Type Filter */}
        <MultiSelect
          value={selectedDeviceType}
          onChange={(e) => setSelectedDeviceType(e.value)}
          options={deviceTypes}
          optionLabel="label"
          filter
          placeholder="Device Type"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1 font-semibold text-lg border md:64 text-orange-500 bg-gray-200"
          showSelectAll={false}
          //disabled={deviceTypes.length === 0} // Disable if no options
        />
        <br />

        {/* Interaction Reason Filter */}
        <MultiSelect
          value={selectedInteractionReason}
          onChange={(e) => setSelectedInteractionReason(e.value)}
          options={interactionReasons}
          optionLabel="label"
          filter
          placeholder="Interaction Reason"
          maxSelectedLabels={3}
          className="w-80 mt-1 mb-1 font-semibold text-lg border md:64 text-orange-500 bg-gray-200"
          showSelectAll={false}
          //disabled={interactionReasons.length === 0} // Disable if no options
        />

        <div className="w-full flex justify-between">
          {/* Clear Button */}
          <Button
            label="Clear"
            onClick={clearSelections}
            className="p-button-primary bg-fuchsia-950 ml-5 mt-3 text-white"
            style={{ width: "100px", height: "35px" }}
          />

          {/* Apply Button */}
          <Button
            label="Apply"
            onClick={applySelections}
            className="w-80 p-button-primary bg-fuchsia-700 mr-5 mt-3 text-white"
            style={{ width: "100px" }}
          />
        </div>
      </OverlayPanel>
    </div>
  );
};
}
export default PopupDoc;
