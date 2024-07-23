import {combineReducers} from 'redux'
import {initialUserData, evalData, flag, query} from '../data'

function filterUserData(state = initialUserData, action) {
    
    switch (action.type) {
      case 'SET_USERS':
        return {
          ...state,
          userData: action.userData,
          filteredUsers: action.userData, // Initially show all users
        };
      case 'FILTER_USERS':
        const temp = state.userData.rows.filter((user) =>
          user.name.toLowerCase().includes(action.query.toLowerCase())
        )
        return {
          ...state,
          filteredUsers: {rows:temp,columns:state.userData.columns
          },
        };
      default:
        return state;
    }
  }

function setEvalData(state = evalData, action){
    switch (action.type){
        case 'SET_EVAL_DATA': return action.evalData;
        default: return state
    }
}

function setFlag(state=flag,action){
    switch (action.type){
        case 'SET_FLAG': return action.flag;
        default: return state
    }
}

function setQuery(state=query,action){
    switch (action.type){
        case 'SET_QUERY': return action.query;
        default: return state
    }
}

const rootReducer = combineReducers({filterUserData, setEvalData, setFlag, setQuery})
export default rootReducer
