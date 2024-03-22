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

    getIdUnique() {
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
            const queries = [];
            queries.push(Query.orderDesc('datetime'))
            queries.push(Query.limit(1000000));            
            const measures = await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, queries)
            //console.log('Measures: ' + JSON.stringify(measures.documents))
            return measures;
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllMeasures ' + error);
            return null;
        }
    }

    async getAllLocations(userId, searchText, limit, withMeasures = false) {
        try {
            const queries = [];

            if (!withMeasures) queries.push(Query.select(['$id', 'name', 'latitude', 'longitude']))
            if (userId) queries.push(Query.equal('userId', userId));
            if (searchText) queries.push(Query.search('name', searchText));
            queries.push(Query.orderDesc('$updatedAt'));
            queries.push(Query.limit(limit));

            //console.log(queries)

            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, queries  )
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllLocations ' + error);
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
    

    async getAllReports(userId, searchText, limit) {
        try {

            const queries = [];

            if (userId) queries.push(Query.equal('userId', userId));
            if (searchText) queries.push(Query.search('title', searchText)); //TODO: When Appwrite will implement the logical OR in queries, we need to add a search on the "description" field too
            queries.push(Query.orderDesc('$updatedAt'));
            queries.push(Query.limit(limit));

            //console.log(queries)

            const reports = await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, queries);
            //console.log('LIST OF REPORTS: ' + JSON.stringify(reports));
            return reports;
        } catch (error) {
            console.log('--- Appwrite DatabaseService getAllReports ' + error);
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

    async getMeasuresByUserId(userId, searchText, limit) {
        try {

            const queries = [];

            if (userId) queries.push(Query.equal('userId', userId));
            if (searchText) queries.push(Query.search('title', searchText));
            queries.push(Query.orderDesc('$updatedAt'));
            queries.push(Query.limit(limit));

            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMeasuresCollectionId, queries)

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


    async updateLocation(locationId, { name, latitude, longitude, imageId, measures, lastOperationTime }) {
        try {
            return await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appriteLocationsCollectionId, locationId, { name, latitude, longitude, imageId, measures, lastOperationTime })
        } catch (error) {
            console.log('--- Appwrite DatabaseService updateLocation ' + error);
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

    async getReportsByUserId(userId) {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteReportsCollectionId, [Query.equal('userId', userId)])
        } catch (error) {
            console.log('--- Appwrite DatabaseService getReportsByUserId ' + error);
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