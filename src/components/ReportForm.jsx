import React, { useState, useEffect } from 'react'
import { Controller, useForm } from "react-hook-form";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdvancedMarker, APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import { conf } from "../conf/conf.js";
import { formatDateTime, removeTimeZone } from "../utils/date.js";
import { useTranslation } from 'react-i18next'

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function ReportForm() {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    useEffect(() => {
        async function retrievePosition() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success, error);
            } else {
                console.log("Geolocation not supported");
            }
        }

        retrievePosition();
    }, [])

    function success(position) {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);

        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    }

    function error() {
        console.log("Unable to retrieve your location");
    }

    return (
        <div>AddReport</div>
    )
}

export default ReportForm