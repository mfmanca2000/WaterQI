/* eslint-disable no-undef */
const conf = {
    appwriteUrl: String(process.env.APPWRITE_URL),
    appwriteProjectId: String(process.env.APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(process.env.APPWRITE_DATABASE_ID),
    appwriteMeasuresCollectionId: String(process.env.APPWRITE_MEASURES_COLLECTION_ID),
    appwriteMeasureGroupsCollectionId: String(process.env.APPWRITE_MEASUREGROUPS_COLLECTION_ID),
    appriteLocationsCollectionId: String(process.env.APPWRITE_LOCATIONS_COLLECTION_ID),
    appwriteReportsCollectionId: String(process.env.APPWRITE_REPORTS_COLLECTION_ID),
    appwriteBucketId: String(process.env.APPWRITE_BUCKET_ID),
    googleMapsAPIKey: String(process.env.GOOGLE_MAPS_API_KEY),
    defaultLatitude: Number(process.env.DEFAULT_LATITUDE),
    defaultLongitude: Number(process.env.DEFAULT_LONGITUDE),
    defaultZoomLevel: Number(process.env.DEFAULT_ZOOM_LEVEL),
    lastInsertedMeasuresNumber: Number(process.env.LAST_INSERTED_MEASURES_NUMBER),
    lastModifiedMeasureGroupsNumber: Number(process.env.LAST_MODIFIED_MEASURE_GROUPS_NUMBER),
    lastModifiedLocationsNumber: Number(process.env.LAST_MODIFIED_LOCATIONS_NUMBER),
    lastInsertedReportsNumber: Number(process.env.LAST_INSERTED_REPORTS_NUMBER),
    maxUploadFileSizeKB: Number(process.env.MAX_UPLOAD_FILE_SIZE_KB),
    measureImageRequired: String(process.env.MEASURE_IMAGE_REQUIRED),
    measureGroupImageRequired: String(process.env.MEASURE_GROUP_IMAGE_REQUIRED),
    reportImageRequired: String(process.env.REPORT_IMAGE_REQUIRED),
    maxDistanceMeters: Number(process.env.MAX_DISTANCE_METERS)

}

const languages = {
    it: { nativeName: 'Italiano' },
    en: { nativeName: 'English' },
    fr: { nativeName: 'Français' },
};

export { conf, languages }