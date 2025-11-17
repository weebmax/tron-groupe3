/*
 * Tron Multiplayer - Client WebSocket
 * Gestion de la connexion, enregistrement joueur, et communication
 */

// ========================================
// VARIABLES GLOBALES
// ========================================

let ws = null; // WebSocket connection
let isConnected = false;
let playerName = '';
let playerColor = '';
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const WEBSOCKET_URL = 'ws://localhost:9898';

// ========================================
// INITIALISATION CORDOVA
// ========================================

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('✅ Cordova is ready!');
    console.log(`Running cordova-${cordova.platformId}@${cordova.version}`);
    
    // Initialiser la connexion WebSocket
    initWebSocket();
    
    // Initialiser les événements
    initEventListeners();
}

// Si Cordova n'est pas disponible (navigateur), on lance quand même
if (!window.cordova) {
    console.log('⚠️ Cordova not detected, running in browser mode');
    document.addEventListener('DOMContentLoaded', () => {
        initWebSocket();
        initEventListeners();
    });
}

// ========================================
// WEBSOCKET - CONNEXION
// ========================================

function initWebSocket() {
    console.log('🔌 Tentative de connexion au serveur...');
    updateConnectionStatus('connecting', 'Connexion au serveur...');
    
    try {
        ws = new WebSocket(WEBSOCKET_URL);
        
        // Événement : connexion réussie
        ws.addEventListener('open', onWebSocketOpen);
        
        // Événement : message reçu
        ws.addEventListener('message', onWebSocketMessage);
        
        // Événement : connexion fermée
        ws.addEventListener('close', onWebSocketClose);
        
        // Événement : erreur
        ws.addEventListener('error', onWebSocketError);
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du WebSocket:', error);
        updateConnectionStatus('disconnected', 'Erreur de connexion');
    }
}

function onWebSocketOpen() {
    console.log('✅ Connecté au serveur WebSocket!');
    isConnected = true;
    reconnectAttempts = 0;
    updateConnectionStatus('connected', '✓ Connecté au serveur');
}

function onWebSocketMessage(event) {
    console.log('📨 Message reçu:', event.data);
    
    try {
        // Essayer de parser en JSON
        const data = JSON.parse(event.data);
        handleStructuredMessage(data);
    } catch (e) {
        // Si ce n'est pas du JSON, c'est un message texte simple
        addMessage('Serveur', event.data);
    }
}

function onWebSocketClose() {
    console.log('🔌 Connexion fermée');
    isConnected = false;
    updateConnectionStatus('disconnected', '● Déconnecté');
    
    // Tentative de reconnexion
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔄 Tentative de reconnexion ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
        setTimeout(initWebSocket, 3000);
    } else {
        updateConnectionStatus('disconnected', '❌ Impossible de se connecter');
    }
}

function onWebSocketError(error) {
    console.error('❌ Erreur WebSocket:', error);
    updateConnectionStatus('disconnected', '❌ Erreur de connexion');
}

// ========================================
// GESTION DES MESSAGES
// ========================================

function handleStructuredMessage(data) {
    switch(data.type) {
        case 'welcome':
            addMessage('Serveur', data.message);
            break;
            
        case 'player_joined':
            addMessage('Info', `${data.playerName} a rejoint la partie`);
            addPlayerToList(data.playerName, data.playerColor);
            updatePlayerCount();
            break;
            
        case 'player_left':
            addMessage('Info', `${data.playerName} a quitté la partie`);
            removePlayerFromList(data.playerName);
            updatePlayerCount();
            break;
            
        case 'players_list':
            updatePlayersList(data.players);
            break;
            
        case 'chat':
            addMessage(data.from, data.message, data.color);
            break;
            
        default:
            addMessage('Serveur', JSON.stringify(data));
    }
}

function sendMessage(type, data) {
    if (!isConnected || !ws) {
        console.error('❌ Non connecté au serveur');
        return;
    }
    
    const message = JSON.stringify({
        type: type,
        ...data
    });
    
    ws.send(message);
    console.log('📤 Message envoyé:', message);
}

