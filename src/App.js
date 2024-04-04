import 'react-awesome-button/dist/styles.css';
import './App.css';
import { AwesomeButton } from 'react-awesome-button';
import { useEffect, useCallback, useState } from 'react';
import { ColorRing } from 'react-loader-spinner'
import { useInterval } from 'usehooks-ts'
import { Map, Marker } from "pigeon-maps"
import { osm } from 'pigeon-maps/providers'
import Webcam from "react-webcam";
import React from 'react';
import axios from 'axios';

const api = 'https://y0qjfq7023.execute-api.us-east-1.amazonaws.com/';

const colorRingColors = [
  '#5AAF94',
  '#FFFFF2',
  '#791E94',
  '#A38560',
  '#DE6449'
]

const formatedTimestamp = ()=> {
  const d = new Date()
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];
  return `${date} ${time}`
}

function App() {
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

  useInterval(
    () => {
      try {
        if (window.gettingLocation !== true) {
          window.gettingLocation = true;
          navigator.geolocation.getCurrentPosition((data) => {
            window.gettingLocation = false;
            if (data && data.coords) {
              setGpsLocation({
                latitude: data.coords.latitude,
                longitude: data.coords.longitude 
              })
            }
          });
        }
      }
      catch(e) {

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

      axios.get(api).then((v) => {
        setMushrooms(v.data);
        setLoadingMushrooms(false);
      })
    }
  }

  const handleCaptureMushroom = (info) => {
    setSavingMushroom(true);

    const imageSrc = webcamRef.current.getScreenshot();

    axios.post(api, {
      action: 'add',
      image: imageSrc,
      latitude: info.latitude,
      longitude: info.longitude,
      date: info.date
    }).then((v) => {
      setSavingMushroom(false);
      refreshMushroomData();
    });
  }

  const renderWaitingForGPS = () => {
    return <div>
      <p>Loading GPS info...</p>
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="color-ring-loading"
        wrapperStyle={{}}
        wrapperClass="color-ring-wrapper"
        colors={colorRingColors}
        />
    </div>
  }

  const genericLoader = () => {
    return <div style={{width: '100%', height: '100%'}}><ColorRing
    visible={true}
    height="80"
    width="80"
    style={{margin: 'auto'}}
    ariaLabel="color-ring-loading"
    wrapperStyle={{}}
    wrapperClass="color-ring-wrapper"
    colors={colorRingColors}
    /></div>
  }

  const renderCaptureMeta = () => {
    return <div style={{display: 'flex', flexDirection: 'column', width: '300px', color: 'black', textAlign: 'left', padding: '5px'}}>
      <p style={{margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic'}}>Longitude: {gpsLocation.longitude}</p>
      <p style={{margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic'}}>Latitude: {gpsLocation.latitude}</p>
      <p style={{margin: '0px', color: 'rgba(0,0,0,0.8)', fontStyle: 'italic'}}>Date: {formatedTimestamp()}</p>
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
        color: 'white'
      }} type="primary">+ Mushroom</AwesomeButton>
    }

    return <>
      <Webcam  ref={webcamRef} videoConstraints={{
      facingMode: { exact: "environment" }
    }} audio={false} screenshotFormat="image/jpeg" />
      {renderCaptureMeta()}
      <AwesomeButton onPress={() => {
        handleCaptureMushroom({
          longitude: gpsLocation.longitude,
          latitude: gpsLocation.latitude,
          date: formatedTimestamp()
        })
      }} style={{
        color: 'white'
      }} type="primary">Save</AwesomeButton>
      <AwesomeButton onPress={() => {
        setCapturingMushroom(false);
      }} style={{
        color: 'white'
      }} type="primary">Done</AwesomeButton>
    </>
  }

  const renderMushroomTableEntry = (info) => {
    return <div style={{display: 'flex', flexDirection: 'row', height: '30px', width: '290px'}}>
      <img style={{height: '30px', width: '30px'}} src={info.image} alt={info.date} />
      <div style={{height: '30px', width: '100px', color: 'black', fontSize: '12px'}}>{info.date}</div>
      <div style={{height: '30px', width: '80px', color: 'black', fontSize: '12px'}}>{info.latitude}</div>
      <div style={{height: '30px', width: '80px', color: 'black', fontSize: '12px'}}>{info.longitude}</div>
    </div>
  }

  const renderMushroomTable = () => {
    let entries = [];

    for (let i = 0; i < mushrooms.length; i++) {
      entries.push(renderMushroomTableEntry(mushrooms[i]));
    }

    return <div style={{display: 'flex', flexDirection: 'column', overflowY: 'scroll', maxHeight: '100px'}}>
      {entries}
    </div>
  }

  const renderControlHover = () => {
    return <div style={{
      position: 'absolute',
      top: '30px',
      left: '30px',
      width: '300px',
    }}>

        <div style={{display: 'flex', flexDirection: 'column', zIndex: '9999', backgroundColor: '#FFFFF2', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.3)'}}    >
          {renderCaptureControl()}
          {renderMushroomTable()}
        </div>
      </div>
  }

  const renderLoadingIndicator = () => {
    if (loadingMushrooms === true) {
      return <div style={{position: 'absolute', bottom: '30px', right: '30px'}}>
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
          anchor={[parseFloat(mushrooms[i].latitude), parseFloat(mushrooms[i].longitude)]}
          width={75}
        >
          <img src={mushrooms[i].image} width={75} height={75} alt={mushrooms[i].date} />
        </Marker>
      )
    }

    return <Map animate={true} key={'mu-' + markers.length} provider={osm} width={window.innerWidth} height={window.innerHeight} defaultCenter={[gpsLocation.latitude, gpsLocation.longitude]} defaultZoom={16}>
      {markers}
    </Map>
  }, [gpsLocation, mushrooms]);

  const renderInputMap = () => {
    return <div>
      {renderMapProvider()}
      {renderControlHover()}
      {renderLoadingIndicator()}
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

export default App;
