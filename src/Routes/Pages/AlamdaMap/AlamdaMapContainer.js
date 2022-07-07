import React, { useState, useEffect }from 'react';
import AlamdaMapPresenter from './AlamdaMapPresenter';

function AlamdaMapContainer() {
  const [ aa, setAa ] = useState({
    a: '',
    b: ''
  })
  const { a, b } = aa

  function GPSfunction() {
    let lat, long;
    if (navigator.geolocation) { // GPS를 지원하면
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            long = position.coords.longitude;
            setAa({
              ...aa,
              a : lat,
              b : long
            })
        }, function(error) {
            console.error(error);
        }, {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: Infinity
        });
    } else {
        console.log('GPS를 지원하지 않습니다');
    }
  }
  
  useEffect(() => {
    GPSfunction()
  }, []);

  return (
    <>
    { a === b
      ? null
      : 
      <AlamdaMapPresenter a={a} b={b} />
    }
    </>
    
   
  );
}

export default AlamdaMapContainer;
