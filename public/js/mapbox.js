



export const displayMap = (locations)=>{
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFwcHktMiIsImEiOiJjbTAyOTFndDkwMDM3MnFzZDUxY2dkOWk5In0.T62HMh2dqytXN4LqpICwvw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  scrollZoom: false
  //   center:[-118.113494,34.111745],
  //  zoom: 10,
  //  interactive:false
})

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  //create marker
  const el = document.createElement('div');
  el.className ='marker';

  //Add marker
  new mapboxgl.Marker({element:el,anchor:'bottom'}).setLngLat(loc.coordinates).addTo(map);

  //Add Popup
  new mapboxgl.Popup({
    offset:30
  }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`).addTo(map);

  //Extend map bound to include current locations
  bounds.extend(loc.coordinates,{pading:{
    top:200,
    bottom:150,
    left:100,
    right:100}
  });
})
// console.log(locations);

map.fitBounds(bounds);}