import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useSelector } from "react-redux";
import Loading from "../Loading";
import * as XLSX from "xlsx";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";
import DownloadTabView from "./DownloadTabView";
import { getBotFeedbackDownlaodData } from "../../API/TopicAPI";

const DownloadView = (props) => {
  const [visible, setVisible] = useState(false);
  const { trendData, downloadData, filters, setDownloadData, dateRange } = props;

  const [loading, setLoading] = useState(false);

  const [selectedDownloadOptions, setSelectedDownloadOptions] = useState(["All"]);

  // Define the available download options
  const [downloadOptions, setDownloadOptions] = useState([
    { label: "All", value: "All" },
    { label: "Summary", value: "Summary" },
    { label: "Positive Feedback", value: "Positive Feedback" },
    { label: "Negative Feedback", value: "Negative Feedback" },
  ]);

  const toast = useRef(null);

  const showExcelDownloadToast = () => {
    toast.current.show({
      severity: "info",
      summary: "Excel Download",
      detail: "The Excel file is being generated and will download shortly.",
      life: 3000,
    });
  };

  const showDownloadSuccessToast = () => {
    toast.current.show({
      severity: "success",
      summary: "Download Complete",
      detail: "The Excel file has been successfully downloaded.",
      life: 3000,
    });
  };

  const showDownloadErrorToast = () => {
    toast.current.show({
      severity: "error",
      summary: "Download Failed",
      detail: "An error occurred during the download. Please try again.",
      life: 3000,
    });
  };

  useEffect(() => {
    if (Object.keys(downloadData).length !== 0) {
      setLoading(false);
    }
  }, [downloadData]);

  const handleDownload = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.current.show({
        severity: "error",
        summary: "Invalid Date Range",
        detail: "Please select a valid date range.",
      });
      return;
    }

    setLoading(true);
    setVisible(true); // Show the dialog

    try {
      const response = await getBotFeedbackDownlaodData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        lob: filters.lob,
        deviceType: filters.deviceType,
        interactionReason: filters.interactionReason,
      });

      setDownloadData(response);
    } catch (error) {
      setLoading(false);
      setVisible(false); // Hide the dialog on error
      console.log("Error while fetching download Data", error);
      showDownloadErrorToast();
    }
  };

  // This function generates the Excel file based on the downloadData state.
  const generateExcel = (selectedOptions) => {
    try {
      const wb = XLSX.utils.book_new();

      // Adding sheets conditionally based on selected options
      const summarySheet = XLSX.utils.json_to_sheet(downloadData.summaryData);
      const positiveSheet = XLSX.utils.json_to_sheet(downloadData.downloadData.positiveFeedback);
      const negativeSheet = XLSX.utils.json_to_sheet(downloadData.downloadData.negativeFeedback);

      if (selectedOptions.includes("All")) {
        // If "All" is selected, include all sheets
        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
        XLSX.utils.book_append_sheet(wb, positiveSheet, "Positive Feedback");
        XLSX.utils.book_append_sheet(wb, negativeSheet, "Negative Feedback");
      } else {
        // Otherwise, include only the selected sheets
        if (selectedOptions.includes("Summary")) {
          XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
        }
        if (selectedOptions.includes("Positive Feedback")) {
          XLSX.utils.book_append_sheet(wb, positiveSheet, "Positive Feedback");
        }
        if (selectedOptions.includes("Negative Feedback")) {
          XLSX.utils.book_append_sheet(wb, negativeSheet, "Negative Feedback");
        }
      }

      const fileName = `FeedbackData_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showDownloadSuccessToast();
    } catch (error) {
      showDownloadErrorToast();
    }
  };

  const downloadExcelData = () => {
    if (selectedDownloadOptions.length === 0) {
      showDownloadErrorToast(); // Prevent download if no option is selected
      return;
    }
    showExcelDownloadToast(); // Show download toast
    generateExcel(selectedDownloadOptions); // Generate Excel with selected options
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: "150px" }}>
        <Toast ref={toast} />
        <Button
          label="Download"
          className="mt-3 border mb-2 mr-2 text-white text-xs font-semibold py-2 px-4 rounded-lg"
          icon="pi pi-download"
          onClick={handleDownload}
        />

        <div>
          <div className="bg-gradient-to-tl from-orange-400 via-amber-400 to-orange-400 rounded-xl">
            <Dialog
              header="Feedback Download Preview"
              className="custom-dialog bg-gradient-to-tl from-orange-400 via-amber-400 to-orange-400 pt-10 rounded-xl"
              visible={visible}
              maximizable
              style={{ width: "80%" }}
              onHide={() => setVisible(false)}
            >
              {loading ? (
                <Loading />
              ) : (
                <>
                  <p className="mb-4">
                    You can download the below data of Feedbacks from{" "}
                    <b>
                      {dateRange.startDate} to {dateRange.endDate}
                    </b>{" "}
                    as Excel format.
                  </p>
                  <div className="flex justify-start items-center text-xs mb-2 mt-4">
                    <MultiSelect
                      value={selectedDownloadOptions}
                      onChange={(e) => setSelectedDownloadOptions(e.value)}
                      options={downloadOptions}
                      optionLabel="label"
                      filter
                      placeholder="Select File"
                      maxSelectedLabels={4}
                      className="w-full mb-1 border md:w-60"
                    />

                    <Button
                      label="Download"
                      className="ml-3 bg-blue-950 border mb-2 mr-2 text-white text-xs font-semibold py-3 px-8 rounded-lg"
                      onClick={downloadExcelData} // Fix function call here
                    />
                  </div>
                  <hr />
                  <DownloadTabView {...props} />
                </>
              )}
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadView;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import SummaryPage from './SummaryPage';
import TopicsPage from './TopicsPage';

const DownloadTabView = (props) => {
    const [scrollableTabs, setScrollableTabs] = useState([]);
    const { downloadData } = props;
    
    // Extracting the feedback data from props
    const propsData = downloadData?.downloadData;

    // Log for debugging
    console.log(downloadData?.summaryData, propsData, 'inside tab view download', scrollableTabs);

    useEffect(() => {
        if (downloadData && Object.keys(downloadData).length !== 0) {
            // Prepare the tabs in one go
            const newTabs = [
                { title: 'Summary', content: <SummaryPage data={downloadData.summaryData} /> },
                { title: 'Positive Feedback', content: <TopicsPage data={propsData?.positiveFeedback} /> },
                { title: 'Negative Feedback', content: <TopicsPage data={propsData?.negativeFeedback} /> },
            ];
            setScrollableTabs(newTabs);
        }
    }, [downloadData]); // Trigger whenever downloadData changes

    return (
        <div className="card">
            <TabView key={scrollableTabs.length} scrollable>
                {scrollableTabs.map((tab, index) => (
                    <TabPanel key={index} header={tab.title}>
                        {/* Styled horizontal rule */}
                        <hr style={{ borderTop: '2px solid black', margin: '10px 0' }} />
                        <br />
                        <p className="m-0">{tab.content}</p>
                    </TabPanel>
                ))}
            </TabView>
        </div>
    );
};

export default DownloadTabView;

/* Custom styling for the active tab underline */
.p-tabview-nav li.p-highlight .p-tabview-title {
    position: relative; /* Ensure the title can position its children */
}

/* Adding space between the title and the hr */
.p-tabview-nav li.p-highlight .p-tabview-title:after {
    content: ""; /* Create a pseudo-element */
    position: absolute;
    left: -10%; /* Align slightly to the left */
    right: -10%; /* Align slightly to the right */
    bottom: -8px; /* Position it slightly below the title */
    height: 3px; /* Height of the hr */
    background-color: #007ad9; /* Use the color from the lara-light-indigo theme */
    transition: left 0.5s ease, right 0.5s ease; /* Smooth transition for position */
}

/* Style for the hr element itself */
.p-tabview .p-tabview-content hr {
    margin-top: 10px; /* Space between the title and the hr */
    margin-bottom: 20px; /* Optional: Add margin below the hr if needed */
    border: none; /* Remove default border */
    border-top: 3px solid #007ad9; /* Color matching the lara-light-indigo theme */
    width: calc(100% + 20px); /* Ensure hr takes full width and overflows */
    transition: width 0.5s ease; /* Add a transition effect for width */
}
