import conf from "../conf/conf";
import { Client, Databases, Query, ID } from "appwrite";

export class DatabaseService {
    client = new Client();
    databases;

    constructor() {
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client)
    }

    async getMeasure(measureId) {
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, measureId);
        } catch (error) {
            console.log('--- Appwrite DatabaseService getMeasure ' + error);
            return null;
        }
    }

    async getMeasureGroup(measureGroupId) {
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, measureGroupId);
        } catch (error) {
            console.log('--- Appwrite DatabaseService getMeasureGroup ' + error);
            return null;
        }
    }

    async getAllMeasures() {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, [ Query.orderDesc('datetime') ])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllMeasures ' + error);
            return null;
        }
    }

    async getAllMeasureGroups() {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, [Query.orderDesc('$updatedAt')])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllMeasureGroups ' + error);
            return null;
        }
    }

    async getMeasuresInTimeInterval(from, to) {

        console.log('GetMeasuresInTimeInterval --> from: ' + from + ' to: ' + to)

        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, [Query.between('datetime', from, to)])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getMeasuresInTimeInterval ' + error);
            return null;
        }
    }

    async getMeasuresByUserId(userId) {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, [Query.equal('userId', userId)])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getMeasuresInTimeInterval ' + error);
            return null;
        }
    }

    async addMeasure({ userId, latitude, longitude, placeDescription, datetime, imageId, electricalConductivity, totalDissolvedSolids, pH, temperature, salinity }) {
        try {
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, ID.unique(), { userId, latitude, longitude, placeDescription, datetime, imageId, electricalConductivity, totalDissolvedSolids, pH, temperature, salinity });
        } catch (error) {
            console.log('--- Appwrite DatabaseService addMeasure ' + error);
            return null;
        }
    }

    async updateMeasure(measureId, { latitude, longitude, placeDescription, datetime, imageId, electricalConductivity, totalDissolvedSolids, pH, temperature, salinity }) {
        try {
            return await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, measureId, { latitude, longitude, placeDescription, datetime, imageId, electricalConductivity, totalDissolvedSolids, pH, temperature, salinity });
        } catch (error) {
            console.log('--- Appwrite DatabaseService updateMeasure ' + error);
            return null;
        }
    }

    async deleteMeasure(measureId) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, measureId);
            return true;
        } catch (error) {
            console.log('--- Appwrite DatabaseService deleteMeasure ' + error);
            return false;
        }
    }

    async addMeasureGroup({ userId, description, latitude, longitude, imageId, measures }) {
        try {
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, ID.unique(), { userId, description, latitude, longitude, imageId, measures });
        } catch (error) {
            console.log('--- Appwrite DatabaseService addMeasureGroup ' + error);
            return null;
        }
    }

    async updateMeasureGroup(measureGroupId, { description, latitude, longitude, imageId, measures, lastOperationTime }) {
        try {
            return await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, measureGroupId, { description, latitude, longitude, imageId, measures, lastOperationTime })
        } catch (error) {
            console.log('--- Appwrite DatabaseService updateMeasureGroup ' + error);
            return null;
        }
    }

    async deleteMeasureGroup(measureGroupId) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, measureGroupId);
            return true; 
        } catch (error) {
            console.log('--- Appwrite DatabaseService deleteMeasureGroup ' + error);
            return false;
        }
    }
}

const databaseService = new DatabaseService()
export default databaseService