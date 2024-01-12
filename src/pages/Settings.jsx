import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import Container from '../components/Container'
import Input from '../components/Input';

function Settings() {

    const userData = useSelector((state) => state.auth.userData);

    // useEffect(() => {
    //     async function load() {
    //       const prefs = await authService.loadPreferences();
    //       if (prefs) {
    //         //console.log('USE EFFECT prefs: ' + JSON.stringify(prefs));
    //         //console.log('---> showYourDataOnly: ' + prefs.showYourDataOnly);
    //         setShowYourDataOnly(prefs.showYourDataOnly);
    //         //console.log('---> showStandaloneMeasures: ' + prefs.showStandaloneMeasures);
    //         setShowMeasures(prefs.showStandaloneMeasures);
    //         //console.log('---> showMeasureGroups: ' + prefs.showMeasureGroups);
    //         setShowMeasureGroups(prefs.showMeasureGroups);
    //       } else {
    //         console.log('Empty prefs')
    //       }
    //     }
    //     load();
    
    //   }, [])

    return (
        <div className='w-full p-8'>

            <Container>
                <label className='text-4xl'>Settings</label>
                <Input label='Username' disabled></Input>
            </Container>
        </div>
    )
}

export default Settings