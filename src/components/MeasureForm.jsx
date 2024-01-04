import React, {useCallback} from "react";
import { useForm } from "react-hook-form";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function MeasureForm({measure}){
    const { register, handleSubmit, watch, setValue, control, getValues} = useForm({
        defaultValues: {
            latitude: measure?.latitude || 45.4637979, 
            longitude: measure?.longitude || 7.87375, 
            placeDescription: measure?.placeDescription || "",
            datetime: measure?.datetime || new Date(Date.now()), 
            imageId: measure?.imageId || "", 
            electricalConductivity: measure?.electricalConductivity || null, 
            totalDissolvedSolids: measure?.totalDissolvedSolids || null, 
            pH: measure?.pH || null, 
            temperature: measure?.temperature || null, 
            salinity: measure?.salinity || null
        }
    })

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData)

    const submit = async(data) => {             

        if (measure) {
            const file = data.image[0] ? await storageService.uploadImage(data.image[0]) : null;
            if (file) {
                storageService.deleteImage(measure.imageId);
            }
            const dbMeasure = await databaseService.updateMeasure(measure.$id, {...data, imageId: file ? file.$id : undefined});
            if (dbMeasure) {
                navigate(`/measure/${dbMeasure.$id}`)
            }
        } else {
            const file = await storageService.uploadImage(data.image[0]);
            if (file) {                             
                data.imageId = file.$id;
                const dbMeasure = await databaseService.addMeasure({...data, userId: userData.$id});
                if (dbMeasure){
                    navigate(`/measure/${dbMeasure.$id}`);
                }            
            }
        }
        
    }

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-1/3 px-2">
                <Input label="Place Description" 
                    placeholder="insert a place description" 
                    className="mb-4"
                    {...register("placeDescription", {required: true})}
                />

                <Input label="Latitude" 
                    placeholder="insert a latitude (i.e. 45.4637979" 
                    className="mb-4"
                    {...register("latitude", {required: true})}
                />
                
                <Input label="Longitude" 
                    placeholder="insert a longitude (i.e. 7.87375)" 
                    className="mb-4"
                    {...register("longitude", {required: true})}
                />

                <Input type="datetime-local" 
                    className="mb-4"
                    {...register("datetime", {required: true})}
                />

                <Input label="Electrical Conductivity"                     
                    className="mb-4"
                    {...register("electricalConductivity")}
                />

                <Input label="Total Dissolved Solids"                     
                    className="mb-4"
                    {...register("totalDissolvedSolids")}
                />

                <Input label="pH"                     
                    className="mb-4"
                    {...register("pH")}
                />

                <Input label="Temperature"                     
                    className="mb-4"
                    {...register("temperature")}
                />

                <Input label="Salinity"                     
                    className="mb-4"
                    {...register("salinity")}
                />
            </div>

            <div className="w-1/3 px-2">

            </div>

            <div className="w-1/3 px-2">
                <Input label="Location image"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg"
                    {...register("image", {required: !measure})}
                />
                {measure && (
                    <div className="w-full mb-4">
                        <img src={storageService.getPreviewImageUrl(measure.imageId)} alt={measure.placeDescription} className="rounded-lg"/>
                    </div>
                )}

                <Button type="submit" bgColor={ measure ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full">
                    { measure ? "Update" : "Insert"}
                </Button>
            </div>
        </form>
    )
}