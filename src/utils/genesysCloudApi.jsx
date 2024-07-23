import { clientConfig } from '../clientConfig';
import platformClient from 'purecloud-platform-client-v2';

const client = platformClient.ApiClient.instance;
const { clientId, redirectUri } = clientConfig;

client.setEnvironment(platformClient.PureCloudRegionHosts.us_west_2); // Genesys Cloud region

let userApi = new platformClient.UsersApi();
let qualityApi = new platformClient.QualityApi();

let opts = {
    //   "pageSize": 25, // Number | The total page size requested
    //   "pageNumber": 1, // Number | The page number requested
    //   "expand": ["expand_example"], // [String] | variable name requested by expand list
    //   "previousPage": "previousPage_example", // String | Previous page token
    //   "conversationId": "conversationId_example", // String | conversationId specified
    "agentUserId": "406f7191-4166-441d-b765-d493e02ffb23", // String | user id of the agent
    //   "agentTeamId": "agentTeamId_example", // String | team id of the agent
    //   "evaluatorUserId": "evaluatorUserId_example", // String | evaluator user id
    //   "assigneeUserId": "assigneeUserId_example", // String | assignee user id
    //   "queueId": "queueId_example", // String | queue id
    //   "startTime": "startTime_example", // String | start time of the evaluation query
    //   "endTime": "endTime_example", // String | end time of the evaluation query
    //   "formContextId": "formContextId_example", // String | shared id between form versions
    //   "evaluationState": ["evaluationState_example"], // [String] | 
    //   "isReleased": true, // Boolean | the evaluation has been released
    //   "agentHasRead": true, // Boolean | agent has the evaluation
    //   "expandAnswerTotalScores": true, // Boolean | get the total scores for evaluations. NOTE: The answers will only be populated if this parameter is set to true in the request.
    //   "maximum": 3.4, // Number | the maximum number of results to return
    //   "sortOrder": "sortOrder_example" // String | NOTE: Does not work when conversationId is supplied.
};

// Queries Evaluations and returns a paged list

export async function authenticate() {
    return client.loginImplicitGrant(clientId, redirectUri, { state: 'state' })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            console.error(err);
        });
}
// let opts = { 
//   "pageSize": 25, // Number | Page size
//   "pageNumber": 1, // Number | Page number
//   "id": ["id_example"], // [String] | A list of user IDs to fetch by bulk
//   "jabberId": ["jabberId_example"], // [String] | A list of jabberIds to fetch by bulk (cannot be used with the id parameter)
//   "sortOrder": "ASC", // String | Ascending or descending sort order
//   "expand": ["expand_example"], // [String] | Which fields, if any, to expand
//   "integrationPresenceSource": "integrationPresenceSource_example", // String | Gets an integration presence for users instead of their defaults. This parameter will only be used when presence is provided as an expand. When using this parameter the maximum number of users that can be returned is 100.
//   "state": "active" // String | Only list users of this state
// };

// Get the list of available users.
export const fetchUsersData = async () => {
    try {
        const data = await userApi.getUsers()
        if (data && data.entities) {
            const rows = data.entities.map((user) => ({
                id: user.id || 'N/A',
                divisionId: user.division ? user.division.id : 'N/A',
                name: user.name || 'N/A',
                state: user.state || 'N/A',
            }));
            const columns = [
                { field: 'id', headerName: 'ID', width: 300 },
                { field: 'divisionId', headerName: 'Division Id', width: 300 },
                { field: 'name', headerName: 'Username', width: 300 },
                { field: 'state', headerName: 'State', width: 80 },
            ];

            const transformedUserData = {
                rows,
                columns,
            }
            //console.log(transformedUserData);
            return transformedUserData;
        } else {
            return [];
        }
    } catch (err) {
        console.log("There was a failure calling getUsers", err);
    };

}

export const fetchEvalData = async () => {
    try {
        const evalData = await qualityApi.getQualityEvaluationsQuery(opts)
        //console.log(evalData);
        if (evalData && evalData.entities) {
            const rows = evalData.entities.map((user) => ({
                id: user.agent.id || 'N/A',
                evaluatorId: user.evaluator.id ? user.evaluator.id : 'N/A',
                evaluationScore: user.evaluationSource.id || 'N/A',
                status: user.status || 'N/A',
            }));
            const columns = [
                { field: 'id', headerName: 'Agent ID', width: 300 },
                { field: 'evaluatorId', headerName: 'Evaluator', width: 300 },
                { field: 'evaluationScore', headerName: 'Evaluation Score', width: 300 },
                { field: 'status', headerName: 'Status', width: 80 },
            ];

            const transformedEvalData = {
                rows,
                columns,
            }
            return transformedEvalData;
        } else {
            return [];
        }
    } catch (err) {
        console.log("There was a failure calling getQualityEvaluationsQuery");
        console.error(err);
    };
}




