import React, { useState, useEffect } from 'react';
import AccueilNavBar from '@/components/layout/AccueilNavBar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Coffee,
  Calendar,
  Users,
  Plus,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  Package,
  Search,
  Download,
  Martini,
  UtensilsCrossed,
  CalendarDays,
  Building
} from 'lucide-react';
import AddServiceModal from '@/components/ui/AddServiceModal';
import axios from 'axios';
import { API_BASE_URL } from '../../public/environment';
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

// --- Types ---
type ServiceType = 'coffee' | 'lunch' | 'cocktail' | 'room_rental' | 'enhanced_coffee' | 'reservation';

interface Service {
  _id: string;
  title: string;
  description: string;
  price: string;
  status: 'active' | 'new' | 'limited';
  type: ServiceType;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Service | Service[];
  message?: string;
  count?: number;
}

// --- Composant principal ---
const Services = () => {
  // États
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ServiceType>('coffee');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Configuration Axios
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Intercepteur pour ajouter le token d'authentification
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Vérification de la connexion API
  const checkApiStatus = async () => {
    try {
      await api.get('/health');
      setApiStatus('online');
      return true;
    } catch {
      setApiStatus('offline');
      return false;
    }
  };

  // Chargement des services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const isApiOnline = await checkApiStatus();
      if (!isApiOnline) {
        setError('Le serveur est indisponible. Vérifiez que le backend est démarré.');
        return;
      }
      const response = await api.get<ApiResponse>('/services');
      if (response.data.success) {
        setServices(response.data.data as Service[]);
      } else {
        setError('Erreur lors du chargement des services');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de connexion';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  // Ajout d'un service
  const handleAddService = async (newService: Omit<Service, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const response = await api.post<ApiResponse>('/services', newService);
      if (response.data.success) {
        setServices(prev => [...prev, response.data.data as Service]);
        setShowAddModal(false);
        return true;
      } else {
        setError('Erreur lors de l\'ajout du service');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'ajout';
      setError(errorMessage);
      return false;
    }
  };

  // Suppression d'un service
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Supprimer ce service ? Cette action est irréversible.')) return;
    try {
      setError(null);
      const response = await api.delete<ApiResponse>(`/services/${serviceId}`);
      if (response.data.success) {
        setServices(prev => prev.filter(service => service._id !== serviceId));
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression';
      setError(errorMessage);
    }
  };

  // Mise à jour d'un service
  const handleUpdateService = async (serviceId: string, updateData: Partial<Service>) => {
    try {
      setError(null);
      const response = await api.put<ApiResponse>(`/services/${serviceId}`, updateData);
      if (response.data.success) {
        setServices(prev => prev.map(service =>
          service._id === serviceId ? { ...service, ...updateData } : service
        ));
        return true;
      } else {
        setError('Erreur lors de la mise à jour');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      return false;
    }
  };

  // Filtres et statistiques
  const filteredServices = services.filter(service =>
    service.type === activeTab &&
    (service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     service.price.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const coffeeServices = services.filter(s => s.type === 'coffee');
  const lunchServices = services.filter(s => s.type === 'lunch');
  const cocktailServices = services.filter(s => s.type === 'cocktail');
  const roomRentalServices = services.filter(s => s.type === 'room_rental');
  const enhancedCoffeeServices = services.filter(s => s.type === 'enhanced_coffee');
  const reservationServices = services.filter(s => s.type === 'reservation');

  const getServiceTypeLabel = (type: ServiceType) => {
    const labels: Record<ServiceType, string> = {
      'coffee': 'Pauses café',
      'lunch': 'Déjeuners',
      'cocktail': 'Cocktails',
      'room_rental': 'Location de salles',
      'enhanced_coffee': 'Pauses café renforcé',
      'reservation': 'Réservations',
    };
    return labels[type];
  };

  const getServiceIcon = (type: ServiceType) => {
    const icons: Record<ServiceType, React.ReactNode> = {
      'coffee': <Coffee className="h-4 w-4" />,
      'lunch': <UtensilsCrossed className="h-4 w-4" />,
      'cocktail': <Martini className="h-4 w-4" />,
      'room_rental': <Building className="h-4 w-4" />,
      'enhanced_coffee': <Coffee className="h-4 w-4" />,
      'reservation': <CalendarDays className="h-4 w-4" />,
    };
    return icons[type];
  };

  // Export
  const handleExportToExcel = () => {
    const data = filteredServices.length > 0 ? filteredServices : services;
    exportToExcel(data, `services-${activeTab}`);
  };

  const handleExportToPDF = () => {
    exportToPDF('services-grid', `Services ${getServiceTypeLabel(activeTab)}`);
  };

  const handlePrint = () => {
    printTable('services-grid');
  };

  // Rechargement
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(fetchServices, 1000);
  };

  // --- Affichage ---
  if (loading) {
    return (
      <div className="min-h-screen">
        <AccueilNavBar />
        <div className="p-6 pt-24 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Chargement des services...</span>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              {apiStatus === 'checking' && <Wifi className="h-4 w-4" />}
              {apiStatus === 'online' && <Wifi className="h-4 w-4 text-green-500" />}
              {apiStatus === 'offline' && <WifiOff className="h-4 w-4 text-red-500" />}
              <span>
                {apiStatus === 'checking' ? 'Vérification de la connexion...' :
                 apiStatus === 'online' ? 'Connecté au serveur' :
                 'Serveur hors ligne'}
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
            <div className="space-y-2 text-sm text-gray-400 mb-6">
              <p>Vérifiez que :</p>
              <ul className="list-disc list-inside text-left">
                <li>Le serveur backend est démarré sur {API_BASE_URL}</li>
                <li>La base de données est connectée</li>
                <li>Les ports ne sont pas bloqués</li>
              </ul>
            </div>
            <Button onClick={handleRetry} className="bg-kimi-green hover:bg-kimi-green-dark text-white">
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
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Services</h1>
              <p className="text-gray-400 mt-2">Gérez tous vos services proposés</p>
            </div>
            {apiStatus === 'online' && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                <Wifi className="h-3 w-3 mr-1" /> En ligne
              </Badge>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="border-none shadow-md bg-kimi-green bg-opacity-90 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm">Total</p>
                  <p className="text-xl font-bold">{services.length}</p>
                </div>
                <Package className="h-6 w-6 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-blue-600 bg-opacity-90 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm">Pauses Café</p>
                  <p className="text-xl font-bold">{coffeeServices.length}</p>
                </div>
                <Coffee className="h-6 w-6 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-orange-600 bg-opacity-90 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm">Déjeuners</p>
                  <p className="text-xl font-bold">{lunchServices.length}</p>
                </div>
                <UtensilsCrossed className="h-6 w-6 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-purple-600 bg-opacity-90 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm">Cocktails</p>
                  <p className="text-xl font-bold">{cocktailServices.length}</p>
                </div>
                <Martini className="h-6 w-6 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-green-600 bg-opacity-90 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm">Locations</p>
                  <p className="text-xl font-bold">{roomRentalServices.length}</p>
                </div>
                <Building className="h-6 w-6 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-amber-600 bg-opacity-90 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm">Pauses Café Renforcé</p>
                  <p className="text-xl font-bold">{enhancedCoffeeServices.length}</p>
                </div>
                <Coffee className="h-6 w-6 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-cyan-600 bg-opacity-90 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-90 text-sm">Réservations</p>
                  <p className="text-xl font-bold">{reservationServices.length}</p>
                </div>
                <CalendarDays className="h-6 w-6 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold text-lg hover:text-red-900">
              ×
            </button>
          </div>
        )}

        {/* Barre de recherche et actions */}
        <Card className="border-none shadow-md mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none focus-visible:ring-0 flex-1"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-kimi-orange hover:bg-kimi-orange-dark text-white flex-1 sm:flex-none"
                  disabled={apiStatus === 'offline'}
                >
                  <Plus className="w-4 h-4 mr-2" /> Ajouter un service
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white">
                      <Download className="h-4 w-4 mr-2" /> Exporter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportToExcel}>
                      {ExportIcons.Excel} Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportToPDF}>
                      {ExportIcons.PDF} PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrint}>
                      {ExportIcons.Print} Imprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onglets et grille de services */}
        <Tabs
          defaultValue="coffee"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ServiceType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 bg-kimi-green bg-opacity-90 text-white">
            <TabsTrigger value="coffee" className="flex items-center gap-2 data-[state=active]:bg-kimi-orange data-[state=active]:text-white">
              <Coffee className="w-3 h-3" /> Pauses café
              <Badge variant="secondary" className="ml-1 bg-white text-kimi-green text-xs">
                {coffeeServices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="lunch" className="flex items-center gap-2 data-[state=active]:bg-kimi-orange data-[state=active]:text-white">
              <UtensilsCrossed className="w-3 h-3" /> Déjeuners
              <Badge variant="secondary" className="ml-1 bg-white text-kimi-green text-xs">
                {lunchServices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cocktail" className="flex items-center gap-2 data-[state=active]:bg-kimi-orange data-[state=active]:text-white">
              <Martini className="w-3 h-3" /> Cocktails
              <Badge variant="secondary" className="ml-1 bg-white text-kimi-green text-xs">
                {cocktailServices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="room_rental" className="flex items-center gap-2 data-[state=active]:bg-kimi-orange data-[state=active]:text-white">
              <Building className="w-3 h-3" /> Location
              <Badge variant="secondary" className="ml-1 bg-white text-kimi-green text-xs">
                {roomRentalServices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="enhanced_coffee" className="flex items-center gap-2 data-[state=active]:bg-kimi-orange data-[state=active]:text-white">
              <Coffee className="w-3 h-3" /> Café renforcé
              <Badge variant="secondary" className="ml-1 bg-white text-kimi-green text-xs">
                {enhancedCoffeeServices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reservation" className="flex items-center gap-2 data-[state=active]:bg-kimi-orange data-[state=active]:text-white">
              <CalendarDays className="w-3 h-3" /> Réservations
              <Badge variant="secondary" className="ml-1 bg-white text-kimi-green text-xs">
                {reservationServices.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coffee">
            <ServiceGrid
              services={filteredServices}
              onDelete={handleDeleteService}
              onUpdate={handleUpdateService}
              emptyIcon={<Coffee className="w-16 h-16 mx-auto text-gray-400 mb-4" />}
              emptyMessage="Aucun service de pause café"
              type="coffee"
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value="lunch">
            <ServiceGrid
              services={filteredServices}
              onDelete={handleDeleteService}
              onUpdate={handleUpdateService}
              emptyIcon={<UtensilsCrossed className="w-16 h-16 mx-auto text-gray-400 mb-4" />}
              emptyMessage="Aucun service de déjeuner"
              type="lunch"
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value="cocktail">
            <ServiceGrid
              services={filteredServices}
              onDelete={handleDeleteService}
              onUpdate={handleUpdateService}
              emptyIcon={<Martini className="w-16 h-16 mx-auto text-gray-400 mb-4" />}
              emptyMessage="Aucun service de cocktail"
              type="cocktail"
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value="room_rental">
            <ServiceGrid
              services={filteredServices}
              onDelete={handleDeleteService}
              onUpdate={handleUpdateService}
              emptyIcon={<Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />}
              emptyMessage="Aucun service de location"
              type="room_rental"
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value="enhanced_coffee">
            <ServiceGrid
              services={filteredServices}
              onDelete={handleDeleteService}
              onUpdate={handleUpdateService}
              emptyIcon={<Coffee className="w-16 h-16 mx-auto text-gray-400 mb-4" />}
              emptyMessage="Aucun service de pause café renforcé"
              type="enhanced_coffee"
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value="reservation">
            <ServiceGrid
              services={filteredServices}
              onDelete={handleDeleteService}
              onUpdate={handleUpdateService}
              emptyIcon={<CalendarDays className="w-16 h-16 mx-auto text-gray-400 mb-4" />}
              emptyMessage="Aucun service de réservation"
              type="reservation"
              searchTerm={searchTerm}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal d'ajout */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddService}
        serviceType={activeTab}
        serviceTypeLabel={getServiceTypeLabel(activeTab)}
      />
    </div>
  );
};

// --- Composants enfants ---
const ServiceGrid: React.FC<{
  services: Service[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Service>) => void;
  emptyIcon: React.ReactNode;
  emptyMessage: string;
  type: ServiceType;
  searchTerm: string;
}> = ({ services, onDelete, onUpdate, emptyIcon, emptyMessage, type, searchTerm }) => {
  if (services.length === 0) {
    return (
      <div id="services-grid" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full text-center py-12">
          {emptyIcon}
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
          <p className="text-gray-400">
            {searchTerm ? 'Aucun service ne correspond à votre recherche' : 'Ajoutez votre premier service'}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div id="services-grid" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map(service => (
        <ServiceCard
          key={service._id}
          service={service}
          onDelete={onDelete}
          onUpdate={onUpdate}
          type={type}
        />
      ))}
    </div>
  );
};

const ServiceCard: React.FC<{
  service: Service;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Service>) => void;
  type: ServiceType;
}> = ({ service, onDelete, onUpdate, type }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(service.title);
  const [editDescription, setEditDescription] = useState(service.description);
  const [editPrice, setEditPrice] = useState(service.price);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onUpdate(service._id, {
      title: editTitle,
      description: editDescription,
      price: editPrice
    });
    setSaving(false);
    if (success) setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(service.title);
    setEditDescription(service.description);
    setEditPrice(service.price);
    setIsEditing(false);
  };

  const formatPriceDisplay = (price: string) => {
    if (price.includes('/') || price.includes('€')) return price;
    switch (type) {
      case 'coffee': return `${price} € / personne`;
      case 'lunch': return `${price} € / personne`;
      case 'cocktail': return `${price} € / événement`;
      case 'room_rental': return `${price} € / salle`;
      case 'enhanced_coffee': return `${price} € / personne`;
      case 'reservation': return `${price} € / réservation`;
      default: return `${price} €`;
    }
  };

  const getServiceIcon = () => {
    switch (type) {
      case 'coffee': return <Coffee className="w-5 h-5" />;
      case 'lunch': return <UtensilsCrossed className="w-5 h-5" />;
      case 'cocktail': return <Martini className="w-5 h-5" />;
      case 'room_rental': return <Building className="w-5 h-5" />;
      case 'enhanced_coffee': return <Coffee className="w-5 h-5" />;
      case 'reservation': return <CalendarDays className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getServiceIcon()}
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-white bg-white/20 border-white placeholder:text-white/70 flex-1"
                placeholder="Titre du service"
              />
            ) : (
              <CardTitle className="text-white text-lg">{service.title}</CardTitle>
            )}
          </div>
          <div className="flex gap-1">
            <StatusBadge status={service.status} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-6 w-6 p-0 text-white hover:bg-blue-500 hover:text-white"
              disabled={saving}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(service._id)}
              className="h-6 w-6 p-0 text-white hover:bg-red-500 hover:text-white"
              disabled={saving}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {isEditing ? (
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="text-white bg-white/20 border-white placeholder:text-white/70 resize-none mt-2"
            rows={2}
            placeholder="Description du service"
          />
        ) : (
          <CardDescription className="text-white text-opacity-90 mt-2">
            {service.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Prix
              </label>
              <Input
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Ex: 15,50"
                className="bg-white border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format recommandé: "15,50" pour 15.50€
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-kimi-orange text-white"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Sauvegarder
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline" disabled={saving}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-kimi-orange">
              {formatPriceDisplay(service.price)}
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                Créé le {new Date(service.createdAt).toLocaleDateString('fr-FR')}
              </span>
              {service.updatedAt !== service.createdAt && (
                <span className="text-xs">Modifié</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StatusBadge: React.FC<{ status: 'active' | 'new' | 'limited' }> = ({ status }) => {
  const config = {
    'new': { label: 'Nouveau', className: 'bg-green-500 text-white' },
    'limited': { label: 'Limité', className: 'bg-amber-500 text-white' },
    'active': { label: 'Actif', className: 'bg-blue-500 text-white' },
  }[status];
  return <Badge className={`text-xs ${config.className}`}>{config.label}</Badge>;
};

export default Services;
