import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';
import Papa from 'papaparse';
import '../Styles/DataTable.css'; // Import CSS file for styling

const DataTable = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [externalContacts, setExternalContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://api.mypurecloud.com/api/v2/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.entities);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchExternalContacts = async () => {
      try {
        const response = await axios.get('https://api.mypurecloud.com/api/v2/externalcontacts/contacts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExternalContacts(response.data.entities.slice(0, 20)); // Limit to 20 contacts
      } catch (error) {
        console.error('Error fetching external contacts:', error);
      }
    };

    const fetchConversations = async () => {
      try {
        const response = await axios.get('https://api.mypurecloud.com/api/v2/conversations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConversations(response.data.entities);
        
        
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    const fetchQueues = async () => {
      try {
        const response = await axios.get('https://api.mypurecloud.com/api/v2/routing/queues', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
       
        setQueues(response.data.entities);
       
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchUsers();
    fetchExternalContacts();
    fetchConversations();
    fetchQueues();
  }, [token]);

  const userColumns = React.useMemo(() => [
    {
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Email',
      accessor: 'email',
    },
  ], []);

  const contactColumns = React.useMemo(() => [
    {
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Name',
      accessor: row => `${row.firstName} ${row.lastName}`,
    },
    {
      Header: 'Title',
      accessor: row => `${row.title ? row.title : "N/A"}`,
    },
    {
      Header: 'Work E-mail',
      accessor: 'workEmail',
    },
    {
      Header: 'Address',
      accessor: row => `${row.address?.address1 || ''} ${row.address?.city || ''} ${row.address?.state || ''}  ${row.address?.countryCode || ''} ${row.address?.postalCode || ''}`,
    },
    {
      Header: 'Phone No.',
      accessor: row => (<>Work Phone: {row.workPhone?.display || "N/A"} <br /> Other Phone: {row.otherPhone?.display || "N/A"}</>),
    },
  ], []);

  const conversationColumns = React.useMemo(() => [
    {
      Header: 'ID',
      accessor: 'conversationId',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'State',
      accessor: 'state',
    },
  ], []);

  const queuesColumns = React.useMemo(() => [
    {
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Division ID',
      accessor: 'division.id',
    },
    {
      Header: 'Date Created',
      accessor: 'dateCreated',
    },
    {
      Header: 'Member Count',
      accessor: 'memberCount',
    },
  ], []);

  const userTable = useTable({ columns: userColumns, data: users });
  const contactTable = useTable({ columns: contactColumns, data: externalContacts });
  const conversationTable = useTable({ columns: conversationColumns, data: conversations });
  const queuesTable = useTable({ columns: queuesColumns, data: queues });

  const renderTable = (tableInstance) => {
    const { headerGroups, rows, prepareRow } = tableInstance;
    return (
      <div className="table-container">
        <table className="user-table">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr key={`header-${headerGroup.id}`}>
                {headerGroup.headers.map(column => (
                  <th key={`header-${column.id}`}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr key={`row-${row.id}`}>
                  {row.cells.map(cell => (
                    <td key={`cell-${cell.column.id}`}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const mapDataForDownload = (data, columns) => {
    return data.map(row => {
      const mappedRow = {};
      columns.forEach(column => {
        const accessor = column.accessor;
        if (typeof accessor === 'function') {
          mappedRow[column.Header] = accessor(row);
        } else {
          mappedRow[column.Header] = row[accessor];
        }
      });
      return mappedRow;
    });
  };

  const downloadCsv = (data, columns, filename) => {
    const mappedData = mapDataForDownload(data, columns);
    const csv = Papa.unparse(mappedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>User Data</h2>
      <button className="download-button" onClick={() => downloadCsv(users, userColumns, 'users_data.csv')}>Download Users CSV</button>
      {renderTable(userTable)}
  
      <h2>External Contacts</h2>
      <button className="download-button" onClick={() => downloadCsv(externalContacts, contactColumns, 'external_contacts_data.csv')}>Download External Contacts CSV</button>
      {renderTable(contactTable)}
      
      {/* <h2>Conversations</h2>
      <button className="download-button" onClick={() => downloadCsv(conversations, conversationColumns, 'conversations_data.csv')}>Download Conversations CSV</button>
      {renderTable(conversationTable)} */}

      <h2>Queues Data</h2>
      <button className="download-button" onClick={() => downloadCsv(queues, queuesColumns, 'queues_data.csv')}>Download Queues CSV</button>
      {renderTable(queuesTable)}
    </div>
  );
};

export default DataTable;