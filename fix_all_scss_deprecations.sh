#!/bin/bash

# Script pour corriger récursivement toutes les dépréciations SCSS
# Traite tous les fichiers .scss dans tous les sous-répertoires de components

COMPONENTS_DIR="/home/nihongo/Bureau/googleAIstudio_apps/RestOrFeed/next-app/assets/bem/components"

echo "Recherche de tous les fichiers .scss avec des fonctions dépréciées..."

# Trouver tous les fichiers .scss contenant des fonctions dépréciées
files_with_issues=$(find "$COMPONENTS_DIR" -name "*.scss" -exec grep -l "map.get\|map-merge\|darken(\|lighten(" {} \;)

if [ -z "$files_with_issues" ]; then
    echo "Aucun fichier avec des fonctions dépréciées trouvé!"
    exit 0
fi

echo "Fichiers trouvés avec des fonctions dépréciées:"
echo "$files_with_issues"
echo ""

# Traiter chaque fichier
for filepath in $files_with_issues; do
    filename=$(basename "$filepath")
    echo "Traitement de $filepath..."
    
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
        sed -i 's/darken(\([^,]*\), \([^)]*\))/color.adjust(\1, $lightness: -\2)/g' "$filepath"
    fi
    
    # Remplacer lighten() par color.adjust() avec $lightness: +X%
    if grep -q "lighten(" "$filepath"; then
        echo "  - Remplacement de lighten() par color.adjust()"
        sed -i 's/lighten(\([^,]*\), \([^)]*\))/color.adjust(\1, $lightness: \2)/g' "$filepath"
    fi
    
    echo "  - $filename corrigé avec succès"
    echo ""
done

echo "✅ Correction de tous les fichiers SCSS terminée!"
echo "📁 Les sauvegardes sont disponibles avec l'extension .backup"

# Compter le nombre de fichiers traités
total_files=$(echo "$files_with_issues" | wc -l)
echo "📊 Total: $total_files fichiers traités"
