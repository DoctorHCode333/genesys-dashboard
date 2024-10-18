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

import React from 'react';
import { Chip } from 'primereact/chip'; // PrimeReact Chip component

// HeaderFilterChips Component
const HeaderFilterChips = ({
  filters,
  removeItemFromLOB,
  removeItemFromConversationIDs,
  removeItemFromDeviceType,
  removeItemFromInteractionReason
}) => {
  // Check if there are any active filters
  const hasActiveFilters = filters.lob.length > 0 || filters.converstionIDs.length > 0 || filters.deviceType.length > 0 || filters.interactionReason.length > 0;

  // Render the component
  return (
    <>
      {hasActiveFilters ? (
        <div className="card flex flex-wrap gap-2 text-xs">
          {/* Render LOB filter chips */}
          {filters.lob.map((name, index) => (
            <Chip
              className="text-xs text-black bg-sky-300"
              key={`lob-${index}`}
              label={name}
              removable
              onRemove={() => removeItemFromLOB(name)} // Call specific action for LOB
            />
          ))}

          {/* Render ConversationIDs filter chips */}
          {filters.converstionIDs.map((name, index) => (
            <Chip
              className="text-xs text-black bg-sky-300"
              key={`converstionIDs-${index}`}
              label={name}
              removable
              onRemove={() => removeItemFromConversationIDs(name)} // Call specific action for Conversation IDs
            />
          ))}

          {/* Render DeviceType filter chips */}
          {filters.deviceType.map((name, index) => (
            <Chip
              className="text-xs text-black bg-sky-300"
              key={`deviceType-${index}`}
              label={name}
              removable
              onRemove={() => removeItemFromDeviceType(name)} // Call specific action for Device Type
            />
          ))}

          {/* Render InteractionReason filter chips */}
          {filters.interactionReason.map((name, index) => (
            <Chip
              className="text-xs text-black bg-sky-300"
              key={`interactionReason-${index}`}
              label={name}
              removable
              onRemove={() => removeItemFromInteractionReason(name)} // Call specific action for Interaction Reason
            />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default HeaderFilterChips;

///////////////////////////////////////////////////////////////////


terraform {
  required_providers {
    genesyscloud = {
      source = "mypurecloud/genesyscloud"

    }
  }
}

###
#
# Description:  
#
# Creates a new web-based data integration and then adds a data action that calls out to the AWS API Gateway endpoint and 
# Lambda that is performing our email-classification. 
#
##
terraform {
  required_providers {
    genesyscloud = {
      source = "mypurecloud/genesyscloud"
    }
  }
}

# Define the integration for the data action
resource "genesyscloud_integration" "waitTimeIntegration" {
  intended_state   = "ENABLED"
  integration_type = "purecloud-data-actions"
  config {
    name       = "waitTimeIntegration"
    properties = jsonencode({})
    advanced   = jsonencode({})
    notes      = "Used to retrieve estimated wait time for a specific media type and queue"
  }
}

# Define the data action for estimated wait time
resource "genesyscloud_integration_action" "waitTime" {
  name           = "Get Estimated Wait Time"
  category       = "waitTimeIntegration"
  integration_id = genesyscloud_integration.waitTimeIntegration.id
  secure         = false

  # Define the input contract
  contract_input = jsonencode({
    "type"       = "object",
    "required"   = ["QUEUE_ID", "MEDIA_TYPE"],
    "properties" = {
      "QUEUE_ID" = {
        "type"        = "string",
        "description" = "The queue ID."
      },
      "MEDIA_TYPE" = {
        "type"        = "string",
        "description" = "The media type of the interaction: call, chat, callback, email, social media, video communication, or message.",
        "enum"        = ["call", "chat", "callback", "email", "socialExpression", "videoComm", "message"]
      }
    }
  })

  # Define the output contract
  contract_output = jsonencode({
    "type"       = "object",
    "properties" = {
      "estimated_wait_time" = {
        "type"        = "integer",
        "title"       = "Estimated Wait Time in Seconds",
        "description" = "The estimated wait time (in seconds) for the specified media type and queue."
      }
    }
  })

  # Configure the request
  config_request {
    request_url_template = "/api/v2/routing/queues/${input.QUEUE_ID}/mediatypes/${input.MEDIA_TYPE}/estimatedwaittime"
    request_type         = "GET"
    request_template     = "${input.rawRequest}"
    headers = {
      "Content-Type" = "application/x-www-form-urlencoded"
      "UserAgent"    = "PureCloudIntegrations/1.0"
    }
  }

  # Configure the response
  config_response {
    translation_map = {
      "estimated_wait_time" = "$.results[0].estimatedWaitTimeSeconds"
    }
    translation_map_defaults = {}
    success_template         = "{\n   \"estimated_wait_time\": ${estimated_wait_time}\n}"
  }
}
///////0///////////////////////////////////////////////

import React, { useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css'; // Replace with your theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css'; // PrimeIcons for hamburger icon
import 'primeflex/primeflex.css'; // Optional for layout utilities

export default function HamburgerMenu() {
    const [visible, setVisible] = useState(false);

    const items = [
        { label: 'Home', icon: 'pi pi-fw pi-home' },
        { label: 'About', icon: 'pi pi-fw pi-info' },
        { label: 'Contact', icon: 'pi pi-fw pi-phone' },
        {
            label: 'Settings',
            icon: 'pi pi-fw pi-cog',
            items: [
                { label: 'Profile', icon: 'pi pi-fw pi-user' },
                { label: 'Security', icon: 'pi pi-fw pi-lock' }
            ]
        }
    ];

    const start = (
        <Button
            icon="pi pi-bars"
            className="p-button-rounded p-button-text"
            onClick={() => setVisible(true)}
        />
    );

    return (
        <div>
            {/* Menubar with a hamburger button at the start */}
            <Menubar start={start} />
            
            {/* Sidebar to show when hamburger menu is clicked */}
            <Sidebar visible={visible} onHide={() => setVisible(false)}>
                <h3>Menu</h3>
                <ul>
                    {items.map((item, index) => (
                        <li key={index} style={{ marginBottom: '1rem' }}>
                            <Button label={item.label} icon={item.icon} className="p-button-text" />
                        </li>
                    ))}
                </ul>
            </Sidebar>
        </div>
    );
}
