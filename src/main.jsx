import App from './App'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as actions from './redux/actions'


function mapStateToProps(state){
    return{
        flag: state.setFlag,
        userData: state.filterUserData,
        evalData: state.setEvalData,
        query: state.setQuery,

    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({...actions}, dispatch)
     
}

const Main = connect(mapStateToProps, mapDispatchToProps)(App)

export default Main