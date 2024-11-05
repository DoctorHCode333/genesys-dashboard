

---

Batch Job Upgrade Report

Index

1. Introduction

1.1 Background

1.2 Purpose of the Report

1.3 Scope of the Project



2. Overview of Current Batch Job

2.1 Technology Stack

2.2 Limitations of the Existing Java Batch Job

2.3 Data Sources



3. Proposed Batch Job in Python

3.1 Technology Stack

3.2 Features and Functionalities

3.3 Data Handling and Processing



4. Advantages of Rewriting the Batch Job in Python

4.1 Enhanced Flexibility for KVPs

4.2 Improved Data Processing and Structure

4.3 Upgrading to the Latest SDK Version

4.4 Enhanced Database Structure

4.5 Future Data Science and Machine Learning Capabilities



5. Technical Specifications

5.1 Development Environment

5.2 Required Libraries and SDKs

5.3 Python Version



6. Implementation Plan

6.1 Project Timeline

6.2 Resource Allocation

6.3 Risk Management



7. Conclusion

7.1 Summary of Benefits

7.2 Next Steps



8. Appendices

8.1 References

8.2 Glossary of Terms





---

1. Introduction

1.1 Background

The existing Batch Job has been implemented in Java and is responsible for processing data from Genesis Cloud to an Oracle relational database. Due to limitations in flexibility and scalability, an upgrade to a Python-based solution is proposed.

1.2 Purpose of the Report

This report outlines the rationale, benefits, and implementation details for migrating the Batch Job from Java to Python, with an emphasis on addressing current data handling challenges.

1.3 Scope of the Project

The project will focus on rewriting the Batch Job to ensure the correct structure of the database and data tables while ensuring data availability from Genesis Cloud.

2. Overview of Current Batch Job

2.1 Technology Stack

Current Language: Java

Database: Oracle Relational Database

Data Source: Genesis Cloud SDK (Version 171.0.0)


2.2 Limitations of the Existing Java Batch Job

Difficulty in adding new Key-Value Pairs (KVPs) or columns.

The old Batch Job operates on an outdated SDK version (171.0.0), which lacks essential features such as sentiment scoring.

Upgrading to the newer SDK version has caused unforeseen issues with the existing Batch Job.

Inadequate error handling leads to difficulties when adding new data points or columns.


2.3 Data Sources

Data is retrieved from Genesis Cloud using the provided SDK, which interfaces with the existing Java Batch Job.

3. Proposed Batch Job in Python

3.1 Technology Stack

New Language: Python

Database: Oracle Relational Database

Data Source: Genesis Cloud SDK (Version 217.0.0)


3.2 Features and Functionalities

Dynamic addition of KVPs and columns to the database schema.

Improved error handling to facilitate data processing and management.


3.3 Data Handling and Processing

The primary focus of the new Batch Job is to ensure robust data handling and processing for transferring data from Genesis Cloud to the Oracle database.

4. Advantages of Rewriting the Batch Job in Python

4.1 Enhanced Flexibility for KVPs

The new architecture allows for easy modifications and additions of KVPs, accommodating changing business needs.

4.2 Improved Data Processing and Structure

The new Batch Job will provide a more efficient mechanism for data processing, ensuring that all necessary data points are accurately captured and stored.

4.3 Upgrading to the Latest SDK Version

The new Batch Job will utilize the latest version of the Genesis Cloud SDK (217.0.0), which provides essential features that were missing in the older version, such as sentiment scores.

4.4 Enhanced Database Structure

The new implementation will refine the database structure, consolidating data into a single robust table. Currently, data is spread across multiple tables, making filtering difficult. The new structure will include all necessary columns and allow for easy addition of new data points in the future.

4.5 Future Data Science and Machine Learning Capabilities

Once the data handling is robust and reliable, future enhancements will focus on leveraging Python's capabilities for data science and machine learning. This includes potential applications such as customer segmentation, sentiment analysis, classification, and prediction.

5. Technical Specifications

5.1 Development Environment

Integrated Development Environment (IDE): PyCharm or Jupyter Notebook.

Version Control: Git.


5.2 Required Libraries and SDKs

SDK: Genesis Cloud SDK for Python (Version 217.0.0).


5.3 Python Version

The latest stable version of Python at the time of this report is Python 3.11. This version includes several performance improvements and new features ideal for our use case.

6. Implementation Plan

6.1 Project Timeline

A detailed timeline will be developed to outline each phase of the project, including development, testing, and deployment.

6.2 Resource Allocation

Team members will be assigned specific roles based on expertise in Python development, database management, and project management.

6.3 Risk Management

Potential risks will be identified and assessed to mitigate any impact on project delivery.

7. Conclusion

7.1 Summary of Benefits

Rewriting the Batch Job in Python will provide enhanced flexibility, improved data processing capabilities, and a more robust database structure to support current needs.

7.2 Next Steps

Upon approval, the project will commence with a kickoff meeting to outline responsibilities and timelines.

8. Appendices

8.1 References

Documentation for Genesis Cloud SDK

Python Official Documentation


8.2 Glossary of Terms

