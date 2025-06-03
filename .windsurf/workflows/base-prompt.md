---
description: le prompt qui a généré l'application dans index.html
---

crée un application à destination des gérants de restaurant. L'application doit tenir dans un seul fichier html. La principale fonctionnalité du frontend est de présenter l'ensemble des produits du restaurant au travers d'un "digital menu ordering system", auquel les clients pourront accéder en scannant le qrcode sur leur table pour les commande sur place, ou via l'url de l'application pour les commandes en ligne. On va simuler un restaurant de sushi, tu auras donc une variable json-like contenant les produits présentés dans le menu digital.
L'application doit permettre plusieurs roles: 
- public: role réservé aux clients avec le moins de droits (lire les produits, commander), accès au frontend uniquement
- employee: role pour les employés, permet en plus de public de voir les commandes en cours, accès au frontend uniquement aussi mais avec des éléments en plus pour la gestion des commandes et autres impératifs de l'employé
- manager: accès au backend autorisé, role permettant en plus des précedants d'avoir accès aux informations des employers (tel, position géo en cours, tables assignées, son calendrier, etc) et de donner des ordre/directives aux employers (assigner une table, chat, se rendre à tel position, etc)
- admin: role qui donne accès à tous en CRUD

Dans l'interface du backend, il est possible de:
- voir les statistique de vente, pour le jour la semaine le mois en cours ou sur l'historique entier.
- gérer les commande en cours
- gérer les employer, leurs informations, ainsi que leur donner des ordres
- gérer les fournisseurs