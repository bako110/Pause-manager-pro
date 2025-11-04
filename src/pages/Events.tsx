import React, { useState, useEffect } from 'react';
import AccueilNavBar from '@/components/layout/AccueilNavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, Clock, Users, Plus, Trash2, Edit, 
  Search, Loader2, AlertCircle, Wifi, WifiOff,
  X
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../public/environment';

// Types pour les événements
interface Event {
  _id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'coffee' | 'lunch' | 'cocktail' | 'meeting' | 'training' | 'other';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  client: {
    name: string;
    contact: string;
  };
  service: {
    title: string;
    type: string;
  };
  participants: number;
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Event | Event[];
  message?: string;
  count?: number;
}

// Composant Modal pour ajouter un événement
const AddEventModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'coffee',
    clientName: '',
    clientContact: '',
    serviceTitle: '',
    serviceType: '',
    participants: 1,
    location: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave(formData);
      // Réinitialiser le formulaire après succès
      setFormData({
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'coffee',
        clientName: '',
        clientContact: '',
        serviceTitle: '',
        serviceType: '',
        participants: 1,
        location: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'participants' ? parseInt(value) || 1 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Nouvel événement</h2>
          <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nom de l'événement *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Réunion équipe, Pause café..."
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Type d'événement *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kimi-green"
                required
              >
                <option value="coffee">Pause café</option>
                <option value="lunch">Déjeuner</option>
                <option value="cocktail">Cocktail</option>
                <option value="meeting">Réunion</option>
                <option value="training">Formation</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Date *
              </label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Heure début *
                </label>
                <Input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Heure fin *
                </label>
                <Input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nombre de participants *
              </label>
              <Input
                type="number"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Lieu *
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Salle de réunion, Bureau..."
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nom du client
              </label>
              <Input
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Nom du client..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Contact du client
              </label>
              <Input
                name="clientContact"
                value={formData.clientContact}
                onChange={handleChange}
                placeholder="Email ou téléphone..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Titre du service
              </label>
              <Input
                name="serviceTitle"
                value={formData.serviceTitle}
                onChange={handleChange}
                placeholder="Titre du service..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Type de service
              </label>
              <Input
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                placeholder="Type de service..."
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Notes
            </label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Informations supplémentaires..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-kimi-orange text-white"
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Créer l'événement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Configuration Axios
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Vérifier la connexion API
  const checkApiStatus = async () => {
    try {
      await api.get('/health');
      setApiStatus('online');
      return true;
    } catch (error) {
      setApiStatus('offline');
      return false;
    }
  };

  // Charger les événements
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const isApiOnline = await checkApiStatus();
      if (!isApiOnline) {
        setError('Le serveur est indisponible.');
        setLoading(false);
        return;
      }

      const response = await api.get<ApiResponse>('/events');
      if (response.data.success) {
        setEvents(response.data.data as Event[]);
      } else {
        setError(response.data.message || 'Erreur lors du chargement des événements');
      }
    } catch (error: any) {
      console.error('Erreur fetchEvents:', error);
      setError(error.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un événement
  const handleAddEvent = async (eventData: any) => {
    try {
      setError(null);
      const response = await api.post<ApiResponse>('/events', eventData);

      if (response.data.success) {
        setEvents(prev => [...prev, response.data.data as Event]);
        setShowAddModal(false);
        return true;
      } else {
        setError(response.data.message || 'Erreur lors de l\'ajout de l\'événement');
        return false;
      }
    } catch (error: any) {
      console.error('Erreur handleAddEvent:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout');
      return false;
    }
  };

  // Supprimer un événement
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      return;
    }

    try {
      setActionLoading(eventId);
      setError(null);

      const response = await api.delete<ApiResponse>(`/events/${eventId}`);

      if (response.data.success) {
        setEvents(prev => prev.filter(event => event._id !== eventId));
      } else {
        setError(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur handleDeleteEvent:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  // Mettre à jour le statut d'un événement
  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      setActionLoading(eventId);
      setError(null);

      const response = await api.put<ApiResponse>(`/events/${eventId}`, {
        status: newStatus
      });

      if (response.data.success) {
        setEvents(prev => 
          prev.map(event => 
            event._id === eventId ? { ...event, status: newStatus } : event
          )
        );
      } else {
        setError(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur handleUpdateStatus:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtrer les événements
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formater la date
  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Traduire le statut
  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Planifié',
      'confirmed': 'Confirmé',
      'in-progress': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  // Traduire le type
  const translateType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'coffee': 'Pause café',
      'lunch': 'Déjeuner',
      'cocktail': 'Cocktail',
      'meeting': 'Réunion',
      'training': 'Formation',
      'other': 'Autre'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AccueilNavBar />
        <div className="p-6 pt-24 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Chargement des événements...</span>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              {apiStatus === 'checking' && <Wifi className="h-4 w-4" />}
              {apiStatus === 'online' && <Wifi className="h-4 w-4 text-green-500" />}
              {apiStatus === 'offline' && <WifiOff className="h-4 w-4 text-red-500" />}
              <span>
                {apiStatus === 'checking' && 'Vérification de la connexion...'}
                {apiStatus === 'online' && 'Connecté au serveur'}
                {apiStatus === 'offline' && 'Serveur hors ligne'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && apiStatus === 'offline') {
    return (
      <div className="min-h-screen">
        <AccueilNavBar />
        <div className="p-6 pt-24 flex justify-center items-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Serveur indisponible</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={fetchEvents} className="bg-kimi-green text-white">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AccueilNavBar />
      <div className="p-6 pt-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Événements</h1>
            <p className="text-gray-400 mt-2">Gestion de tous vos événements</p>
          </div>
          <div className="flex items-center space-x-2">
            {apiStatus === 'online' && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                <Wifi className="h-3 w-3 mr-1" />
                En ligne
              </Badge>
            )}
            <Button 
              className="bg-kimi-orange text-white"
              onClick={() => setShowAddModal(true)}
              disabled={apiStatus === 'offline'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel événement
            </Button>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && apiStatus === 'online' && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="font-bold text-lg hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Barre de recherche */}
        <Card className="mb-6 border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement, client, lieu ou type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tableau des événements */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Tous les événements
            </CardTitle>
            <CardDescription className="text-white text-opacity-90">
              {filteredEvents.length} événement(s) trouvé(s) sur {events.length} au total
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Événement</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.client?.name || 'Non spécifié'}</div>
                          {event.client?.contact && (
                            <div className="text-sm text-gray-500">{event.client.contact}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatEventDate(event.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          {event.startTime} - {event.endTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-kimi-green text-kimi-green">
                          {translateType(event.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          {event.participants}
                        </div>
                      </TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(event.status)} text-white`}>
                          {translateStatus(event.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleUpdateStatus(event._id, 
                              event.status === 'scheduled' ? 'confirmed' : 'scheduled'
                            )}
                            disabled={actionLoading === event._id}
                          >
                            {actionLoading === event._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleDeleteEvent(event._id)}
                            disabled={actionLoading === event._id}
                          >
                            {actionLoading === event._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">Aucun événement trouvé</p>
                      {searchTerm ? (
                        <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                      ) : (
                        <p className="text-sm">Commencez par créer votre premier événement</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal d'ajout d'événement */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddEvent}
      />
    </div>
  );
};

export default Events;