KVP: Key-Value Pair

SDK: Software Development Kit



---

Document Format

Font: Roboto

Heading Font Size: 24

Text Font Size: 12



---

New Batch Jobs to be Created

Initially, the following three Batch Jobs will be developed:

1. SDA Data Leak Batch Job for the Voice SDA database.


2. Port Feedback Data Leak Batch Job for Voyapal.


3. IVR STA Batch Job for the IVR dashboard.

  
Batch Job Upgrade Report

1. Introduction

1.1 Background

The existing Batch Job has been implemented in Java and is responsible for processing data from Genesis Cloud to an Oracle relational database. Due to limitations in flexibility and scalability, an upgrade to a Python-based solution is proposed. This upgrade aims to streamline data processing and enhance the overall functionality of our data handling system.

1.2 Purpose of the Report

This report outlines the rationale, benefits, and implementation details for migrating the Batch Job from Java to Python, with an emphasis on addressing current data handling challenges and future enhancements.

1.3 Scope of the Project

The project will focus on rewriting the Batch Job to ensure the correct structure of the database and data tables while ensuring data availability from Genesis Cloud. We aim to leverage Python's capabilities for improved performance and easier maintenance.

2. Overview of Current Batch Job

2.1 Technology Stack

Current Language: Java

Database: Oracle Relational Database

Data Source: Genesis Cloud SDK (Version 171.0.0)


2.2 Limitations of the Existing Java Batch Job

Difficulty in adding new Key-Value Pairs (KVPs) or columns.

The old Batch Job operates on an outdated SDK version (171.0.0), which lacks essential features such as sentiment scoring.

Upgrading to the newer SDK version has caused unforeseen issues with the existing Batch Job.

Inadequate error handling leads to difficulties when adding new data points or columns.

Lack of proper versioning control for the Batch Job, making updates and rollback challenging.


2.3 Data Sources

Data is retrieved from Genesis Cloud using the provided SDK, which interfaces with the existing Java Batch Job.

3. Proposed Batch Job in Python

3.1 Technology Stack

New Language: Python

Database: Oracle Relational Database

Data Source: Genesis Cloud SDK (Version 217.0.0)


3.2 Features and Functionalities

Dynamic addition of KVPs and columns to the database schema.

Improved error handling to facilitate data processing and management.

Implementation of parallel processing to reduce the time taken to complete batch jobs.

Maintenance of proper versioning for the batch jobs, enabling easier tracking and management of changes.


3.3 Data Handling and Processing

The primary focus of the new Batch Job is to ensure robust data handling and processing for transferring data from Genesis Cloud to the Oracle database, enhancing reliability and efficiency.

4. Advantages of Rewriting the Batch Job in Python

4.1 Enhanced Flexibility for KVPs

The new architecture allows for easy modifications and additions of KVPs, accommodating changing business needs without significant downtime.

4.2 Improved Data Processing and Structure

The new Batch Job will provide a more efficient mechanism for data processing, ensuring that all necessary data points are accurately captured and stored.

4.3 Upgrading to the Latest SDK Version

The new Batch Job will utilize the latest version of the Genesis Cloud SDK (217.0.0), which provides essential features that were missing in the older version, such as sentiment scores.

4.4 Enhanced Database Structure

The new implementation will refine the database structure, consolidating data into a single robust table. Currently, data is spread across multiple tables, making filtering difficult. The new structure will include all necessary columns and allow for easy addition of new data points in the future.

4.5 Future Data Science and Machine Learning Capabilities

Once the data handling is robust and reliable, future enhancements will focus on leveraging Python's capabilities for data science and machine learning. This includes potential applications such as customer segmentation, sentiment analysis, classification, and prediction.

4.6 Performance Improvements

Utilizing parallel processing in Python will significantly reduce the time taken to complete batch jobs, improving overall efficiency and throughput.

4.7 Version Control Management

The new Batch Job will support proper versioning, allowing for better tracking of changes, easier updates, and a straightforward rollback process if necessary.

5. Technical Specifications

5.1 Development Environment

Integrated Development Environment (IDE): PyCharm or Jupyter Notebook.

Version Control: Git.


5.2 Required Libraries and SDKs

SDK: Genesis Cloud SDK for Python (Version 217.0.0).


5.3 Python Version

The latest stable version of Python at the time of this report is Python 3.11. This version includes several performance improvements and new features ideal for our use case.

6. Implementation Plan

6.1 Project Timeline

A detailed timeline will be developed to outline each phase of the project, including development, testing, and deployment.

6.2 Resource Allocation

Team members will be assigned specific roles based on expertise in Python development, database management, and project management.

6.3 Risk Management

Potential risks will be identified and assessed to mitigate any impact on project delivery.

7. Conclusion

7.1 Summary of Benefits

Rewriting the Batch Job in Python will provide enhanced flexibility, improved data processing capabilities, a more robust database structure, and the potential for future data science applications.

7.2 Next Steps

Upon approval, the project will commence with a kickoff meeting to outline responsibilities and timelines.

8. Appendices

8.1 New Batch Jobs to be Created

