import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccueilNavBar from '@/components/layout/AccueilNavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Coffee, UtensilsCrossed, CalendarDays, Clock, Users, 
  Search, Martini, Building, Download, Loader2,
  AlertCircle, Wifi, WifiOff
} from "lucide-react";
import { 
  exportToExcel, 
  exportToPDF, 
  printTable, 
  ExportIcons 
} from '@/utils/exportUtils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_BASE_URL } from '../../public/environment';

// Configuration Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types pour les données
interface DashboardStats {
  coffeePauses: {
    today: number;
    thisWeek: number;
    next: string;
  };
  lunches: {
    today: number;
    reservedPlaces: number;
    next: string;
  };
  reservations: {
    ongoing: number;
    thisWeek: number;
    next: string;
  };
  enhancedCoffee: {
    today: number;
    thisWeek: number;
    next: string;
  };
  cocktails: {
    scheduled: number;
    thisMonth: number;
    next: string;
  };
  roomRentals: {
    today: number;
    thisWeek: number;
    next: string;
  };
}

interface Event {
  id: string;
  name: string;
  date: string;
  status: string;
  type: string;
  client?: {
    name: string;
  };
  startTime: string;
}

interface Client {
  id: string;
  name: string;
  service?: string;
  status: string;
  contact: string;
  email: string;
}

// Nouveau type pour les services
interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  status: 'active' | 'new' | 'limited';
  type: 'coffee' | 'lunch' | 'cocktail' | 'room_rental' | 'enhanced_coffee' | 'reservation';
  createdAt: string;
  updatedAt: string;
}

