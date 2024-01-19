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

  // const [currentMarker, setCurrentMarker] = useState<L.Marker | null>(null);

  useEffect(() => {
    if (isVisible && mapContainerRef.current && !mapRef.current) {
      const localMap = L.map(mapContainerRef.current).setView([-15.7801, -47.9292], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(localMap);

      let currentMarker: L.Layer | null = null;

      localMap.on('click', function (e) {
        if (currentMarker) {
          localMap.removeLayer(currentMarker);
        }

        currentMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(localMap);

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



  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px'
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '80%',
    maxWidth: '400px'
  };

  const labelStyle: React.CSSProperties = {
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  };

  const submitButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer'
  };

  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      <h1 style={{ textAlign: 'center' }}>Cadastrar Cliente</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Nome:</label>
          <input type="text" value={nome} onChange={handleNomeChange} style={inputStyle} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} style={inputStyle} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Telefone:</label>
          <input type="text" value={telefone} onChange={handleTelefoneChange} style={inputStyle} />
        </div>
        <button type="submit" style={submitButtonStyle}>Enviar</button>
      </form>
      <h1 style={{ textAlign: 'center' }}>Selecionar a localização do cliente</h1>
      <div ref={mapContainerRef} style={{ height: '400px' }}></div>
    </div>
  );
}

export default CreateClientForm;
