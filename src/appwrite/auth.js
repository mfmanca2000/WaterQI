/* eslint-disable no-useless-catch */
import { Client, Account, ID } from "appwrite";
import conf from "../conf/conf.js";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccount(email, password, name) {
        try {
            const userAccount = await this.account.create(ID.unique, email, password, name);
            if (userAccount) {
                return this.login({email, password});
            } else {
                return userAccount;
            }
        } catch (error) {
            console.log('--- Appwrite AuthService createAccount : ' + error);            
        }
        return null;
    }

    async login({email, password}) {
        try {
            return await this.account.createEmailSession(email, password)
        } catch (error) {
            console.log('--- Appwrite AuthService login : ' + error);            
        }
        return null;
    }

    async getCurrentUser(){
        try {
            return await this.account.get();
        } catch (error) {
            console.log('--- Appwrite AuthService getCurrentUser : ' + error);            
        }
        return null;
    }

    async logout() {
        try {
            await this.account.deleteSessions();
        } catch (error) {
            console.log('--- Appwrite AuthService logout : ' + error);
            throw error;
        }
    }
}


const authService = new AuthService()

export default authService