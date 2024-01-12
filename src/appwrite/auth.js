/* eslint-disable no-useless-catch */
import { Client, Account, ID } from "appwrite";
import {conf } from "../conf/conf";

export class AuthService {
    client = new Client();
    account;

    constructor() {        
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccount( { email, password, name }) {
        const userId = ID.unique();        
        try {
            const userAccount = await this.account.create(userId, email, password, name);
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

    async googleLogin() {
        try {            
            this.account.createOAuth2Session('google', window.location.origin + '/', window.location.origin + '/login')
        } catch (error) {
            console.log('--- Appwrite AuthService googleLogin : ' + error);         
        }
    }

    async facebookLogin() {
        try {
            await this.account.createOAuth2Session('facebook', window.location.origin + '/', window.location.origin + '/login')
        } catch (error) {
            console.log('--- Appwrite AuthService facebookLogin : ' + error);         
        }
    }

    async getCurrentUser(){
        try {
            return await this.account.get();
        } catch (error) {
            console.log('--- Appwrite AuthService getCurrentUser : ' + error);            
        }
        return null;
    }

    async savePreferences({ showYourDataOnly, showStandaloneMeasures, showMeasureGroups, username, language}) {
        try {
            await this.account.updatePrefs( {showYourDataOnly, showStandaloneMeasures, showMeasureGroups, username, language});
            return true;
        } catch (error) {
            console.log('--- Appwrite AuthService savePreferences : ' + error);     
            return false;
        }
    }

    async loadPreferences(){
        try {
            const prefs = await this.account.getPrefs();
            //console.log('The prefs... ' + JSON.stringify(prefs));
            return prefs;
        } catch (error) {
            console.log('--- Appwrite AuthService loadPreferences : ' + error);     
            return null;
        }
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