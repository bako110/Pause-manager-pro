import React, { useState, useEffect } from 'react';
import AccueilNavBar from '@/components/layout/AccueilNavBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { exportToExcel, exportToPDF, printTable, ExportIcons } from '@/utils/exportUtils';
import { Search, Upload, Plus } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../public/environment';
import ClientModal from '@/components/ui/ClientModal';

// Types pour les clients
interface Client {
  _id: string;
  name: string;
  contact: string;
  email: string;
  phone?: string;
  address?: string;
  contractNumber: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Client | Client[];
  message?: string;
  count?: number;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Configuration Axios
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Charger les clients depuis le backend
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ApiResponse>('/clients');
      
      if (response.data.success) {
        setClients(response.data.data as Client[]);
      } else {
        setError('Erreur lors du chargement des clients');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des clients:', error);
      setError(error.response?.data?.error || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Filtrer les clients selon la recherche
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter un client
  const handleAddClient = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  // Éditer un client
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  // Sauvegarder un client (création ou modification)
  const handleSaveClient = async (clientData: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      let response;

      if (editingClient) {
        // Mode édition
        response = await api.put<ApiResponse>(`/clients/${editingClient._id}`, clientData);
      } else {
        // Mode création
        response = await api.post<ApiResponse>('/clients', clientData);
      }

      if (response.data.success) {
        if (editingClient) {
          setClients(prev => 
            prev.map(client => 
              client._id === editingClient._id ? response.data.data as Client : client
            )
          );
        } else {
          setClients(prev => [...prev, response.data.data as Client]);
        }
        setShowModal(false);
        setEditingClient(null);
      } else {
        setError(response.data.error || 'Erreur lors de la sauvegarde du client');
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du client:', error);
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde du client');
    }
  };

  // Supprimer un client
  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

    try {
      setError(null);
      const response = await api.delete<ApiResponse>(`/clients/${clientId}`);

      if (response.data.success) {
        setClients(prev => prev.filter(client => client._id !== clientId));
      } else {
        setError('Erreur lors de la suppression du client');
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du client:', error);
      setError(error.response?.data?.error || 'Erreur lors de la suppression du client');
    }
  };

  // Exporter les données
  const handleExportToExcel = () => {
    exportToExcel(clients, 'liste-clients');
  };

  const handleExportToPDF = () => {
    exportToPDF('clients-table', 'Liste des Clients');
  };

  const handlePrint = () => {
    printTable('clients-table');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsUploading(true);
      // À implémenter : logique d'importation réelle
      setTimeout(() => {
        setIsUploading(false);
        alert('Importation terminée avec succès!');
        // Recharger les clients après import
        fetchClients();
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AccueilNavBar />
        <div className="p-6 pt-24 flex justify-center items-center">
          <div className="text-white">Chargement des clients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AccueilNavBar />
      <div className="p-6 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Clients</h1>
          <p className="text-white-600 mt-2">Gérez vos clients et contrats</p>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <Card className="border-none shadow-md">
          <CardHeader className="bg-kimi-green bg-opacity-90 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl">Liste des clients</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un client..."
                    className="pl-8 w-full sm:w-[250px] bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tabs defaultValue="actions" className="w-full sm:w-auto">
                  <TabsList>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="export">Exporter</TabsTrigger>
                  </TabsList>
                  <TabsContent value="actions" className="flex gap-2 mt-0">
                    <Button 
                      variant="default" 
                      className="bg-kimi-orange hover:bg-kimi-orange-dark text-white"
                      onClick={handleAddClient}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un client
                    </Button>
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        className="bg-white"
                        disabled={isUploading}
                      >
                        <Upload size={16} className="mr-2" />
                        {isUploading ? 'Import...' : 'Importer'}
                      </Button>
                      <Input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="export" className="flex gap-2 mt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportToExcel}
                      className="bg-white"
                      disabled={clients.length === 0}
                    >
                      {ExportIcons.Excel} Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportToPDF}
                      className="bg-white"
                      disabled={clients.length === 0}
                    >
                      {ExportIcons.PDF} PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrint}
                      className="bg-white"
                      disabled={clients.length === 0}
                    >
                      {ExportIcons.Print} Imprimer
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Table id="clients-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>N° Contrat Global</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client._id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || 'Non renseigné'}</TableCell>
                      <TableCell>{client.contractNumber}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {client.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-2 border-kimi-green text-kimi-green hover:bg-kimi-green hover:text-white"
                          onClick={() => handleEditClient(client)}
                        >
                          Éditer
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                          onClick={() => handleDeleteClient(client._id)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {clients.length === 0 ? (
                        <div className="text-center">
                          <p className="text-gray-500 text-lg">Aucun client enregistré</p>
                          <p className="text-gray-400 mt-2">Commencez par ajouter votre premier client</p>
                          <Button 
                            className="mt-4 bg-kimi-orange hover:bg-kimi-orange-dark text-white"
                            onClick={handleAddClient}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter un client
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-500 text-lg">Aucun client trouvé</p>
                          <p className="text-gray-400 mt-2">Essayez de modifier vos critères de recherche</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal pour ajouter/éditer un client */}
        <ClientModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClient}
          client={editingClient}
          isEditing={!!editingClient}
        />
      </div>
    </div>
  );
};

export default Clients;