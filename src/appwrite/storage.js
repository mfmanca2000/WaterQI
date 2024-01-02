import conf from "../conf/conf";
import { Client, Storage, ID } from "appwrite";

export class StorageService {
    client =new Client();
    storage;

    constructor(){
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.storage = new Storage(this.client);
    }

    async uploadImage(image){
        try {
            return await this.storage.createFile(conf.appwriteBucketId, ID.unique, image);
        } catch (error) {
            console.log('--- Appwrite StorageService uploadImage ' + error);
            return null;
        }
    }

    async deleteImage(imageId){
        try {
            return await this.storage.deleteFile(conf.appwriteBucketId, imageId);
        } catch (error) {
            console.log('--- Appwrite StorageService deleteImage ' + error);
            return null;
        }
    }

    getPreviewImageUrl(imageId){
        try {
            return this.storage.getFilePreview(conf.appwriteBucketId, imageId).href;
        } catch (error) {
            console.log('--- Appwrite StorageService getPreviewImage ' + error);
            return null;
        }
    }
}

const storageService = new StorageService()
export default storageService