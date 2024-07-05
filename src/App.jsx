import { useEffect,useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {fetchUsersData,fetchEvalData, authenticate} from './utils/genesysCloudApi'
import Dashboard from './components/dashboard/Dashboard'

const App = () => { 
  const [props, setProps] = useState({});
  const [flag, setFlag] = useState(true);
  authenticate();
  useEffect(() => {
    const getData = async () => {
      try {
        const usersData = await fetchUsersData();
        const evalData = await fetchEvalData();
        if(usersData){
          setFlag(false)
        }
       setProps({usersData,evalData})
       
      } catch (error) {
        console.log("Error while fetching data from genesys cloud",error);
      }
      
    };
    getData();
  }, []);

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
