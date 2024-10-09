const generateExcel = async(summaryData, conversationData) => {
        const wb = XLSX.utils.book_new();
        // Add summary sheet
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        
        summarySheet["!cols"] = [{wch: 25},{wch: 15},{wch: 15}]

        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

       

        // Add conversation sheets
        conversationData.forEach((conversation, index) => {
            let x = conversation.data;
            // '=HYPERLINK("https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/item[0], "item[0")'
            // let data1 = [['Conversation ID', 'Start Date', "DNIS","Queue","Client ID","Market Type","LOB","Agent Name","Call Duration(mins)","Sentiment Score","Topic",'Phrase',"Party ID", "ANI", "Agent Duration", "Sentiment Trend"]]
            let data1 = [['Conversation ID', 'Start Date',"Party ID", "LOB", "Market Type", "Queue", "Client ID", "DNIS", "ANI",
            "Agent Name", "Call Duration(mins)","Agent Connected Duration(mins)", "Sentiment Score", "Sentiment Trend", "Topic", 'Phrase' ]]

            let data = x.map((item) => (

                data1.push([
                    
                    // item[0],convertTime(item[1]),item[2],item[3],item[4], item[5],item[6],item[7],item[8],Math.round(item[9] * 100),item[10],item[11],item[12], item[13],item[14], item[15]

                    item[0],
                    convertTime(item[1]),
                    item[12],
                    item[6],
                    item[5],
                    item[3],
                    item[4],
                    item[2],
                    item[13],
                    item[7],
                    Math.ceil(item[8]*100)/100,
                    Math.ceil(item[14]*100)/100,
                    Math.round(item[9] * 100),
                    Math.round(item[15] * 100),
                    item[10],
                    item[11]
                ])
                
            ))
            // let data = x.map((item) => (
            //     {
            //         'Conversation ID': item[0],
            //         'Start Date': item[1],
            //         "DNIS": item[2],
            //         "Queue": item[3],
            //         "Client ID": item[4],
            //         "Market Type": item[5],
            //         "LOB": item[6],
            //         "Agent ID": item[7],
            //         "Call Duration": item[8],
            //         "Sentiment Score": Math.round(item[9]*100),
            //         "Topic": item[10],
            //         "Phrase": item[11]
            //     }
            // ))


            const truncateSheetName1 = truncateSheetName(conversation.name.replace(/\//g, '_'));
            console.log(truncateSheetName1)
            // const conversationSheet = XLSX.utils.json_to_sheet(data);
            const conversationSheet = XLSX.utils.aoa_to_sheet(data1);
                conversationSheet["!cols"] = [{wch: 35},{wch: 25},{wch: 25},{wch: 25},{wch: 25},{wch: 25},{wch: 25},{wch: 25},{wch: 25},{wch: 25},{wch: 25},{wch: 25}]
        //   conversationData.map((item, index) => {
        //     const cellAddress = XLSX.utils.encode_cell({c: 0, r:index+1});
        //     conversationSheet[cellAddress] = {Target: 'www.google.com'}
        //   })

        
        for(let i =1; i< data1.length; i++){
                        const cellAddress = `A${i+1}`;
                        const cell = conversationSheet[cellAddress];
                        if(!cell) continue;
                        const id = data1[i][0];
        
                        cell.l = { Target: `https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/${id}`, Tooltip: "Click to visit link", Rel:"nofollow"},
                        cell.v = id;
                    }
          XLSX.utils.book_append_sheet(wb, conversationSheet, truncateSheetName1);


          
        });
        // Generate Excel file and initiate download
       
        // Generate Excel file and initiate download
        let fileName = 'HistoricalTrends '+date1+' to '+date2+'.xlsx';

        XLSX.writeFile(wb, fileName);
        console.log('successfuly donloaded')
      };



const generateExcel = (selectedOptions) => {
    try {
        const wb = XLSX.utils.book_new();

        // Adding sheets conditionally based on selected options
        const summarySheet = XLSX.utils.json_to_sheet(downloadData.summaryData);
        
        // Create the positive feedback sheet with hyperlinks
        const positiveFeedbackData = downloadData.downloadData.positiveFeedback.map((item) => ({
            ...item,
            // Create hyperlink for the conversation ID
            'Conversation ID': {
                v: item['Conversation ID'], // The visible value
                l: { Target: `https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/${item['Conversation ID']}`, Tooltip: "Click to visit link" }
            }
        }));

        // Create the negative feedback sheet with hyperlinks
        const negativeFeedbackData = downloadData.downloadData.negativeFeedback.map((item) => ({
            ...item,
            // Create hyperlink for the conversation ID
            'Conversation ID': {
                v: item['Conversation ID'], // The visible value
                l: { Target: `https://apps.usw2.pure.cloud/directory/#/engage/admin/interactions/${item['Conversation ID']}`, Tooltip: "Click to visit link" }
            }
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

return (

    <>
      {values.length > 0 ? (
        <div className="card flex flex-wrap gap-2 text-xs">
          {values.map((item, index) => (
            <Chip className='text-xs text-black bg-sky-300' key={item.name} label={item.name} onRemove={() => {
              removeItemFromQueue1(item.name)
            }} removable />
          ))}

        </div>
      ) : null}

    </>

  );
}
