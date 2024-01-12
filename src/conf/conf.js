/* eslint-disable no-undef */
const conf = {
    appwriteUrl: String(process.env.APPWRITE_URL),
    appwriteProjectId: String(process.env.APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(process.env.APPWRITE_DATABASE_ID),
    appwriteMeasuresCollectionId: String(process.env.APPWRITE_MEASURES_COLLECTION_ID),
    appwriteMeasureGroupsCollectionId: String(process.env.APPWRITE_MEASUREGROUPS_COLLECTION_ID),
    appwriteBucketId: String(process.env.APPWRITE_BUCKET_ID),
    googleMapsAPIKey: String(process.env.GOOGLE_MAPS_API_KEY),
    defaultLatitude: Number(process.env.DEFAULT_LATITUDE),
    defaultLongitude: Number(process.env.DEFAULT_LONGITUDE),
    defaultZoomLevel: Number(process.env.DEFAULT_ZOOM_LEVEL),
    lastInsertedMeasuresNumber: Number(process.env.LAST_INSERTED_MEASURES_NUMBER),
    lastModifiedMeasureGroupsNumber: Number(process.env.LAST_MODIFIED_MEASURE_GROUPS_NUMBER),
}

const languages = {
    it: { nativeName: 'Italiano' },
    en: { nativeName: 'English' },
    fr: { nativeName: 'Français' },
};

export { conf, languages }