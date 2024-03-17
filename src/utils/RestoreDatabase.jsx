import { Button, FileInput, Modal } from 'flowbite-react'
import React, { useState } from 'react'
import { TbMapPinQuestion } from 'react-icons/tb';
import databaseService from '../appwrite/database'

function RestoreDatabase() {
    const [openModal, setOpenModal] = useState(false);

    const handleRestore = () => {
        setOpenModal(true);
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const onReaderLoad = async (event) => {
        console.log(event.target.result);
        var allData = JSON.parse(event.target.result);
        //console.log(allData)  
        if (allData.locations) {
            for (const l of allData.locations.documents) {

                const exists = await databaseService.getLocation(l.$id)
                if (!exists) {
                    await databaseService.restoreLocation(l)
                    console.log('Restored location')
                    await delay(500)
                } else {
                    console.log('Already existing location')
                }
            }
        }

        if (allData.reports) {
            for (const r of allData.reports.documents) {
                const exists = await databaseService.getReport(r.$id)
                if (!exists) {
                    await databaseService.restoreReport(r)
                    console.log('Restored report')
                } else {
                    console.log('Already existing report')
                }
            }
        }
    }

    const onRestoreClicked = () => {
        const fileInput = document.getElementById('file-upload');

        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(fileInput.files[0]);
    }

    return (<>
        <Button className='rounded bg-blue-500 h-12 mt-2' onClick={async () => await handleRestore()}>Start</Button>


        <Modal show={openModal} onClose={() => setOpenModal(false)} popup>
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <TbMapPinQuestion className="mx-auto mb-4 h-14 w-14 text-casaleggio-rgba dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Select the backup file .json
                    </h3>


                    <FileInput id="file-upload" />

                    <div className="flex justify-center gap-4 mt-8">

                        <Button className="bg-green-600" onClick={(e) => {
                            onRestoreClicked(e,);
                            setOpenModal(false)
                        }}>
                            Restore
                        </Button>

                        <Button color="gray" onClick={() => {
                            setOpenModal(false)
                        }}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer />
        </Modal>
    </>
    )
}

export default RestoreDatabase