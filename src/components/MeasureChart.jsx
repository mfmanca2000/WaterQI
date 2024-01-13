import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, Label, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatDateTime } from "../utils/date";

let inputLabels = [
    { key: "electricalConductivity", color: "black" },
    { key: "totalDissolvedSolids", color: "blue" },
    { key: "pH", color: "orange" },
    { key: "temperature", color: "red" },
    { key: "salinity", color: "cyan" },
];

const MeasureChart = ({ values }) => {

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
        console.log(e.dataKey)      
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
                <div className="custom-tooltip bg-white border p-2">
                    <p className="font-bold">{`${formatDateTime(new Date(payload[0].payload.datetime))}`}</p>
                    <p className="font-thin">{`EC: ${payload[0].payload.electricalConductivity ?? '-'}`}</p>
                    <p className="font-thin">{`TDS: ${payload[0].payload.totalDissolvedSolids ?? '-'}`}</p>
                    <p className="font-thin">{`pH: ${payload[0].payload.pH ?? '-'}`}</p>
                    <p className="font-thin">{`Temp: ${payload[0].payload.temperature ?? '-'}`}</p>
                    <p className="font-thin">{`Salinity: ${payload[0].payload.salinity ?? '-'}`}</p>
                </div>
            );
        }

        return null
    }

    return (
        <ResponsiveContainer width="95%" height={400} className='mt-4'>
            <LineChart data={values} 
                margin={{ top: 5, right: 10, bottom: 5, left: 50 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="datetime" tickFormatter={dateFormatter} />

                {/* <Line type="monotone" dataKey="electricalConductivity" stroke="red" hide={lineProps['electricalConductivity'] === true} />
                <Line type="monotone" dataKey="totalDissolvedSolids" stroke="blue" hide={lineProps['totalDissolvedSolids'] === true} />
                <Line type="monotone" dataKey="pH" stroke="orange" hide={lineProps['pH'] === true} />
                <Line type="monotone" dataKey="temperature" stroke="black" hide={lineProps['temperature'] === true} />
                <Line type="monotone" dataKey="salinity" stroke="cyan" hide={lineProps['salinity'] === true} /> */}


                {inputLabels.map((label, index) => (
                    <Line type="monotone"
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
                <Legend
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
