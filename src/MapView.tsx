import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import eoem from './iconmap.webp';
import './MapView.css';
import iconEmpresa from './empresa.png';


const empresa: LatLngExpression = [-15.7801, -47.9292];

const customIcon = new L.Icon({
  iconUrl: eoem,
  iconSize: [19, 28],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Cliente = {
  id: number;
  nome: string;
  telefone: string,
  coordenadas: string;
};

const empresaIcon = new L.Icon({
  iconUrl: iconEmpresa,
  iconSize: [42, 30],
  iconAnchor: [21, 15],
  popupAnchor: [1, -34]
});

function adicionarMarcadores(map: L.Map, usuarios: Cliente[]) {
  usuarios.forEach((usuario) => {
    const coordenadas = usuario.coordenadas.split(',').map(Number);

    let marker;

    if (usuario.id === 7) {
      marker = L.marker(coordenadas as LatLngExpression, { icon: empresaIcon }).addTo(map);
    } else {
      marker = L.marker(coordenadas as LatLngExpression, { icon: customIcon }).addTo(map);
      marker.bindPopup(`<strong><span>Cliente: </span></strong>${usuario.nome}<br/><br/><strong><span>Contato: </span></strong>${usuario.telefone}`);
    }

    map.addLayer(marker);
  });
}

function MapView() {
  const [clientesProximos, setClientesProximos] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [usuarios, setUsuarios] = useState<Cliente[]>([]);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const resposta = await fetch('http://localhost:3331/create-client');
        if (!resposta.ok) {
          throw new Error('falha');
        }
        const data = await resposta.json();
        setUsuarios(data);
        const mapInstance = L.map('map').setView(empresa, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);
        adicionarMarcadores(mapInstance, data);
        setMap(mapInstance);
      } catch (error) {
        console.error('Falha ao carregar os usuários:', error);
      }
    }
    carregarUsuarios();
  }, []);

  const selecionarCliente = (cliente: Cliente) => {
    setIsModalOpen(false);
    if (map) {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });

      const empresaEncontrada = usuarios.find(u => u.id === 7);
      if (empresaEncontrada) {
        adicionarMarcadores(map, [cliente, empresaEncontrada]);
      } else {

        console.error("Empresa não encontrada");
      }
    }
  };

  const removerFiltro = () => {
    if (map) {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
      adicionarMarcadores(map, usuarios);
    }
  };

  async function buscarClientesProximos() {
    console.log("Buscando clientes próximos...");
    try {
      const resposta = await fetch('http://localhost:3331/calc-routes/calcular-rota');
      if (!resposta.ok) {
        throw new Error('Falha ao buscar clientes próximos');
      }
      const dados = await resposta.json();
      setClientesProximos(dados);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar clientes próximos:', error);
    }
  }

  const estiloModal: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    border: '1px solid black',
    zIndex: 1000,
    maxWidth: '80%',
    maxHeight: '80%',
    overflowY: 'auto'
  };

  const estiloLista = {
    listStyleType: 'none',
    paddingLeft: 0
  };

  const estiloItem = {
    counterIncrement: 'item'
  };

  const estiloNumero = {
    marginRight: '5px'
  };

  function ModalClientesProximos() {
    if (!isModalOpen) return null;

    return (
      <div style={estiloModal}>
        <h3>Clientes Mais Próximos</h3>
        <ol style={estiloLista}>
          {clientesProximos.map((cliente, index) => (
            <li key={cliente.id} style={estiloItem}>
              <span style={estiloNumero}>{index + 1}º</span>
              {cliente.nome}
              <button onClick={() => selecionarCliente(cliente)} style={{ marginLeft: '10px' }}>
                View
              </button>
            </li>
          ))}
        </ol>
        <button onClick={() => setIsModalOpen(false)}>Fechar</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Mapa de Rotas</h2>
      <button onClick={buscarClientesProximos}>Exibir cliente mais próximo</button>
      <button onClick={removerFiltro}>Remover filtro</button>

      <div id="map" style={{ height: '400px' }}></div>
      <ModalClientesProximos />
    </div>
  );
}

export default MapView;