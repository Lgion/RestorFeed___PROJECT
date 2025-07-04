#!/bin/bash

# Script pour corriger automatiquement les dépréciations SCSS
# Traite tous les fichiers .scss dans le répertoire components

COMPONENTS_DIR="/home/nihongo/Bureau/googleAIstudio_apps/RestOrFeed/next-app/assets/bem/components"

# Liste des fichiers à traiter (excluant productCard.scss et actionHeader.scss déjà corrigés)
files_to_fix=(
    "categoryFilter.scss"
    "adminPage.scss"
    "card.scss"
    "card_.scss"
    "cartHover.scss"
    "dashboard.scss"
    "menuLayout.scss"
    "modal.scss"
    "notification.scss"
    "orderCard.scss"
    "orderList.scss"
    "productForm.scss"
)

for file in "${files_to_fix[@]}"; do
    filepath="$COMPONENTS_DIR/$file"
    
    if [[ -f "$filepath" ]]; then
        echo "Traitement de $file..."
        
        # Vérifier si le fichier contient des fonctions dépréciées
        if grep -q "map.get\|map-merge\|darken\|lighten" "$filepath"; then
            echo "  - Fonctions dépréciées trouvées dans $file"
            
            # Créer une copie de sauvegarde
            cp "$filepath" "$filepath.backup"
            
            # Ajouter les imports au début du fichier s'ils n'existent pas déjà
            if ! grep -q "@use \"sass:map\"" "$filepath"; then
                echo "  - Ajout des imports sass:map et sass:color"
                # Insérer les imports au début du fichier
                sed -i '1i@use "sass:map";\n@use "sass:color";\n' "$filepath"
            fi
            
            # Remplacer map.get par map.get
            if grep -q "map.get" "$filepath"; then
                echo "  - Remplacement de map.get par map.get"
                sed -i 's/map.get/map.get/g' "$filepath"
            fi
            
            # Remplacer map-merge par map.merge
            if grep -q "map-merge" "$filepath"; then
                echo "  - Remplacement de map-merge par map.merge"
                sed -i 's/map-merge/map.merge/g' "$filepath"
            fi
            
            # Remplacer darken() par color.adjust() avec $lightness: -X%
            if grep -q "darken(" "$filepath"; then
                echo "  - Remplacement de darken() par color.adjust()"
                # Utiliser une expression régulière pour capturer darken(color, percentage)
                sed -i 's/darken(\([^,]*\), \([^)]*\))/color.adjust(\1, $lightness: -\2)/g' "$filepath"
            fi
            
            # Remplacer lighten() par color.adjust() avec $lightness: +X%
            if grep -q "lighten(" "$filepath"; then
                echo "  - Remplacement de lighten() par color.adjust()"
                # Utiliser une expression régulière pour capturer lighten(color, percentage)
                sed -i 's/lighten(\([^,]*\), \([^)]*\))/color.adjust(\1, $lightness: \2)/g' "$filepath"
            fi
            
            echo "  - $file corrigé avec succès"
        else
            echo "  - Aucune fonction dépréciée trouvée dans $file"
        fi
    else
        echo "  - Fichier $file non trouvé"
    fi
done

echo "Correction terminée!"
echo "Les sauvegardes sont disponibles avec l'extension .backup"
