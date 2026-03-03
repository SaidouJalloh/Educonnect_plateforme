// import { useState, useRef, useEffect } from 'react';
// import AppLayout from '@/components/AppLayout';
// import ChatBubble from '@/components/chat/ChatBubble';
// import ChatInput from '@/components/chat/ChatInput';
// import { useChat, ChatSession } from '@/context/ChatContext';
// import { Bot, RefreshCw, WifiOff, Sparkles, GraduationCap, Globe, Search, Inbox, TrendingUp, ArrowRight, Clock, Plus, MessageSquare, MoreHorizontal, Pin, PinOff, Pencil, Trash2, Download, Loader2, User, Menu, X } from 'lucide-react';
// import { useLanguage } from '@/i18n/LanguageContext';
// import { chatWithBotCloud } from '@/services/api';
// import { useApp } from '@/context/AppContext';
// import { useToast } from '@/hooks/use-toast';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useAuthContext } from '@/context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import OpportunityCard from '@/components/OpportunityCard';
// import type { Opportunity } from '@/services/api';
// import type { ActivePanel } from '@/components/chat/ChatSidebar';
// import Navigation from '@/components/Navigation';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
// import { cn } from '@/lib/utils';
// import { useTheme } from 'next-themes';
// import { useIsMobile } from '@/hooks/use-mobile';

// interface ConversationContext {
//   previousMessages: Array<{ role: string; content: string }>;
//   topics: string[];
// }

// const MAX_RETRIES = 3;
// const RETRY_DELAY = 2000;
// const ITEMS_PER_PAGE = 9;

// const fallbackOpportunities: Opportunity[] = [
//   { id: 1, titre: "Bourse d'Excellence Africaine 2025", description: "Programme de bourses complètes pour études supérieures en sciences et technologies.", type: "Bourse", pays: "Plusieurs pays", date_limite: "30 Mars 2025", lien: "#" },
//   { id: 2, titre: "Formation en Data Science - Google Africa", description: "Formation gratuite en analyse de données et intelligence artificielle.", type: "Formation", pays: "En ligne", date_limite: "15 Avril 2025", lien: "#" },
//   { id: 3, titre: "Stage International - Banque Africaine", description: "Opportunité de stage de 6 mois dans le secteur bancaire et financier.", type: "Stage", pays: "Abidjan, Côte d'Ivoire", date_limite: "20 Février 2025", lien: "#" },
//   { id: 4, titre: "Programme d'Échange Universitaire", description: "Échanges académiques entre universités africaines.", type: "Échange", pays: "Afrique de l'Ouest", date_limite: "10 Mai 2025", lien: "#" },
//   { id: 5, titre: "Bourse Master en Ingénierie", description: "Financement complet pour Master en génie civil et architecture.", type: "Bourse", pays: "Dakar, Sénégal", date_limite: "25 Mars 2025", lien: "#" },
//   { id: 6, titre: "Formation Entrepreneuriat Digital", description: "Programme intensif pour jeunes entrepreneurs africains dans le numérique.", type: "Formation", pays: "Lagos, Nigeria", date_limite: "5 Avril 2025", lien: "#" },
// ];

// const createGetRelativeTime = (t: any, language: string) => (dateString: string): string => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffMins = Math.floor(diffMs / (1000 * 60));
//   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//   if (diffMins < 1) return t.chat.justNow;
//   if (diffMins < 60) return t.chat.minutesAgo.replace('{n}', String(diffMins));
//   if (diffHours < 24) return t.chat.hoursAgo.replace('{n}', String(diffHours));
//   if (diffDays === 1) return t.chat.yesterday;
//   if (diffDays < 7) return t.chat.daysAgo.replace('{n}', String(diffDays));
//   const locale = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
//   return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
// };

// // ─── Panel Opportunités ───────────────────────────────────────────────────────
// const OpportunitiesPanel = () => {
//   const { t } = useLanguage();
//   const [opportunities] = useState<Opportunity[]>(fallbackOpportunities);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);

//   const filtered = opportunities.filter(opp => {
//     const q = searchQuery.toLowerCase();
//     const matchSearch = !q || opp.titre.toLowerCase().includes(q) || opp.description.toLowerCase().includes(q) || (opp.pays?.toLowerCase().includes(q) ?? false);
//     const matchCat = selectedCategory === 'all' || opp.type.toLowerCase() === selectedCategory.toLowerCase();
//     return matchSearch && matchCat;
//   });
//   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
//   const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="mb-6">
//         <h1 className="text-xl font-bold mb-1">
//           {t.opportunities.title} <span className="bg-gradient-primary bg-clip-text text-transparent">{t.opportunities.available}</span>
//         </h1>
//         <p className="text-sm text-muted-foreground">{t.opportunities.subtitle}</p>
//       </div>
//       <div className="flex flex-col md:flex-row gap-3 mb-5">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input placeholder={t.opportunities.search} className="pl-9 rounded-xl" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
//         </div>
//         <Select value={selectedCategory} onValueChange={v => { setSelectedCategory(v); setCurrentPage(1); }}>
//           <SelectTrigger className="w-full md:w-[160px] rounded-xl">
//             <SelectValue placeholder={t.opportunities.category} />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">{t.opportunities.all}</SelectItem>
//             <SelectItem value="bourse">{t.opportunities.scholarships}</SelectItem>
//             <SelectItem value="formation">{t.opportunities.trainings}</SelectItem>
//             <SelectItem value="stage">{t.opportunities.internships}</SelectItem>
//             <SelectItem value="echange">{t.opportunities.exchanges}</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       <p className="text-xs text-muted-foreground mb-4">{filtered.length} {filtered.length > 1 ? t.opportunities.opportunityPlural : t.opportunities.opportunity}</p>
//       {filtered.length === 0 && (
//         <div className="flex flex-col items-center justify-center py-16 text-center">
//           <Inbox className="w-10 h-10 text-muted-foreground mb-3" />
//           <p className="text-sm text-muted-foreground">{t.opportunities.noResult}</p>
//           <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>{t.opportunities.reset}</Button>
//         </div>
//       )}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {paginated.map((opp, i) => (
//           <div key={opp.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
//             <OpportunityCard title={opp.titre} description={opp.description} category={opp.type} location={opp.pays || 'N/A'} deadline={opp.date_limite || 'N/A'} link={opp.lien} />
//           </div>
//         ))}
//       </div>
//       {totalPages > 1 && (
//         <div className="flex justify-center gap-2 mt-8">
//           <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{t.opportunities.previous}</Button>
//           <span className="flex items-center text-sm text-muted-foreground px-3">{currentPage} / {totalPages}</span>
//           <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{t.opportunities.next}</Button>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Panel Dashboard (Accueil) ────────────────────────────────────────────────
// const DashboardPanel = ({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) => {
//   const { profile } = useAuthContext();
//   const { t } = useLanguage();
//   const firstName = profile?.name?.split(' ')[0] || '';

//   const fields = [profile?.name, profile?.email, profile?.niveau, profile?.filiere, profile?.pays, profile?.interets?.length];
//   const filled = fields.filter(Boolean).length;
//   const pct = Math.round((filled / fields.length) * 100);
//   const circumference = 2 * Math.PI * 28;
//   const dashOffset = circumference * (1 - pct / 100);

//   const stats = [
//     { icon: '🏆', color: 'bg-yellow-50 dark:bg-yellow-500/10', value: '8', label: t.dashboard.scholarships, sublabel: t.dashboard.matchingProfile, trend: `+3 ${t.dashboard.thisWeek}` },
//     { icon: '🥇', color: 'bg-orange-50 dark:bg-orange-500/10', value: '3', label: t.dashboard.competitions, sublabel: t.dashboard.openNow, trend: `2 ${t.dashboard.urgent}` },
//     { icon: '🎓', color: 'bg-blue-50 dark:bg-blue-500/10', value: '12', label: t.dashboard.trainings, sublabel: t.dashboard.available, trend: `+5 ${t.dashboard.new}` },
//     { icon: '🔖', color: 'bg-purple-50 dark:bg-purple-500/10', value: '5', label: t.dashboard.saved, sublabel: t.dashboard.dontMiss, trend: `2 ${t.dashboard.expireSoon}` },
//   ];

