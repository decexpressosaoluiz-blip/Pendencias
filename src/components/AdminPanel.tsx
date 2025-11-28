import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUser, deleteUser, getScriptUrl, saveScriptUrl } from '../services/dataService';
import { Button } from './Button';
import { Trash2, Plus, Users, Save, HelpCircle, Check, Copy } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.USER });
  const [scriptUrl, setScriptUrl] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUsers(getUsers());
    setScriptUrl(getScriptUrl());
  }, []);

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password) {
      alert("Usuário e Senha são obrigatórios.");
      return;
    }
    
    const userToSave: User = {
      id: Date.now().toString(),
      username: newUser.username.toLowerCase(),
      password: newUser.password,
      role: newUser.role || UserRole.USER,
      unitOrigin: newUser.unitOrigin || '',
      unitDestination: newUser.unitDestination || ''
    };

    saveUser(userToSave);
    setUsers(getUsers());
    setNewUser({ role: UserRole.USER, username: '', password: '', unitOrigin: '', unitDestination: '' });
    alert("Usuário salvo com sucesso!");
  };

  const handleDeleteUser = (username: string) => {
    if (confirm(`Tem certeza que deseja excluir ${username}?`)) {
      deleteUser(username);
      setUsers(getUsers());
    }
  };

  const handleSaveUrl = () => {
    saveScriptUrl(scriptUrl);
    alert("URL salva com sucesso.");
  };

  const copyCode = () => {
    // Code snippet for user reference
    const code = `function doPost(e) { ... }`; 
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-primary" size={28} />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Painel Administrativo</h2>
      </div>

      {/* User Management */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black/20">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Gerenciar Usuários</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="lg:col-span-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Usuário</label>
              <input 
                className="w-full p-2 text-sm border rounded dark:bg-dark-bg dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ex: joao.silva"
                value={newUser.username || ''}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Senha</label>
              <input 
                className="w-full p-2 text-sm border rounded dark:bg-dark-bg dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                type="text"
                placeholder="******"
                value={newUser.password || ''}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Perfil</label>
              <select 
                className="w-full p-2 text-sm border rounded dark:bg-dark-bg dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
              >
                <option value={UserRole.USER}>Unidade (Padrão)</option>
                <option value={UserRole.ADMIN}>Administrador</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Origem (Col H)</label>
              <input 
                className="w-full p-2 text-sm border rounded dark:bg-dark-bg dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="Vincula à Origem"
                value={newUser.unitOrigin || ''}
                onChange={e => setNewUser({...newUser, unitOrigin: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Destino (Col I)</label>
               <input 
                 className="w-full p-2 text-sm border rounded dark:bg-dark-bg dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                 placeholder="Vincula ao Destino"
                 value={newUser.unitDestination || ''}
                 onChange={e => setNewUser({...newUser, unitDestination: e.target.value})}
               />
            </div>
            <div className="lg:col-span-1">
              <Button onClick={handleCreateUser} className="w-full" icon={<Plus size={16}/>}>Adicionar</Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perfil</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Origem</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destino</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.unitOrigin || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.unitDestination || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.username !== 'admin' && (
                        <button onClick={() => handleDeleteUser(user.username)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                           <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Script Config */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
         <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Save size={20} className="text-primary"/> Integração Google Sheets
         </h3>
         <div className="flex gap-4">
           <input 
             className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-primary outline-none"
             placeholder="URL do Web App (Apps Script)..."
             value={scriptUrl}
             onChange={e => setScriptUrl(e.target.value)}
           />
           <Button onClick={handleSaveUrl}>Salvar</Button>
         </div>
      </div>
    </div>
  );
};