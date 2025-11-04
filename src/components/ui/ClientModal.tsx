import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>) => void;
  client?: Client | null;
  isEditing?: boolean;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    contractNumber: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire avec les données du client en mode édition
  useEffect(() => {
    if (isEditing && client) {
      setFormData({
        name: client.name || '',
        contact: client.contact || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        contractNumber: client.contractNumber || '',
        status: client.status || 'active',
        notes: client.notes || ''
      });
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        contractNumber: '',
        status: 'active',
        notes: ''
      });
    }
    setErrors({});
  }, [isOpen, client, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du client est obligatoire';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Le nom du contact est obligatoire';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    if (!formData.contractNumber.trim()) {
      newErrors.contractNumber = 'Le numéro de contrat est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        contractNumber: formData.contractNumber.trim(),
        status: formData.status,
        notes: formData.notes.trim() || undefined
      });
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      contractNumber: '',
      status: 'active',
      notes: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newContractNumber = `CT-${year}${month}-${random}`;
    
    setFormData(prev => ({
      ...prev,
      contractNumber: newContractNumber
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le client' : 'Ajouter un nouveau client'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Ligne 1: Nom et Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Nom du client <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Entreprise ABC"
                disabled={isSubmitting}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact" className="flex items-center gap-1">
                Personne à contacter <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="Ex: Jean Dupont"
                disabled={isSubmitting}
                className={errors.contact ? 'border-red-500' : ''}
              />
              {errors.contact && (
                <p className="text-red-500 text-sm">{errors.contact}</p>
              )}
            </div>
          </div>

          {/* Ligne 2: Email et Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Ex: contact@entreprise.com"
                disabled={isSubmitting}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Ex: +33 1 23 45 67 89"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Ligne 3: Numéro de contrat et Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contractNumber" className="flex items-center gap-1">
                Numéro de contrat <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="contractNumber"
                  value={formData.contractNumber}
                  onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                  placeholder="Ex: CT-2023-001"
                  disabled={isSubmitting}
                  className={errors.contractNumber ? 'border-red-500' : ''}
                />
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateContractNumber}
                    disabled={isSubmitting}
                    className="whitespace-nowrap"
                  >
                    Générer
                  </Button>
                )}
              </div>
              {errors.contractNumber && (
                <p className="text-red-500 text-sm">{errors.contractNumber}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Adresse */}
          <div className="grid gap-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ex: 123 Rue de Paris, 75001 Paris, France"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes supplémentaires</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Informations complémentaires sur le client..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-kimi-orange hover:bg-kimi-orange-dark text-white"
          >
            {isSubmitting ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Ajouter le client')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;