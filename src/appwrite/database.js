import { conf } from "../conf/conf.js";
import { Client, Databases, Query, ID } from "appwrite";
import { getBoundingBoxCoordinates } from "../utils/geo.js";
import _ from 'lodash';

export class DatabaseService {
    client = new Client();
    databases;

    constructor() {
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client)
    }

    getIdUnique(){
        return ID.unique()
    }

    async getMeasure(measureId) {
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, measureId);
        } catch (error) {
            console.log('--- Appwrite DatabaseService getMeasure ' + error);
            return null;
        }
    }

    async getLocation(locationId) {
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, locationId);
        } catch (error) {
            console.log('--- Appwrite DatabaseService getLocation ' + error);
            return null;
        }
    }

    //DEPRECATED
    async getMeasureGroup(measureGroupId) {
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, measureGroupId);
        } catch (error) {
            console.log('--- Appwrite DatabaseService getMeasureGroup ' + error);
            return null;
        }
    }

    async getReport(reportId) {
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, reportId);
        } catch (error) {
            console.log('--- Appwrite DatabaseService getReport ' + error);
            return null;
        }
    }

    async getAllMeasures() {
        try {
            const measures = await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, [Query.orderDesc('datetime')])
            //console.log('Measures: ' + JSON.stringify(measures.documents))
            return measures;
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllMeasures ' + error);
            return null;
        }
    }

    async getAllLocations() {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, [Query.orderDesc('$updatedAt')])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllLocations ' + error);
            return null;
        }
    }

    //DEPRECATED
    async getAllMeasureGroups() {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, [Query.orderDesc('$updatedAt')])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllMeasureGroups ' + error);
            return null;
        }
    }


    async getAllLocationsAround(refLatitude, refLongitude, distance = conf.maxDistanceMeters) {
        const boundingBox = getBoundingBoxCoordinates(refLatitude, refLongitude, distance);

        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId,
                [
                    Query.greaterThan('latitude', boundingBox.minLatitude),
                    Query.lessThan('latitude', boundingBox.maxLatitude),
                    Query.greaterThan('longitude', boundingBox.minLongitude),
                    Query.lessThan('longitude', boundingBox.maxLatitude)
                ])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllLocationsAround ' + error);
            return null;
        }
    }

    getAllLocationsAroundFromList(locations, refLatitude, refLongitude, distance = conf.maxDistanceMeters) {
        const boundingBox = getBoundingBoxCoordinates(refLatitude, refLongitude, distance)

        try {
            return locations.filter((l) => {
                return l.latitude > boundingBox.minLatitude && l.latitude < boundingBox.maxLatitude && l.longitude > boundingBox.minLongitude && l.longitude < boundingBox.maxLongitude
            })
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllLocationsAroundFromList ' + error)
            return null
        }
    }


    //DEPRECATED
    async getAllMeasureGroupsAround(refLatitude, refLongitude, distance) {

        const boundingBox = getBoundingBoxCoordinates(refLatitude, refLongitude, distance);

        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId,
                [
                    Query.greaterThan('latitude', boundingBox.minLatitude),
                    Query.lessThan('latitude', boundingBox.maxLatitude),
                    Query.greaterThan('longitude', boundingBox.minLongitude),
                    Query.lessThan('longitude', boundingBox.maxLatitude)
                ])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllMeasureGroupsAround ' + error);
            return null;
        }
    }

    async getAllReports() {
        try {
            const reports = await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, [Query.orderDesc('$updatedAt')]);
            //console.log('LIST OF REPORTS: ' + JSON.stringify(reports));
            return reports;
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllMeasureGroups ' + error);
            return null;
        }
    }

    //TODO: it's not working
    // async getMeasuresInTimeInterval(from, to) {

    //     console.log('GetMeasuresInTimeInterval --> from: ' + from + ' to: ' + to)

    //     try {
    //         return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, [Query.between('datetime', from, to)])
    //     } catch (error) {
    //         console.log('--- Appwrite DatabaseService getMeasuresInTimeInterval ' + error);
    //         return null;
    //     }
    // }

    async getMeasuresByUserId(userId) {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, [Query.equal('userId', userId)])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getMeasuresByUserId ' + error);
            return null;
        }
    }

    async addMeasure({ userId, username, latitude, longitude, placeDescription, datetime, imageId, electricalConductivity, totalDissolvedSolids, pH, temperature, salinity, location }) {
        try {
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, ID.unique(), { userId, username, latitude, longitude, placeDescription, datetime, imageId, electricalConductivity, totalDissolvedSolids, pH, temperature, salinity, location });
        } catch (error) {
            console.log('--- Appwrite DatabaseService addMeasure ' + error);
            return null;
        }
    }

    async updateMeasure(measureId, { username, latitude, longitude, placeDescription, datetime, imageId, electricalConductivity, totalDissolvedSolids, pH, temperature, salinity }) {
        try {
            return await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, measureId, { username, latitude, longitude, placeDescription, datetime, imageId, electricalConductivity, totalDissolvedSolids, pH, temperature, salinity });
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


    async getLocationsByUserId(userId) {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, [Query.equal('userId', userId)])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getLocationsByUserId ' + error);
            return null;
        }
    }

    //DEPRECATED
    async getMeasureGroupsByUserId(userId) {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, [Query.equal('userId', userId)])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getMeasureGroupsByUserId ' + error);
            return null;
        }
    }

    async addLocation({ userId, username, name, latitude, longitude, imageId, measures }) {
        try {
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, ID.unique(), { userId, username, name, latitude, longitude, imageId, measures });
        } catch (error) {
            console.log('--- Appwrite DatabaseService addLocation ' + error);
            return null;
        }
    }

    async restoreLocation(location) {
        try {

            const measures = location.measures.map((e) => {
                return _.pick(e, ['userId', 'username', 'datetime', 'latitude', 'longitude', 'imageId', 'electricalConductivity', 'totalDissolvedSolids', 'pH', 'temperature', 'salinity', 'placeDescription']);
            })

            //console.log(measures)

            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, location.$id ?? ID.unique(), { userId: location.userId, username: location.username, name: location.name, lastOperationTime: location.lastOperationTime, latitude: location.latitude, longitude: location.longitude, imageId: location.imageId, measures: measures });
        } catch (error) {
            console.log('--- Appwrite DatabaseService restoreLocation ' + error);
            return null;
        }
    }

    //DEPRECATED
    async addMeasureGroup({ userId, username, description, latitude, longitude, imageId, measures }) {
        try {
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, ID.unique(), { userId, username, description, latitude, longitude, imageId, measures });
        } catch (error) {
            console.log('--- Appwrite DatabaseService addMeasureGroup ' + error);
            return null;
        }
    }


    async updateLocation(locationId, { username, name, latitude, longitude, imageId, measures, lastOperationTime }) {
        try {
            return await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, locationId, { username, name, latitude, longitude, imageId, measures, lastOperationTime })
        } catch (error) {
            console.log('--- Appwrite DatabaseService updateLocation ' + error);
            return null;
        }
    }

    //DEPRECATED
    async updateMeasureGroup(measureGroupId, { username, description, latitude, longitude, imageId, measures, lastOperationTime }) {
        try {
            return await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, measureGroupId, { username, description, latitude, longitude, imageId, measures, lastOperationTime })
        } catch (error) {
            console.log('--- Appwrite DatabaseService updateMeasureGroup ' + error);
            return null;
        }
    }


    async deleteLocation(locationId) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, locationId);
            return true;
        } catch (error) {
            console.log('--- Appwrite DatabaseService deleteLocation ' + error);
            return false;
        }
    }

    //DEPRECATED
    async deleteMeasureGroup(measureGroupId) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteMeasureGroupsCollectionId, measureGroupId);
            return true;
        } catch (error) {
            console.log('--- Appwrite DatabaseService deleteMeasureGroup ' + error);
            return false;
        }
    }


    ////


    async getReportssByUserId(userId) {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, [Query.equal('userId', userId)])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getReportssByUserId ' + error);
            return null;
        }
    }

    async addReport({ userId, username, latitude, longitude, title, description, datetime, imageId }) {
        try {
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, ID.unique(), { userId, username, latitude, longitude, title, description, datetime, imageId });
        } catch (error) {
            console.log('--- Appwrite DatabaseService addReport ' + error);
            return null;
        }
    }

    async restoreReport(report) {
        try {
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, report.$id, { userId: report.userId, username: report.username, title: report.title, description: report.name, datetime: report.datetime, latitude: report.latitude, longitude: report.longitude, imageId: report.imageId });
        } catch (error) {
            console.log('--- Appwrite DatabaseService restoreReport ' + error);
            return null;
        }
    }

    async updateReport(measureId, { username, latitude, longitude, title, description, datetime, imageId }) {
        try {
            return await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, measureId, { username, latitude, longitude, title, description, datetime, imageId });
        } catch (error) {
            console.log('--- Appwrite DatabaseService updateReport ' + error);
            return null;
        }
    }

    async deleteReport(reportId) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, reportId);
            return true;
        } catch (error) {
            console.log('--- Appwrite DatabaseService deleteReport ' + error);
            return false;
        }
    }
}

const databaseService = new DatabaseService()
export default databaseService