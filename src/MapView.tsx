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

    if (usuario.id === 7) { // ID da empresa
      marker = L.marker(coordenadas as LatLngExpression, { icon: empresaIcon });
      marker.bindPopup("<strong>VOCÊ ESTÁ AQUI</strong>");
    } else {
      marker = L.marker(coordenadas as LatLngExpression, { icon: customIcon });
      marker.bindPopup(`<strong><span>Cliente: </span></strong>${usuario.nome}<br/><br/><strong><span>Contato: </span></strong>${usuario.telefone}`);
    }

    marker.addTo(map);
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
        const mapInstance = L.map('map').setView(empresa, 10.5);
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
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    zIndex: 1000,
    maxWidth: '80%',
    maxHeight: '80%',
    textAlign: 'center',
    overflowY: 'auto'
  };


  const estiloLista = {
    listStyle: 'none',
    padding: 0
  };

  const estiloItem = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #eee',
    padding: '10px 0'
  };

  const estiloNumero = {
    fontWeight: 'bold',
    marginRight: '10px'
  };

  const estiloBotao = {
    padding: '6px 12px',
    margin: '10px 0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white'
  };

  const botaoFechar = {
    backgroundColor: 'rgb(255, 97, 97)',
    color: 'white'
  }

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
              <button onClick={() => selecionarCliente(cliente)} style={estiloBotao}>
                View
              </button>
            </li>
          ))}
        </ol>
        <button style={botaoFechar} onClick={() => setIsModalOpen(false)}>Fechar</button>
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