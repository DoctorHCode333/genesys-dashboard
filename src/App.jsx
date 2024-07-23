import { useEffect,useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {fetchUsersData, fetchEvalData, authenticate} from './utils/genesysCloudApi'
import Dashboard from './components/dashboard/Dashboard'

const App = (props) => { 
  const { flag, setFlag, setUsers, setEvalData, filterUsers, query} = props;
  authenticate();
  useEffect(() => {
    const getData = async () => {
      try {
        const userDataResponse = await fetchUsersData();
        const evalDataResponse = await fetchEvalData();
        if(userDataResponse && evalDataResponse){
          setFlag(false)
        }
       
        setUsers(userDataResponse)
        setEvalData(evalDataResponse)
      } catch (error) {
        console.log("Error while fetching data from genesys cloud",error);
      }
      
    };
    getData();
  }, []);

  useEffect(() => {
    filterUsers(query);
  }, [query,filterUsers]);

  if(flag){
    return(<div>Loading...</div>)
  }else{
    return (
      <div className="App">
        <Dashboard {...props}/>
      </div>
    )
  }
}

export default App
