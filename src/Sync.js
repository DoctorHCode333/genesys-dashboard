import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import Loading from "../Loading";
import * as XLSX from "xlsx";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";
import DownloadTabView from "./DownloadTabView";
import { getBotFeedbackDownlaodData } from "../../API/TopicAPI";

const DownloadView = (props) => {
  const [visible, setVisible] = useState(false);
  const { downloadData, filters, setDownloadData, dateRange } = props;
  const [loading, setLoading] = useState(false);
  const [selectedDownloadOptions, setSelectedDownloadOptions] = useState(["All"]);
  const [downloadOptions] = useState([
    { label: "All", value: "All" },
    { label: "Summary", value: "Summary" },
    { label: "Positive Feedback", value: "Positive Feedback" },
    { label: "Negative Feedback", value: "Negative Feedback" },
  ]);
  const toast = useRef(null);
  const isCancelledRef = useRef(false); // Reference for cancellation

  const showDownloadErrorToast = () => {
    toast.current.show({
      severity: "error",
      summary: "Download Failed",
      detail: "An error occurred during the download. Please try again.",
      life: 3000,
    });
  };

  // Function to hide dialog and stop loading
  const hideDialog = () => {
    setVisible(false);
    isCancelledRef.current = true; // Set the cancel flag
    setLoading(false); // Stop loading immediately
  };

  useEffect(() => {
    if (Object.keys(downloadData).length !== 0) {
      setLoading(false);
    }
  }, [downloadData]);

  const handleDownload = async () => {
    // Check date range validity
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.current.show({
        severity: "error",
        summary: "Invalid Date Range",
        detail: "Please select a valid date range.",
      });
      return;
    }
    
    setVisible(true); // Show the dialog
    setLoading(true);
    isCancelledRef.current = false; // Reset cancellation flag

    try {
      // Check if the dialog was closed before proceeding with the fetch
      if (isCancelledRef.current) {
        setLoading(false);
        return;
      }

      const response = await getBotFeedbackDownlaodData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        convIds: filters.convIds,
        lob: filters.lob,
        deviceType: filters.deviceType,
        interactionReason: filters.interactionReason,
      });

      // Update download data if fetch is not cancelled
      if (!isCancelledRef.current) {
        setDownloadData(response);
      } else {
        setLoading(false); // Ensure loading stops if cancelled
      }
    } catch (error) {
      setLoading(false); // Stop loading on error
      console.log("Error while fetching download Data", error);
      showDownloadErrorToast();
    }
  };

  const generateExcel = (selectedOptions) => {
    try {
      const wb = XLSX.utils.book_new();
      const summarySheet = XLSX.utils.json_to_sheet(downloadData.summaryData);
      const positiveFeedbackData = downloadData.downloadData.positiveFeedback.map((item) => ({
        ...item,
        "Conversation_ID": {
          v: item["Conversation_ID"],
          l: { Target: `https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/${item["Conversation_ID"]}`, Tooltip: "Click to see conversation" },
        },
      }));
      const negativeFeedbackData = downloadData.downloadData.negativeFeedback.map((item) => ({
        ...item,
        "Conversation_ID": {
          v: item["Conversation_ID"],
          l: { Target: `https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/${item["Conversation_ID"]}`, Tooltip: "Click to see conversation" },
        },
      }));
      const positiveSheet = XLSX.utils.json_to_sheet(positiveFeedbackData);
      const negativeSheet = XLSX.utils.json_to_sheet(negativeFeedbackData);

      if (selectedOptions.includes("All")) {
        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
        XLSX.utils.book_append_sheet(wb, positiveSheet, "Positive Feedback");
        XLSX.utils.book_append_sheet(wb, negativeSheet, "Negative Feedback");
      } else {
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
    } catch (error) {
      showDownloadErrorToast();
    }
  };

  const downloadExcelData = () => {
    if (selectedDownloadOptions.length === 0) {
      showDownloadErrorToast();
      return;
    }
    generateExcel(selectedDownloadOptions);
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
                  onClick={downloadExcelData}
                />
              </div>
              <hr />
              <DownloadTabView {...props} />
            </>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default DownloadView;

SELECT COUNT(*) FROM HIST_TOPICS_IXNS WHERE STARTDATE>TO_TIMESTAMP('2024-09-19', 'YYYY-MM-DD') AND STARTDATE<TO_TIMESTAMP('2024-09-20', 'YYYY-MM-DD');
