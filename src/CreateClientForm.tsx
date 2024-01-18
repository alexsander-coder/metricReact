import React, { useState } from 'react';

interface CreateClientFormProps {
  isVisible?: boolean;
}

function CreateClientForm({ isVisible = false }: CreateClientFormProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

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

    const response = await fetch('http://localhost:3331/create-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, email, telefone }),
    });

    if (response.ok) {
      console.log('Cliente criado com sucesso');
      setNome('');
      setEmail('');
      setTelefone('');
    } else {
      console.error('Erro ao criar cliente');
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
    </div>
  );
}

export default CreateClientForm;
