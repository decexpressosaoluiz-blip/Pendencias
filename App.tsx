import React, { useState, useEffect, useMemo } from 'react';
import { User, PendingItem, Note, UserRole, StalledItem } from './types';
import { initializeData, getUsers, fetchPendingItems, saveNote, getNotes, getNotesByCTE, getInboxNotes, saveUser, deleteUser, getScriptUrl, saveScriptUrl } from './services/dataService';
import { parseDate } from './services/dateUtils';
import { StatusTag } from './components/StatusTag';
import { Button } from './components/Button';
import { NoteModal } from './components/NoteModal';
import { HistoryModal } from './components/HistoryModal';
import { LogOut, Search, Bell, Settings, Plus, Trash2, Menu, X, Filter, AlertTriangle, Link as LinkIcon, StickyNote, Moon, Sun } from 'lucide-react';

function App() {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [items, setItems] = useState<PendingItem[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [stalledItems, setStalledItems] = useState<StalledItem[]>([]);
  const [view, setView] = useState<'DASHBOARD' | 'ADMIN' | 'INBOX'>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Filters
  const [activeFilters, setActiveFilters] = useState<{ serie: string | null, payment: string | null }>({ serie: null, payment: null });

  // Modals
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [historySearch, setHistorySearch] = useState({ cte: '', serie: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [historyNotes, setHistoryNotes] = useState<Note[]>([]);

  // Admin State
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.USER });
  const [scriptUrl, setScriptUrl] = useState('');

  useEffect(() => {
    initializeData();
  }, []);

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(async () => {
      const users = getUsers();
      // Case insensitive login
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

      if (user) {
        setCurrentUser(user);
        if (user.role === UserRole.ADMIN) {
           await loadAdminData();
           setView('ADMIN');
        } else {
           await loadDashboard(user);
        }
      } else {
        setError('Usuário ou senha inválidos');
      }
      setLoading(false);
    }, 500);
  };

  const loadDashboard = async (user: User) => {
    const { items: allItems, uniqueUnits } = await fetchPendingItems();
    setAvailableUnits(uniqueUnits);
    
    // Filter by user unit (Destination)
    const userItems = allItems.filter(item => item.entrega === user.unitDestination);
    
    // Sort by Limit Date Ascending
    userItems.sort((a, b) => {
      const dateA = parseDate(a.dataLimite)?.getTime() || 0;
      const dateB = parseDate(b.dataLimite)?.getTime() || 0;
      return dateA - dateB;
    });

    setItems(userItems);
    setView('DASHBOARD');
  };

  const loadAdminData = async () => {
    setAdminUsers(getUsers());
    const { items: allItems, uniqueUnits, stalledItems } = await fetchPendingItems();
    setAvailableUnits(uniqueUnits);
    setStalledItems(stalledItems);
    setScriptUrl(getScriptUrl());
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setItems([]);
    setStalledItems([]);
    setActiveFilters({ serie: null, payment: null });
  };

  const handleSaveNote = (text: string, image?: string) => {
    if (!selectedItem || !currentUser) return;

    const newNote: Note = {
      id: Date.now().toString(),
      cte: selectedItem.cte,
      serie: selectedItem.serie,
      user: currentUser.username,
      content: text,
      timestamp: new Date().toISOString(),
      imageUrl: image,
      originUnit: selectedItem.coleta,
      destinationUnit: selectedItem.entrega,
      isReadByOrigin: false
    };

    saveNote(newNote);
    
    // Update local state
    setItems(prev => prev.map(i => {
      if (i.cte === selectedItem.cte && i.serie === selectedItem.serie) {
        return { ...i, hasNotes: true, noteCount: (i.noteCount || 0) + 1 };
      }
      return i;
    }));

    setSelectedItem(null);
    alert('Justificativa salva com sucesso!');
  };

  const handleSearchHistory = () => {
    if (!historySearch.cte || !historySearch.serie) {
      alert("Preencha CTE e Série para buscar.");
      return;
    }
    const notes = getNotesByCTE(historySearch.cte, historySearch.serie);
    setHistoryNotes(notes);
    setShowHistory(true);
  };

  const toggleFilter = (type: 'serie' | 'payment', value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? null : value
    }));
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeFilters.serie && item.serie !== activeFilters.serie) return false;
      if (activeFilters.payment && item.fretePago !== activeFilters.payment) return false;
      return true;
    });
  }, [items, activeFilters]);

  // For Admin inbox, we might want to see alerts or interactions addressed to "ADMIN"
  // OR just general system notifications. For now, using the user's origin unit.
  const inboxNotes = currentUser ? getInboxNotes(currentUser.unitOrigin) : [];

  // --- ADMIN HANDLERS ---
  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password || !newUser.unitDestination || !newUser.unitOrigin) {
      alert("Todos os campos são obrigatórios");
      return;
    }
    const userToSave: User = {
      id: Date.now().toString(),
      // Ensure lowercase username creation as requested
      username: newUser.username!.toLowerCase(),
      password: newUser.password!,
      role: newUser.role || UserRole.USER,
      unitDestination: newUser.unitDestination!,
      unitOrigin: newUser.unitOrigin!
    };
    saveUser(userToSave);
    setAdminUsers(getUsers());
    setNewUser({ role: UserRole.USER, username: '', password: '', unitDestination: '', unitOrigin: '' });
    alert("Usuário criado!");
  };

  const handleDeleteUser = (username: string) => {
    if (confirm(`Excluir usuário ${username}?`)) {
      deleteUser(username);
      setAdminUsers(getUsers());
    }
  };

  const handleSaveScriptUrl = () => {
    saveScriptUrl(scriptUrl);
    alert('URL do script salva.');
  };

  // --- RENDER ---

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary dark:text-white mb-2">ControlLog</h1>
            <p className="text-slate-500 dark:text-slate-400">Gestão de Pendências</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuário / CPF</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-dark-bg border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors"
                placeholder="Digite seu usuário"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-dark-bg border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors"
                placeholder="********"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>}
            <Button type="submit" className="w-full shadow-lg shadow-primary/30" disabled={loading}>
              {loading ? 'Entrando...' : 'Acessar Sistema'}
            </Button>
          </form>
          
          <div className="mt-6 flex justify-center">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-300 hover:scale-110 transition-transform">
               {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar - Responsive */}
      {/* Hidden on mobile (default), visible on md (desktop/tablet) */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-dark-bg text-white border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-bold tracking-tight text-white">ControlLog</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {currentUser.role === UserRole.ADMIN ? (
             <>
               <Button variant="ghost" className={`w-full justify-start ${view === 'ADMIN' ? 'bg-primary text-white shadow-neon-blue' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => { setView('ADMIN'); setSidebarOpen(false); }}>
                  <Settings size={20} className="mr-3" /> Painel Admin
               </Button>
               {/* Admin Inbox added */}
               <Button variant="ghost" className={`w-full justify-start ${view === 'INBOX' ? 'bg-primary text-white shadow-neon-blue' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => { setView('INBOX'); setSidebarOpen(false); }}>
                <div className="flex items-center w-full">
                  <Bell size={20} className="mr-3" /> 
                  <span className="flex-1 text-left">Caixa de Entrada</span>
                  {inboxNotes.length > 0 && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{inboxNotes.length}</span>}
                </div>
              </Button>
             </>
          ) : (
            <>
              <Button variant="ghost" className={`w-full justify-start ${view === 'DASHBOARD' ? 'bg-primary text-white shadow-neon-blue' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => { setView('DASHBOARD'); setSidebarOpen(false); }}>
                <div className="flex items-center w-full">
                   <span className="flex-1 text-left">Pendências</span>
                   {items.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-neon-red">{items.length}</span>}
                </div>
              </Button>
              <Button variant="ghost" className={`w-full justify-start ${view === 'INBOX' ? 'bg-primary text-white shadow-neon-blue' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => { setView('INBOX'); setSidebarOpen(false); }}>
                <div className="flex items-center w-full">
                  <Bell size={20} className="mr-3" /> 
                  <span className="flex-1 text-left">Caixa de Entrada</span>
                  {inboxNotes.length > 0 && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{inboxNotes.length}</span>}
                </div>
              </Button>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-black/20">
          <div className="flex justify-between items-center mb-4 px-2">
             <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Logado como</p>
                <p className="font-medium truncate text-sm text-white">{currentUser.username}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.unitDestination}</p>
             </div>
             <button onClick={toggleTheme} className="text-slate-400 hover:text-yellow-400 transition-colors">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>
          <Button variant="danger" className="w-full justify-start bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white" onClick={handleLogout}>
            <LogOut size={20} className="mr-3" /> Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-dark-surface shadow-sm p-4 flex justify-between items-center sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700">
          <h1 className="font-bold text-slate-800 dark:text-white text-xl">ControlLog</h1>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="text-slate-600 dark:text-slate-300">
               {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-white">
              <Menu />
            </button>
          </div>
        </div>

        {/* Content Scroll Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-light-bg dark:bg-dark-bg transition-colors">
          
          {/* Universal Search (User & Admin) */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-8">
             <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
               <Search size={16} /> Consultar Histórico
             </h3>
             <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full sm:flex-1">
                  <label className="block text-xs text-slate-400 mb-1">CTE</label>
                  <input 
                    placeholder="Número do CTE" 
                    className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-bg text-slate-900 dark:text-white rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    value={historySearch.cte}
                    onChange={e => setHistorySearch({...historySearch, cte: e.target.value})}
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-xs text-slate-400 mb-1">Série</label>
                  <input 
                    placeholder="Série" 
                    className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-bg text-slate-900 dark:text-white rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    value={historySearch.serie}
                    onChange={e => setHistorySearch({...historySearch, serie: e.target.value})}
                  />
                </div>
                <Button onClick={handleSearchHistory} icon={<Search size={18} />} className="w-full sm:w-auto h-[42px]">
                  Buscar
                </Button>
             </div>
          </div>

          {view === 'DASHBOARD' && currentUser.role !== UserRole.ADMIN && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Pendências <span className="text-slate-400 dark:text-slate-500 text-lg font-normal">| {currentUser.unitDestination}</span>
                </h2>
                
                {(activeFilters.serie || activeFilters.payment) && (
                   <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full text-sm">
                      <Filter size={14} className="text-slate-600 dark:text-slate-300"/>
                      <span className="text-slate-700 dark:text-slate-200">Filtros Ativos</span>
                      <button onClick={() => setActiveFilters({serie: null, payment: null})} className="ml-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"><X size={14}/></button>
                   </div>
                )}
              </div>
              
              {items.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-16 text-center border border-slate-100 dark:border-slate-700">
                  <div className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tudo limpo!</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Não há pendências hoje para esta unidade. Retorne amanhã.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredItems.map((item, idx) => (
                    <div key={`${item.cte}-${idx}`} className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-600 group-hover:bg-primary transition-colors"></div>
                      
                      {/* Flex layout adjusted for better tablet/desktop responsiveness */}
                      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pl-2">
                        
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-xl font-bold text-slate-800 dark:text-white">{item.cte}</span>
                            
                            <button 
                              onClick={() => toggleFilter('serie', item.serie)}
                              className={`text-sm px-2.5 py-0.5 rounded border transition-colors ${activeFilters.serie === item.serie ? 'bg-slate-800 text-white border-slate-800 dark:bg-primary dark:border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:border-slate-400'}`}
                            >
                              Série: {item.serie}
                            </button>

                            <button 
                              onClick={() => toggleFilter('payment', item.fretePago)}
                              className={`text-xs px-2 py-0.5 rounded border uppercase tracking-wide ${activeFilters.payment === item.fretePago ? 'bg-slate-800 text-white border-slate-800 dark:bg-primary dark:border-primary' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600'}`}
                            >
                              {item.fretePago}
                            </button>

                            {item.noteCount > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                <StickyNote size={12} /> {item.noteCount} nota{item.noteCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-6 text-sm text-slate-500 dark:text-slate-400">
                             <div>
                                <span className="text-slate-400 dark:text-slate-500 block sm:inline">Emissão:</span> {item.dataEmissao}
                             </div>
                             <div>
                                <span className="text-slate-400 dark:text-slate-500 block sm:inline">Limite:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{item.dataLimite}</span>
                             </div>
                             <div>
                                <span className="text-slate-400 dark:text-slate-500 block sm:inline">Origem:</span> {item.coleta}
                             </div>
                             <div>
                                <span className="text-slate-400 dark:text-slate-500 block sm:inline">Destinatário:</span> {item.destinatario}
                             </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start lg:items-end xl:items-center gap-4 min-w-[200px] justify-end">
                          <div className="w-full sm:w-auto">
                            {item.computedStatus && <StatusTag status={item.computedStatus} />}
                          </div>
                          <Button 
                             size="md" 
                             onClick={() => setSelectedItem(item)}
                             variant={item.hasNotes ? 'secondary' : 'primary'}
                             className="w-full sm:w-auto shadow-sm"
                          >
                             {item.hasNotes ? 'Adicionar Nota' : 'Justificar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-dark-surface rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                      Nenhum item corresponde aos filtros selecionados.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {view === 'INBOX' && (
             <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Caixa de Entrada</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Notificações e justificativas de outras unidades para origem: {currentUser.unitOrigin}</p>
                
                <div className="space-y-4">
                  {inboxNotes.length === 0 ? (
                    <div className="bg-white dark:bg-dark-surface p-12 text-center rounded-xl border border-slate-200 dark:border-slate-700">
                       <Bell size={48} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" />
                       <p className="text-slate-500 dark:text-slate-400">Sua caixa de entrada está vazia.</p>
                    </div>
                  ) : (
                    inboxNotes.map(note => (
                      <div key={note.id} className="bg-white dark:bg-dark-surface p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-primary relative">
                         <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                            <h4 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                               {note.cte} <span className="text-slate-400 font-normal">/ {note.serie}</span>
                            </h4>
                            <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">{new Date(note.timestamp).toLocaleString()}</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-3">
                            <span className="font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-200">{note.destinationUnit}</span>
                            <span className="text-slate-400">escreveu:</span>
                         </div>
                         <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-lg text-slate-700 dark:text-slate-300 text-sm border border-slate-100 dark:border-slate-700">
                            {note.content}
                         </div>
                         {note.imageUrl && (
                           <div className="mt-3">
                             <img src={note.imageUrl} className="h-24 w-auto rounded-lg border dark:border-slate-600 shadow-sm" alt="Evidence" />
                           </div>
                         )}
                      </div>
                    ))
                  )}
                </div>
             </div>
          )}

          {view === 'ADMIN' && currentUser.role === UserRole.ADMIN && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Painel Administrativo</h2>
              
              {/* Alert Section */}
              {stalledItems.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
                   <div className="flex items-center gap-3 mb-4 text-red-700 dark:text-neon-red">
                      <AlertTriangle size={24} />
                      <h3 className="font-bold text-lg glow-text-red">Alerta: Mercadoria Parada (+10 dias)</h3>
                   </div>
                   <div className="bg-white dark:bg-dark-surface rounded-lg border border-red-100 dark:border-red-900/30 overflow-hidden overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                          <tr>
                            <th className="p-3 whitespace-nowrap">CTE / Série</th>
                            <th className="p-3 whitespace-nowrap">Destino</th>
                            <th className="p-3 whitespace-nowrap">Vencimento</th>
                            <th className="p-3 whitespace-nowrap">Dias Parado</th>
                            <th className="p-3 whitespace-nowrap">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50 dark:divide-red-900/10">
                          {stalledItems.map((item, idx) => (
                             <tr key={idx} className="hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-700 dark:text-slate-300">
                                <td className="p-3 font-medium whitespace-nowrap">{item.cte} / {item.serie}</td>
                                <td className="p-3 whitespace-nowrap">{item.entrega}</td>
                                <td className="p-3 whitespace-nowrap">{item.dataLimite}</td>
                                <td className="p-3 font-bold text-red-600 dark:text-neon-red whitespace-nowrap">{item.daysStalled} dias</td>
                                <td className="p-3 whitespace-nowrap">
                                   <button 
                                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
                                      onClick={() => {
                                         setHistorySearch({ cte: item.cte, serie: item.serie });
                                         const notes = getNotesByCTE(item.cte, item.serie);
                                         setHistoryNotes(notes);
                                         setShowHistory(true);
                                      }}
                                   >
                                      Ver Histórico
                                   </button>
                                </td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}

              {/* Config Script - VISIBLE AND STYLED */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <LinkIcon size={18} className="text-primary"/> Integração Apps Script
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Cole abaixo a URL do Web App gerada pelo Google Apps Script para sincronizar dados.
                 </p>
                 <div className="flex gap-2">
                    <input 
                      value={scriptUrl}
                      onChange={(e) => setScriptUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/..."
                      className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-bg text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    />
                    <Button onClick={handleSaveScriptUrl}>Salvar URL</Button>
                 </div>
              </div>

              {/* User Management */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Gestão de Usuários</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6 bg-slate-50 dark:bg-dark-bg p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="col-span-1 lg:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Usuário</label>
                    <input 
                      placeholder="Nome / CPF"
                      className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-surface text-slate-900 dark:text-white p-2 rounded mt-1 focus:ring-2 focus:ring-primary outline-none"
                      value={newUser.username}
                      onChange={e => setNewUser({...newUser, username: e.target.value})}
                    />
                  </div>
                  <div className="col-span-1 lg:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Senha</label>
                    <input 
                      placeholder="Senha"
                      type="text"
                      className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-surface text-slate-900 dark:text-white p-2 rounded mt-1 focus:ring-2 focus:ring-primary outline-none"
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                  
                  {/* Combobox for Units */}
                  <div className="col-span-1 lg:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Destino (Col I)</label>
                    <input 
                      list="units-list"
                      placeholder="Selecione ou digite"
                      className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-surface text-slate-900 dark:text-white p-2 rounded mt-1 focus:ring-2 focus:ring-primary outline-none"
                      value={newUser.unitDestination}
                      onChange={e => setNewUser({...newUser, unitDestination: e.target.value})}
                    />
                  </div>
                  <div className="col-span-1 lg:col-span-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Origem (Col H)</label>
                    <input 
                      list="units-list"
                      placeholder="Selecione ou digite"
                      className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-surface text-slate-900 dark:text-white p-2 rounded mt-1 focus:ring-2 focus:ring-primary outline-none"
                      value={newUser.unitOrigin}
                      onChange={e => setNewUser({...newUser, unitOrigin: e.target.value})}
                    />
                  </div>
                  
                  {/* Datalist for Unit Autocomplete */}
                  <datalist id="units-list">
                    {availableUnits.map(u => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>

                  <div className="col-span-1 lg:col-span-1 flex items-center justify-between gap-2">
                     <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                       <input 
                         type="checkbox" 
                         className="w-4 h-4 text-primary rounded focus:ring-primary"
                         checked={newUser.role === UserRole.ADMIN} 
                         onChange={e => setNewUser({...newUser, role: e.target.checked ? UserRole.ADMIN : UserRole.USER})} 
                       />
                       <span className="text-sm font-medium">É Admin?</span>
                     </label>
                     <Button onClick={handleCreateUser} icon={<Plus size={18}/>} size="sm">Adicionar</Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border dark:border-slate-700 rounded-lg">
                    <thead className="bg-slate-50 dark:bg-black/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Usuário</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Unidade Destino</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Unidade Origem</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-slate-200 dark:divide-slate-700">
                      {adminUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                             {u.username} 
                             {u.role === UserRole.ADMIN && <span className="ml-2 bg-slate-800 dark:bg-primary text-white text-[10px] px-1.5 py-0.5 rounded">ADMIN</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{u.unitDestination}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{u.unitOrigin}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {u.username !== 'admin' && (
                              <button onClick={() => handleDeleteUser(u.username)} className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
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
          )}

        </main>
      </div>

      {/* Modals */}
      {selectedItem && currentUser && (
        <NoteModal 
          item={selectedItem} 
          currentUser={currentUser} 
          onClose={() => setSelectedItem(null)} 
          onSave={handleSaveNote} 
        />
      )}

      {showHistory && (
        <HistoryModal 
           cte={historySearch.cte} 
           serie={historySearch.serie} 
           notes={historyNotes} 
           onClose={() => setShowHistory(false)} 
        />
      )}
    </div>
  );
}

export default App;