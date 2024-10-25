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
  const { trendData, downloadData, filters, setDownloadData, dateRange } =
    props;

  const [loading, setLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const isCancelledRef = useRef(false)

  const [selectedDownloadOptions, setSelectedDownloadOptions] = useState([
    "All",
  ]);

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

      //hide dialoge 
      const hideDialog = () => {
        setVisible(false);
        setIsCancelled(true)
        isCancelledRef.current = true;
    }

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
    setVisible(true); // Show the dialog
    setIsCancelled(false);
    isCancelledRef.current = false;
    setLoading(true);
   
    if(isCancelledRef.current){
      console.log("function aborted")
      return
    }else{
      try {
        const response = await getBotFeedbackDownlaodData({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          convIds:filters.convIds,
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
    }
    
  };

  // This function generates the Excel file based on the downloadData state.

  const generateExcel = (selectedOptions) => {
    try {
      const wb = XLSX.utils.book_new();

      // Adding sheets conditionally based on selected options
      const summarySheet = XLSX.utils.json_to_sheet(downloadData.summaryData);

      // Create the positive feedback sheet with hyperlinks
      const positiveFeedbackData =
        downloadData.downloadData.positiveFeedback.map((item) => ({
          ...item,
          // Create hyperlink for the conversation ID
          "Conversation_ID": {
            v: item["Conversation_ID"], // The visible value
            l: {
              Target: `https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/${item["Conversation_ID"]}`,
              Tooltip: "Click to see conversation",
            },
          },
        }));

      // Create the negative feedback sheet with hyperlinks
      const negativeFeedbackData =
        downloadData.downloadData.negativeFeedback.map((item) => ({
          ...item,
          // Create hyperlink for the conversation ID
          "Conversation_ID": {
            v: item["Conversation_ID"], // The visible value
            l: {
              Target: `https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/${item["Conversation_ID"]}`,
              Tooltip: "Click to see conversation",
            },
          },
        }));

      // Convert the data to sheets
      const positiveSheet = XLSX.utils.json_to_sheet(positiveFeedbackData);
      const negativeSheet = XLSX.utils.json_to_sheet(negativeFeedbackData);

      // Append sheets based on selection
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
              onHide={hideDialog}
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


SELECT COUNT(*) FROM HIST_TOPICS_IXNS WHERE STARTDATE>TO_TIMESTAMP('2024-09-19', 'YYYY-MM-DD') AND STARTDATE<TO_TIMESTAMP('2024-09-20', 'YYYY-MM-DD');
