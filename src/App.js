import React, { useRef, useEffect, useState } from 'react';
import StopPage from './Containers/StopPage';
import HomePage from './Containers/HomePage';
import GlobalStyle from './Components/GlobalStyle';
import Mapbox from 'mapbox-gl';
import Cosmic from 'cosmicjs';
import Plot from 'react-plotly.js';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import mapboxgl from 'mapbox-gl';

function App() {
  // Setter opp verdier
  let map = null;
  let points = [];
  const mapElement = useRef(null);
  const [pageData, setPageData] = useState(null);
  Mapbox.accessToken = process.env.MAPBOX_API_KEY;
  const yr = require("yr-forecast"); //Bruker yr-forecast til å hente vær
  const defaultCor = [10.394199663947818, 63.43072950793196];
  //Setter opp diagram
  const [chartState, setChartState] = useState({
    data: [],
    layout: {
      // width: 1080,
      // height: 300,
      title: 'Været i Trondheim det neste døgnet'
    },
    frames: [],
    config: { responsive: true, staticPlot: true, autosize: true }
  });

  //Henter inn data fra Cosmic.js
  useEffect(() => {
    const client = new Cosmic();
    const bucket = client.bucket({
      slug: process.env.COSMIC_BUCKET_SLUG,
      read_key: process.env.COSMIC_READKEY
    });
    bucket.getObjects({
      type: 'stops',
      props: 'title,content,slug,metafields'
    }).then(data => {
      setPageData(data);
    })
      .catch(error => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    //Setter opp Mapbox-kart
    map = new Mapbox.Map({
      container: mapElement.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: defaultCor,
      zoom: 11.5
    })

    //Setter opp kartmarkører med data fra Cosmic. Bruker en koordinater-string, som den deler i to og koverter til tall
    if (pageData != null && map != null) {
      pageData.objects.map(item => {
        let cor = item.metafields[0].value.split(',');
        let marker = new mapboxgl.Marker({
          draggable: false
        })
          .setLngLat([parseFloat(cor[1]), parseFloat(cor[0])])
          .setPopup(new mapboxgl.Popup({ closeButton: false }).setHTML(item.title))
          .addTo(map);
        points.push(marker);
        marker.getElement().addEventListener('click', () => {
          window.location.href = `/stops/${item.slug}`;
        })
        marker.getElement().addEventListener('mouseover', () => {
          marker.togglePopup();
        });
        marker.getElement().addEventListener('mouseout', () => {
          marker.togglePopup();
        });
      });
    }
    //Henter inn værdata fra yr med default coordinates (defaultCor) og setter inn i chart data
    yr.getForecast(defaultCor[1], defaultCor[0])
      .then(data => {
        let chartData = {
          type: 'lines',
          x: [],
          y: []
        }
        for (let index = 0; index < 24; index++) {
          const element = data[index];
          chartData.x.push(index);
          chartData.y.push(element.instant.air_temperature);
        }
        let newCS = {
          ...chartState,
          data: [chartData]
        }
        setChartState(newCS);
      });
  }, [pageData]);

  //Rendrer link til alle sidene man kan få tilgang på hvis data er lastet inn
  function StopList() {
    return (
      (pageData === null) ? (<p>"Henter innhold"</p>) :
        pageData.objects.map(item => {
          return (
            <a href={`/stops/${item.slug}`} key={item.slug} slug={item.slug} map={map} cor={item.metafields[0].value.split(',')}>
              {item.title}
            </a>
          )
        }
        )
    )
  }

  return (
    <Router>
      <GlobalStyle />
      <nav className="stops">
        <a href='/'>Start</a>
        {StopList()}
      </nav>
      <div style={{ height: '500px' }} tabindex="-1" ref={mapElement}></div>

      <Switch>
        <Route path='/stops/:slug' component={StopPage} />
        <Route path='/' component={HomePage} />
      </Switch>

      <Plot
        data={chartState.data}
        layout={chartState.layout}
        frames={chartState.frames}
        config={chartState.config}
        onInitialized={(figure) => setChartState(figure)}
        onUpdate={(figure) => setChartState(figure)}
        style={{ width: 100 + '%' }}
        tabindex="0"
        aria-label="Temperaturen i Trondheim det neste døgnet hentet fra yr.no"
      />
    </Router>
  )
};

export default App;