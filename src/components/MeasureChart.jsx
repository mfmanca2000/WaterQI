import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatDateTime } from "../utils/date";

const inputLabels = [
    { key: "electricalConductivity", color: "#1E293B", unit: "μS/cm" },
    { key: "pH",                     color: "#F59E0B", unit: "" },
    { key: "temperature",            color: "#EF4444", unit: "°C" },
    { key: "escherichiaColi",        color: "#EC4899", unit: "UFC/100mL" },
    { key: "limeco",                 color: "#10B981", unit: "" },
    { key: "nitrates",               color: "#94A3B8", unit: "mg/L" },
    { key: "phosphates",             color: "#7C3AED", unit: "mg/L" },
    { key: "dissolvedOxygen",        color: "#06B6D4", unit: "mg/L" },
    { key: "totalDissolvedSolids",   color: "#3B82F6", unit: "ppm" },
    { key: "salinity",               color: "#14B8A6", unit: "‰" },
];

const defaultVisible = new Set(['limeco', 'pH', 'temperature', 'escherichiaColi']);

const MeasureChart = ({ values, height = 400 }) => {
    const { t } = useTranslation();

    const [lineProps, setLineProps] = useState(
        inputLabels.reduce(
            (a, { key }) => {
                a[key] = !defaultVisible.has(key);
                return a;
            },
            { hover: null }
        )
    );

    const dateFormatter = date => {
        return formatDateTime(new Date(date)).slice(0, 10);
    };

    const handleLegendMouseEnter = (e) => {
        if (!lineProps[e.dataKey]) {
            setLineProps({ ...lineProps, hover: e.dataKey });
        }
    };

    const handleLegendMouseLeave = () => {
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
        if (active && payload && payload[0] && payload[0].payload) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 border border-slate-200 rounded-xl shadow-lg p-3 text-xs max-w-[260px]">
                    <p className="font-semibold text-slate-800 text-center mb-2 pb-2 border-b border-slate-100">
                        {formatDateTime(new Date(data.datetime))}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {inputLabels.map(({ key, color, unit }) => (
                            data[key] != null && (
                                <div key={key} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                    <span className="text-slate-600 truncate">
                                        {t(key)}: <span className="font-medium text-slate-900">{data[key]}{unit ? ` ${unit}` : ''}</span>
                                    </span>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div>
            <ResponsiveContainer width="95%" height={height} className='mt-4'>
                <LineChart data={values} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="datetime"
                        tickFormatter={dateFormatter}
                        tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fill: '#94A3B8' }}
                        axisLine={{ stroke: '#E2E8F0' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                    />

                    {inputLabels.map((label, index) => (
                        <Line
                            type="monotone"
                            name={t(label.key)}
                            key={index}
                            dataKey={label.key}
                            stroke={label.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                            hide={lineProps[label.key] === true}
                            strokeOpacity={Number(
                                lineProps.hover === label.key || !lineProps.hover ? 1 : 0.15
                            )}
                        />
                    ))}

                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        onClick={selectLine}
                        onMouseOver={handleLegendMouseEnter}
                        onMouseOut={handleLegendMouseLeave}
                        wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 text-center mt-1">{t('chartClickLegend')}</p>
        </div>
    );
};

export default MeasureChart;
