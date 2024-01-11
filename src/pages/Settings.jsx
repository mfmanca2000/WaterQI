import React, { useEffect } from 'react'
import Container from '../components/Container'

function Settings() {

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
        <div className='w-full py-8'>

            <Container>
                <label className='text-4xl'>Settings</label>
            </Container>
        </div>
    )
}

export default Settings