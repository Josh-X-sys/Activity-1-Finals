import { Client, Databases, Account, Teams, ID } from 'appwrite';

const client = new Client();
client.setEndpoint('https://syd.cloud.appwrite.io/v1').setProject('68f5f55c003b751143a8');

const databases = new Databases(client);
const DATABASE_ID = '68f5f56c003891f13ce7';
const COLLECTION_ID = 'Products';
const account = new Account(client);
const teams = new Teams(client);

export { databases, ID, DATABASE_ID, account, COLLECTION_ID, teams };  // Export teams