Initially, the following three Batch Jobs will be developed:

1. SDA Data Leak Batch Job for the Voice SDA database.


2. Port Feedback Data Leak Batch Job for Voyapal.


3. IVR STA Batch Job for the IVR dashboard.


Batch Job Upgrade Report

1. Introduction

1.1 Background

The existing Batch Job has been implemented in Java and is responsible for processing data from Genesis Cloud to an Oracle relational database. Due to limitations in flexibility and scalability, an upgrade to a Python-based solution is proposed. This upgrade aims to streamline data processing and enhance the overall functionality of our data handling system.

1.2 Purpose of the Report

This report outlines the rationale, benefits, and implementation details for migrating the Batch Job from Java to Python, with an emphasis on addressing current data handling challenges and future enhancements.

1.3 Scope of the Project

The project will focus on rewriting the Batch Job to ensure the correct structure of the database and data tables while ensuring data availability from Genesis Cloud. We aim to leverage Python's capabilities for improved performance and easier maintenance.

2. Overview of Current Batch Job

2.1 Technology Stack

Current Language: Java

Database: Oracle Relational Database

Data Source: Genesis Cloud SDK (Version 171.0.0)


2.2 Limitations of the Existing Java Batch Job

Difficulty in adding new Key-Value Pairs (KVPs) or columns.

The old Batch Job operates on an outdated SDK version (171.0.0), which lacks essential features such as sentiment scoring.

Upgrading to the newer SDK version has caused unforeseen issues with the existing Batch Job.

Inadequate error handling leads to difficulties when adding new data points or columns.

Lack of proper versioning control for the Batch Job, making updates and rollback challenging.


2.3 Data Sources

Data is retrieved from Genesis Cloud using the provided SDK, which interfaces with the existing Java Batch Job.

3. Proposed Batch Job in Python

3.1 Technology Stack

New Language: Python

Database: Oracle Relational Database

Data Source: Genesis Cloud SDK (Version 217.0.0)


3.2 Features and Functionalities

Dynamic addition of KVPs and columns to the database schema.

Improved error handling to facilitate data processing and management.

Implementation of parallel processing to reduce the time taken to complete batch jobs.

Maintenance of proper versioning for the batch jobs, enabling easier tracking and management of changes.


3.3 Data Handling and Processing

The primary focus of the new Batch Job is to ensure robust data handling and processing for transferring data from Genesis Cloud to the Oracle database, enhancing reliability and efficiency.

4. Advantages of Rewriting the Batch Job in Python

4.1 Enhanced Flexibility for KVPs

The new architecture allows for easy modifications and additions of KVPs, accommodating changing business needs without significant downtime.

4.2 Improved Data Processing and Structure

The new Batch Job will provide a more efficient mechanism for data processing, ensuring that all necessary data points are accurately captured and stored.

4.3 Upgrading to the Latest SDK Version

The new Batch Job will utilize the latest version of the Genesis Cloud SDK (217.0.0), which provides essential features that were missing in the older version, such as sentiment scores.

4.4 Enhanced Database Structure

The new implementation will refine the database structure, consolidating data into a single robust table. Currently, data is spread across multiple tables, making filtering difficult. The new structure will include all necessary columns and allow for easy addition of new data points in the future.

4.5 Future Data Science and Machine Learning Capabilities

Once the data handling is robust and reliable, future enhancements will focus on leveraging Python's capabilities for data science and machine learning. This includes potential applications such as customer segmentation, sentiment analysis, classification, and prediction.

4.6 Performance Improvements

Utilizing parallel processing in Python will significantly reduce the time taken to complete batch jobs, improving overall efficiency and throughput.

4.7 Version Control Management

The new Batch Job will support proper versioning, allowing for better tracking of changes, easier updates, and a straightforward rollback process if necessary.

5. Technical Specifications

5.1 Development Environment

Integrated Development Environment (IDE): PyCharm or Jupyter Notebook.

Version Control: Git.


5.2 Required Libraries and SDKs

SDK: Genesis Cloud SDK for Python (Version 217.0.0).


5.3 Python Version

The latest stable version of Python at the time of this report is Python 3.11. This version includes several performance improvements and new features ideal for our use case.

6. Implementation Plan

6.1 Project Timeline

A detailed timeline will be developed to outline each phase of the project, including development, testing, and deployment.

6.2 Resource Allocation

Team members will be assigned specific roles based on expertise in Python development, database management, and project management.

6.3 Risk Management

Potential risks will be identified and assessed to mitigate any impact on project delivery.

7. Conclusion

7.1 Summary of Benefits

Rewriting the Batch Job in Python will provide enhanced flexibility, improved data processing capabilities, a more robust database structure, and the potential for future data science applications.

7.2 Next Steps

Upon approval, the project will commence with a kickoff meeting to outline responsibilities and timelines.

8. Appendices

8.1 New Batch Jobs to be Created

Initially, the following three Batch Jobs will be developed:

1. SDA Data Leak Batch Job for the Voice SDA database.


2. Port Feedback Data Leak Batch Job for Voyapal.


3. IVR STA Batch Job for the IVR dashboard.


