export function setUsers(userData) {
    return {
      type: 'SET_USERS',
      userData, // The full list of users
    };
  }
  
export function filterUsers(query) {
    return {
      type: 'FILTER_USERS',
      query, // The search query to filter users
    };
  }

export function setEvalData(evalData){
    return{
        type:'SET_EVAL_DATA',
        evalData
    }
}

export function setFlag(flag){
    return{
        type:'SET_FLAG',
        flag
    }
}

export function setQuery(query){
    return{
        type:'SET_QUERY',
        query
    }
}