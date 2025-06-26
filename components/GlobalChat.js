'use client';

import { useState, useEffect, useRef } from 'react';
import './GlobalChat.scss';

export default function GlobalChat({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Récupérer les conversations au chargement
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      // Polling pour les nouveaux messages toutes les 5 secondes
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/chat/user-conversations/${currentUser.id}`);
      const data = await response.json();
      
      setConversations(data);
      
      // Calculer le nombre total de messages non lus
      const totalUnread = data.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`/api/chat/messages/${conversationId}`);
      const data = await response.json();
      setMessages(data);
      
      // Marquer les messages comme lus
      await fetch('/api/chat/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: currentUser.id
        })
      });
      
      // Actualiser les conversations pour mettre à jour le compteur
      fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const response = await fetch(`/api/chat/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          authorId: currentUser.id
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour obtenir le nom d'affichage d'une conversation
  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    
    if (conversation.type === 'private') {
      // Pour une conversation privée, afficher le nom de l'autre participant
      const otherParticipants = conversation.participants.filter(p => p.userId !== currentUser.id);
      if (otherParticipants.length > 0) {
        return otherParticipants[0].user.username || otherParticipants[0].user.email;
      }
    }
    
    return `Conversation ${conversation.type}`;
  };

  // Ne pas afficher le chat pour les utilisateurs publics
  if (!currentUser || currentUser.role === 'public') {
    return null;
  }

  return (
    <>
      {/* Bouton flottant de chat */}
      <div 
        className={`global-chat__fab ${isOpen ? 'global-chat__fab--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
        {unreadCount > 0 && (
          <div className="global-chat__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      {/* Modal de chat */}
      {isOpen && (
        <div className="global-chat__modal">
          <div className="global-chat__header">
            <h3>💬 Chat</h3>
            <button 
              className="global-chat__close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="global-chat__body">
            {/* Liste des conversations */}
            <div className="conversation-list">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conversation-header">
                    <span className="conversation-name">
                      {conv.type === 'general' && '💬 '}
                      {conv.type === 'support' && '🆘 '}
                      {conv.type === 'private' && '👤 '}
                      {conv.type === 'group' && '👥 '}
                      {getConversationName(conv)}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                  {conv.messages[0] && (
                    <div className="last-message">
                      <span className="author">{conv.messages[0].author.username || conv.messages[0].author.email}:</span>
                      <span className="content">{conv.messages[0].content}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Zone de messages */}
            {selectedConversation && (
              <div className="global-chat__messages-container">
                <div className="global-chat__messages-header">
                  {getConversationName(selectedConversation)}
                </div>
                
                <div className="global-chat__messages">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`global-chat__message ${message.authorId === currentUser.id ? 'own' : 'other'}`}
                    >
                      <div className="global-chat__message-author">
                        {message.author.username || message.author.email}
                      </div>
                      <div className="global-chat__message-content">
                        {message.content}
                      </div>
                      <div className="global-chat__message-time">
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="global-chat__input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Tapez votre message..."
                    className="global-chat__input"
                  />
                  <button 
                    onClick={sendMessage}
                    className="global-chat__send"
                    disabled={!newMessage.trim()}
                  >
                    📤
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
