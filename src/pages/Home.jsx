import React, { useEffect, useRef, useState } from 'react'
import databaseService from '../appwrite/database'
import Container from '../components/Container';
import HomeMenuItem from '../components/HomeMenuItem';
import { useTranslation } from 'react-i18next'
import Counters from '../components/Counters';
import { useSelector } from 'react-redux';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import { conf } from '../conf/conf';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { divIcon, Icon, point } from 'leaflet';
import { calculateWQILocation, getLocationIcon } from '../utils/wqi';
import { Link } from 'react-router-dom';
import MeasureChart from '../components/MeasureChart';
import { formatDateTime } from '../utils/date';
import { IoMapOutline, IoBeakerOutline, IoWarningOutline, IoSearchOutline, IoLocationOutline, IoBeaker, IoWarning } from 'react-icons/io5';

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function Home() {
  const userData = useSelector((state) => state.auth.userData);
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation();

  const locations = useRef([]);
  const reports = useRef([]);

  const warningIcon = new Icon({
    iconUrl: window.location.origin + '/warning.png',
    iconSize: [30, 26]
  });

  const createClusterCustomIcon = function (cluster) {
    const count = cluster.getChildCount();
    return new divIcon({
      html: `<div style="background:linear-gradient(135deg,#0EA5E9,#0284C7);width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:3px solid rgba(255,255,255,0.95);box-shadow:0 2px 8px rgba(2,132,199,0.4);font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#fff;letter-spacing:-0.3px;">${count > 99 ? '99+' : count}</div>`,
      className: '',
      iconSize: point(36, 36, true)
    });
  };

  useEffect(() => {
    setIsLoading(true)
    databaseService.getAllLocations(null, '', 100000)
      .then((returnedLocations) => {
        if (returnedLocations) {
          locations.current = returnedLocations.documents;
        }
        databaseService.getAllReports(null, '', 100000)
          .then((returnedReports) => {
            if (returnedReports) {
              reports.current = returnedReports.documents;
              setIsLoading(false)
            }
          })
      })
  }, []);

  const legendParams = [
    { key: 'pH',                  color: '#F59E0B', descKey: 'legendaPH' },
    { key: 'totalDissolvedSolids', color: '#3B82F6', descKey: 'legendaTotalDissolvedSolids' },
    { key: 'nitrates',            color: '#94A3B8', descKey: 'legendaNitrates' },
    { key: 'phosphates',          color: '#7C3AED', descKey: 'legendaPhosphates' },
    { key: 'escherichiaColi',     color: '#EC4899', descKey: 'legendaEscherichiaColi' },
    { key: 'dissolvedOxygen',     color: '#06B6D4', descKey: 'legendaDissolvedOxygen' },
    { key: 'temperature',         color: '#EF4444', descKey: 'legendaTemperature' },
    { key: 'limeco',              color: '#10B981', descKey: 'legendaLimeco' },
  ];

  if (!userData) {
    return (
      <div className="bg-brand-50">

        {/* Hero: full-width map */}
        <div className="relative">
          <MapContainer
            className='h-[62vh] lg:h-[72vh] w-full'
            center={[defaultLatitude, defaultLongitude]}
            zoom={conf.defaultZoomLevel}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false}>
              {locations?.current.map((l) => (
                <Marker key={l.$id} position={[l.latitude, l.longitude]} icon={getLocationIcon(l)} eventHandlers={{
                  click: async () => {
                    setSelectedLocation(await databaseService.getLocation(l.$id))
                  },
                }}>
                  <Popup>
                    <div className='w-[310px]'>
                      <div className='bg-brand-800 text-white px-4 py-3'>
                        <h3 className='font-semibold text-sm'>{selectedLocation?.name}</h3>
                        <p className='text-brand-200 text-xs mt-0.5'>
                          {selectedLocation?.measures?.length ?? 0}{' '}
                          {(selectedLocation?.measures?.length === 0 || selectedLocation?.measures?.length > 1) ? t('measuresLabel') : t('measureLabel')}
                        </p>
                      </div>
                      <div className='bg-white p-2'>
                        <MeasureChart height={180} values={selectedLocation?.measures?.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))} />
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {reports?.current.map((r) => (
                <Marker key={'r_' + r.$id} position={[r.latitude, r.longitude]} icon={warningIcon}>
                  <Popup>
                    <div className='w-[310px]'>
                      <div className='bg-water-amber text-white px-4 py-3'>
                        <h3 className='font-semibold text-sm'><Link className='hover:underline' to={`/report/${r.$id}`}>{r.title}</Link></h3>
                        <p className='text-amber-100 text-xs mt-0.5'>{formatDateTime(new Date(r.datetime))}</p>
                      </div>
                      <div className='bg-white p-3'>
                        <p className='text-sm text-slate-600 leading-relaxed'>{r.description}</p>
                      </div>
                    </div>
                  </Popup>
                  <Tooltip>{r.title}</Tooltip>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>

          {/* Overlay bar at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 z-[400] bg-white/90 backdrop-blur-sm border-t border-brand-100 px-4 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-brand-900 text-base hidden sm:block">Fiumi Puliti</span>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <IoLocationOutline className="text-brand-600" size={15} />
                  <span className="font-medium text-slate-800">{locations.current.length}</span>
                  <span className="hidden sm:inline text-slate-500">{t('locationsLabel') || 'siti'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <IoWarning className="text-water-amber" size={15} />
                  <span className="font-medium text-slate-800">{reports.current.length}</span>
                  <span className="hidden sm:inline text-slate-500">{t('reportsLabel') || 'segnalazioni'}</span>
                </span>
              </div>
            </div>
            <a
              href="https://associazionegianrobertocasaleggio.s3.amazonaws.com/Fiumi+Puliti_WEB.pdf"
              target="_blank"
              rel="noreferrer"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              {t('downloadDoc')}
            </a>
          </div>
        </div>

        {/* Content section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Left: intro text */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('aboutProjectTitle') || 'Il Progetto'}</h2>
                <div className="space-y-4">
                  <p className="text-slate-700 leading-relaxed text-base">{t('homePageFirstParagraph')}</p>
                  <p className="text-slate-700 leading-relaxed text-base">{t('homePageSecondParagraph')}</p>
                  <p className="text-slate-600 leading-relaxed text-sm">{t('homePageThirdParagraph')}</p>
                </div>
              </div>

              {/* Right: legend */}
              <div className="bg-slate-50 border border-slate-200 rounded-card p-6 shadow-card">
                <h2 className="text-xl font-bold text-slate-900 mb-5">Legenda</h2>
                <div className="space-y-4">
                  {legendParams.map(({ key, color, descKey }) => (
                    <div key={key} className="flex items-start gap-3">
                      <span
                        className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{t(key)}</p>
                        <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{t(descKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    const menuItems = [
      {
        title: `${t('menuItemAllMeasuresTitle')}`,
        description: `${t('menuItemAllMeasuresDescription')}`,
        path: '/locations',
        icon: <IoMapOutline />,
      },
      {
        title: `${t('menuItemAddMeasureTitle')}`,
        description: `${t('menuItemAddMeasureDescription')}`,
        path: '/addMeasure',
        icon: <IoBeakerOutline />,
      },
      {
        title: `${t('menuItemAddReportTitle')}`,
        description: `${t('menuItemAddReportDescription')}`,
        path: '/addReport',
        icon: <IoWarningOutline />,
      },
      {
        title: `${t('menuItemFindSensorTitle')}`,
        description: `${t('menuItemFindSensorDescription')}`,
        path: '',
        icon: <IoSearchOutline />,
      }
    ];

    return (
      <div>
        {/* Welcome bar */}
        <div className="bg-white border-b border-slate-100">
          <Container>
            <div className="py-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {t('homeWelcome')}, <span className="text-brand-600">{userData?.name}</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">{t('homeIntroText')}</p>
            </div>
          </Container>
        </div>

        <Container>
          <div className="py-8">
            {/* Stat cards */}
            <Counters />

            {/* Quick actions */}
            <h2 className="text-lg font-semibold text-slate-800 mt-10 mb-4">{t('quickActions') || 'Azioni rapide'}</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {menuItems.map((m) => (
                <HomeMenuItem key={m.title} menuItem={m} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    )
  }
}

export default Home
