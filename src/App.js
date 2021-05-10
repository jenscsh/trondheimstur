import React,{useRef,useEffect,useState} from 'react';
import StopPage from './Containers/StopPage';
import HomePage from './Containers/HomePage';
import GlobalStyle from './Components/GlobalStyle';
import Mapbox from 'mapbox-gl';
import Cosmic from 'cosmicjs';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import mapboxgl from 'mapbox-gl';

function App() {
  let map = null;
  let points = [];
  const mapElement = useRef(null);
  const [pageData, setPageData] = useState(null);
  Mapbox.accessToken = process.env.MAPBOX_API_KEY;

  useEffect(() => {
    const client = new Cosmic();
    const bucket = client.bucket({
      slug: process.env.COSMIC_BUCKET_SLUG,
      read_key: process.env.COSMIC_READKEY
    });
    bucket.getObjects({
        type: 'stops',
        props: 'title,content,slug,metafields'
    }).then(data=>{
        setPageData(data);
    })
    .catch(error=>{
        console.error(error);
    });
  },[]);

  useEffect(()=>{
    map = new Mapbox.Map({
      container: mapElement.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [10.394199663947818,63.43072950793196],
      zoom: 11.5
    })
    
    if (pageData!=null&&map!=null) {
      pageData.objects.map(item => {
      let cor = item.metafields[0].value.split(',');
      let marker = new mapboxgl.Marker({
        draggable: false
      })
      .setLngLat([parseFloat(cor[1]),parseFloat(cor[0])])
      .setPopup(new mapboxgl.Popup({closeButton: false}).setHTML(item.title))
      .addTo(map);
      points.push(marker);
      marker.getElement().addEventListener('click',()=>{
        window.location.href = `/stops/${item.slug}`;
      })
      marker.getElement().addEventListener('mouseover',()=>{
        marker.togglePopup();
      });
      marker.getElement().addEventListener('mouseout',()=>{
        marker.togglePopup();
      });
    });}
  },[pageData]);
  
  function StopList() {
    return (
    (pageData===null)? (<p>"Henter innhold"</p>):
        pageData.objects.map(item=>{
          return (
            <a href={`/stops/${item.slug}`} key={item.slug} slug={item.slug}>
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
      <a href='/'>Start</a>
      {StopList()}
      <div style={{height: '500px'}} ref={mapElement}></div>

      <Switch>
        <Route path='/stops/:slug' component={StopPage}/>
        <Route path='/' component={HomePage}/>
      </Switch>
    </Router>
  )
};

export default App;