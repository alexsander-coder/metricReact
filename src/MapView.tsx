import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import eoem from './marcador.png'

const empresa: LatLngExpression = [-15.7801, -47.9292];

const customIcon = new L.Icon({
  iconUrl: eoem,
  iconSize: [42, 30],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});




function adicionarMarcadores(map: L.Map, usuarios: any) {
  usuarios.forEach((usuario: any) => {
    const coordenadas = usuario.coordenadas.split(',').map(Number);
    const marker = L.marker(coordenadas as LatLngExpression, { icon: customIcon }).addTo(map);
    console.log(marker, 'icon felas veja o iccooonn')
    marker.bindPopup(`<strong>${usuario.nome}</strong><br/>${usuario.email}<br/>${usuario.telefone}`);
  });
}


function MapView() {
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const resposta = await fetch('http://localhost:3331/create-client');
        if (!resposta.ok) {
          throw new Error('falha');
        }
        const usuarios = await resposta.json();
        return usuarios;
      } catch (error) {
        console.error('Falha ao carregar os usuários:', error);
        return [];
      }
    }

    carregarUsuarios().then((usuarios) => {
      const map = L.map('map').setView(empresa, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      if (usuarios && usuarios.length > 0) {
        adicionarMarcadores(map, usuarios);
      }

      return () => {
        map.remove();
      };
    });
  }, []);

  return (
    <div>
      <h2>Mapa de Rotas</h2>
      <div id="map" style={{ height: '400px' }}></div>
    </div>
  );
}

export default MapView;
