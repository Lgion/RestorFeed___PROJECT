#!/bin/bash

# Script pour corriger les problèmes de color.adjust mal formés
# Corrige les paramètres $lightness mal placés

COMPONENTS_DIR="/home/nihongo/Bureau/googleAIstudio_apps/RestOrFeed/next-app/assets/bem/components"

echo "Recherche des fichiers avec des color.adjust() mal formés..."

# Trouver tous les fichiers .scss avec le problème
files_with_issues=$(find "$COMPONENTS_DIR" -name "*.scss" -exec grep -l "color\.adjust(map\.get([^,]*, \$lightness:" {} \;)

if [ -z "$files_with_issues" ]; then
    echo "Aucun fichier avec des color.adjust() mal formés trouvé!"
    exit 0
fi

echo "Fichiers trouvés avec des color.adjust() mal formés:"
echo "$files_with_issues"
echo ""

# Traiter chaque fichier
for filepath in $files_with_issues; do
    filename=$(basename "$filepath")
    echo "Correction de $filepath..."
    
    # Créer une copie de sauvegarde
    cp "$filepath" "$filepath.color-fix-backup"
    
    # Correction pour le pattern: color.adjust(map.get($defaultValues, $lightness: -key), percentage%)
    # Doit devenir: color.adjust(map.get($defaultValues, key), $lightness: -percentage%)
    
    # Pattern 1: $lightness: -key avec un tiret au début
    sed -i 's/color\.adjust(map\.get(\$defaultValues, \$lightness: -\([^)]*\)), \([^)]*\))/color.adjust(map.get($defaultValues, \1), $lightness: -\2)/g' "$filepath"
    
    # Pattern 2: $lightness: key sans tiret
    sed -i 's/color\.adjust(map\.get(\$defaultValues, \$lightness: \([^)]*\)), \([^)]*\))/color.adjust(map.get($defaultValues, \1), $lightness: \2)/g' "$filepath"
    
    echo "  - $filename corrigé"
done

echo ""
echo "✅ Correction des color.adjust() terminée!"
echo "📁 Les sauvegardes sont disponibles avec l'extension .color-fix-backup"
