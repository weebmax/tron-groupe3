# 🎮 Projet Tron - Jeu Multijoueur

## 📋 Description

Projet de développement d'un jeu Tron multijoueur utilisant :
- **Client** : Application mobile Cordova (HTML/CSS/JavaScript)
- **Serveur** : Serveur WebSocket Node.js pour la synchronisation en temps réel
- **Communication** : WebSocket pour le multijoueur

## 🚀 Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

- **Node.js** (v14 ou supérieur) - [Télécharger](https://nodejs.org/)
- **npm** (inclus avec Node.js)
- **Cordova** (optionnel pour le développement mobile)
npm install -g cordova

text

## 📁 Structure du Projet

tron-groupe3/
├── client/ # Application client Cordova
│ ├── www/ # Fichiers web (HTML/CSS/JS)
│ │ ├── index.html # Page principale
│ │ ├── js/
│ │ │ └── index.js # Logique client + WebSocket
│ │ └── css/
│ │ └── index.css # Styles
│ └── config.xml # Configuration Cordova
│
├── server/ # Serveur WebSocket Node.js
│ ├── Server.js # Code du serveur
│ └── package.json # Dépendances serveur
│
└── README.md # Ce fichier

text

## 🔧 Installation

### 1. Cloner le repository
git clone https://github.com/Exyo02/tron-groupe3.git
cd tron-groupe3

text

### 2. Installer les dépendances du serveur
cd server
npm install
cd ..

text

### 3. Installer les dépendances du client (si nécessaire)
cd client
npm install
cd ..

text

## ▶️ Lancement du Projet

### Démarrer le serveur WebSocket

cd server
node Server.js

text

Le serveur démarrera sur `ws://localhost:9898`

### Démarrer le client Cordova

**Option 1 : Dans le navigateur**
cd client
npx cordova serve

text
Puis ouvrez : `http://localhost:8000`

**Option 2 : Sur un émulateur Android**
cd client
npx cordova run android

text

## 🎮 Fonctionnalités

### ✅ Implémenté
- [x] Serveur WebSocket fonctionnel
- [x] Client Cordova avec connexion WebSocket
- [x] Communication bidirectionnelle client-serveur

### 🚧 En cours de développement
- [ ] Logique du jeu Tron (grille, déplacements)
- [ ] Gestion multijoueur (synchronisation des positions)
- [ ] Interface de jeu complète
- [ ] Système de collision et score

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Backend** : Node.js, WebSocket
- **Mobile** : Apache Cordova
- **Contrôle de version** : Git / GitHub

## 👥 Contributeurs

- **Exyo02** (Matis Basso)
- **Nizijolas**
- **weebmax** (Eric)

## 📝 Notes de Développement

### WebSocket
Le serveur écoute sur le port **9898**. Pour modifier le port, éditez `server/Server.js`.

### Cordova
Pour ajouter des plateformes :
cd client
npx cordova platform add android
npx cordova platform add browser

text

## 🐛 Problèmes Connus

- Le client doit être lancé **après** le serveur
- Vérifier que le port 9898 n'est pas déjà utilisé

## 📄 Licence

Projet académique - Master 2 S1 - Web Client

---

**Dernière mise à jour** : 16 novembre 2025