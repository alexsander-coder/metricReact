import { useState } from 'react';
import './App.css';
import CreateClientForm from './CreateClientForm';
import ClientList from './ClientList';
import MapView from './MapView';


function App() {

  const [isCreateClientFormVisible, setIsCreateClientFormVisible] = useState(false);
  const [isClientListVisible, setIsClientListVisible] = useState(false);
  const [isMapViewVisible, setIsMapViewVisible] = useState(false);
  const [clients, setClients] = useState([]);

  const handleCreateClientClick = () => {
    setIsCreateClientFormVisible(!isCreateClientFormVisible);
    if (isClientListVisible) {
      setIsClientListVisible(false);
    }
    if (isMapViewVisible) {
      setIsMapViewVisible(false)
    }
  };


  const handleListClick = async () => {
    setIsClientListVisible(!isClientListVisible);
    if (isCreateClientFormVisible) {
      setIsCreateClientFormVisible(false);
    }
    if (isMapViewVisible) {
      setIsMapViewVisible(false)
    }

    if (!isClientListVisible) {
      try {
        const response = await fetch('http://localhost:3331/create-client');
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
          console.error('Erro ao listar clientes');
        }
      } catch (error) {
        console.error('Erro ao listar clientes', error);
      }
    }
  };

  const handleMapViewClick = () => {
    setIsMapViewVisible(!isMapViewVisible);
    if (isCreateClientFormVisible) {
      setIsCreateClientFormVisible(false);
    }
    if (isClientListVisible) {
      setIsClientListVisible(false);
    }
  };

  return (
    <div>
      <button onClick={handleCreateClientClick}>
        {isCreateClientFormVisible ? 'Fechar Formulário' : 'Criar Cliente'}
      </button>
      <button onClick={handleListClick}>
        {isClientListVisible ? 'Fechar Lista' : 'Listar Clientes'}
      </button>
      <button onClick={handleMapViewClick}>
        {isMapViewVisible ? 'Fechar Mapa' : 'Mapas clientes'}
      </button>
      {isCreateClientFormVisible && <CreateClientForm isVisible={isCreateClientFormVisible} />}
      {isClientListVisible && <ClientList clients={clients} />}
      {isMapViewVisible && <MapView />}
    </div>
  );
}

export default App;