// Données par défaut pour éviter les erreurs
const defaultStats: DashboardStats = {
  coffeePauses: { today: 0, thisWeek: 0, next: 'N/A' },
  lunches: { today: 0, reservedPlaces: 0, next: 'N/A' },
  reservations: { ongoing: 0, thisWeek: 0, next: 'N/A' },
  enhancedCoffee: { today: 0, thisWeek: 0, next: 'N/A' },
  cocktails: { scheduled: 0, thisMonth: 0, next: 'N/A' },
  roomRentals: { today: 0, thisWeek: 0, next: 'N/A' }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

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

  // Fonctions pour récupérer les données depuis le backend avec Axios
  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erreur fetchDashboardStats:', error);
      return defaultStats;
    }
  };

  const fetchUpcomingEvents = async (): Promise<Event[]> => {
    try {
      const response = await api.get('/events/upcoming');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Erreur fetchUpcomingEvents:', error);
      return [];
    }
  };

  const fetchActiveClients = async (): Promise<Client[]> => {
    try {
      const response = await api.get('/clients');
      const clientsData = response.data.data || response.data || [];
      return clientsData.filter((client: Client) => client.status === 'active').slice(0, 5);
    } catch (error) {
      console.error('Erreur fetchActiveClients:', error);
      return [];
    }
  };

  // Nouvelle fonction pour récupérer les services
  const fetchServices = async (): Promise<Service[]> => {
    try {
      const response = await api.get('/services');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Erreur fetchServices:', error);
      return [];
    }
  };

  // Fonction pour calculer les statistiques basées sur les services
  const calculateServiceStats = (servicesData: Service[]): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Obtenir le début de la semaine (lundi)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Obtenir le début du mois
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filtrer les services par type
    const coffeeServices = servicesData.filter(service => service.type === 'coffee');
    const lunchServices = servicesData.filter(service => service.type === 'lunch');
    const reservationServices = servicesData.filter(service => service.type === 'reservation');
    const enhancedCoffeeServices = servicesData.filter(service => service.type === 'enhanced_coffee');
    const cocktailServices = servicesData.filter(service => service.type === 'cocktail');
    const roomRentalServices = servicesData.filter(service => service.type === 'room_rental');

    // Trouver le prochain service pour chaque catégorie
    const findNextService = (services: Service[]) => {
      const activeServices = services.filter(s => s.status === 'active');
      if (activeServices.length === 0) return 'Aucun';
      
      // Trier par date de création et prendre le premier
      const sorted = [...activeServices].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return sorted[0].title.length > 20 ? sorted[0].title.substring(0, 20) + '...' : sorted[0].title;
    };

    // Calculer les statistiques
    return {
      coffeePauses: {
        today: coffeeServices.filter(s => 
          new Date(s.createdAt).toISOString().split('T')[0] === today
        ).length,
        thisWeek: coffeeServices.filter(s => {
          const serviceDate = new Date(s.createdAt);
          return serviceDate >= startOfWeek;
        }).length,
        next: findNextService(coffeeServices)
      },
      lunches: {
        today: lunchServices.filter(s => 
          new Date(s.createdAt).toISOString().split('T')[0] === today
        ).length,
        reservedPlaces: lunchServices.reduce((total, service) => {
          // Estimation basée sur le prix - extraire le premier nombre trouvé
          const priceMatch = service.price.match(/(\d+)/);
          return total + (priceMatch ? parseInt(priceMatch[1]) : 1);
        }, 0),
        next: findNextService(lunchServices)
      },
      reservations: {
        ongoing: reservationServices.filter(s => s.status === 'active').length,
        thisWeek: reservationServices.filter(s => {
          const serviceDate = new Date(s.createdAt);
          return serviceDate >= startOfWeek;
        }).length,
        next: findNextService(reservationServices)
      },
      enhancedCoffee: {
        today: enhancedCoffeeServices.filter(s => 
          new Date(s.createdAt).toISOString().split('T')[0] === today
        ).length,
        thisWeek: enhancedCoffeeServices.filter(s => {
          const serviceDate = new Date(s.createdAt);
          return serviceDate >= startOfWeek;
        }).length,
        next: findNextService(enhancedCoffeeServices)
      },
      cocktails: {
        scheduled: cocktailServices.filter(s => s.status === 'active').length,
        thisMonth: cocktailServices.filter(s => {
          const serviceDate = new Date(s.createdAt);
          return serviceDate >= startOfMonth;
        }).length,
        next: findNextService(cocktailServices)
      },
      roomRentals: {
        today: roomRentalServices.filter(s => 
          new Date(s.createdAt).toISOString().split('T')[0] === today
        ).length,
        thisWeek: roomRentalServices.filter(s => {
          const serviceDate = new Date(s.createdAt);
          return serviceDate >= startOfWeek;
        }).length,
        next: findNextService(roomRentalServices)
      }
    };
  };

  // Chargement des données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier d'abord le statut de l'API
        const isApiOnline = await checkApiStatus();
        
        if (!isApiOnline) {
          setError('Le serveur est indisponible. Vérifiez que le backend est démarré.');
          setLoading(false);
          return;
        }

        // Charger les données en parallèle (ajout de fetchServices)
        const [statsData, eventsData, clientsData, servicesData] = await Promise.all([
          fetchDashboardStats(),
          fetchUpcomingEvents(),
          fetchActiveClients(),
          fetchServices()
        ]);

        setEvents(eventsData);
        setClients(clientsData);
        setServices(servicesData);

        // Calculer les statistiques basées sur les services
        const calculatedStats = calculateServiceStats(servicesData);
        
        // Fusionner les statistiques du backend avec celles calculées
        // Priorité aux données calculées si disponibles
        const mergedStats = {
          coffeePauses: statsData.coffeePauses.today > 0 ? statsData.coffeePauses : calculatedStats.coffeePauses,
          lunches: statsData.lunches.today > 0 ? statsData.lunches : calculatedStats.lunches,
          reservations: statsData.reservations.ongoing > 0 ? statsData.reservations : calculatedStats.reservations,
          enhancedCoffee: statsData.enhancedCoffee.today > 0 ? statsData.enhancedCoffee : calculatedStats.enhancedCoffee,
          cocktails: statsData.cocktails.scheduled > 0 ? statsData.cocktails : calculatedStats.cocktails,
          roomRentals: statsData.roomRentals.today > 0 ? statsData.roomRentals : calculatedStats.roomRentals
        };

        setStats(mergedStats);

        // Vérifier si toutes les données sont vides
        if (statsData === defaultStats && eventsData.length === 0 && clientsData.length === 0 && servicesData.length === 0) {
          setError('Aucune donnée disponible. Le backend peut être en cours de démarrage.');
        }

      } catch (err) {
        console.error('Erreur loadData:', err);
        setError('Erreur lors du chargement des données. Vérifiez la connexion au serveur.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers pour les boutons des cartes
  const handleViewCoffeeDetails = () => {
    // Rediriger vers la page des services avec filtre café
    navigate('/services?type=coffee');
  };

  const handleViewLunchReservations = () => {
    // Rediriger vers la page des services avec filtre déjeuner
    navigate('/services?type=lunch');
  };

  const handleManageReservations = () => {
    // Rediriger vers la page des réservations
    navigate('/reservations');
  };

  const handleViewEnhancedCoffeeDetails = () => {
    // Rediriger vers la page des services avec filtre café renforcé
    navigate('/services?type=enhanced_coffee');
  };

  const handleManageCocktails = () => {
    // Rediriger vers la page des services avec filtre cocktails
    navigate('/services?type=cocktail');
  };

  const handleViewRoomRentals = () => {
    // Rediriger vers la page des services avec filtre location de salles
    navigate('/services?type=room_rental');
  };

  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
    event.date.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
    event.client?.name.toLowerCase().includes(eventSearchTerm.toLowerCase())
  );

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.contact.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // Handle export functions
  const handleExportExcel = (data: any[], fileName: string) => {
    exportToExcel(data, fileName);
  };

  const handleExportPDF = (tableId: string, fileName: string) => {
    exportToPDF(tableId, fileName);
  };

  const handlePrint = (tableId: string) => {
    printTable(tableId);
  };

  // Handle export all data (mise à jour avec les services)
  const handleExportAllData = () => {
    const allData = {
      events: events,
      clients: clients,
      services: services,
      stats: stats
    };
    exportToExcel(allData, 'Toutes_les_données_dashboard');
  };

  // Formater la date pour l'affichage
  const formatEventDate = (dateString: string, startTime: string) => {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (eventDate.toDateString() === today.toDateString()) {
        return `Aujourd'hui, ${startTime}`;
      } else if (eventDate.toDateString() === tomorrow.toDateString()) {
        return `Demain, ${startTime}`;
      } else {
        return `${eventDate.toLocaleDateString('fr-FR')}, ${startTime}`;
      }
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Obtenir la classe CSS pour le statut
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return "bg-green-500 text-white";
      case 'scheduled':
        return "border-kimi-orange text-kimi-orange";
      case 'inactive':
        return "bg-gray-500 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  };

  // Traduire le statut
  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'À venir',
      'confirmed': 'Confirmé',
      'in-progress': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé',
      'active': 'Actif',
      'inactive': 'Inactif'
    };
    return statusMap[status] || status;
  };

  // Recharger les données
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AccueilNavBar />
        <div className="p-6 pt-24 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Chargement des données...</span>
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

  if (error) {
    return (
      <div className="min-h-screen">
        <AccueilNavBar />
        <div className="p-6 pt-24 flex justify-center items-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Erreur de connexion</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="space-y-2 text-sm text-gray-400 mb-6">
              <p>Vérifiez que :</p>
              <ul className="list-disc list-inside text-left">
                <li>Le serveur backend est démarré</li>
                <li>L'URL {API_BASE_URL} est accessible</li>
                <li>Les endpoints API existent</li>
              </ul>
            </div>
            <Button 
              onClick={handleRetry}
              className="bg-kimi-green hover:bg-kimi-green-dark text-white"
            >
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
              <p className="text-gray-400 mt-2">Vue d'ensemble de vos services et prestations</p>
            </div>
            <div className="flex items-center space-x-2">
              {apiStatus === 'online' && (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  <Wifi className="h-3 w-3 mr-1" />
                  En ligne
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            className="text-kimi-green border-kimi-green hover:bg-kimi-green hover:text-white"
            onClick={handleExportAllData}
            disabled={events.length === 0 && clients.length === 0 && services.length === 0}
          >
            <Download className="mr-2 h-4 w-4"  />
            Exporter toutes les données
          </Button>
        </div>
        
        {/* Cartes de statistiques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Carte Pauses café */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Pauses café</CardTitle>
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <CardDescription className="text-white text-opacity-90">Gestion des pauses café</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aujourd'hui:</span>
                  <span className="font-semibold">{stats.coffeePauses.today} pauses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cette semaine:</span>
                  <span className="font-semibold">{stats.coffeePauses.thisWeek} pauses</span>
                </div>
                <div className="mt-4">
                  <Badge className="bg-kimi-orange text-white">
                    Prochain: {stats.coffeePauses.next}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-kimi-green border-kimi-green hover:bg-kimi-green hover:text-white"
                  onClick={handleViewCoffeeDetails}
                >
                  Voir les détails
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Carte Déjeuners */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Déjeuners</CardTitle>
                <UtensilsCrossed className="h-8 w-8 text-white" />
              </div>
              <CardDescription className="text-white text-opacity-90">Gestion des pauses déjeuner</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aujourd'hui:</span>
                  <span className="font-semibold">{stats.lunches.today} déjeuners</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Places réservées:</span>
                  <span className="font-semibold">{stats.lunches.reservedPlaces} personnes</span>
                </div>
                <div className="mt-4">
                  <Badge className="bg-kimi-orange text-white">
                    Prochain: {stats.lunches.next}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-kimi-green border-kimi-green hover:bg-kimi-green hover:text-white"
                  onClick={handleViewLunchReservations}
                >
                  Voir les réservations
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Carte Réservations */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Réservations</CardTitle>
                <CalendarDays className="h-8 w-8 text-white" />
              </div>
              <CardDescription className="text-white text-opacity-90">Réservations de salles</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">En cours:</span>
                  <span className="font-semibold">{stats.reservations.ongoing} réservations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cette semaine:</span>
                  <span className="font-semibold">{stats.reservations.thisWeek} réservations</span>
                </div>
                <div className="mt-4">
                  <Badge className="bg-kimi-orange text-white">
                    Prochaine: {stats.reservations.next}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-kimi-green border-kimi-green hover:bg-kimi-green hover:text-white"
                  onClick={handleManageReservations}
                >
                  Gérer les réservations
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte Pauses café renforcé */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Pauses café renforcé</CardTitle>
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <CardDescription className="text-white text-opacity-90">Gestion des pauses améliorées</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aujourd'hui:</span>
                  <span className="font-semibold">{stats.enhancedCoffee.today} pauses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cette semaine:</span>
                  <span className="font-semibold">{stats.enhancedCoffee.thisWeek} pauses</span>
                </div>
                <div className="mt-4">
                  <Badge className="bg-kimi-orange text-white">
                    Prochain: {stats.enhancedCoffee.next}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-kimi-green border-kimi-green hover:bg-kimi-green hover:text-white"
                  onClick={handleViewEnhancedCoffeeDetails}
                >
                  Voir les détails
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte Cocktails */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Cocktails</CardTitle>
                <Martini className="h-8 w-8 text-white" />
              </div>
              <CardDescription className="text-white text-opacity-90">Gestion des cocktails et réceptions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Planifiés:</span>
                  <span className="font-semibold">{stats.cocktails.scheduled} événements</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ce mois:</span>
                  <span className="font-semibold">{stats.cocktails.thisMonth} événements</span>
                </div>
                <div className="mt-4">
                  <Badge className="bg-kimi-orange text-white">
                    Prochain: {stats.cocktails.next}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-kimi-green border-kimi-green hover:bg-kimi-green hover:text-white"
                  onClick={handleManageCocktails}
                >
                  Gérer les cocktails
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte Location de salles */}
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Location de salles</CardTitle>
                <Building className="h-8 w-8 text-white" />
              </div>
              <CardDescription className="text-white text-opacity-90">Gestion des locations d'espaces</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aujourd'hui:</span>
                  <span className="font-semibold">{stats.roomRentals.today} locations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cette semaine:</span>
                  <span className="font-semibold">{stats.roomRentals.thisWeek} locations</span>
                </div>
                <div className="mt-4">
                  <Badge className="bg-kimi-orange text-white">
                    Prochaine: {stats.roomRentals.next}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-kimi-green border-kimi-green hover:bg-kimi-green hover:text-white"
                  onClick={handleViewRoomRentals}
                >
                  Voir les locations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableaux des événements et clients */}
        <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-2">
          {/* Tableau des événements */}
          <Card className="border-none shadow-md">
            <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Événements à venir</CardTitle>
                <div className="flex items-center space-x-2">
                  <Clock className="h-6 w-6 text-white" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white h-8 w-8 hover:bg-kimi-green-dark">
                        <Download className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExportExcel(events, 'Evenements')}>
                        {ExportIcons.Excel} Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportPDF('events-table', 'Evenements')}>
                        {ExportIcons.PDF} PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrint('events-table')}>
                        {ExportIcons.Print} Imprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4 pb-2 border-b">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un événement..." 
                  value={eventSearchTerm}
                  onChange={(e) => setEventSearchTerm(e.target.value)}
                  className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
                />
              </div>
              <div id="events-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Événement</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.name}</TableCell>
                          <TableCell>{formatEventDate(event.date, event.startTime)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getStatusBadgeClass(event.status)}
                            >
                              {translateStatus(event.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {events.length === 0 ? 'Aucun événement à venir' : 'Aucun événement trouvé'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des clients */}
          <Card className="border-none shadow-md">
            <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Clients actifs</CardTitle>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-white" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white h-8 w-8 hover:bg-kimi-green-dark">
                        <Download className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExportExcel(clients, 'Clients')}>
                        {ExportIcons.Excel} Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportPDF('clients-table', 'Clients')}>
                        {ExportIcons.PDF} PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrint('clients-table')}>
                        {ExportIcons.Print} Imprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4 pb-2 border-b">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un client..." 
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
                />
              </div>
              <div id="clients-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.contact}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClass(client.status)}>
                              {translateStatus(client.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {clients.length === 0 ? 'Aucun client actif' : 'Aucun client trouvé'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;