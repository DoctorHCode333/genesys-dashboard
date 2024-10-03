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

  const [selectedCities, setSelectedCities] = useState(["All"]);

  // getting what are the topics need to display on display preview
  // const cities = fetchedReduxData.labels.map((item) => (
  //     { name: item }
  // ));
  const [cities, setCities] = useState([
    {label:"All", value: "All"},
    {label:"Summary", value: "Summary"},
    {label:"Positive Feedback", value: "Positive Feedback"},
    {label:"Negative Feedback", value: "Negative Feedback"},
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
  // Fetches the data and displays the dialog.
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
  const generateExcel = (arr) => {
    try {
      const wb = XLSX.utils.book_new();

      // Adding Summary Sheet
      const summarySheet = XLSX.utils.json_to_sheet(downloadData.summaryData);

      // Adding Positive Feedback Sheet
      const positiveSheet = XLSX.utils.json_to_sheet(
        downloadData.downloadData.positiveFeedback
      );
      // Adding Negative Feedback Sheet
      const negativeSheet = XLSX.utils.json_to_sheet(
        downloadData.downloadData.negativeFeedback
      );

      if ("All" in arr) {
        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
        XLSX.utils.book_append_sheet(wb, positiveSheet, "Positive Feedback");
        XLSX.utils.book_append_sheet(wb, negativeSheet, "Negative Feedback");
      } else {
        if ("Summary" in arr) {
          XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
        }
        if ("Positive Feedback" in arr) {
          XLSX.utils.book_append_sheet(wb, positiveSheet, "Positive Feedback");
        }
        if ("Negative Feedback" in arr) {
          XLSX.utils.book_append_sheet(wb, negativeSheet, "Negative Feedback");
        }
      }

      const fileName = `FeedbackData ${dateRange.startDate} to ${dateRange.endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showDownloadSuccessToast();
    } catch (error) {
      showDownloadErrorToast();
    }
  };

  const downloadExcelData = (arr) => {
    //showExcelDownloadToast();

    generateExcel(arr);
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: "150px" }}>
        <Toast ref={toast} />
        <Button
          label="Download"
          className=" mt-3 border mb-2 mr-2 text-white text-xs  font-semibold py-2 px-4 rounded-lg  "
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
                  <p className="mb-4 ">
                    You can download the below data of Feedbacks from{" "}
                    <b>
                      {" "}
                      {dateRange.startDate} to {dateRange.endDate}
                    </b>{" "}
                    as excel format
                    {/* <button
                          icon="pi pi-download"
                          className="px-2 py-1  text-black font-extrabold"
                          onClick={downloadExcelData(cities)}
                        >
                          <i className="pi pi-download"></i>
                        </button> */}
                  </p>
                  <div className="flex justify-start items-center text-xs mb-2 mt-4">
                    <MultiSelect
                      value={selectedCities}
                      onChange={(e) => setSelectedCities(e.value)}
                      options={cities}
                      optionLabel="label"
                      filter
                      placeholder="Select File"
                      maxSelectedLabels={4}
                      className="w-full mb-1 border md:w-60 "
                    />

                    <Button
                      label="Download"
                      className="ml-3 bg-blue-950  border mb-2 mr-2 text-white text-xs  font-semibold py-3 px-8 rounded-lg  "
                      onClick={downloadExcelData(selectedCities)}
                    />
                  </div>
                  <hr />
                  <DownloadTabView {...props} />
                  {/*rowData={rowData} finalData={finalData} */}
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
