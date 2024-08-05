import { useEffect,useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {fetchUsersData, fetchEvalData, authenticate, fetchConversations, fetchCategories} from './utils/genesysCloudApi'
import Dashboard from './components/dashboard/Dashboard'
import { conversationUser } from './data'

const App = (props) => { 
  const { flag, setFlag, setUsers, setEvalData, setCategories, filterUsers,conversationUser, query} = props;
  authenticate(); 
  useEffect(() => {
    const getData = async () => {
      try {
        const userDataResponse = await fetchUsersData();
        const evalDataResponse = await fetchEvalData();
        const categoriesDataResponse = await fetchCategories();
        if(userDataResponse && evalDataResponse && categoriesDataResponse){
          setFlag(false)
        }
        
        setUsers(userDataResponse)
        setEvalData(evalDataResponse)
        setCategories(categoriesDataResponse)
      } catch (error) {
        console.log("Error while fetching data from genesys cloud",error);
      }
      
    };
    getData();
  }, []);

  useEffect(() => {
    filterUsers(query);
  }, [query,filterUsers]);

  useEffect(() => {
    console.log(conversationUser);
    
    const response = fetchConversations(conversationUser);
    console.log("resp",response);
    
  }, [conversationUser,fetchConversations]);

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
