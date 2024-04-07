import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, Label, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatDateTime } from "../utils/date";

let inputLabels = [
    { key: "electricalConductivity", color: "black" },
    { key: "pH", color: "orange" },
    { key: "temperature", color: "red" },
    { key: "escherichiaColi", color: "pink" },
    { key: "limeco", color: "green" },
    { key: "nitrates", color: "gray" },
    { key: "phosphates", color: "violet" },
    { key: "dissolvedOxygen", color: "fuchsia" },
    { key: "totalDissolvedSolids", color: "blue" },
    { key: "salinity", color: "cyan" },
];



const MeasureChart = ({ values, height = 400 }) => {
    const { t } = useTranslation();

    const [lineProps, setLineProps] = useState(
        inputLabels.reduce(
            (a, { key }) => {
                a[key] = false;
                return a;
            },
            { hover: null }
        )
    );

    const dateFormatter = date => {
        return formatDateTime(new Date(date)).slice(0, 10);
    };

    const handleLegendMouseEnter = (e) => {
        // console.log(e.dataKey)      
        if (!lineProps[e.dataKey]) {
            setLineProps({ ...lineProps, hover: e.dataKey });
        }
    };

    const handleLegendMouseLeave = (e) => {
        setLineProps({ ...lineProps, hover: null });
    };

    const selectLine = (e) => {
        setLineProps({
            ...lineProps,
            [e.dataKey]: !lineProps[e.dataKey],
            hover: null
        });
    };

    function CustomTooltip({ payload, label, active }) {
        if (active && payload[0] && payload[0].payload) {
            return (
                <div className="custom-tooltip bg-white border p-1">
                    <p className="font-bold text-center">{`${formatDateTime(new Date(payload[0].payload.datetime))}`}</p>
                    <div className="grid grid-cols-5 gap-1">

                        <p className="bg-black text-white p-1 font-thin ">EC: {payload[0].payload.electricalConductivity ?? '-'} μS/cm</p>
                        <p className="bg-orange-500 text-white p-1 font-thin">pH: {payload[0].payload.pH ?? '-'}</p>
                        <p className="bg-red-500 text-white p-1 font-thin">Temp: {payload[0].payload.temperature ?? '-'} °C</p>
                        <p className="bg-pink-500 text-white p-1 font-thin">Esch.Coli: {payload[0].payload.escherichiaColi ?? '-'}</p>
                        <p className="bg-green-500 text-white p-1 font-thin">Limeco: {payload[0].payload.limeco ?? '-'}</p>
                        <p className="bg-gray-500 text-white p-1 font-thin">Nit.: {payload[0].payload.nitrates ?? '-'}</p>
                        <p className="bg-violet-800 text-white p-1 font-thin">Ph.: {payload[0].payload.phosphates ?? '-'}</p>
                        <p className="bg-fuchsia-700 text-white p-1 font-thin">Diss.Ox.: {payload[0].payload.dissolvedOxygen ?? '-'}</p>
                        <p className="bg-blue-600 text-white p-1 font-thin">TDS: {payload[0].payload.totalDissolvedSolids ?? '-'} ppm</p>
                        <p className="bg-cyan-500 text-white p-1 font-thin">Salinity: {payload[0].payload.salinity ?? '-'}</p>
                    </div >
                </div >
            );
        }

        return null
    }

    return (
        <ResponsiveContainer width="95%" height={height} className='mt-4'>
            <LineChart data={values}
                margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="datetime" tickFormatter={dateFormatter} />

                {/* <Line type="monotone" dataKey="electricalConductivity" stroke="red" hide={lineProps['electricalConductivity'] === true} />
                <Line type="monotone" dataKey="totalDissolvedSolids" stroke="blue" hide={lineProps['totalDissolvedSolids'] === true} />
                <Line type="monotone" dataKey="pH" stroke="orange" hide={lineProps['pH'] === true} />
                <Line type="monotone" dataKey="temperature" stroke="black" hide={lineProps['temperature'] === true} />
                <Line type="monotone" dataKey="salinity" stroke="cyan" hide={lineProps['salinity'] === true} /> */}


                {inputLabels.map((label, index) => (
                    <Line type="monotone"
                        name={t(label.key)}
                        key={index}
                        dataKey={label.key}
                        stroke={label.color}
                        hide={lineProps[label.key] === true}
                        strokeOpacity={Number(
                            lineProps.hover === label.key || !lineProps.hover ? 1 : 0.1
                        )}
                    />
                ))}


                <Tooltip content={<CustomTooltip />} />
                <Legend className="text-xs"
                    onClick={selectLine}
                    onMouseOver={handleLegendMouseEnter}
                    onMouseOut={handleLegendMouseLeave}
                />
            </LineChart>


            {/* <BarChart
                width={600}
                height={300}
                data={values}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
            >
                <XAxis dataKey={dataKey}>
                    <Label value={oxLabel} position="insideBottomRight" dy={10} dx={20} />
                </XAxis>
                <YAxis type="number" domain={yLimit}>
                    <Label
                        value={oyLabel}
                        position="left"
                        angle={-90}
                        dy={-20}
                        dx={-10}
                    />
                </YAxis>
                <Tooltip />
                <Legend
                    onClick={selectBar}
                    onMouseOver={handleLegendMouseEnter}
                    onMouseOut={handleLegendMouseLeave}
                />
                {labels.map((label, index) => (
                    <Bar
                        key={index}
                        dataKey={label.key}
                        fill={label.color}
                        stackId={dataKey}
                        hide={barProps[label.key] === true}
                        fillOpacity={Number(
                            barProps.hover === label.key || !barProps.hover ? 1 : 0.6
                        )}
                    />
                ))}
            </BarChart> */}
        </ResponsiveContainer>
    );
};

export default MeasureChart;