//   const recentOpps = fallbackOpportunities.slice(0, 3);

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="relative rounded-2xl overflow-hidden mb-6 p-6 bg-gradient-to-r from-primary to-[hsl(211,80%,45%)] text-primary-foreground">
//         <div className="relative z-10">
//           <h1 className="text-2xl font-bold mb-1">{t.dashboard.hello} {firstName} 👋</h1>
//           <p className="text-primary-foreground/80 text-sm">
//             <span className="font-semibold text-primary-foreground">5 {t.dashboard.newOpportunities}</span> {t.dashboard.matchProfile}
//           </p>
//           <Button size="sm" className="mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold rounded-full text-xs px-4" onClick={() => onNavigate('opportunites')}>
//             {t.dashboard.viewOpportunities} <ArrowRight className="w-3 h-3 ml-1" />
//           </Button>
//         </div>
//         <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
//           <svg width="72" height="72" viewBox="0 0 72 72">
//             <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
//             <circle cx="36" cy="36" r="28" fill="none" stroke="white" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 36 36)" />
//             <text x="36" y="40" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{pct}%</text>
//           </svg>
//           <p className="text-[10px] text-primary-foreground/70 text-center leading-tight">{t.dashboard.profileCompleted}<br/>{t.dashboard.completed}</p>
//         </div>
//         <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
//         <div className="absolute -right-4 -top-6 w-24 h-24 rounded-full bg-white/5" />
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         {stats.map((s, i) => (
//           <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate('opportunites')}>
//             <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
//             <p className="text-2xl font-bold">{s.value}</p>
//             <p className="text-sm font-medium">{s.label}</p>
//             <p className="text-xs text-muted-foreground mb-2">{s.sublabel}</p>
//             <p className="text-xs text-primary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {s.trend}</p>
//           </div>
//         ))}
//       </div>

//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-base font-bold">{t.dashboard.todayOpportunities}</h2>
//           <button className="text-sm text-primary hover:underline flex items-center gap-1 font-medium" onClick={() => onNavigate('opportunites')}>
//             {t.dashboard.viewAll} <ArrowRight className="w-3.5 h-3.5" />
//           </button>
//         </div>
//         <div className="grid md:grid-cols-3 gap-4">
//           {recentOpps.map((opp, i) => (
//             <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
//               <div className="flex items-start justify-between mb-2">
//                 <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{opp.type}</span>
//                 <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{opp.date_limite}</span>
//               </div>
//               <h3 className="text-sm font-semibold mb-1 leading-tight">{opp.titre}</h3>
//               <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{opp.description}</p>
//               <div className="flex items-center justify-between">
//                 <span className="text-xs text-muted-foreground">📍 {opp.pays}</span>
//                 <button className="text-xs text-primary font-medium hover:underline">{t.dashboard.apply}</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-primary/15 transition-colors" onClick={() => onNavigate('chat')}>
//         <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
//           <Bot className="w-6 h-6 text-primary" />
//         </div>
//         <div className="flex-1">
//           <p className="text-sm font-semibold">{t.dashboard.talkToEdubot}</p>
//           <p className="text-xs text-muted-foreground">{t.dashboard.edubotDesc}</p>
//         </div>
//         <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
//       </div>
//     </div>
//   );
// };

// // ─── EduBot Session Sidebar ───────────────────────────────────────────────────
// const EdubotSessionSidebar = ({ onNavigate, onClose }: { onNavigate: (panel: ActivePanel) => void; onClose?: () => void }) => {
//   const { t, language } = useLanguage();
//   const getRelativeTime = createGetRelativeTime(t, language);
//   const {
//     currentSessionId,
//     createNewSession,
//     switchSession,
//     deleteSession,
//     updateSessionTitle,
//     togglePinSession,
//     getSessionsByDate,
//     searchSessions,
//   } = useChat();

//   const [searchQuery, setSearchQuery] = useState('');
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editTitle, setEditTitle] = useState('');
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

//   const filteredSessions = searchQuery ? searchSessions(searchQuery) : null;
//   const sessionsByDate = getSessionsByDate();

//   const handleSaveTitle = () => {
//     if (editingId && editTitle.trim()) updateSessionTitle(editingId, editTitle.trim());
//     setEditingId(null);
//     setEditTitle('');
//   };

//   const handleExport = (session: ChatSession) => {
//     const content = session.messages.map(m => `[${m.timestamp}] ${m.isUser ? 'Vous' : 'EduBot'}: ${m.text}`).join('\n\n');
//     const blob = new Blob([content], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url; a.download = `${session.title.replace(/[^a-z0-9]/gi, '_')}.txt`; a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleSwitchSession = (id: string) => {
//     switchSession(id);
//     // Fermer la sidebar sur mobile après sélection
//     if (onClose) onClose();
//   };

//   const renderSession = (session: ChatSession, isPin = false) => {
//     const isActive = session.id === currentSessionId;
//     const isEditing = session.id === editingId;
//     const userMsgs = session.messages.filter(m => m.isUser);
//     const lastMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].text : '';
//     const msgCount = session.messages.filter(m => m.isUser).length;

//     return (
//       <div
//         key={session.id}
//         className={cn(
//           'group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
//           isActive
//             ? 'bg-primary/8 border border-primary/15'
//             : 'hover:bg-muted/60 border border-transparent'
//         )}
//         onClick={() => !isEditing && handleSwitchSession(session.id)}
//       >
//         <div className="flex items-start gap-2">
//           <div className={cn(
//             'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5',
//             isPin ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-primary/10'
//           )}>
//             {isPin ? '📌' : session.icon}
//           </div>
//           <div className="flex-1 min-w-0">
//             {isEditing ? (
//               <Input
//                 value={editTitle}
//                 onChange={e => setEditTitle(e.target.value)}
//                 onBlur={handleSaveTitle}
//                 onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
//                 className="h-6 text-xs"
//                 autoFocus
//                 onClick={e => e.stopPropagation()}
//               />
//             ) : (
//               <>
//                 <p className="text-sm font-semibold truncate leading-tight text-foreground">
//                   {session.title}
//                 </p>
//                 {lastMsg && (
//                   <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
//                     {lastMsg.slice(0, 45)}{lastMsg.length > 45 ? '...' : ''}
//                   </p>
//                 )}
//                 <p className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
//                   <Clock className="w-2.5 h-2.5" />
//                   {getRelativeTime(session.updatedAt)} · {msgCount} msg
//                 </p>
//               </>
//             )}
//           </div>
//           {!isEditing && (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1"
//                   onClick={e => e.stopPropagation()}
//                 >
//                   <MoreHorizontal className="w-3 h-3" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-44">
//                 <DropdownMenuItem onClick={() => togglePinSession(session.id)}>
//                   {session.isPinned ? <><PinOff className="w-3.5 h-3.5 mr-2" />{t.chat.unpin}</> : <><Pin className="w-3.5 h-3.5 mr-2" />{t.chat.pin}</>}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => { setEditingId(session.id); setEditTitle(session.title); }}>
//                   <Pencil className="w-3.5 h-3.5 mr-2" />{t.chat.rename}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => handleExport(session)}>
//                   <Download className="w-3.5 h-3.5 mr-2" />{t.chat.export}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   onClick={() => { setSessionToDelete(session.id); setDeleteDialogOpen(true); }}
//                   className="text-destructive focus:text-destructive"
//                 >
//                   <Trash2 className="w-3.5 h-3.5 mr-2" />{t.chat.delete}
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const pinnedSessions = [...(sessionsByDate.today || []), ...(sessionsByDate.yesterday || []), ...(sessionsByDate.thisWeek || []), ...(sessionsByDate.older || [])].filter(s => s.isPinned);
//   const recentSessions = [...(sessionsByDate.today || []), ...(sessionsByDate.yesterday || []), ...(sessionsByDate.thisWeek || []), ...(sessionsByDate.older || [])].filter(s => !s.isPinned);

//   return (
//     <div className="w-80 flex-shrink-0 flex flex-col bg-background h-full overflow-hidden">
//       {/* ── Header EduBot ── */}
//       <div className="px-4 pt-5 pb-4 flex-shrink-0">
//         {/* Back link + bouton fermer mobile */}
//         <div className="flex items-center justify-between mb-4">
//           <button
//             onClick={() => onNavigate('dashboard')}
//             className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
//           >
//             <ArrowRight className="w-3 h-3 rotate-180" /> {t.chat.backToDashboard}
//           </button>
//           {/* Bouton ✕ visible uniquement sur mobile (quand onClose est fourni) */}
//           {onClose && (
//             <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>

//         {/* EduBot identity */}
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center shadow-md">
//             <Bot className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <p className="text-sm font-bold text-foreground">EduBot</p>
//             <p className="text-xs text-primary font-medium">• {t.chat.aiOrientation}</p>
//           </div>
//         </div>

//         {/* New conversation button */}
//         <Button
//           onClick={() => { createNewSession(); if (onClose) onClose(); }}
//           className="w-full gap-2 h-10 text-sm font-semibold rounded-xl shadow-sm"
//           style={{ background: 'var(--gradient-primary)' }}
//         >
//           <Plus className="w-4 h-4" /> {t.chat.newConversation}
//         </Button>
//       </div>

//       {/* ── Search ── */}
//       <div className="px-4 pb-3 flex-shrink-0">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
//           <Input
//             value={searchQuery}
//             onChange={e => setSearchQuery(e.target.value)}
//             placeholder={t.chat.searchConversation}
//             className="pl-9 h-9 text-xs rounded-xl bg-muted/50 border-border/50"
//           />
//         </div>
//       </div>

//       {/* ── Sessions list ── */}
//       <ScrollArea className="flex-1 min-h-0 px-3">
//         <div className="pb-4">
//           {filteredSessions ? (
//             <div className="space-y-1">
//               {filteredSessions.length === 0
//                 ? <p className="text-xs text-muted-foreground text-center py-6">{t.chat.noResult}</p>
//                 : filteredSessions.map(s => renderSession(s, s.isPinned))
//               }
//             </div>
//           ) : (
//             <>
//               {pinnedSessions.length > 0 && (
//                 <div className="mb-4">
//                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 mb-2 flex items-center gap-1.5">
//                     <Pin className="w-2.5 h-2.5" /> {t.chat.pinned}
//                   </p>
//                   <div className="space-y-1">{pinnedSessions.map(s => renderSession(s, true))}</div>
//                 </div>
//               )}
//               {recentSessions.length > 0 && (
//                 <div>
//                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 mb-2">
//                     {t.chat.recent}
//                   </p>
//                   <div className="space-y-1">{recentSessions.map(s => renderSession(s, false))}</div>
//                 </div>
//               )}
//               {pinnedSessions.length === 0 && recentSessions.length === 0 && (
//                 <div className="flex flex-col items-center gap-2 py-12 text-center">
//                   <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
//                   <p className="text-xs text-muted-foreground">{t.chat.noConversation}</p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </ScrollArea>

//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>{t.chat.deleteConversation}</AlertDialogTitle>
//             <AlertDialogDescription>{t.chat.deleteIrreversible}</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => { if (sessionToDelete) deleteSession(sessionToDelete); setSessionToDelete(null); setDeleteDialogOpen(false); }}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {t.common.delete}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// // ─── Panel Chat (EduBot) — page dédiée avec sidebar sessions ─────────────────
// const ChatPanel = ({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) => {
//   const { toast } = useToast();
//   const { t } = useLanguage();
//   const isMobile = useIsMobile();
//   const [sidebarOpen, setSidebarOpen] = useState(false); // fermée par défaut sur mobile
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { currentSession, currentSessionId, addMessage, createNewSession } = useChat();

//   const [isTyping, setIsTyping] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const [isOffline, setIsOffline] = useState(false);
//   const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
//   const [conversationContext, setConversationContext] = useState<ConversationContext>({ previousMessages: [], topics: [] });

//   const allMessages = currentSession?.messages || [];
//   const userMessages = allMessages.filter(m => m.isUser);
//   const hasStarted = userMessages.length > 0;
//   const displayMessages = hasStarted ? allMessages : [];

//   useEffect(() => {
//     if (hasStarted) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [displayMessages, isTyping, hasStarted]);

//   useEffect(() => {
//     const handleOnline = () => setIsOffline(false);
//     const handleOffline = () => setIsOffline(true);
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
//     setIsOffline(!navigator.onLine);
//     return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
//   }, []);

//   useEffect(() => {
//     if (currentSession) {
//       const prev = currentSession.messages.filter(m => m.id !== '1').map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));
//       setConversationContext({ previousMessages: prev, topics: [] });
//     }
//   }, [currentSessionId]);

//   const sendMessageWithRetry = async (text: string, retryCount = 0): Promise<{ success: boolean; response?: string }> => {
//     const result = await chatWithBotCloud(text, { previousMessages: conversationContext.previousMessages.slice(-10), topics: conversationContext.topics });
//     if (result.success && result.data) return { success: true, response: result.data.response };
//     if (retryCount < MAX_RETRIES) { await new Promise(r => setTimeout(r, RETRY_DELAY)); return sendMessageWithRetry(text, retryCount + 1); }
//     throw new Error(result.error || 'Erreur de communication avec EduBot');
//   };

//   const handleSendMessage = async (text: string, chatAttachments?: import('@/components/chat/ChatInput').ChatAttachment[]) => {
//     let sessionId = currentSessionId;
//     if (!sessionId) sessionId = createNewSession();
//     if (isOffline) { toast({ title: 'Hors ligne', description: 'Vérifiez votre connexion.', variant: 'destructive' }); return; }

//     const msgAttachments = chatAttachments?.map(a => ({
//       name: a.file.name,
//       type: a.type,
//       url: a.previewUrl || (a.type !== 'file' ? URL.createObjectURL(a.file) : undefined),
//     }));

//     const displayText = text || (chatAttachments?.map(a => a.type === 'audio' ? '🎤 Message vocal' : `📎 ${a.file.name}`).join(', ') || '');

//     const userMsg = { id: Date.now().toString(), text: displayText, isUser: true, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), attachments: msgAttachments };
//     addMessage(sessionId, userMsg);
//     setIsTyping(true); setIsError(false); setLastFailedMessage(null);

//     const aiText = text || (chatAttachments?.map(a => a.type === 'audio' ? "[L'utilisateur a envoyé un message vocal]" : `[Fichier joint: ${a.file.name}]`).join(' ') || '');

//     try {
//       const result = await sendMessageWithRetry(aiText);
//       if (result.success && result.response) {
//         addMessage(sessionId, { id: (Date.now() + 1).toString(), text: result.response, isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) });
//         setConversationContext(prev => ({ previousMessages: [...prev.previousMessages, { role: 'user', content: aiText }, { role: 'assistant', content: result.response! }].slice(-20), topics: prev.topics }));
//       }
//     } catch {
//       setIsError(true); setLastFailedMessage(aiText);
//       toast({ title: 'Erreur de connexion', description: 'Impossible de joindre EduBot.', variant: 'destructive' });
//       addMessage(sessionId, { id: (Date.now() + 1).toString(), text: "Désolé, je n'ai pas pu traiter ta demande. Clique sur 'Réessayer'.", isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) });
//     } finally { setIsTyping(false); }
//   };

//   return (
//     <div className="flex flex-1 overflow-hidden h-full relative">

//       {/* Overlay sombre derrière la sidebar sur mobile */}
//       {isMobile && sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* ── Sidebar sessions ── */}
//       <div className={cn(
//         'flex-shrink-0 border-r border-border bg-background z-50',
//         isMobile
//           ? `fixed inset-y-0 left-0 w-80 transition-transform duration-300 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
//           : 'relative w-80'
//       )}>
//         <EdubotSessionSidebar
//           onNavigate={onNavigate}
//           onClose={isMobile ? () => setSidebarOpen(false) : undefined}
//         />
//       </div>

//       {/* ── Zone de chat ── */}
//       <div className="flex-1 flex flex-col min-w-0 bg-muted/20">

//         {/* Header conversation */}
//         <div className="h-16 flex items-center gap-3 px-4 border-b border-border bg-background flex-shrink-0">

//           {/* Bouton hamburger — mobile uniquement */}
//           {isMobile && (
//             <button
//               onClick={() => setSidebarOpen(v => !v)}
//               className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
//               aria-label="Ouvrir le menu"
//             >
//               <Menu className="w-5 h-5" />
//             </button>
//           )}

//           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center shadow-sm flex-shrink-0">
//             <Bot className="w-5 h-5 text-primary-foreground" />
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-base font-bold truncate text-foreground">{currentSession?.title || 'EduBot'}</p>
//             <p className="text-xs text-muted-foreground">{t.chat.advisor}</p>
//           </div>
//           <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
//             {isOffline
//               ? <><span className="w-2 h-2 rounded-full bg-destructive inline-block" /><span className="text-destructive">{t.chat.offline}</span></>
//               : isTyping
//                 ? <><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" /><span className="text-yellow-600 dark:text-yellow-400">{t.chat.typing}</span></>
//                 : <><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{t.chat.online}</>
//             }
//           </div>
//         </div>

//         {/* Bannière hors-ligne */}
//         {isOffline && (
//           <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 flex-shrink-0">
//             <WifiOff className="w-4 h-4 text-destructive flex-shrink-0" />
//             <p className="text-sm text-destructive">{t.chat.offlineBanner}</p>
//           </div>
//         )}

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto px-4 py-6">
//           <div className="max-w-3xl mx-auto space-y-1">
//             {displayMessages.map(msg => (
//               <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} attachments={msg.attachments} />
//             ))}
//             {!hasStarted && (
//               <div className="flex flex-col items-center justify-center h-full py-20 text-center">
//                 <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center mb-5 shadow-md">
//                   <Bot className="w-8 h-8 text-primary-foreground" />
//                 </div>
//                 <h2 className="text-xl font-bold mb-2 text-foreground">{t.chat.howCanIHelp}</h2>
//                 <p className="text-sm text-muted-foreground mb-6 max-w-xs">{t.chat.askQuestion}</p>
//                 <div className="flex flex-wrap gap-2 justify-center max-w-md">
//                   {t.suggestions.map((s, i) => (
//                     <button
//                       key={i}
//                       onClick={() => handleSendMessage(s)}
//                       className="text-xs px-4 py-2 rounded-full border border-border bg-background hover:bg-primary/5 hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground shadow-sm"
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {isTyping && (
//               <div className="flex gap-3 mb-4">
//                 <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center flex-shrink-0 shadow-sm">
//                   <Bot className="w-4 h-4 text-primary-foreground" />
//                 </div>
//                 <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border shadow-sm">
//                   <div className="flex gap-1 items-center h-4">
//                     {[0, 150, 300].map(delay => (
//                       <div key={delay} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//             {isError && lastFailedMessage && (
//               <div className="flex justify-center py-2">
//                 <Button variant="outline" size="sm" onClick={() => handleSendMessage(lastFailedMessage)} className="gap-2">
//                   <RefreshCw className="w-3.5 h-3.5" /> {t.chat.retry}
//                 </Button>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         {/* Input */}
//         <div className="bg-background px-4 py-4 flex-shrink-0 border-t border-border">
//           <div className="max-w-3xl mx-auto">
//             <ChatInput onSendMessage={handleSendMessage} disabled={isTyping || isOffline} placeholder={t.chat.placeholder} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Panel Profil (Personnalisation) ──────────────────────────────────────────
// const ProfilePanel = () => {
//   const { user, profile, updateProfile } = useAuthContext();
//   const { toast } = useToast();

//   const [formData, setFormData] = useState({ firstname: '', lastname: '', email: user?.email || '', location: '', niveau: '', filiere: '', interets: '', ambitions: '' });
//   const [originalData, setOriginalData] = useState({ firstname: '', lastname: '', email: user?.email || '', location: '', niveau: '', filiere: '', interets: '', ambitions: '' });
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     if (profile) {
//       const nameParts = profile.name?.split(' ') || [];
//       const data = {
//         firstname: nameParts[0] || '',
//         lastname: nameParts.slice(1).join(' ') || '',
//         email: profile.email || user?.email || '',
//         location: [profile.ville, profile.pays].filter(Boolean).join(', '),
//         niveau: profile.niveau || '',
//         filiere: profile.filiere || '',
//         interets: profile.interets?.join(', ') || '',
//         ambitions: (profile as any).ambitions || '',
//       };
//       setFormData(data);
//       setOriginalData(data);
//     }
//   }, [profile, user]);

//   const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
//   const handleChange = (key: string, value: string) => setFormData(p => ({ ...p, [key]: value }));

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       const locationParts = formData.location.split(',').map(s => s.trim());
//       await updateProfile({
//         name: `${formData.firstname} ${formData.lastname}`.trim(),
//         email: formData.email,
//         ville: locationParts[0] || null,
//         pays: locationParts[1] || null,
//         niveau: formData.niveau || null,
//         filiere: formData.filiere || null,
//         interets: formData.interets ? formData.interets.split(',').map(s => s.trim()).filter(Boolean) : null,
//         ambitions: formData.ambitions || null,
//       } as any);
//       setOriginalData({ ...formData });
//       toast({ title: '✅ Profil mis à jour', description: 'Tes informations ont été sauvegardées.' });
//     } catch {
//       toast({ title: 'Erreur', description: 'La mise à jour a échoué.', variant: 'destructive' });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="max-w-3xl mx-auto space-y-5">
//         <h1 className="text-xl font-bold">Personnalisation</h1>

//         <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
//           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
//             {formData.firstname ? (
//               <span className="text-xl font-bold text-primary-foreground">
//                 {formData.firstname.charAt(0).toUpperCase()}{formData.lastname.charAt(0).toUpperCase()}
//               </span>
//             ) : (
//               <User className="w-8 h-8 text-primary-foreground" />
//             )}
//           </div>
//           <div>
//             <p className="text-base font-bold">{formData.firstname || formData.lastname ? `${formData.firstname} ${formData.lastname}`.trim() : 'Ton nom'}</p>
//             <p className="text-sm text-muted-foreground">{formData.email || 'email@exemple.com'}</p>
//             {formData.niveau && <p className="text-xs text-primary font-medium mt-1">{formData.niveau}{formData.filiere ? ` · ${formData.filiere}` : ''}</p>}
//           </div>
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
//           <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Informations personnelles</h2>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">Prénom *</label>
//               <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Jean" value={formData.firstname} onChange={e => handleChange('firstname', e.target.value)} />
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">Nom</label>
//               <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Dupont" value={formData.lastname} onChange={e => handleChange('lastname', e.target.value)} />
//             </div>
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Email</label>
//             <input className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm text-muted-foreground cursor-not-allowed" value={formData.email} disabled />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Localisation</label>
//             <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Dakar, Sénégal" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
//           </div>
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
//           <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Parcours académique</h2>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Niveau d'études</label>
//             <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Licence, Master..." value={formData.niveau} onChange={e => handleChange('niveau', e.target.value)} />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Domaine d'études</label>
//             <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Informatique, Médecine..." value={formData.filiere} onChange={e => handleChange('filiere', e.target.value)} />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Centres d'intérêt</label>
//             <textarea className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Ex: Intelligence artificielle, Entrepreneuriat..." value={formData.interets} onChange={e => handleChange('interets', e.target.value)} />
//             <p className="text-xs text-muted-foreground">Sépare par des virgules</p>
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Ambitions</label>
//             <textarea className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Ex: Devenir ingénieur IA, Créer une startup..." value={formData.ambitions} onChange={e => handleChange('ambitions', e.target.value)} />
//             <p className="text-xs text-muted-foreground">Décris tes objectifs et aspirations</p>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3">
//           <Button variant="outline" className="rounded-xl" onClick={() => setFormData(originalData)} disabled={!hasChanges || isSaving}>Annuler</Button>
//           <Button className="rounded-xl" style={{ background: 'var(--gradient-primary)' }} onClick={handleSave} disabled={!hasChanges || isSaving}>
//             {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : 'Enregistrer'}
//           </Button>
//         </div>
//         {hasChanges && <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">⚠️ Modifications non sauvegardées</p>}
//       </div>
//     </div>
//   );
// };

// // ─── Panel Paramètres ─────────────────────────────────────────────────────────
// const SettingsPanel = () => {
//   const { toast } = useToast();
//   const { theme, setTheme } = useTheme();
//   const chatContext = useChat();

//   const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en' | 'ar'>('fr');
//   const [notifications, setNotifications] = useState({ emailNotifications: true, chatNotifications: true, opportunityAlerts: true, weeklyDigest: false });
//   const [privacy, setPrivacy] = useState({ profileVisible: true, showOnlineStatus: true, allowDataCollection: false, shareWithPartners: false });

//   useEffect(() => {
//     const savedLang = localStorage.getItem('educonnect_language') as 'fr' | 'en' | 'ar';
//     const savedNotifs = localStorage.getItem('educonnect_notifications');
//     const savedPrivacy = localStorage.getItem('educonnect_privacy');
//     if (savedLang) setCurrentLanguage(savedLang);
//     if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
//     if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
//   }, []);

//   const updateNotification = (key: string, value: boolean) => {
//     const updated = { ...notifications, [key]: value };
//     setNotifications(updated as typeof notifications);
//     localStorage.setItem('educonnect_notifications', JSON.stringify(updated));
//     toast({ title: 'Paramètre mis à jour', description: 'Tes préférences ont été sauvegardées.' });
//   };
//   const updatePrivacy = (key: string, value: boolean) => {
//     const updated = { ...privacy, [key]: value };
//     setPrivacy(updated as typeof privacy);
//     localStorage.setItem('educonnect_privacy', JSON.stringify(updated));
//     toast({ title: 'Paramètre mis à jour', description: 'Tes préférences ont été sauvegardées.' });
//   };
//   const handleLanguageChange = (lang: 'fr' | 'en' | 'ar') => {
//     setCurrentLanguage(lang);
//     localStorage.setItem('educonnect_language', lang);
//     const labels = { fr: 'Français 🇫🇷', en: 'English 🇬🇧', ar: 'العربية 🇸🇦' };
//     toast({ title: 'Langue changée', description: `Langue changée en ${labels[lang]}` });
//   };
//   const handleExportChats = () => {
//     const sessions = chatContext?.sessions || [];
//     if (sessions.length === 0) { toast({ title: 'Aucune conversation', description: 'Pas de conversations à exporter.', variant: 'destructive' }); return; }
//     const content = sessions.map(s => `=== ${s.title} ===\n${s.messages.map(m => `[${m.timestamp}] ${m.isUser ? 'Vous' : 'EduBot'}: ${m.text}`).join('\n')}`).join('\n\n' + '='.repeat(40) + '\n\n');
//     const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a'); a.href = url; a.download = `educonnect_conversations_${new Date().toISOString().split('T')[0]}.txt`; a.click();
//     URL.revokeObjectURL(url);
//     toast({ title: 'Conversations exportées', description: `${sessions.length} conversation(s) exportée(s).` });
//   };

//   const LANGS = [{ code: 'fr' as const, label: 'Français', flag: '🇫🇷' }, { code: 'en' as const, label: 'English', flag: '🇬🇧' }, { code: 'ar' as const, label: 'العربية', flag: '🇸🇦' }];

//   const ToggleRow = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
//     <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
//       <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
//       <button onClick={() => onChange(!checked)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', checked ? 'bg-primary' : 'bg-muted')}>
//         <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
//       </button>
//     </div>
//   );

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="max-w-3xl mx-auto space-y-5">
//         <h1 className="text-xl font-bold">Paramètres</h1>

//         <div className="bg-card border border-border rounded-2xl p-5">
//           <h2 className="font-semibold mb-4">Notifications</h2>
//           <ToggleRow label="Notifications par email" desc="Recevoir des emails pour les mises à jour importantes" checked={notifications.emailNotifications} onChange={v => updateNotification('emailNotifications', v)} />
//           <ToggleRow label="Notifications de chat" desc="Alertes pour les nouvelles réponses d'EduBot" checked={notifications.chatNotifications} onChange={v => updateNotification('chatNotifications', v)} />
//           <ToggleRow label="Alertes opportunités" desc="Être notifié des nouvelles bourses et programmes" checked={notifications.opportunityAlerts} onChange={v => updateNotification('opportunityAlerts', v)} />
//           <ToggleRow label="Résumé hebdomadaire" desc="Recevoir un récapitulatif chaque semaine" checked={notifications.weeklyDigest} onChange={v => updateNotification('weeklyDigest', v)} />
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-5">
//           <h2 className="font-semibold mb-4">Confidentialité</h2>
//           <ToggleRow label="Profil visible" desc="Permettre aux autres de voir ton profil" checked={privacy.profileVisible} onChange={v => updatePrivacy('profileVisible', v)} />
//           <ToggleRow label="Statut en ligne" desc="Afficher quand tu es connecté" checked={privacy.showOnlineStatus} onChange={v => updatePrivacy('showOnlineStatus', v)} />
//           <ToggleRow label="Collecte de données" desc="Autoriser l'analyse pour améliorer le service" checked={privacy.allowDataCollection} onChange={v => updatePrivacy('allowDataCollection', v)} />
//           <ToggleRow label="Partage partenaires" desc="Partager avec des universités partenaires" checked={privacy.shareWithPartners} onChange={v => updatePrivacy('shareWithPartners', v)} />
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-5">
//           <h2 className="font-semibold mb-4">Export des données</h2>
//           <Button variant="outline" className="gap-2 rounded-xl w-full sm:w-auto" onClick={handleExportChats}>
//             <Download className="w-4 h-4" /> Exporter mes conversations
//           </Button>
//           <p className="text-xs text-muted-foreground mt-2">Télécharge l'historique de tes conversations EduBot au format texte</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Guest Chat (sans connexion) ─────────────────────────────────────────────
// const GuestChat = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const { t } = useLanguage();
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const [messages, setMessages] = useState<Array<{ id: string; text: string; isUser: boolean; timestamp: string }>>([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const [isOffline, setIsOffline] = useState(!navigator.onLine);
//   const [conversationContext, setConversationContext] = useState<ConversationContext>({ previousMessages: [], topics: [] });

//   const hasStarted = messages.filter(m => m.isUser).length > 0;

//   useEffect(() => {
//     if (hasStarted) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, isTyping, hasStarted]);

//   useEffect(() => {
//     const handleOnline = () => setIsOffline(false);
//     const handleOffline = () => setIsOffline(true);
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
//     return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
//   }, []);

//   const handleSendMessage = async (text: string) => {
//     if (isOffline) { toast({ title: 'Hors ligne', description: 'Vérifiez votre connexion.', variant: 'destructive' }); return; }

//     const userMsg = { id: Date.now().toString(), text, isUser: true, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
//     setMessages(prev => [...prev, userMsg]);
//     setIsTyping(true);

//     try {
//       const result = await chatWithBotCloud(text, { previousMessages: conversationContext.previousMessages.slice(-10), topics: conversationContext.topics });
//       if (result.success && result.data) {
//         const botMsg = { id: (Date.now() + 1).toString(), text: result.data.response, isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
//         setMessages(prev => [...prev, botMsg]);
//         setConversationContext(prev => ({ previousMessages: [...prev.previousMessages, { role: 'user', content: text }, { role: 'assistant', content: result.data!.response }].slice(-20), topics: prev.topics }));
//       } else {
//         throw new Error('Erreur');
//       }
//     } catch {
//       setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Désolé, je n'ai pas pu traiter ta demande. Réessaie.", isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
//     } finally { setIsTyping(false); }
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <Navigation />
//       <main className="flex-1 flex flex-col pt-14">
//         <div className="flex-1 overflow-y-auto px-4 py-6">
//           <div className="max-w-2xl mx-auto space-y-1">
//             {!hasStarted && (
//               <div className="flex flex-col items-center justify-center py-20 text-center">
//                 <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center mb-5 shadow-md">
//                   <Bot className="w-8 h-8 text-primary-foreground" />
//                 </div>
//                 <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{t.chat.howCanIHelp}</h1>
//                 <p className="text-sm text-muted-foreground mb-6 max-w-xs">{t.chat.askQuestion}</p>
//                 <div className="flex flex-wrap gap-2 justify-center max-w-md">
//                   {t.suggestions.map((s, i) => (
//                     <button
//                       key={i}
//                       onClick={() => handleSendMessage(s)}
//                       className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border border-border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground shadow-sm"
//                     >
//                       {i === 0 && <GraduationCap className="w-3 h-3" />}
//                       {i === 1 && <Sparkles className="w-3 h-3" />}
//                       {i === 2 && <Globe className="w-3 h-3" />}
//                       {i === 3 && <Bot className="w-3 h-3" />}
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {messages.map(msg => (
//               <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />
//             ))}
//             {isTyping && (
//               <div className="flex gap-3 mb-4">
//                 <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center flex-shrink-0 shadow-sm">
//                   <Bot className="w-4 h-4 text-primary-foreground" />
//                 </div>
//                 <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border shadow-sm">
//                   <div className="flex gap-1 items-center h-4">
//                     {[0, 150, 300].map(delay => (
//                       <div key={delay} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         <div className="bg-background px-4 py-4 border-t border-border">
//           <div className="max-w-2xl mx-auto">
//             <ChatInput onSendMessage={handleSendMessage} disabled={isTyping || isOffline} placeholder={t.chat.placeholder} />
//             <p className="mt-2 text-xs text-muted-foreground text-center">
//               <button onClick={() => navigate('/auth')} className="text-primary hover:underline font-medium">{t.chat.connectYou}</button>
//               {' '}{t.chat.loginToSave}
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// const ChatContent = () => {
//   const { user } = useAuthContext();
//   const navigate = useNavigate();
//   const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard');

//   if (!user) {
//     return <GuestChat />;
//   }

//   if (activePanel === 'chat') {
//     return (
//       <div className="h-screen flex overflow-hidden bg-background">
//         <ChatPanel onNavigate={setActivePanel} />
//       </div>
//     );
//   }

//   return (
//     <AppLayout activePanel={activePanel} onNavigate={setActivePanel}>
//       {activePanel === 'dashboard'   && <DashboardPanel onNavigate={setActivePanel} />}
//       {activePanel === 'opportunites' && <OpportunitiesPanel />}
//       {activePanel === 'profil' && <ProfilePanel />}
//       {activePanel === 'parametres' && <SettingsPanel />}
//     </AppLayout>
//   );
// };

// const Index = () => <ChatContent />;
// export default Index;















// code precedent usais des données fictif

// import { useState, useRef, useEffect } from 'react';
// import AppLayout from '@/components/AppLayout';
// import ChatBubble from '@/components/chat/ChatBubble';
// import ChatInput from '@/components/chat/ChatInput';
// import { useChat, ChatSession } from '@/context/ChatContext';
// import { Bot, RefreshCw, WifiOff, Sparkles, GraduationCap, Globe, Search, Inbox, TrendingUp, ArrowRight, Clock, Plus, MessageSquare, MoreHorizontal, Pin, PinOff, Pencil, Trash2, Download, Loader2, User, Menu, X } from 'lucide-react';
// import { useLanguage } from '@/i18n/LanguageContext';
// import { chatWithBotCloud } from '@/services/api';
// import { useApp } from '@/context/AppContext';
// import { useToast } from '@/hooks/use-toast';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useAuthContext } from '@/context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import OpportunityCard from '@/components/OpportunityCard';
// import type { Opportunity } from '@/services/api';
// import type { ActivePanel } from '@/components/chat/ChatSidebar';
// import Navigation from '@/components/Navigation';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
// import { cn } from '@/lib/utils';
// import { useTheme } from 'next-themes';
// import { useIsMobile } from '@/hooks/use-mobile';
// import { supabase } from '@/integrations/supabase/client'; // 💡 IMPORT SUPABASE AJOUTÉ

// interface ConversationContext {
//   previousMessages: Array<{ role: string; content: string }>;
//   topics: string[];
// }

// const MAX_RETRIES = 3;
// const RETRY_DELAY = 2000;
// const ITEMS_PER_PAGE = 9;

// const createGetRelativeTime = (t: any, language: string) => (dateString: string): string => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffMins = Math.floor(diffMs / (1000 * 60));
//   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//   if (diffMins < 1) return t.chat.justNow;
//   if (diffMins < 60) return t.chat.minutesAgo.replace('{n}', String(diffMins));
//   if (diffHours < 24) return t.chat.hoursAgo.replace('{n}', String(diffHours));
//   if (diffDays === 1) return t.chat.yesterday;
//   if (diffDays < 7) return t.chat.daysAgo.replace('{n}', String(diffDays));
//   const locale = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
//   return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
// };

// // ─── Panel Opportunités (Branché sur l'IA) ───────────────────────────────────────────────────────
// const OpportunitiesPanel = () => {
//   const { t } = useLanguage();
//   const { user } = useAuthContext();
//   const [opportunities, setOpportunities] = useState<any[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOpps = async () => {
//       setLoading(true);
//       try {
//         let dataToSet = [];
//         if (user) {
//           // 🚀 Appel à l'API IA (Python locale)
//           const response = await fetch("http://localhost:5000/api/recommend", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ user_id: user.id }),
//           });
//           if (response.ok) {
//             const aiData = await response.json();
//             dataToSet = [...(aiData.bourses || []), ...(aiData.formations || [])];
//           }
//         } else {
//           // 😴 Pas connecté : On affiche tout depuis Supabase
//           const { data } = await (supabase as any).from("opportunities").select("*").order("created_at", { ascending: false });
//           dataToSet = data || [];
//         }
//         setOpportunities(dataToSet);
//       } catch (error) {
//         console.error("Erreur de chargement", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOpps();
//   }, [user]);

//   const filtered = opportunities.filter(opp => {
//     const q = searchQuery.toLowerCase();
//     const matchSearch = !q || opp.titre.toLowerCase().includes(q) || opp.description.toLowerCase().includes(q) || (opp.pays?.toLowerCase().includes(q) ?? false);
//     const matchCat = selectedCategory === 'all' || opp.type.toLowerCase() === selectedCategory.toLowerCase();
//     return matchSearch && matchCat;
//   });

//   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
//   const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="mb-6">
//         <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
//           {user ? "Vos Opportunités" : t.opportunities.title} 
//           <span className="bg-gradient-primary bg-clip-text text-transparent">
//             {user ? "Recommandées" : t.opportunities.available}
//           </span>
//           {user && <Sparkles className="w-5 h-5 text-primary" />}
//         </h1>
//         <p className="text-sm text-muted-foreground">
//           {user ? "Notre IA a analysé votre profil et sélectionné ces opportunités sur mesure." : t.opportunities.subtitle}
//         </p>
//       </div>

//       <div className="flex flex-col md:flex-row gap-3 mb-5">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input placeholder={t.opportunities.search} className="pl-9 rounded-xl" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
//         </div>
//         <Select value={selectedCategory} onValueChange={v => { setSelectedCategory(v); setCurrentPage(1); }}>
//           <SelectTrigger className="w-full md:w-[160px] rounded-xl">
//             <SelectValue placeholder={t.opportunities.category} />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">{t.opportunities.all}</SelectItem>
//             <SelectItem value="bourse">{t.opportunities.scholarships}</SelectItem>
//             <SelectItem value="formation">{t.opportunities.trainings}</SelectItem>
//             <SelectItem value="stage">{t.opportunities.internships}</SelectItem>
//             <SelectItem value="echange">{t.opportunities.exchanges}</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20 text-center">
//           <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
//           <p className="text-sm text-muted-foreground">Analyse IA en cours...</p>
//         </div>
//       ) : (
//         <>
//           <p className="text-xs text-muted-foreground mb-4">{filtered.length} {filtered.length > 1 ? t.opportunities.opportunityPlural : t.opportunities.opportunity}</p>
//           {filtered.length === 0 && (
//             <div className="flex flex-col items-center justify-center py-16 text-center">
//               <Inbox className="w-10 h-10 text-muted-foreground mb-3" />
//               <p className="text-sm text-muted-foreground">{t.opportunities.noResult}</p>
//               <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>{t.opportunities.reset}</Button>
//             </div>
//           )}
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {paginated.map((opp, i) => (
//               <div key={opp.id} className="animate-fade-in flex flex-col" style={{ animationDelay: `${i * 40}ms` }}>
//                 <OpportunityCard title={opp.titre} description={opp.description} category={opp.type} location={opp.pays || 'En ligne'} deadline={opp.date_limite || 'Non spécifié'} link={opp.lien || '#'} />
//                 {/* 🚀 BADGE SCORE IA */}
//                 {opp.score_ia && (
//                   <div className="mt-2 flex justify-end">
//                     <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[10px] px-2.5 py-1 rounded-full font-bold border border-green-200">
//                       <Sparkles className="w-3 h-3" /> Match IA : {Math.round(opp.score_ia * 100)}%
//                     </span>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//           {totalPages > 1 && (
//             <div className="flex justify-center gap-2 mt-8">
//               <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{t.opportunities.previous}</Button>
//               <span className="flex items-center text-sm text-muted-foreground px-3">{currentPage} / {totalPages}</span>
//               <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{t.opportunities.next}</Button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// // ─── Panel Dashboard (Accueil branché sur Supabase) ────────────────────────────────────────────────
// const DashboardPanel = ({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) => {
//   const { profile } = useAuthContext();
//   const { t } = useLanguage();
//   const [recentOpps, setRecentOpps] = useState<any[]>([]);
//   const firstName = profile?.name?.split(' ')[0] || '';

//   useEffect(() => {
//     const fetchRecent = async () => {
//       // On récupère les 3 dernières opportunités de la base de données
//       const { data } = await (supabase as any).from("opportunities").select("*").order("created_at", { ascending: false }).limit(3);
//       if (data) setRecentOpps(data);
//     };
//     fetchRecent();
//   }, []);

//   const fields = [profile?.name, profile?.email, profile?.niveau, profile?.filiere, profile?.pays, profile?.interets?.length];
//   const filled = fields.filter(Boolean).length;
//   const pct = Math.round((filled / fields.length) * 100);
//   const circumference = 2 * Math.PI * 28;
//   const dashOffset = circumference * (1 - pct / 100);

//   const stats = [
//     { icon: '🏆', color: 'bg-yellow-50 dark:bg-yellow-500/10', value: '100+', label: t.dashboard.scholarships, sublabel: t.dashboard.matchingProfile, trend: `Mises à jour IA` },
//     { icon: '🥇', color: 'bg-orange-50 dark:bg-orange-500/10', value: '3', label: t.dashboard.competitions, sublabel: t.dashboard.openNow, trend: `2 ${t.dashboard.urgent}` },
//     { icon: '🎓', color: 'bg-blue-50 dark:bg-blue-500/10', value: '30+', label: t.dashboard.trainings, sublabel: t.dashboard.available, trend: `Via Supabase` },
//     { icon: '🔖', color: 'bg-purple-50 dark:bg-purple-500/10', value: '5', label: t.dashboard.saved, sublabel: t.dashboard.dontMiss, trend: `2 ${t.dashboard.expireSoon}` },
//   ];

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="relative rounded-2xl overflow-hidden mb-6 p-6 bg-gradient-to-r from-primary to-[hsl(211,80%,45%)] text-primary-foreground">
//         <div className="relative z-10">
//           <h1 className="text-2xl font-bold mb-1">{t.dashboard.hello} {firstName} 👋</h1>
//           <p className="text-primary-foreground/80 text-sm">
//             <span className="font-semibold text-primary-foreground">Nouvelles opportunités</span> {t.dashboard.matchProfile}
//           </p>
//           <Button size="sm" className="mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold rounded-full text-xs px-4" onClick={() => onNavigate('opportunites')}>
//             {t.dashboard.viewOpportunities} <ArrowRight className="w-3 h-3 ml-1" />
//           </Button>
//         </div>
//         <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
//           <svg width="72" height="72" viewBox="0 0 72 72">
//             <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
//             <circle cx="36" cy="36" r="28" fill="none" stroke="white" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 36 36)" />
//             <text x="36" y="40" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{pct}%</text>
//           </svg>
//           <p className="text-[10px] text-primary-foreground/70 text-center leading-tight">{t.dashboard.profileCompleted}<br/>{t.dashboard.completed}</p>
//         </div>
//         <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
//         <div className="absolute -right-4 -top-6 w-24 h-24 rounded-full bg-white/5" />
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         {stats.map((s, i) => (
//           <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate('opportunites')}>
//             <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
//             <p className="text-2xl font-bold">{s.value}</p>
//             <p className="text-sm font-medium">{s.label}</p>
//             <p className="text-xs text-muted-foreground mb-2">{s.sublabel}</p>
//             <p className="text-xs text-primary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {s.trend}</p>
//           </div>
//         ))}
//       </div>

//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-base font-bold">{t.dashboard.todayOpportunities}</h2>
//           <button className="text-sm text-primary hover:underline flex items-center gap-1 font-medium" onClick={() => onNavigate('opportunites')}>
//             {t.dashboard.viewAll} <ArrowRight className="w-3.5 h-3.5" />
//           </button>
//         </div>
//         <div className="grid md:grid-cols-3 gap-4">
//           {recentOpps.map((opp, i) => (
//             <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
//               <div className="flex items-start justify-between mb-2">
//                 <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{opp.type}</span>
//                 <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{opp.date_limite || 'Non spécifié'}</span>
//               </div>
//               <h3 className="text-sm font-semibold mb-1 leading-tight">{opp.titre}</h3>
//               <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{opp.description}</p>
//               <div className="flex items-center justify-between">
//                 <span className="text-xs text-muted-foreground">📍 {opp.pays || 'En ligne'}</span>
//                 <button className="text-xs text-primary font-medium hover:underline">{t.dashboard.apply}</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-primary/15 transition-colors" onClick={() => onNavigate('chat')}>
//         <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
//           <Bot className="w-6 h-6 text-primary" />
//         </div>
//         <div className="flex-1">
//           <p className="text-sm font-semibold">{t.dashboard.talkToEdubot}</p>
//           <p className="text-xs text-muted-foreground">{t.dashboard.edubotDesc}</p>
//         </div>
//         <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
//       </div>
//     </div>
//   );
// };

// // ─── EduBot Session Sidebar ───────────────────────────────────────────────────
// const EdubotSessionSidebar = ({ onNavigate, onClose }: { onNavigate: (panel: ActivePanel) => void; onClose?: () => void }) => {
//   const { t, language } = useLanguage();
//   const getRelativeTime = createGetRelativeTime(t, language);
//   const {
//     currentSessionId,
//     createNewSession,
//     switchSession,
//     deleteSession,
//     updateSessionTitle,
//     togglePinSession,
//     getSessionsByDate,
//     searchSessions,
//   } = useChat();

//   const [searchQuery, setSearchQuery] = useState('');
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editTitle, setEditTitle] = useState('');
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

//   const filteredSessions = searchQuery ? searchSessions(searchQuery) : null;
//   const sessionsByDate = getSessionsByDate();

//   const handleSaveTitle = () => {
//     if (editingId && editTitle.trim()) updateSessionTitle(editingId, editTitle.trim());
//     setEditingId(null);
//     setEditTitle('');
//   };

//   const handleExport = (session: ChatSession) => {
//     const content = session.messages.map(m => `[${m.timestamp}] ${m.isUser ? 'Vous' : 'EduBot'}: ${m.text}`).join('\n\n');
//     const blob = new Blob([content], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url; a.download = `${session.title.replace(/[^a-z0-9]/gi, '_')}.txt`; a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleSwitchSession = (id: string) => {
//     switchSession(id);
//     if (onClose) onClose();
//   };

//   const renderSession = (session: ChatSession, isPin = false) => {
//     const isActive = session.id === currentSessionId;
//     const isEditing = session.id === editingId;
//     const userMsgs = session.messages.filter(m => m.isUser);
//     const lastMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].text : '';
//     const msgCount = session.messages.filter(m => m.isUser).length;

//     return (
//       <div
//         key={session.id}
//         className={cn(
//           'group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
//           isActive
//             ? 'bg-primary/8 border border-primary/15'
//             : 'hover:bg-muted/60 border border-transparent'
//         )}
//         onClick={() => !isEditing && handleSwitchSession(session.id)}
//       >
//         <div className="flex items-start gap-2">
//           <div className={cn(
//             'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5',
//             isPin ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-primary/10'
//           )}>
//             {isPin ? '📌' : session.icon}
//           </div>
//           <div className="flex-1 min-w-0">
//             {isEditing ? (
//               <Input
//                 value={editTitle}
//                 onChange={e => setEditTitle(e.target.value)}
//                 onBlur={handleSaveTitle}
//                 onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
//                 className="h-6 text-xs"
//                 autoFocus
//                 onClick={e => e.stopPropagation()}
//               />
//             ) : (
//               <>
//                 <p className="text-sm font-semibold truncate leading-tight text-foreground">
//                   {session.title}
//                 </p>
//                 {lastMsg && (
//                   <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
//                     {lastMsg.slice(0, 45)}{lastMsg.length > 45 ? '...' : ''}
//                   </p>
//                 )}
//                 <p className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
//                   <Clock className="w-2.5 h-2.5" />
//                   {getRelativeTime(session.updatedAt)} · {msgCount} msg
//                 </p>
//               </>
//             )}
//           </div>
//           {!isEditing && (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1"
//                   onClick={e => e.stopPropagation()}
//                 >
//                   <MoreHorizontal className="w-3 h-3" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-44">
//                 <DropdownMenuItem onClick={() => togglePinSession(session.id)}>
//                   {session.isPinned ? <><PinOff className="w-3.5 h-3.5 mr-2" />{t.chat.unpin}</> : <><Pin className="w-3.5 h-3.5 mr-2" />{t.chat.pin}</>}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => { setEditingId(session.id); setEditTitle(session.title); }}>
//                   <Pencil className="w-3.5 h-3.5 mr-2" />{t.chat.rename}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => handleExport(session)}>
//                   <Download className="w-3.5 h-3.5 mr-2" />{t.chat.export}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   onClick={() => { setSessionToDelete(session.id); setDeleteDialogOpen(true); }}
//                   className="text-destructive focus:text-destructive"
//                 >
//                   <Trash2 className="w-3.5 h-3.5 mr-2" />{t.chat.delete}
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const pinnedSessions = [...(sessionsByDate.today || []), ...(sessionsByDate.yesterday || []), ...(sessionsByDate.thisWeek || []), ...(sessionsByDate.older || [])].filter(s => s.isPinned);
//   const recentSessions = [...(sessionsByDate.today || []), ...(sessionsByDate.yesterday || []), ...(sessionsByDate.thisWeek || []), ...(sessionsByDate.older || [])].filter(s => !s.isPinned);

//   return (
//     <div className="w-80 flex-shrink-0 flex flex-col bg-background h-full overflow-hidden">
//       <div className="px-4 pt-5 pb-4 flex-shrink-0">
//         <div className="flex items-center justify-between mb-4">
//           <button
//             onClick={() => onNavigate('dashboard')}
//             className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
//           >
//             <ArrowRight className="w-3 h-3 rotate-180" /> {t.chat.backToDashboard}
//           </button>
//           {onClose && (
//             <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center shadow-md">
//             <Bot className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <p className="text-sm font-bold text-foreground">EduBot</p>
//             <p className="text-xs text-primary font-medium">• {t.chat.aiOrientation}</p>
//           </div>
//         </div>
//         <Button
//           onClick={() => { createNewSession(); if (onClose) onClose(); }}
//           className="w-full gap-2 h-10 text-sm font-semibold rounded-xl shadow-sm"
//           style={{ background: 'var(--gradient-primary)' }}
//         >
//           <Plus className="w-4 h-4" /> {t.chat.newConversation}
//         </Button>
//       </div>

//       <div className="px-4 pb-3 flex-shrink-0">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
//           <Input
//             value={searchQuery}
//             onChange={e => setSearchQuery(e.target.value)}
//             placeholder={t.chat.searchConversation}
//             className="pl-9 h-9 text-xs rounded-xl bg-muted/50 border-border/50"
//           />
//         </div>
//       </div>

//       <ScrollArea className="flex-1 min-h-0 px-3">
//         <div className="pb-4">
//           {filteredSessions ? (
//             <div className="space-y-1">
//               {filteredSessions.length === 0
//                 ? <p className="text-xs text-muted-foreground text-center py-6">{t.chat.noResult}</p>
//                 : filteredSessions.map(s => renderSession(s, s.isPinned))
//               }
//             </div>
//           ) : (
//             <>
//               {pinnedSessions.length > 0 && (
//                 <div className="mb-4">
//                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 mb-2 flex items-center gap-1.5">
//                     <Pin className="w-2.5 h-2.5" /> {t.chat.pinned}
//                   </p>
//                   <div className="space-y-1">{pinnedSessions.map(s => renderSession(s, true))}</div>
//                 </div>
//               )}
//               {recentSessions.length > 0 && (
//                 <div>
//                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 mb-2">
//                     {t.chat.recent}
//                   </p>
//                   <div className="space-y-1">{recentSessions.map(s => renderSession(s, false))}</div>
//                 </div>
//               )}
//               {pinnedSessions.length === 0 && recentSessions.length === 0 && (
//                 <div className="flex flex-col items-center gap-2 py-12 text-center">
//                   <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
//                   <p className="text-xs text-muted-foreground">{t.chat.noConversation}</p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </ScrollArea>

//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>{t.chat.deleteConversation}</AlertDialogTitle>
//             <AlertDialogDescription>{t.chat.deleteIrreversible}</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => { if (sessionToDelete) deleteSession(sessionToDelete); setSessionToDelete(null); setDeleteDialogOpen(false); }}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {t.common.delete}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// // ─── Panel Chat (EduBot) — page dédiée avec sidebar sessions ─────────────────
// const ChatPanel = ({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) => {
//   const { toast } = useToast();
//   const { t } = useLanguage();
//   const isMobile = useIsMobile();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { currentSession, currentSessionId, addMessage, createNewSession } = useChat();

//   const [isTyping, setIsTyping] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const [isOffline, setIsOffline] = useState(false);
//   const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
//   const [conversationContext, setConversationContext] = useState<ConversationContext>({ previousMessages: [], topics: [] });

//   const allMessages = currentSession?.messages || [];
//   const userMessages = allMessages.filter(m => m.isUser);
//   const hasStarted = userMessages.length > 0;
//   const displayMessages = hasStarted ? allMessages : [];

//   useEffect(() => {
//     if (hasStarted) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [displayMessages, isTyping, hasStarted]);

//   useEffect(() => {
//     const handleOnline = () => setIsOffline(false);
//     const handleOffline = () => setIsOffline(true);
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
//     setIsOffline(!navigator.onLine);
//     return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
//   }, []);

//   useEffect(() => {
//     if (currentSession) {
//       const prev = currentSession.messages.filter(m => m.id !== '1').map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));
//       setConversationContext({ previousMessages: prev, topics: [] });
//     }
//   }, [currentSessionId]);

//   const sendMessageWithRetry = async (text: string, retryCount = 0): Promise<{ success: boolean; response?: string }> => {
//     const result = await chatWithBotCloud(text, { previousMessages: conversationContext.previousMessages.slice(-10), topics: conversationContext.topics });
//     if (result.success && result.data) return { success: true, response: result.data.response };
//     if (retryCount < MAX_RETRIES) { await new Promise(r => setTimeout(r, RETRY_DELAY)); return sendMessageWithRetry(text, retryCount + 1); }
//     throw new Error(result.error || 'Erreur de communication avec EduBot');
//   };

//   const handleSendMessage = async (text: string, chatAttachments?: import('@/components/chat/ChatInput').ChatAttachment[]) => {
//     let sessionId = currentSessionId;
//     if (!sessionId) sessionId = createNewSession();
//     if (isOffline) { toast({ title: 'Hors ligne', description: 'Vérifiez votre connexion.', variant: 'destructive' }); return; }

//     const msgAttachments = chatAttachments?.map(a => ({
//       name: a.file.name,
//       type: a.type,
//       url: a.previewUrl || (a.type !== 'file' ? URL.createObjectURL(a.file) : undefined),
//     }));

//     const displayText = text || (chatAttachments?.map(a => a.type === 'audio' ? '🎤 Message vocal' : `📎 ${a.file.name}`).join(', ') || '');

//     const userMsg = { id: Date.now().toString(), text: displayText, isUser: true, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), attachments: msgAttachments };
//     addMessage(sessionId, userMsg);
//     setIsTyping(true); setIsError(false); setLastFailedMessage(null);

//     const aiText = text || (chatAttachments?.map(a => a.type === 'audio' ? "[L'utilisateur a envoyé un message vocal]" : `[Fichier joint: ${a.file.name}]`).join(' ') || '');

//     try {
//       const result = await sendMessageWithRetry(aiText);
//       if (result.success && result.response) {
//         addMessage(sessionId, { id: (Date.now() + 1).toString(), text: result.response, isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) });
//         setConversationContext(prev => ({ previousMessages: [...prev.previousMessages, { role: 'user', content: aiText }, { role: 'assistant', content: result.response! }].slice(-20), topics: prev.topics }));
//       }
//     } catch {
//       setIsError(true); setLastFailedMessage(aiText);
//       toast({ title: 'Erreur de connexion', description: 'Impossible de joindre EduBot.', variant: 'destructive' });
//       addMessage(sessionId, { id: (Date.now() + 1).toString(), text: "Désolé, je n'ai pas pu traiter ta demande. Clique sur 'Réessayer'.", isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) });
//     } finally { setIsTyping(false); }
//   };

//   return (
//     <div className="flex flex-1 overflow-hidden h-full relative">
//       {isMobile && sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       <div className={cn(
//         'flex-shrink-0 border-r border-border bg-background z-50',
//         isMobile
//           ? `fixed inset-y-0 left-0 w-80 transition-transform duration-300 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
//           : 'relative w-80'
//       )}>
//         <EdubotSessionSidebar
//           onNavigate={onNavigate}
//           onClose={isMobile ? () => setSidebarOpen(false) : undefined}
//         />
//       </div>

//       <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
//         <div className="h-16 flex items-center gap-3 px-4 border-b border-border bg-background flex-shrink-0">
//           {isMobile && (
//             <button
//               onClick={() => setSidebarOpen(v => !v)}
//               className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
//               aria-label="Ouvrir le menu"
//             >
//               <Menu className="w-5 h-5" />
//             </button>
//           )}

//           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center shadow-sm flex-shrink-0">
//             <Bot className="w-5 h-5 text-primary-foreground" />
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-base font-bold truncate text-foreground">{currentSession?.title || 'EduBot'}</p>
//             <p className="text-xs text-muted-foreground">{t.chat.advisor}</p>
//           </div>
//           <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
//             {isOffline
//               ? <><span className="w-2 h-2 rounded-full bg-destructive inline-block" /><span className="text-destructive">{t.chat.offline}</span></>
//               : isTyping
//                 ? <><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" /><span className="text-yellow-600 dark:text-yellow-400">{t.chat.typing}</span></>
//                 : <><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{t.chat.online}</>
//             }
//           </div>
//         </div>

//         {isOffline && (
//           <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 flex-shrink-0">
//             <WifiOff className="w-4 h-4 text-destructive flex-shrink-0" />
//             <p className="text-sm text-destructive">{t.chat.offlineBanner}</p>
//           </div>
//         )}

//         <div className="flex-1 overflow-y-auto px-4 py-6">
//           <div className="max-w-3xl mx-auto space-y-1">
//             {displayMessages.map(msg => (
//               <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} attachments={msg.attachments} />
//             ))}
//             {!hasStarted && (
//               <div className="flex flex-col items-center justify-center h-full py-20 text-center">
//                 <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center mb-5 shadow-md">
//                   <Bot className="w-8 h-8 text-primary-foreground" />
//                 </div>
//                 <h2 className="text-xl font-bold mb-2 text-foreground">{t.chat.howCanIHelp}</h2>
//                 <p className="text-sm text-muted-foreground mb-6 max-w-xs">{t.chat.askQuestion}</p>
//                 <div className="flex flex-wrap gap-2 justify-center max-w-md">
//                   {t.suggestions.map((s, i) => (
//                     <button
//                       key={i}
//                       onClick={() => handleSendMessage(s)}
//                       className="text-xs px-4 py-2 rounded-full border border-border bg-background hover:bg-primary/5 hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground shadow-sm"
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {isTyping && (
//               <div className="flex gap-3 mb-4">
//                 <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center flex-shrink-0 shadow-sm">
//                   <Bot className="w-4 h-4 text-primary-foreground" />
//                 </div>
//                 <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border shadow-sm">
//                   <div className="flex gap-1 items-center h-4">
//                     {[0, 150, 300].map(delay => (
//                       <div key={delay} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//             {isError && lastFailedMessage && (
//               <div className="flex justify-center py-2">
//                 <Button variant="outline" size="sm" onClick={() => handleSendMessage(lastFailedMessage)} className="gap-2">
//                   <RefreshCw className="w-3.5 h-3.5" /> {t.chat.retry}
//                 </Button>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         <div className="bg-background px-4 py-4 flex-shrink-0 border-t border-border">
//           <div className="max-w-3xl mx-auto">
//             <ChatInput onSendMessage={handleSendMessage} disabled={isTyping || isOffline} placeholder={t.chat.placeholder} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Panel Profil (Personnalisation) ──────────────────────────────────────────
// const ProfilePanel = () => {
//   const { user, profile, updateProfile } = useAuthContext();
//   const { toast } = useToast();

//   const [formData, setFormData] = useState({ firstname: '', lastname: '', email: user?.email || '', location: '', niveau: '', filiere: '', interets: '', ambitions: '' });
//   const [originalData, setOriginalData] = useState({ firstname: '', lastname: '', email: user?.email || '', location: '', niveau: '', filiere: '', interets: '', ambitions: '' });
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     if (profile) {
//       const nameParts = profile.name?.split(' ') || [];
//       const data = {
//         firstname: nameParts[0] || '',
//         lastname: nameParts.slice(1).join(' ') || '',
//         email: profile.email || user?.email || '',
//         location: [profile.ville, profile.pays].filter(Boolean).join(', '),
//         niveau: profile.niveau || '',
//         filiere: profile.filiere || '',
//         interets: profile.interets?.join(', ') || '',
//         ambitions: (profile as any).ambitions || '',
//       };
//       setFormData(data);
//       setOriginalData(data);
//     }
//   }, [profile, user]);

//   const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
//   const handleChange = (key: string, value: string) => setFormData(p => ({ ...p, [key]: value }));

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       const locationParts = formData.location.split(',').map(s => s.trim());
//       await updateProfile({
//         name: `${formData.firstname} ${formData.lastname}`.trim(),
//         email: formData.email,
//         ville: locationParts[0] || null,
//         pays: locationParts[1] || null,
//         niveau: formData.niveau || null,
//         filiere: formData.filiere || null,
//         interets: formData.interets ? formData.interets.split(',').map(s => s.trim()).filter(Boolean) : null,
//         ambitions: formData.ambitions || null,
//       } as any);
//       setOriginalData({ ...formData });
//       toast({ title: '✅ Profil mis à jour', description: 'Tes informations ont été sauvegardées.' });
//     } catch {
//       toast({ title: 'Erreur', description: 'La mise à jour a échoué.', variant: 'destructive' });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="max-w-3xl mx-auto space-y-5">
//         <h1 className="text-xl font-bold">Personnalisation</h1>

//         <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
//           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
//             {formData.firstname ? (
//               <span className="text-xl font-bold text-primary-foreground">
//                 {formData.firstname.charAt(0).toUpperCase()}{formData.lastname.charAt(0).toUpperCase()}
//               </span>
//             ) : (
//               <User className="w-8 h-8 text-primary-foreground" />
//             )}
//           </div>
//           <div>
//             <p className="text-base font-bold">{formData.firstname || formData.lastname ? `${formData.firstname} ${formData.lastname}`.trim() : 'Ton nom'}</p>
//             <p className="text-sm text-muted-foreground">{formData.email || 'email@exemple.com'}</p>
//             {formData.niveau && <p className="text-xs text-primary font-medium mt-1">{formData.niveau}{formData.filiere ? ` · ${formData.filiere}` : ''}</p>}
//           </div>
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
//           <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Informations personnelles</h2>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">Prénom *</label>
//               <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Jean" value={formData.firstname} onChange={e => handleChange('firstname', e.target.value)} />
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">Nom</label>
//               <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Dupont" value={formData.lastname} onChange={e => handleChange('lastname', e.target.value)} />
//             </div>
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Email</label>
//             <input className="w-full h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm text-muted-foreground cursor-not-allowed" value={formData.email} disabled />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Localisation</label>
//             <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Dakar, Sénégal" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
//           </div>
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
//           <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Parcours académique</h2>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Niveau d'études</label>
//             <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Licence, Master..." value={formData.niveau} onChange={e => handleChange('niveau', e.target.value)} />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Domaine d'études</label>
//             <input className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Informatique, Médecine..." value={formData.filiere} onChange={e => handleChange('filiere', e.target.value)} />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Centres d'intérêt</label>
//             <textarea className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Ex: Intelligence artificielle, Entrepreneuriat..." value={formData.interets} onChange={e => handleChange('interets', e.target.value)} />
//             <p className="text-xs text-muted-foreground">Sépare par des virgules</p>
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Ambitions</label>
//             <textarea className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Ex: Devenir ingénieur IA, Créer une startup..." value={formData.ambitions} onChange={e => handleChange('ambitions', e.target.value)} />
//             <p className="text-xs text-muted-foreground">Décris tes objectifs et aspirations</p>
//           </div>
//         </div>

//         <div className="flex justify-end gap-3">
//           <Button variant="outline" className="rounded-xl" onClick={() => setFormData(originalData)} disabled={!hasChanges || isSaving}>Annuler</Button>
//           <Button className="rounded-xl" style={{ background: 'var(--gradient-primary)' }} onClick={handleSave} disabled={!hasChanges || isSaving}>
//             {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : 'Enregistrer'}
//           </Button>
//         </div>
//         {hasChanges && <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">⚠️ Modifications non sauvegardées</p>}
//       </div>
//     </div>
//   );
// };

// // ─── Panel Paramètres ─────────────────────────────────────────────────────────
// const SettingsPanel = () => {
//   const { toast } = useToast();
//   const { theme, setTheme } = useTheme();
//   const chatContext = useChat();

//   const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en' | 'ar'>('fr');
//   const [notifications, setNotifications] = useState({ emailNotifications: true, chatNotifications: true, opportunityAlerts: true, weeklyDigest: false });
//   const [privacy, setPrivacy] = useState({ profileVisible: true, showOnlineStatus: true, allowDataCollection: false, shareWithPartners: false });

//   useEffect(() => {
//     const savedLang = localStorage.getItem('educonnect_language') as 'fr' | 'en' | 'ar';
//     const savedNotifs = localStorage.getItem('educonnect_notifications');
//     const savedPrivacy = localStorage.getItem('educonnect_privacy');
//     if (savedLang) setCurrentLanguage(savedLang);
//     if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
//     if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
//   }, []);

//   const updateNotification = (key: string, value: boolean) => {
//     const updated = { ...notifications, [key]: value };
//     setNotifications(updated as typeof notifications);
//     localStorage.setItem('educonnect_notifications', JSON.stringify(updated));
//     toast({ title: 'Paramètre mis à jour', description: 'Tes préférences ont été sauvegardées.' });
//   };
//   const updatePrivacy = (key: string, value: boolean) => {
//     const updated = { ...privacy, [key]: value };
//     setPrivacy(updated as typeof privacy);
//     localStorage.setItem('educonnect_privacy', JSON.stringify(updated));
//     toast({ title: 'Paramètre mis à jour', description: 'Tes préférences ont été sauvegardées.' });
//   };
//   const handleLanguageChange = (lang: 'fr' | 'en' | 'ar') => {
//     setCurrentLanguage(lang);
//     localStorage.setItem('educonnect_language', lang);
//     const labels = { fr: 'Français 🇫🇷', en: 'English 🇬🇧', ar: 'العربية 🇸🇦' };
//     toast({ title: 'Langue changée', description: `Langue changée en ${labels[lang]}` });
//   };
//   const handleExportChats = () => {
//     const sessions = chatContext?.sessions || [];
//     if (sessions.length === 0) { toast({ title: 'Aucune conversation', description: 'Pas de conversations à exporter.', variant: 'destructive' }); return; }
//     const content = sessions.map(s => `=== ${s.title} ===\n${s.messages.map(m => `[${m.timestamp}] ${m.isUser ? 'Vous' : 'EduBot'}: ${m.text}`).join('\n')}`).join('\n\n' + '='.repeat(40) + '\n\n');
//     const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a'); a.href = url; a.download = `educonnect_conversations_${new Date().toISOString().split('T')[0]}.txt`; a.click();
//     URL.revokeObjectURL(url);
//     toast({ title: 'Conversations exportées', description: `${sessions.length} conversation(s) exportée(s).` });
//   };

//   const LANGS = [{ code: 'fr' as const, label: 'Français', flag: '🇫🇷' }, { code: 'en' as const, label: 'English', flag: '🇬🇧' }, { code: 'ar' as const, label: 'العربية', flag: '🇸🇦' }];

//   const ToggleRow = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
//     <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
//       <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
//       <button onClick={() => onChange(!checked)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', checked ? 'bg-primary' : 'bg-muted')}>
//         <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
//       </button>
//     </div>
//   );

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="max-w-3xl mx-auto space-y-5">
//         <h1 className="text-xl font-bold">Paramètres</h1>

//         <div className="bg-card border border-border rounded-2xl p-5">
//           <h2 className="font-semibold mb-4">Notifications</h2>
//           <ToggleRow label="Notifications par email" desc="Recevoir des emails pour les mises à jour importantes" checked={notifications.emailNotifications} onChange={v => updateNotification('emailNotifications', v)} />
//           <ToggleRow label="Notifications de chat" desc="Alertes pour les nouvelles réponses d'EduBot" checked={notifications.chatNotifications} onChange={v => updateNotification('chatNotifications', v)} />
//           <ToggleRow label="Alertes opportunités" desc="Être notifié des nouvelles bourses et programmes" checked={notifications.opportunityAlerts} onChange={v => updateNotification('opportunityAlerts', v)} />
//           <ToggleRow label="Résumé hebdomadaire" desc="Recevoir un récapitulatif chaque semaine" checked={notifications.weeklyDigest} onChange={v => updateNotification('weeklyDigest', v)} />
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-5">
//           <h2 className="font-semibold mb-4">Confidentialité</h2>
//           <ToggleRow label="Profil visible" desc="Permettre aux autres de voir ton profil" checked={privacy.profileVisible} onChange={v => updatePrivacy('profileVisible', v)} />
//           <ToggleRow label="Statut en ligne" desc="Afficher quand tu es connecté" checked={privacy.showOnlineStatus} onChange={v => updatePrivacy('showOnlineStatus', v)} />
//           <ToggleRow label="Collecte de données" desc="Autoriser l'analyse pour améliorer le service" checked={privacy.allowDataCollection} onChange={v => updatePrivacy('allowDataCollection', v)} />
//           <ToggleRow label="Partage partenaires" desc="Partager avec des universités partenaires" checked={privacy.shareWithPartners} onChange={v => updatePrivacy('shareWithPartners', v)} />
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-5">
//           <h2 className="font-semibold mb-4">Export des données</h2>
//           <Button variant="outline" className="gap-2 rounded-xl w-full sm:w-auto" onClick={handleExportChats}>
//             <Download className="w-4 h-4" /> Exporter mes conversations
//           </Button>
//           <p className="text-xs text-muted-foreground mt-2">Télécharge l'historique de tes conversations EduBot au format texte</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Guest Chat (sans connexion) ─────────────────────────────────────────────
// const GuestChat = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const { t } = useLanguage();
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const [messages, setMessages] = useState<Array<{ id: string; text: string; isUser: boolean; timestamp: string }>>([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const [isOffline, setIsOffline] = useState(!navigator.onLine);
//   const [conversationContext, setConversationContext] = useState<ConversationContext>({ previousMessages: [], topics: [] });

//   const hasStarted = messages.filter(m => m.isUser).length > 0;

//   useEffect(() => {
//     if (hasStarted) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, isTyping, hasStarted]);

//   useEffect(() => {
//     const handleOnline = () => setIsOffline(false);
//     const handleOffline = () => setIsOffline(true);
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
//     return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
//   }, []);

//   const handleSendMessage = async (text: string) => {
//     if (isOffline) { toast({ title: 'Hors ligne', description: 'Vérifiez votre connexion.', variant: 'destructive' }); return; }

//     const userMsg = { id: Date.now().toString(), text, isUser: true, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
//     setMessages(prev => [...prev, userMsg]);
//     setIsTyping(true);

//     try {
//       const result = await chatWithBotCloud(text, { previousMessages: conversationContext.previousMessages.slice(-10), topics: conversationContext.topics });
//       if (result.success && result.data) {
//         const botMsg = { id: (Date.now() + 1).toString(), text: result.data.response, isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
//         setMessages(prev => [...prev, botMsg]);
//         setConversationContext(prev => ({ previousMessages: [...prev.previousMessages, { role: 'user', content: text }, { role: 'assistant', content: result.data!.response }].slice(-20), topics: prev.topics }));
//       } else {
//         throw new Error('Erreur');
//       }
//     } catch {
//       setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Désolé, je n'ai pas pu traiter ta demande. Réessaie.", isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
//     } finally { setIsTyping(false); }
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <Navigation />
//       <main className="flex-1 flex flex-col pt-14">
//         <div className="flex-1 overflow-y-auto px-4 py-6">
//           <div className="max-w-2xl mx-auto space-y-1">
//             {!hasStarted && (
//               <div className="flex flex-col items-center justify-center py-20 text-center">
//                 <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center mb-5 shadow-md">
//                   <Bot className="w-8 h-8 text-primary-foreground" />
//                 </div>
//                 <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{t.chat.howCanIHelp}</h1>
//                 <p className="text-sm text-muted-foreground mb-6 max-w-xs">{t.chat.askQuestion}</p>
//                 <div className="flex flex-wrap gap-2 justify-center max-w-md">
//                   {t.suggestions.map((s, i) => (
//                     <button
//                       key={i}
//                       onClick={() => handleSendMessage(s)}
//                       className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border border-border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground shadow-sm"
//                     >
//                       {i === 0 && <GraduationCap className="w-3 h-3" />}
//                       {i === 1 && <Sparkles className="w-3 h-3" />}
//                       {i === 2 && <Globe className="w-3 h-3" />}
//                       {i === 3 && <Bot className="w-3 h-3" />}
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {messages.map(msg => (
//               <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />
//             ))}
//             {isTyping && (
//               <div className="flex gap-3 mb-4">
//                 <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-[hsl(211,80%,50%)] flex items-center justify-center flex-shrink-0 shadow-sm">
//                   <Bot className="w-4 h-4 text-primary-foreground" />
//                 </div>
//                 <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border shadow-sm">
//                   <div className="flex gap-1 items-center h-4">
//                     {[0, 150, 300].map(delay => (
//                       <div key={delay} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         <div className="bg-background px-4 py-4 border-t border-border">
//           <div className="max-w-2xl mx-auto">
//             <ChatInput onSendMessage={handleSendMessage} disabled={isTyping || isOffline} placeholder={t.chat.placeholder} />
//             <p className="mt-2 text-xs text-muted-foreground text-center">
//               <button onClick={() => navigate('/auth')} className="text-primary hover:underline font-medium">{t.chat.connectYou}</button>
//               {' '}{t.chat.loginToSave}
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// const ChatContent = () => {
//   const { user } = useAuthContext();
//   const navigate = useNavigate();
//   const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard');

//   if (!user) {
//     return <GuestChat />;
//   }

//   if (activePanel === 'chat') {
//     return (
//       <div className="h-screen flex overflow-hidden bg-background">
//         <ChatPanel onNavigate={setActivePanel} />
//       </div>
//     );
//   }

//   return (
//     <AppLayout activePanel={activePanel} onNavigate={setActivePanel}>
//       {activePanel === 'dashboard'   && <DashboardPanel onNavigate={setActivePanel} />}
//       {activePanel === 'opportunites' && <OpportunitiesPanel />}
//       {activePanel === 'profil' && <ProfilePanel />}
//       {activePanel === 'parametres' && <SettingsPanel />}
//     </AppLayout>
//   );
// };

// const Index = () => <ChatContent />;
// export default Index;
















// code qui marche mais un petit soucis avec les infos du profil

// import { useState, useRef, useEffect } from 'react';
// import AppLayout from '@/components/AppLayout';
// import ChatBubble from '@/components/chat/ChatBubble';
// import ChatInput from '@/components/chat/ChatInput';
// import { useChat, ChatSession } from '@/context/ChatContext';
// import { Bot, RefreshCw, WifiOff, Sparkles, GraduationCap, Globe, Search, Inbox, TrendingUp, ArrowRight, Clock, Plus, MessageSquare, MoreHorizontal, Pin, PinOff, Pencil, Trash2, Download, Loader2, User, Menu, X, Briefcase, Award } from 'lucide-react';
// import { useLanguage } from '@/i18n/LanguageContext';
// import { chatWithBotCloud } from '@/services/api';
// import { useApp } from '@/context/AppContext';
// import { useToast } from '@/hooks/use-toast';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useAuthContext } from '@/context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import OpportunityCard from '@/components/OpportunityCard';
// import type { Opportunity } from '@/services/api';
// import type { ActivePanel } from '@/components/chat/ChatSidebar';
// import Navigation from '@/components/Navigation';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
// import { cn } from '@/lib/utils';
// import { useTheme } from 'next-themes';
// import { useIsMobile } from '@/hooks/use-mobile';
// import { supabase } from '@/integrations/supabase/client';

// // --- TYPES & CONSTANTES ---
// interface ConversationContext {
//   previousMessages: Array<{ role: string; content: string }>;
//   topics: string[];
// }

// const ITEMS_PER_PAGE = 9;

// // ─── 1. PANEL OPPORTUNITÉS (IA + SUPABASE) ───────────────────────────────────
// const OpportunitiesPanel = () => {
//   const { t } = useLanguage();
//   const { user } = useAuthContext();
//   const [opportunities, setOpportunities] = useState<any[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOpps = async () => {
//       setLoading(true);
//       try {
//         let dataToSet = [];
//         if (user) {
//           const response = await fetch("http://localhost:5000/api/recommend", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ user_id: user.id }),
//           });
//           if (response.ok) {
//             const aiData = await response.json();
//             dataToSet = aiData.recommandations || [];
//           }
//         } else {
//           const { data } = await (supabase as any).from("opportunities").select("*").order("created_at", { ascending: false });
//           dataToSet = data || [];
//         }
//         setOpportunities(dataToSet);
//       } catch (error) {
//         console.error("Erreur de chargement", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOpps();
//   }, [user]);

//   const filtered = opportunities.filter(opp => {
//     const q = searchQuery.toLowerCase();
//     const matchSearch = !q || opp.titre.toLowerCase().includes(q) || opp.description.toLowerCase().includes(q);
//     const matchCat = selectedCategory === 'all' || opp.type.toLowerCase() === selectedCategory.toLowerCase();
//     return matchSearch && matchCat;
//   });

//   const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
//   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="mb-6">
//         <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
//           {user ? "Vos Opportunités Recommandées" : "Opportunités Disponibles"}
//           <Sparkles className="w-5 h-5 text-primary" />
//         </h1>
//         <p className="text-sm text-muted-foreground">Analysées par notre IA : bourses, stages et concours.</p>
//       </div>

//       <div className="flex flex-col md:flex-row gap-3 mb-5">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input placeholder="Rechercher..." className="pl-9 rounded-xl" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
//         </div>
//         <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//           <SelectTrigger className="w-full md:w-[180px] rounded-xl">
//             <SelectValue placeholder="Catégories" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">Toutes</SelectItem>
//             <SelectItem value="bourse">Bourses</SelectItem>
//             <SelectItem value="formation">Formations</SelectItem>
//             <SelectItem value="stage">Stages</SelectItem>
//             <SelectItem value="concours">Concours</SelectItem>
//             <SelectItem value="emploi">Emplois</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary mb-2" /><p className="text-sm text-muted-foreground">Analyse IA...</p></div>
//       ) : (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
//           {paginated.map((opp) => (
//             <div key={opp.id} className="flex flex-col">
//               <OpportunityCard title={opp.titre} description={opp.description} category={opp.type} location={opp.pays} deadline={opp.date_limite} link={opp.lien} />
//               {opp.score_ia && (
//                 <div className="mt-2 text-right"><span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">✨ Match IA : {Math.round(opp.score_ia * 100)}%</span></div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── 2. PANEL DASHBOARD (ACCUEIL) ──────────────────────────────────────────
// const DashboardPanel = ({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) => {
//   const { profile } = useAuthContext();
//   const [recentOpps, setRecentOpps] = useState<any[]>([]);

//   useEffect(() => {
//     (supabase as any).from("opportunities").select("*").order("created_at", { ascending: false }).limit(3)
//       .then(({ data }: any) => setRecentOpps(data || []));
//   }, []);

//   return (
//     <div className="flex-1 overflow-y-auto px-6 py-6">
//       <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white mb-8 shadow-lg">
//         <h1 className="text-2xl font-bold mb-1">Bonjour {profile?.name?.split(' ')[0]} 👋</h1>
//         <p className="text-white/80">Nous avons trouvé {recentOpps.length} nouvelles opportunités pour vous.</p>
//         <Button size="sm" className="mt-4 bg-white text-primary hover:bg-white/90 rounded-full" onClick={() => onNavigate('opportunites')}>Voir tout</Button>
//       </div>

//       <div className="mb-6">
//         <h2 className="text-lg font-bold mb-4">Derniers ajouts</h2>
//         <div className="grid md:grid-cols-3 gap-4">
//           {recentOpps.map((opp, i) => (
//             <div key={i} className="p-4 border rounded-xl bg-card hover:shadow-md transition-shadow">
//               <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{opp.type}</span>
//               <h3 className="text-sm font-bold mt-2 line-clamp-1">{opp.titre}</h3>
//               <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{opp.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── 3. PANEL CHAT (EDUBOT RÉTABLI) ──────────────────────────────────────────
// const ChatPanel = ({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) => {
//   const { toast } = useToast();
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { currentSession, currentSessionId, addMessage, createNewSession } = useChat();
//   const [isTyping, setIsTyping] = useState(false);
//   const [conversationContext, setConversationContext] = useState<ConversationContext>({ previousMessages: [], topics: [] });

//   const allMessages = currentSession?.messages || [];

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [allMessages, isTyping]);

//   const handleSendMessage = async (text: string) => {
//     let sessionId = currentSessionId;
//     if (!sessionId) sessionId = createNewSession();

//     addMessage(sessionId, { 
//       id: Date.now().toString(), 
//       text, 
//       isUser: true, 
//       timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) 
//     });
//     setIsTyping(true);

//     try {
//       const result = await chatWithBotCloud(text, { 
//         previousMessages: conversationContext.previousMessages.slice(-10), 
//         topics: [] 
//       });

//       if (result.success && result.data) {
//         addMessage(sessionId, { 
//           id: (Date.now() + 1).toString(), 
//           text: result.data.response, 
//           isUser: false, 
//           timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) 
//         });

//         setConversationContext(prev => ({
//           previousMessages: [...prev.previousMessages, { role: 'user', content: text }, { role: 'assistant', content: result.data!.response }].slice(-20),
//           topics: []
//         }));
//       }
//     } catch (error) {
//       toast({ title: 'Erreur', description: 'EduBot indisponible.', variant: 'destructive' });
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   return (
//     <div className="flex-1 flex flex-col h-full bg-muted/20 overflow-hidden">
//       <div className="h-16 flex items-center gap-3 px-4 border-b bg-background flex-shrink-0">
//         <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}><ArrowRight className="rotate-180 w-4 h-4 mr-1"/> Retour</Button>
//         <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
//         <p className="text-sm font-bold">EduBot IA</p>
//       </div>
//       <div className="flex-1 overflow-y-auto px-4 py-6">
//         <div className="max-w-3xl mx-auto space-y-4">
//           {allMessages.map(msg => <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />)}
//           {isTyping && <div className="italic text-xs text-muted-foreground animate-pulse">EduBot répond...</div>}
//           <div ref={messagesEndRef} />
//         </div>
//       </div>
//       <div className="p-4 bg-background border-t">
//         <div className="max-w-3xl mx-auto">
//           <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} placeholder="Posez une question à EduBot..." />
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── 4. AUTRES PANELS & ROUTAGE ─────────────────────────────────────────────
// const ProfilePanel = () => <div className="p-6"><h1>Mon Profil</h1><p>Personnalisez vos données.</p></div>;
// const SettingsPanel = () => <div className="p-6"><h1>Paramètres</h1><p>Gérez votre compte.</p></div>;

// const GuestChat = () => (
//   <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted/20">
//     <Bot className="w-16 h-16 text-primary mb-4" />
//     <h1 className="text-3xl font-bold mb-8">EduConnect Afrika</h1>
//     <Button onClick={() => window.location.href = '/auth'}>Se connecter</Button>
//   </div>
// );

// const ChatContent = () => {
//   const { user } = useAuthContext();
//   const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard');

//   if (!user) return <GuestChat />;

//   if (activePanel === 'chat') return <ChatPanel onNavigate={setActivePanel} />;

//   return (
//     <AppLayout activePanel={activePanel} onNavigate={setActivePanel}>
//       {activePanel === 'dashboard'   && <DashboardPanel onNavigate={setActivePanel} />}
//       {activePanel === 'opportunites' && <OpportunitiesPanel />}
//       {activePanel === 'profil' && <ProfilePanel />}
//       {activePanel === 'parametres' && <SettingsPanel />}
//     </AppLayout>
//   );
// };

// const Index = () => <ChatContent />;
// export default Index;


















import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import { useChat, ChatSession } from '@/context/ChatContext';
import { Bot, RefreshCw, WifiOff, Sparkles, GraduationCap, Globe, Search, Inbox, TrendingUp, ArrowRight, Clock, Plus, MessageSquare, MoreHorizontal, Pin, PinOff, Pencil, Trash2, Download, Loader2, User, Menu, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { chatWithBotCloud } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OpportunityCard from '@/components/OpportunityCard';
import type { Opportunity } from '@/services/api';
import type { ActivePanel } from '@/components/chat/ChatSidebar';
import Navigation from '@/components/Navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

// --- TYPES & UTILITAIRES ---
interface ConversationContext {
  previousMessages: Array<{ role: string; content: string }>;
  topics: string[];
}

const ITEMS_PER_PAGE = 9;

const createGetRelativeTime = (t: any, language: string) => (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 1) return t.chat.justNow;
  if (diffMins < 60) return t.chat.minutesAgo.replace('{n}', String(diffMins));
  if (diffHours < 24) return t.chat.hoursAgo.replace('{n}', String(diffHours));
  if (diffDays === 1) return t.chat.yesterday;
  if (diffDays < 7) return t.chat.daysAgo.replace('{n}', String(diffDays));
  const locale = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
};

// ─── 1. EDUBOT SESSION SIDEBAR ──────────────────────────────────────────────────
const EdubotSessionSidebar = ({ onNavigate, onClose }: { onNavigate: (panel: ActivePanel) => void; onClose?: () => void }) => {
  const { t, language } = useLanguage();
  const getRelativeTime = createGetRelativeTime(t, language);
  const { currentSessionId, createNewSession, switchSession, deleteSession, updateSessionTitle, togglePinSession, getSessionsByDate, searchSessions } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const filteredSessions = searchQuery ? searchSessions(searchQuery) : null;
  const sessionsByDate = getSessionsByDate();

  const handleSaveTitle = () => {
    if (editingId && editTitle.trim()) updateSessionTitle(editingId, editTitle.trim());
    setEditingId(null); setEditTitle('');
  };

  const handleSwitchSession = (id: string) => {
    switchSession(id);
    if (onClose) onClose();
  };

  const renderSession = (session: ChatSession, isPin = false) => {
    const isActive = session.id === currentSessionId;
    const isEditing = session.id === editingId;
    return (
      <div key={session.id} className={cn('group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all', isActive ? 'bg-primary/8 border border-primary/15' : 'hover:bg-muted/60 border border-transparent')} onClick={() => !isEditing && handleSwitchSession(session.id)}>
        <div className="flex items-start gap-2">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5', isPin ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-primary/10')}>
            {isPin ? '📌' : session.icon}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={handleSaveTitle} onKeyDown={e => e.key === 'Enter' && handleSaveTitle()} className="h-6 text-xs" autoFocus onClick={e => e.stopPropagation()} />
            ) : (
              <>
                <p className="text-sm font-semibold truncate text-foreground">{session.title}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {getRelativeTime(session.updatedAt)}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const pinned = [...(sessionsByDate.today || []), ...(sessionsByDate.yesterday || []), ...(sessionsByDate.thisWeek || []), ...(sessionsByDate.older || [])].filter(s => s.isPinned);
  const recent = [...(sessionsByDate.today || []), ...(sessionsByDate.yesterday || []), ...(sessionsByDate.thisWeek || []), ...(sessionsByDate.older || [])].filter(s => !s.isPinned);

  return (
    <div className="w-full flex flex-col bg-background h-full overflow-hidden">
      <div className="px-4 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onNavigate('dashboard')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowRight className="w-3 h-3 rotate-180" /> Tableau de bord</button>
          {onClose && <button onClick={onClose}><X className="w-4 h-4" /></button>}
        </div>
        <Button onClick={() => { createNewSession(); if (onClose) onClose(); }} className="w-full gap-2 h-10 rounded-xl" style={{ background: 'var(--gradient-primary)' }}><Plus className="w-4 h-4" /> Nouvelle discussion</Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 pb-4">
          {pinned.length > 0 && <div><p className="text-[10px] font-bold text-muted-foreground uppercase px-1 mb-2">📌 Épinglés</p>{pinned.map(s => renderSession(s, true))}</div>}
          {recent.length > 0 && <div><p className="text-[10px] font-bold text-muted-foreground uppercase px-1 mb-2">Récent</p>{recent.map(s => renderSession(s, false))}</div>}
        </div>
      </ScrollArea>
    </div>
  );
};

// ─── 2. PANEL OPPORTUNITÉS ───────────────────────────────────────────────────
const OpportunitiesPanel = () => {
  const { t } = useLanguage();
  const { user } = useAuthContext();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpps = async () => {
      setLoading(true);
      try {
        if (user) {
          const response = await fetch("http://localhost:5000/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id }),
          });
          if (response.ok) {
            const aiData = await response.json();
            setOpportunities(aiData.recommandations || []);
          }
        }
      } catch (error) { console.error("Erreur", error); } finally { setLoading(false); }
    };
    fetchOpps();
  }, [user]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">Opportunités IA <Sparkles className="w-5 h-5 text-primary" /></h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary mb-2" /><p className="text-sm text-muted-foreground">Analyse IA...</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {opportunities.map((opp) => (
            <div key={opp.id} className="flex flex-col">
              <OpportunityCard title={opp.titre} description={opp.description} category={opp.type} location={opp.pays || 'En ligne'} deadline={opp.date_limite || 'N/A'} link={opp.lien || '#'} />
              {opp.score_ia && <div className="mt-2 text-right"><span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">✨ Match IA : {Math.round(opp.score_ia * 100)}%</span></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── 3. PANEL DASHBOARD ──────────────────────────────────────────────────────
const DashboardPanel = ({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) => {
  const { profile } = useAuthContext();
  const [recentOpps, setRecentOpps] = useState<any[]>([]);

  useEffect(() => {
    (supabase as any).from("opportunities").select("*").order("created_at", { ascending: false }).limit(3).then(({ data }: any) => setRecentOpps(data || []));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white mb-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Bonjour {profile?.name?.split(' ')[0]} 👋</h1>
        <p className="text-white/80">Votre moteur IA est prêt pour la démo.</p>
        <Button size="sm" className="mt-4 bg-white text-primary hover:bg-white/90 rounded-full" onClick={() => onNavigate('opportunites')}>Voir les bourses</Button>
      </div>
      <h2 className="text-base font-bold mb-4">Nouveautés</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {recentOpps.map((opp, i) => (
          <div key={i} className="bg-card border rounded-2xl p-4 hover:shadow-md transition-all">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{opp.type}</span>
            <h3 className="text-sm font-semibold mt-2 leading-tight">{opp.titre}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── 4. PANEL CHAT (EDUBOT) ──────────────────────────────────────────────────
const ChatPanel = ({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentSession, currentSessionId, addMessage, createNewSession } = useChat();
  const [isTyping, setIsTyping] = useState(false);

  const allMessages = currentSession?.messages || [];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [allMessages, isTyping]);

  const handleSendMessage = async (text: string) => {
    let sessionId = currentSessionId; if (!sessionId) sessionId = createNewSession();
    addMessage(sessionId, { id: Date.now().toString(), text, isUser: true, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) });
    setIsTyping(true);
    try {
      const result = await chatWithBotCloud(text, { previousMessages: [], topics: [] });
      if (result.success && result.data) {
        addMessage(sessionId, { id: (Date.now() + 1).toString(), text: result.data.response, isUser: false, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) });
      }
    } catch { toast({ title: "Erreur IA", variant: "destructive" }); } finally { setIsTyping(false); }
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full relative">
      {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}
      <div className={cn('flex-shrink-0 border-r bg-background z-50', isMobile ? `fixed inset-y-0 left-0 w-80 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` : 'relative w-80')}>
        <EdubotSessionSidebar onNavigate={onNavigate} onClose={isMobile ? () => setSidebarOpen(false) : undefined} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
        <div className="h-16 flex items-center gap-3 px-4 border-b bg-background">
          {isMobile && <button onClick={() => setSidebarOpen(v => !v)} className="p-2"><Menu className="w-5 h-5" /></button>}
          <p className="text-base font-bold">EduBot IA</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {allMessages.map(msg => <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />)}
            {isTyping && <div className="text-xs text-muted-foreground italic ml-12 animate-pulse">Réponse en cours...</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="bg-background px-4 py-4 border-t"><div className="max-w-3xl mx-auto"><ChatInput onSendMessage={handleSendMessage} disabled={isTyping} placeholder="Posez une question..." /></div></div>
      </div>
    </div>
  );
};

// ─── 5. PANEL PROFIL (PERSONNALISATION COMPLÈTE) ──────────────────────────
const ProfilePanel = () => {
  const { user, profile, updateProfile } = useAuthContext();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ firstname: '', lastname: '', location: '', niveau: '', filiere: '', interets: '', ambitions: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const parts = profile.name?.split(' ') || [];
      setFormData({ 
        firstname: parts[0] || '', 
        lastname: parts.slice(1).join(' ') || '', 
        location: [profile.ville, profile.pays].filter(Boolean).join(', '), 
        niveau: profile.niveau || '', 
        filiere: profile.filiere || '', 
        interets: profile.interets?.join(', ') || '', 
        ambitions: (profile as any).ambitions || '' 
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const loc = formData.location.split(',').map(s => s.trim());
      await updateProfile({ 
        name: `${formData.firstname} ${formData.lastname}`.trim(), 
        ville: loc[0], 
        pays: loc[1], 
        niveau: formData.niveau, 
        filiere: formData.filiere, 
        interets: formData.interets.split(',').map(s => s.trim()).filter(Boolean), 
        ambitions: formData.ambitions 
      } as any);
      toast({ title: '✅ Profil mis à jour' });
    } catch { toast({ title: 'Erreur', variant: 'destructive' }); } finally { setIsSaving(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto pb-10">
      <h1 className="text-xl font-bold mb-6">Personnalisation du Profil</h1>
      <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-primary">Identité</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Prénom" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} />
          <Input placeholder="Nom" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} />
        </div>
        <Input placeholder="Dakar, Sénégal" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
        
        <h2 className="text-sm font-semibold uppercase text-primary mt-6">Parcours & IA</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Niveau d'études" value={formData.niveau} onChange={e => setFormData({...formData, niveau: e.target.value})} />
          <Input placeholder="Filière" value={formData.filiere} onChange={e => setFormData({...formData, filiere: e.target.value})} />
        </div>
        <textarea className="w-full min-h-[80px] rounded-xl border p-3 text-sm focus:ring-2 focus:ring-primary/30" placeholder="Centres d'intérêt (IA, Data...)" value={formData.interets} onChange={e => setFormData({...formData, interets: e.target.value})} />
        <textarea className="w-full min-h-[100px] rounded-xl border p-3 text-sm focus:ring-2 focus:ring-primary/30" placeholder="Vos ambitions professionnelles..." value={formData.ambitions} onChange={e => setFormData({...formData, ambitions: e.target.value})} />
        
        <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-xl">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  );
};

// ─── 6. PANEL PARAMÈTRES (MODERNISÉ) ─────────────────────────────────────────
const SettingsPanel = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const chatContext = useChat();

  const handleExport = () => {
    const sessions = chatContext?.sessions || [];
    if (sessions.length === 0) return;
    const content = sessions.map(s => `=== ${s.title} ===\n${s.messages.map(m => `[${m.timestamp}] ${m.isUser ? 'Vous' : 'EduBot'}: ${m.text}`).join('\n')}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'chats_edubot.txt'; a.click();
    toast({ title: "Exporté !" });
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Paramètres</h1>
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div><p className="text-sm font-medium">Apparence</p><p className="text-xs text-muted-foreground">Mode sombre ou clair</p></div>
          <Button size="sm" variant="outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Changer</Button>
        </div>
        <div className="pt-6 border-t flex justify-between items-center">
          <div><p className="text-sm font-medium">Données de chat</p><p className="text-xs text-muted-foreground">Exporter l'historique EduBot</p></div>
          <Button variant="ghost" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-1" /> Exporter</Button>
        </div>
        <div className="pt-6 border-t">
          <Button variant="destructive" className="w-full rounded-xl" onClick={() => supabase.auth.signOut()}>Déconnexion</Button>
        </div>
      </div>
    </div>
  );
};

// ─── 7. GUEST CHAT & ROUTAGE FINAL ──────────────────────────────────────────
const GuestChat = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <Bot className="w-16 h-16 text-primary mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-foreground">EduConnect Afrika</h1>
      <p className="text-muted-foreground mb-8">La plateforme d'IA pour votre avenir académique en Afrique.</p>
      <Button onClick={() => navigate('/auth')} className="rounded-xl px-10 shadow-lg" style={{ background: 'var(--gradient-primary)' }}>Se connecter</Button>
    </div>
  );
};

const ChatContent = () => {
  const { user } = useAuthContext();
  const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard');
  if (!user) return <GuestChat />;
  if (activePanel === 'chat') return <div className="h-screen flex overflow-hidden bg-background"><ChatPanel onNavigate={setActivePanel} /></div>;
  return (
    <AppLayout activePanel={activePanel} onNavigate={setActivePanel}>
      {activePanel === 'dashboard'   && <DashboardPanel onNavigate={setActivePanel} />}
      {activePanel === 'opportunites' && <OpportunitiesPanel />}
      {activePanel === 'profil'      && <ProfilePanel />}
      {activePanel === 'parametres'  && <SettingsPanel />}
    </AppLayout>
  );
};

const Index = () => <ChatContent />;
export default Index;