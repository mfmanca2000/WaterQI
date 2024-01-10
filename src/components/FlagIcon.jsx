import React from 'react'

function FlagIcon({countryCode = ""}) {

    if (countryCode === "en") {
        countryCode = "gb";
    }

    return (
        <span
            className={`fi fir inline-block mr-2 fi-${countryCode} `}
        />
    );
}

export default FlagIcon