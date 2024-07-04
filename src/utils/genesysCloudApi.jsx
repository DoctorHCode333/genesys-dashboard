import { clientConfig } from '../clientConfig';
import platformClient from 'purecloud-platform-client-v2';

const client = platformClient.ApiClient.instance;
const { clientId, redirectUri } = clientConfig;

client.setEnvironment(platformClient.PureCloudRegionHosts.us_east_1); // Genesys Cloud region

let apiInstance = new platformClient.UsersApi();

export function authenticate() {
    return client.loginImplicitGrant(clientId, redirectUri, { state: 'state' })
        .then((data: any) => {
            return data;
        })
        .catch((err: any) => {
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
export const UsersData = ()=> {
    apiInstance.getUsers(opts)
    .then((data) => {
      console.log(`getUsers success! data: ${JSON.stringify(data, null, 2)}`);
    })
    .catch((err) => {
      console.log("There was a failure calling getUsers");
      console.error(err);
    });
}



