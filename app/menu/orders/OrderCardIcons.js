// Centralise les icônes pour OrderCard pour éviter les imports multiples
import { X, Archive } from "lucide-react";

export const CancelIcon = (props) => <X size={18} aria-label="Annuler" {...props} />;
export const ArchiveIcon = (props) => <Archive size={18} aria-label="Archiver" {...props} />;
