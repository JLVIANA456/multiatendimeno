import React from 'react';
import { Message } from './data/get-messages';
import {
  ChatMessage,
  ChatMessageFooter,
  ChatMessageFiller,
} from './styles';

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
}

const MessageBubble = ({ message, isFirstInGroup }: MessageBubbleProps) => {
  const isDocument = message.mediaType === 'document' || (message.mediaUrl && !message.mediaType);

  return (
    <ChatMessage
      className={`${message.isOpponent ? "chat__msg--received" : "chat__msg--sent"} ${
        isFirstInGroup ? "first-in-group" : "consecutive-message"
      }`}
      style={{ flexDirection: 'column' }}
    >
      {/* Se for documento, renderiza o card de anexo */}
      {isDocument && message.mediaUrl ? (
        <a 
          href={message.mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="document-bubble"
          title="Clique para baixar"
        >
          <div className="document-icon">
            <i className={`fa-solid ${message.fileName?.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-lines'}`}></i>
          </div>
          <div className="document-info">
            <span>{message.fileName || 'Documento'}</span>
            <small>{message.fileName?.split('.').pop()?.toUpperCase() || 'ARQUIVO'}</small>
          </div>
          <div className="download-button">
            <i className="fa-solid fa-download"></i>
          </div>
        </a>
      ) : null}

      {/* Renderiza o texto (corpo ou legenda se houver) */}
      {message.body && (
        <span style={{ display: 'block', padding: isDocument ? '4px 2px' : '0' }}>
          {message.body}
        </span>
      )}

      <ChatMessageFooter>
        <span>{message.timestamp}</span>
        {!message.isOpponent && (
          <div className="chat__msg-status-icon">
            {message.isPending ? (
              <i className="fa-solid fa-clock opacity-50" style={{ fontSize: '10px' }}></i>
            ) : (
              <i
                className={`fa-solid fa-check-double ${
                  message.messageStatus === "READ" ? "chat__msg-status-icon--blue" : ""
                }`}
                style={{ fontSize: '10px' }}
              ></i>
            )}
          </div>
        )}
      </ChatMessageFooter>
    </ChatMessage>
  );
};

export default React.memo(MessageBubble);
