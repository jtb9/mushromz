import { AwesomeButton } from 'react-awesome-button';
import { useEffect, useCallback, useState } from 'react';
import { ColorRing } from 'react-loader-spinner'
import { useInterval } from 'usehooks-ts'
import { Map, Marker } from "pigeon-maps"
import { osm } from 'pigeon-maps/providers'
import Webcam from "react-webcam";
import React from 'react';
import axios from 'axios';
import { colorRingColors } from './App';
import { useAuth } from '@clerk/clerk-react';

const api = 'https://y0qjfq7023.execute-api.us-east-1.amazonaws.com/';

const FLOATING_PADDING = '10px';

const formatedTimestamp = () => {
  const d = new Date()
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];
  return `${date} ${time}`
}

function Mapz(props: any) {

  const { getToken } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userButton = props.userButton;
  // const signOutButton = props.signOutButton;

  const webcamRef = React.useRef(null);
  const [gpsLocation, setGpsLocation] = useState(0);
  // eslint-disable-next-line
  const [gpsDelay, setGPSDelay] = useState(1500);
  // eslint-disable-next-line
  const [gpsDataOn, setGpsDataOn] = useState(true);
  const [capturingMushroom, setCapturingMushroom] = useState(false);
  const [savingMushroom, setSavingMushroom] = useState(false);
  const [mushrooms, setMushrooms] = useState([]);
  const [loadingMushrooms, setLoadingMushrooms] = useState(false);
  const [cameraMode, setCameraMode] = useState('default');
  const [selectedMushroom, setSelectedMushroom] = useState(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useInterval(
    () => {
      try {
        //@ts-ignore
        if (window.gettingLocation !== true) {
          //@ts-ignore
          window.gettingLocation = true;
          navigator.geolocation.getCurrentPosition((data) => {
            //@ts-ignore
            window.gettingLocation = false;
            if (data && data.coords) {
              setGpsLocation({
                //@ts-ignore
                latitude: data.coords.latitude,
                //@ts-ignore
                longitude: data.coords.longitude
              })
            }
          });
        }
      }
      catch (e) {

      }
    },
    gpsDataOn ? gpsDelay : null,
  )

  useEffect(() => {
    refreshMushroomData();
    // eslint-disable-next-line
  }, [])

  const refreshMushroomData = () => {
    if (loadingMushrooms === false) {
      setLoadingMushrooms(true);

      getToken().then((t) => {
        axios.get(api, {
          params: {
            token: `${t}`
          }
        }).then((v) => {
          setMushrooms(v.data);
          setLoadingMushrooms(false);
        })
      })

    }
  }

  const handleDeleteMushroom = (id: string) => {
    setSavingMushroom(true);

    getToken().then((t) => {
      axios.post(api, {
        action: 'delete',
        id: id
      }, {
        params: {
          token: t
        }
      }).then((v) => {
        setSavingMushroom(false);
        refreshMushroomData();
        setSelectedMushroom(undefined);
      });
    });
  }

  const handleCaptureMushroom = (info: any) => {
    setSavingMushroom(true);
    //@ts-ignore
    const imageSrc = webcamRef.current.getScreenshot();


    getToken().then((t) => {
      axios.post(api, {
        action: 'add',
        image: imageSrc,
        latitude: info.latitude,
        longitude: info.longitude,
        date: info.date
      }, {
        params: {
          token: t
        }
      }).then((v) => {
        setSavingMushroom(false);
        refreshMushroomData();
      });
    });
  }

  const renderWaitingForGPS = () => {
    return <div style={{ width: '100%', height: '100%', margin: 'auto', marginTop: '100px' }}>
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="color-ring-loading"
        wrapperStyle={{}}
        wrapperClass="color-ring-wrapper"
        //@ts-ignore
        colors={colorRingColors}
      />
    </div>
  }

  const genericLoader = () => {
    return <div style={{ width: '100%', height: '100%' }}><ColorRing
      visible={true}
      height="80"
      width="80"
      style={{ margin: 'auto' }}
      ariaLabel="color-ring-loading"
      wrapperStyle={{}}
      wrapperClass="color-ring-wrapper"
      //@ts-ignore
      colors={colorRingColors}
    /></div>
  }

  const renderCaptureMeta = () => {
    return <div style={{ display: 'flex', flexDirection: 'column', width: '300px', color: 'black', textAlign: 'left', padding: '5px' }}>

      <p style={{ margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic' }}
      //@ts-ignore
      >Longitude: {gpsLocation.longitude}</p>
      <p style={{ margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic' }}
      //@ts-ignore
      >Latitude: {gpsLocation.latitude}</p>
      <p style={{ margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic' }}>Date: {formatedTimestamp()}</p>
    </div>
  }

  const calculateCameraConstraint = () => {
    if (cameraMode === 'default' || cameraMode === undefined) {
      return undefined;
    }
    if (cameraMode === "rear") {
      return {
        facingMode: { exact: "environment" }
      }
    }
  }

  const renderCameraConstraintControl = () => {
    return <div style={{ display: 'flex', flexDirection: 'row' }}>
      <AwesomeButton onPress={() => {
        setCameraMode('default');
      }} style={{
        color: 'white',
        width: '50%'
      }} type="primary">Front</AwesomeButton>
      <AwesomeButton onPress={() => {
        setCameraMode('rear');
      }} style={{
        color: 'white',
        width: '50%'
      }} type="primary">Rear</AwesomeButton>
    </div>
  }

  const renderCaptureControl = () => {
    if (savingMushroom === true) {
      return genericLoader();
    }
    if (capturingMushroom === false) {
      return <AwesomeButton onPress={() => {
        setCapturingMushroom(true)
      }} onMouseUp={() => {
        setCapturingMushroom(true)
      }} style={{
        color: 'white',
        width: '80px',
        margin: 'auto'
      }} type="primary">+</AwesomeButton>
    }

    return <div style={{ position: 'fixed', top: '0px', left: '0px', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', zIndex: '9999', backgroundColor: '#FFFFF2', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.3)' }}>
      <Webcam style={{maxHeight: '70vh'}} ref={webcamRef} videoConstraints={calculateCameraConstraint()} audio={false} screenshotFormat="image/jpeg" />
      {renderCameraConstraintControl()}
      {renderCaptureMeta()}
      <AwesomeButton onPress={() => {
        handleCaptureMushroom({
          //@ts-ignore
          longitude: gpsLocation.longitude,
          //@ts-ignore
          latitude: gpsLocation.latitude,
          date: formatedTimestamp()
        })
      }} style={{
        color: 'white',
        width: '100%'
      }} type="primary">Save</AwesomeButton>
      <AwesomeButton onPress={() => {
        setCapturingMushroom(false);
      }} style={{
        color: 'white',
        width: '100%'
      }} type="secondary">Cancel</AwesomeButton>
    </div>
  }

  // const renderMushroomTableEntry = (info: any) => {
  //   return <div style={{ display: 'flex', flexDirection: 'row', height: '30px', width: '290px' }}>
  //     <img style={{ height: '30px', width: '30px' }} src={info.image} alt={info.date} />
  //     <div style={{ height: '30px', width: '100px', color: 'black', fontSize: '12px' }}>{info.date}</div>
  //     <div style={{ height: '30px', width: '80px', color: 'black', fontSize: '12px' }}>{info.latitude}</div>
  //     <div style={{ height: '30px', width: '80px', color: 'black', fontSize: '12px' }}>{info.longitude}</div>
  //   </div>
  // }

  // const renderMushroomTable = () => {
  //   let entries = [];

  //   for (let i = 0; i < mushrooms.length; i++) {
  //     entries.push(renderMushroomTableEntry(mushrooms[i]));
  //   }

  //   return <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'scroll', maxHeight: '100px' }}>
  //     {entries}
  //   </div>
  // }

  const renderControlHover = () => {
    if (selectedMushroom !== undefined) {
      return <div style={{
        position: 'fixed',
        top: '0px',
        left: '0px',
        width: '100vw',
        height: '100vh',
        zIndex: '9999999'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', zIndex: '9999', backgroundColor: '#FFFFF2', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'black', textAlign: 'left', padding: '5px' }}>
            <img
              //@ts-ignore
              src={selectedMushroom.image} style={{maxWidth: '300px'}} alt="" />
            <p style={{ margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic' }}
            //@ts-ignore
            >Longitude: {selectedMushroom.longitude}</p>
            <p style={{ margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic' }}
            //@ts-ignore
            >Latitude: {selectedMushroom.latitude}</p>
            <p style={{ margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic' }}>Date: {formatedTimestamp()}</p>
            <AwesomeButton onPress={() => {

              getToken().then((t) => {
                //@ts-ignore
                window.open(`${api}?action=download&id=${selectedMushroom.id}&token=${t}`, '_blank', 'noopener, noreferrer');
              });
            }} style={{
              color: 'white'
            }} type="primary">Download</AwesomeButton>
            <AwesomeButton onPress={() => {
              //@ts-ignore
              handleDeleteMushroom(selectedMushroom.id);
            }} style={{
              color: 'white'
            }} type="danger">Delete</AwesomeButton>
            <AwesomeButton onPress={() => {
              setSelectedMushroom(undefined);
            }} style={{
              color: 'white'
            }} type="secondary">Cancel</AwesomeButton>
          </div>
        </div>
      </div>
    }

    return <div style={{
      position: 'absolute',
      top: FLOATING_PADDING,
      left: FLOATING_PADDING,
      zIndex: '10'
    }}>
      {renderCaptureControl()}
    </div>
  }

  const renderLoadingIndicator = () => {
    if (loadingMushrooms === true) {
      return <div style={{ position: 'absolute', bottom: FLOATING_PADDING, right: FLOATING_PADDING }}>
        {genericLoader()}
      </div>
    }

    return <span />
  }

  const renderMapProvider = useCallback(() => {
    let markers = [];

    for (let i = 0; i < mushrooms.length; i++) {
      markers.push(
        <Marker
          //@ts-ignore
          anchor={[parseFloat(mushrooms[i].latitude), parseFloat(mushrooms[i].longitude)]}
        >
          <div style={{ zIndex: '99999', pointerEvents: 'all' }} onClick={() => {
            //@ts-ignore
            setSelectedMushroom(mushrooms[i]);
          }}>
            <div className='stack-count'>1</div>
            <img

              //@ts-ignore
              src={mushrooms[i].image} width={75} height={75} alt={mushrooms[i].date} />
          </div>
        </Marker>
      )
    }
    //@ts-ignore
    return <Map animate={true} key={'mu-' + markers.length} provider={osm} width={window.innerWidth} height={window.innerHeight} defaultCenter={[gpsLocation.latitude, gpsLocation.longitude]} defaultZoom={16}>
      {markers}
    </Map>
  }, [gpsLocation, mushrooms]);

  const renderSettingsHover = () => {
    if (settingsOpen === false) {
      return <div style={{ position: 'absolute', top: FLOATING_PADDING, right: FLOATING_PADDING }}>
        <img className='img-button' style={{ opacity: '0.5' }} onClick={() => {
          setSettingsOpen(true);
        }} alt="settings menu" src="menu.svg" />
      </div>
    }

    return <div style={{ position: 'absolute', top: '0px', left: '0xp', display: 'flex', flexDirection: 'column', zIndex: '9999', backgroundColor: '#FFFFF2', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.3)', width: '100%', height: '100%' }}>
      <div style={{ position: 'relative', top: FLOATING_PADDING, left: FLOATING_PADDING }}>
        {userButton}
      </div>
      <AwesomeButton onPress={() => {
        setSettingsOpen(false);
      }} style={{
        color: 'white',
        width: '100%',
        marginTop: '30px'
      }} type="secondary">Done</AwesomeButton>
    </div>
  }

  const renderInputMap = () => {
    return <div>
      {renderMapProvider()}
      {renderControlHover()}
      {renderLoadingIndicator()}
      {renderSettingsHover()}
    </div>
  };

  const renderInner = () => {
    if (gpsLocation === 0) {
      return renderWaitingForGPS();
    }

    return renderInputMap();
  }

  return (
    <div className="App">
      {renderInner()}
    </div>
  );
}

export default Mapz;
