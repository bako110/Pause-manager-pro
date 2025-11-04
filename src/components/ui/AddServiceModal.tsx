import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: { 
    title: string; 
    description: string; 
    price: string; 
    status: 'active' | 'new' | 'limited';
    type: 'coffee' | 'lunch' | 'rooms';
  }) => void;
  serviceType: 'coffee' | 'lunch' | 'rooms';
  serviceTypeLabel: string;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  serviceType,
  serviceTypeLabel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    status: 'active' as 'active' | 'new' | 'limited'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (formData.title && formData.description && formData.price) {
      setIsSubmitting(true);
      try {
        // Ajouter l'unité automatiquement au prix si pas déjà présente
        let finalPrice = formData.price.trim();
        if (!finalPrice.includes('/')) {
          switch (serviceType) {
            case 'coffee':
              finalPrice += ' / personne';
              break;
            case 'lunch':
              finalPrice += ' / personne';
              break;
            case 'rooms':
              finalPrice += ' / salle';
              break;
          }
        }
        
        await onSave({ 
          ...formData,
          price: finalPrice,
          type: serviceType
        });
        resetForm();
      } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      status: 'active'
    });
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
  };

  const getPricePlaceholder = () => {
    switch (serviceType) {
      case 'coffee': return 'Ex: 5,00 €';
      case 'lunch': return 'Ex: 15,00 €';
      case 'rooms': return 'Ex: 250,00 €';
      default: return 'Ex: 15,00 €';
    }
  };

  const getPriceLabel = () => {
    switch (serviceType) {
      case 'coffee': return 'Prix par personne *';
      case 'lunch': return 'Prix par personne *';
      case 'rooms': return 'Prix par salle *';
      default: return 'Prix *';
    }
  };

  const getTitlePlaceholder = () => {
    switch (serviceType) {
      case 'coffee': return 'Ex: Café Premium, Thé Signature...';
      case 'lunch': return 'Ex: Menu du Jour, Buffet d\'Affaires...';
      case 'rooms': return 'Ex: Salle de Réunion, Espace Conférence...';
      default: return 'Nom du service';
    }
  };

  const getDescriptionPlaceholder = () => {
    switch (serviceType) {
      case 'coffee': return 'Décrivez les boissons et accompagnements...';
      case 'lunch': return 'Décrivez le menu, les options...';
      case 'rooms': return 'Décrivez la salle, capacité, équipements...';
      default: return 'Décrivez votre service en détail...';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un service {serviceTypeLabel}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Nom du service *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={getTitlePlaceholder()}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={getDescriptionPlaceholder()}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">{getPriceLabel()}</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder={getPricePlaceholder()}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                {serviceType === 'coffee' && 'Le prix sera affiché avec "/ personne"'}
                {serviceType === 'lunch' && 'Le prix sera affiché avec "/ personne"'}
                {serviceType === 'rooms' && 'Le prix sera affiché avec "/ salle"'}
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'active' | 'new' | 'limited') => handleInputChange('status', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="limited">Limité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title || !formData.description || !formData.price || isSubmitting}
            className="bg-kimi-orange hover:bg-kimi-orange-dark text-white"
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter le service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;