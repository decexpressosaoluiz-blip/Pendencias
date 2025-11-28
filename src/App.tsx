import React, { useState, useEffect, useMemo } from 'react';
import { User, PendingItem, Note, UserRole, StalledItem } from './types';
import { initializeData, getUsers, fetchPendingItems, saveNote, getNotes, getNotesByCTE, getInboxNotes } from './services/dataService';
import { parseDate } from './services/dateUtils';
import { StatusTag } from './components/StatusTag';
import { Button } from './components/Button';
import { NoteModal } from './components/NoteModal';
import { HistoryModal } from './components/HistoryModal';
import { CriticalItemsModal } from './components/CriticalItemsModal';
import { AdminPanel } from './components/AdminPanel';
import { LogOut, Search, Bell, Settings, Menu, X, Filter, AlertTriangle, ChevronDown, ChevronUp, StickyNote, Sun, Moon } from 'lucide-react';

function App() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [items, setItems] = useState<PendingItem[]>([]);
  const [stalledItems, setStalledItems] = useState<StalledItem[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  
  // Views & UI State
  const [view, setView] = useState<'DASHBOARD' | 'ADMIN' | 'INBOX'>('DASHBOARD');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters & Search
  const [activeFilters, setActiveFilters] = useState<{ serie: string | null, payment: string | null }>({ serie: null, payment: null });
  const [historySearch, setHistorySearch] = useState({ cte: '', serie: '' });
  
  // Modals
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyNotes, setHistoryNotes] = useState<Note[]>([]);

  // --- EFFECTS ---
  useEffect(() => {
    initializeData();
    if (isDarkMode) document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // --- AUTH ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    setTimeout(async () => {
      const users = getUsers();
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

      if (user) {
        setCurrentUser(user);
        await loadData(user);
      } else {
        setLoginError('Usuário ou senha inválidos');
      }
      setLoading(false);
    }, 600);
  };

  const loadData = async (user: User) => {
    const { items: allItems, uniqueUnits, stalledItems } = await fetchPendingItems();
    setAvailableUnits(uniqueUnits);
    setStalledItems(stalledItems);

    let filteredItems = allItems;

    if (user.role === UserRole.ADMIN) {
      setView('DASHBOARD');
    } 
    else if (user.role === UserRole.USER) {
      filteredItems = allItems.filter(item => 
        (user.unitDestination && item.entrega === user.unitDestination) ||
        (user.unitOrigin && item.coleta === user.unitOrigin)
      );
      setView('DASHBOARD');
    }

    // Sort by Date Limit
    filteredItems.sort((a, b) => {
      const dA = parseDate(a.dataLimite)?.getTime() || 0;
      const dB = parseDate(b.dataLimite)?.getTime() || 0;
      return dA - dB;
    });

    setItems(filteredItems);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setItems([]);
  };

  // --- ACTIONS ---
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
    
    // Optimistic Update
    setItems(prev => prev.map(i => 
      (i.cte === selectedItem.cte && i.serie === selectedItem.serie) 
        ? { ...i, hasNotes: true, noteCount: (i.noteCount || 0) + 1 } 
        : i
    ));
    setSelectedItem(null);
  };

  const handleSearchHistory = () => {
    if (!historySearch.cte || !historySearch.serie) return alert("Preencha CTE e Série.");
    const notes = getNotesByCTE(historySearch.cte, historySearch.serie);
    setHistoryNotes(notes);
    setShowHistory(true);
  };

  // --- DERIVED STATE ---
  const displayedItems = useMemo(() => {
    let result = items;
    if (activeFilters.serie) result = result.filter(i => i.serie === activeFilters.serie);
    if (activeFilters.payment) result = result.filter(i => i.fretePago === activeFilters.payment);
    return result;
  }, [items, activeFilters]);

  const inboxNotes = currentUser ? getInboxNotes(currentUser.unitOrigin) : [];

  // --- RENDER ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-center text-primary dark:text-white mb-2">ControlLog</h1>
          <form onSubmit={handleLogin} className="space-y-6 mt-8">
             <div>
               <label className="text-sm font-medium dark:text-gray-300">Usuário</label>
               <input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 rounded border dark:bg-dark-bg dark:text-white" />
             </div>
             <div>
               <label className="text-sm font-medium dark:text-gray-300">Senha</label>
               <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded border dark:bg-dark-bg dark:text-white" />
             </div>
             {loginError && <p className="text-red-500 text-center">{loginError}</p>}
             <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Acessar'}</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col md:flex-row transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-dark-bg text-white border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-xl font-bold">ControlLog</h2>
            <p className="text-xs text-slate-400 mt-1">{currentUser.role} | {currentUser.username}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X/></button>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Button variant="ghost" onClick={() => { setView('DASHBOARD'); setSidebarOpen(false); }} className={`w-full justify-start ${view === 'DASHBOARD' ? 'bg-primary text-white' : 'text-slate-400'}`}>
            Pendências
          </Button>
          <Button variant="ghost" onClick={() => { setView('INBOX'); setSidebarOpen(false); }} className={`w-full justify-start ${view === 'INBOX' ? 'bg-primary text-white' : 'text-slate-400'}`}>
            Caixa de Entrada {inboxNotes.length > 0 && <span className="ml-auto bg-blue-500 text-xs px-2 rounded-full">{inboxNotes.length}</span>}
          </Button>
          {currentUser.role === UserRole.ADMIN && (
             <Button variant="ghost" onClick={() => { setView('ADMIN'); setSidebarOpen(false); }} className={`w-full justify-start ${view === 'ADMIN' ? 'bg-primary text-white' : 'text-slate-400'}`}>
               <Settings size={18} className="mr-2"/> Admin
             </Button>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800">
           <Button variant="danger" onClick={handleLogout} className="w-full justify-start"><LogOut size={18} className="mr-2"/> Sair</Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-dark-surface shadow-sm p-4 flex justify-between items-center z-10">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden"><Menu/></button>
              <h1 className="font-bold text-xl dark:text-white">
                {view === 'DASHBOARD' && 'Painel de Controle'}
                {view === 'INBOX' && 'Caixa de Entrada'}
                {view === 'ADMIN' && 'Administração'}
              </h1>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                 {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
           
           {/* GLOBAL SEARCH */}
           <div className="bg-white dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                 <label className="text-xs text-slate-500 uppercase font-bold">CTE</label>
                 <input className="w-full border rounded p-2 dark:bg-dark-bg dark:text-white" value={historySearch.cte} onChange={e => setHistorySearch({...historySearch, cte: e.target.value})} placeholder="Num CTE" />
              </div>
              <div className="w-32">
                 <label className="text-xs text-slate-500 uppercase font-bold">Série</label>
                 <input className="w-full border rounded p-2 dark:bg-dark-bg dark:text-white" value={historySearch.serie} onChange={e => setHistorySearch({...historySearch, serie: e.target.value})} placeholder="Série" />
              </div>
              <Button icon={<Search size={18}/>} onClick={handleSearchHistory}>Buscar</Button>
           </div>

           {/* DASHBOARD CONTENT */}
           {view === 'DASHBOARD' && (
              <div className="space-y-6">
                 {/* CRITICAL BUTTON */}
                 <button 
                   onClick={() => setShowCriticalModal(true)}
                   className="w-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center justify-between hover:bg-red-100 transition-colors group"
                 >
                    <div className="flex items-center gap-3">
                       <AlertTriangle className="text-red-600 dark:text-neon-red group-hover:scale-110 transition-transform"/>
                       <div className="text-left">
                          <h3 className="font-bold text-red-700 dark:text-red-200">Ver Mercadorias Críticas</h3>
                          <p className="text-xs text-red-500 dark:text-red-400">{stalledItems.length} itens aguardando ação</p>
                       </div>
                    </div>
                    <ChevronDown className="text-red-400"/>
                 </button>

                 {/* Filters */}
                 {(activeFilters.serie || activeFilters.payment) && (
                    <div className="flex gap-2">
                       <span className="text-xs font-bold uppercase text-slate-500 self-center">Filtros:</span>
                       {activeFilters.serie && <span onClick={() => setActiveFilters({...activeFilters, serie: null})} className="cursor-pointer px-2 py-1 bg-slate-200 rounded text-xs flex items-center gap-1">Série: {activeFilters.serie} <X size={12}/></span>}
                       {activeFilters.payment && <span onClick={() => setActiveFilters({...activeFilters, payment: null})} className="cursor-pointer px-2 py-1 bg-slate-200 rounded text-xs flex items-center gap-1">{activeFilters.payment} <X size={12}/></span>}
                    </div>
                 )}

                 {/* List */}
                 <div className="space-y-4">
                    {displayedItems.map((item, idx) => (
                       <div key={idx} className="bg-white dark:bg-dark-surface p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1 space-y-2">
                             <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-lg dark:text-white">{item.cte}</span>
                                <button onClick={() => setActiveFilters({...activeFilters, serie: item.serie})} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded hover:bg-slate-200">{item.serie}</button>
                                <button onClick={() => setActiveFilters({...activeFilters, payment: item.fretePago})} className="text-xs border border-slate-300 dark:border-slate-600 px-2 py-0.5 rounded uppercase">{item.fretePago}</button>
                             </div>
                             <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                                <span>Origem: {item.coleta}</span>
                                <span>Destino: {item.entrega}</span>
                                <span>Limite: {item.dataLimite}</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             {item.computedStatus && <StatusTag status={item.computedStatus}/>}
                             <Button size="sm" onClick={() => setSelectedItem(item)} variant={item.hasNotes ? 'secondary' : 'primary'}>
                                {item.hasNotes ? `Notas (${item.noteCount})` : 'Justificar'}
                             </Button>
                          </div>
                       </div>
                    ))}
                    {displayedItems.length === 0 && (
                       <div className="text-center py-10 text-slate-500 dark:text-slate-400">Nenhum item encontrado.</div>
                    )}
                 </div>
              </div>
           )}

           {/* ADMIN CONTENT */}
           {view === 'ADMIN' && currentUser.role === UserRole.ADMIN && (
              <AdminPanel />
           )}

           {/* INBOX CONTENT */}
           {view === 'INBOX' && (
              <div className="space-y-4 max-w-3xl mx-auto">
                 {inboxNotes.length === 0 ? <p className="text-center text-slate-500 py-10">Caixa de entrada vazia.</p> : 
                    inboxNotes.map(note => (
                       <div key={note.id} className="bg-white dark:bg-dark-surface p-4 rounded-xl border-l-4 border-primary shadow-sm">
                          <div className="flex justify-between mb-2">
                             <span className="font-bold dark:text-white">{note.cte} / {note.serie}</span>
                             <span className="text-xs text-slate-400">{new Date(note.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm dark:text-slate-300">{note.content}</p>
                       </div>
                    ))
                 }
              </div>
           )}
        </div>
      </main>

      {/* MODALS */}
      <CriticalItemsModal isOpen={showCriticalModal} onClose={() => setShowCriticalModal(false)} items={stalledItems} />
      
      {selectedItem && (
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