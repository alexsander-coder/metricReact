import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CreateClientFormProps {
  isVisible?: boolean;
}

function CreateClientForm({ isVisible = false }: CreateClientFormProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [currentMarker, setCurrentMarker] = useState<L.Marker | null>(null);

  useEffect(() => {
    if (isVisible && mapContainerRef.current && !mapRef.current) {
      const localMap = L.map(mapContainerRef.current).setView([0, 0], 1);
      mapRef.current = localMap;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(localMap);

      let currentMarker: L.Layer | null = null;

      localMap.on('click', function (e) {
        // Se um marcador já existir, remova-o
        if (currentMarker) {
          localMap.removeLayer(currentMarker);
        }

        // Cria um novo marcador e o adiciona ao mapa
        currentMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(localMap);

        // Define a localização
        setLocalizacao(e.latlng);
      });
    }
  }, [isVisible]);



  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNome(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localizacao) {
      alert("Por favor, selecione uma localização no mapa.");
      return;
    }

    const coordenadas = `${localizacao.lat},${localizacao.lng}`;

    console.log(coordenadas, 'verify coordenadas')

    const response = await fetch('http://localhost:3331/create-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, email, telefone, coordenadas }),
    });

    if (response.ok) {
      console.log('Cliente criado com sucesso');
      setNome('');
      setEmail('');
      setTelefone('');
    } else {
      console.error('Erro ao criar cliente');
    }

    if (mapRef.current && localizacao) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current!.removeLayer(layer);
        }
      });
    }
  };

  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      <h2>Criar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" value={nome} onChange={handleNomeChange} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} />
        </div>
        <div>
          <label>Telefone:</label>
          <input type="text" value={telefone} onChange={handleTelefoneChange} />
        </div>
        <button type="submit">Enviar</button>

      </form>
      <div ref={mapContainerRef} style={{ height: '400px' }}></div>
    </div>
  );
}

export default CreateClientForm;
