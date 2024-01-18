import { useState } from 'react';

interface ClientListProps {
  clients: Array<{
    id: number;
    nome: string;
    email: string;
    telefone: string;
  }>;
}

function ClientList({ clients }: ClientListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedClient, setEditedClient] = useState({ nome: '', email: '', telefone: '' });

  const handleEditClick = (client: any) => {
    setEditingId(client.id);
    setEditedClient({ nome: client.nome, email: client.email, telefone: client.telefone });
  };

  const handleSaveClick = async (id: any) => {
    try {
      const response = await fetch(`http://localhost:3331/create-client/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedClient),
      });

      if (response.ok) {
        console.log('Cliente atualizado com sucesso');

      } else {
        console.error('Erro ao atualizar cliente');
      }
    } catch (error) {
      console.error('Erro na requisição de atualização', error);
    }

    setEditingId(null);
  };


  const handleCancelClick = () => {
    setEditingId(null);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            <td>{client.id}</td>
            <td>
              {editingId === client.id ? (
                <input
                  type="text"
                  value={editedClient.nome}
                  onChange={(e) => setEditedClient({ ...editedClient, nome: e.target.value })}
                />
              ) : (
                client.nome
              )}
            </td>
            <td>
              {editingId === client.id ? (
                <input
                  type="email"
                  value={editedClient.email}
                  onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                />
              ) : (
                client.email
              )}
            </td>
            <td>
              {editingId === client.id ? (
                <input
                  type="text"
                  value={editedClient.telefone}
                  onChange={(e) => setEditedClient({ ...editedClient, telefone: e.target.value })}
                />
              ) : (
                client.telefone
              )}
            </td>
            <td>
              {editingId === client.id ? (
                <>
                  <button onClick={() => handleSaveClick(client.id)}>Salvar</button>
                  <button onClick={handleCancelClick}>Cancelar</button>
                </>
              ) : (
                <button onClick={() => handleEditClick(client)}>Editar</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ClientList;