// ========================================
// INTERFACE - ÉVÉNEMENTS
// ========================================

function initEventListeners() {
    // Bouton rejoindre
    const joinBtn = document.getElementById('join-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', handleJoinGame);
    }
    
    // Bouton déconnexion
    const disconnectBtn = document.getElementById('disconnect-btn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', handleDisconnect);
    }
    
    // Bouton envoyer message
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendChatMessage);
    }
    
    // Entrée message (Enter pour envoyer)
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendChatMessage();
            }
        });
    }
}

function handleJoinGame() {
    const nameInput = document.getElementById('player-name');
    const colorSelect = document.getElementById('player-color');
    
    playerName = nameInput.value.trim();
    playerColor = colorSelect.value;
    
    // Validation
    if (!playerName) {
        alert('⚠️ Veuillez entrer un nom de joueur');
        return;
    }
    
    if (!isConnected) {
        alert('⚠️ Pas de connexion au serveur');
        return;
    }
    
    // Envoyer l'enregistrement au serveur
    sendMessage('register', {
        playerName: playerName,
        playerColor: playerColor
    });
    
    // Afficher l'écran de jeu
    showGameScreen();
}

function handleDisconnect() {
    // Informer le serveur
    sendMessage('disconnect', {
        playerName: playerName
    });
    
    // Fermer la connexion
    if (ws) {
        ws.close();
    }
    
    // Retour à l'écran d'enregistrement
    showRegistrationScreen();
}

function handleSendChatMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Envoyer le message au serveur
    sendMessage('chat', {
        from: playerName,
        message: message,
        color: playerColor
    });
    
    // Vider l'input
    messageInput.value = '';
}

// ========================================
// INTERFACE - AFFICHAGE
// ========================================

function showGameScreen() {
    document.getElementById('registration-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Afficher les infos du joueur
    document.getElementById('current-player-name').textContent = playerName;
    document.getElementById('current-player-color').style.backgroundColor = playerColor;
}

function showRegistrationScreen() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('registration-screen').classList.add('active');
    
    // Réinitialiser
    playerName = '';
    playerColor = '';
    clearPlayersList();
    clearMessages();
}

function updateConnectionStatus(status, text) {
    const statusElement = document.getElementById('connection-status');
    if (!statusElement) return;
    
    statusElement.className = `status ${status}`;
    statusElement.textContent = text;
}

function addMessage(from, text, color = null) {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const timestamp = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageDiv.innerHTML = `
        <span class="timestamp">${timestamp}</span>
        <strong style="${color ? `color: ${color}` : ''}">${from}:</strong> ${text}
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function clearMessages() {
    const container = document.getElementById('messages-container');
    if (container) {
        container.innerHTML = '';
    }
}

// ========================================
// LISTE DES JOUEURS
// ========================================

function addPlayerToList(name, color) {
    const list = document.getElementById('players-list');
    if (!list) return;
    
    // Vérifier si le joueur existe déjà
    if (document.getElementById(`player-${name}`)) return;
    
    const li = document.createElement('li');
    li.className = 'player-item';
    li.id = `player-${name}`;
    li.innerHTML = `
        <span class="color-badge" style="background-color: ${color}"></span>
        <span>${name}</span>
    `;
    
    list.appendChild(li);
}

function removePlayerFromList(name) {
    const playerElement = document.getElementById(`player-${name}`);
    if (playerElement) {
        playerElement.remove();
    }
}

function updatePlayersList(players) {
    clearPlayersList();
    
    players.forEach(player => {
        addPlayerToList(player.name, player.color);
    });
    
    updatePlayerCount();
}

function clearPlayersList() {
    const list = document.getElementById('players-list');
    if (list) {
        list.innerHTML = '';
    }
}

function updatePlayerCount() {
    const list = document.getElementById('players-list');
    const countElement = document.getElementById('player-count');
    
    if (list && countElement) {
        countElement.textContent = list.children.length;
    }
}
