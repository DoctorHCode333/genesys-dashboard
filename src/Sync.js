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





import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import SummaryPage from './SummaryPage';
import TopicsPage from './TopicsPage';
import { useEffect } from 'react';

const DownloadTabView = (props) =>{
    const [scrollableTabs, setScrollableTabs ] = useState([])
    const {downloadData} = props
    let propsData = downloadData.downloadData;
    console.log(downloadData.summaryData, propsData, 'inisde tab view download', scrollableTabs)
   useEffect(() => {
    if (Object.keys(downloadData).length !== 0) {
    setScrollableTabs((prevData) => [...prevData,  {title : 'Summary', content: <SummaryPage data={downloadData.summaryData}/>}])
    setScrollableTabs((prevData) => [...prevData,  {title : 'Positive Feedback', content: <TopicsPage data={propsData.positiveFeedback}/>}])
    setScrollableTabs((prevData) => [...prevData,  {title : 'Negative Feedback', content: <TopicsPage data={propsData.negativeFeedback}/>}])
    // propsData.map((item) =>{
    //     setScrollableTabs((prevData) => [...prevData, {title: item.name, content: <TopicsPage data={item.data} />}])
    // })
    }
   }, [])

    
    // const scrollableTabs = Array.from({ length: 50 }, (_, i) => ({ title: `Tab ${i + 1}`, content: `Tab ${i + 1} Content` }))
{/* <button className='px-10 py-2 bg-gray-300 hover:bg-gray-300 text-gray-700 font-semibold rounded-md'>{tab.title}</button> */}
    return (
        <div className='card' >
            <TabView scrollable>
                {scrollableTabs.map((tab) => {
                    return (
                        <TabPanel key={tab.title} header={tab.title} >
                            <hr/>
                            <br/>
                            <p className="m-0">{tab.content}</p>
                        </TabPanel>
                    );
                })}
            </TabView>
        </div>

    )
}


export default DownloadTabView;
