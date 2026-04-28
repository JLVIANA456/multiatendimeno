import React from 'react';
import { Message } from './data/get-messages';
import {
  ChatMessage,
  ChatMessageFooter,
} from './styles';

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
}

// Normaliza os tipos vindos do Z-API para categorias internas
function getMediaCategory(mediaType?: string, mediaUrl?: string): 'document' | 'image' | 'video' | 'audio' | null {
  if (!mediaType && !mediaUrl) return null;

  const t = (mediaType || '').toLowerCase();

  if (t.includes('document') || t.includes('pdf')) return 'document';
  if (t.includes('image') || t.includes('sticker')) return 'image';
  if (t.includes('video') || t.includes('gif')) return 'video';
  if (t.includes('audio') || t.includes('ptt')) return 'audio';

  // Fallback por extensão da URL quando tipo não definido
  if (mediaUrl) {
    const url = mediaUrl.toLowerCase().split('?')[0];
    if (url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/)) return 'document';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(mp4|avi|mov|webm)$/)) return 'video';
    if (url.match(/\.(mp3|ogg|aac|m4a|opus)$/)) return 'audio';
    // Qualquer outra URL de mídia sem extensão conhecida → documento genérico
    if (t && t !== 'conversation') return 'document';
  }

  return null;
}

function getFileIcon(fileName?: string, category?: string | null): string {
  const name = (fileName || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'fa-file-pdf';
  if (name.match(/\.(doc|docx)$/)) return 'fa-file-word';
  if (name.match(/\.(xls|xlsx)$/)) return 'fa-file-excel';
  if (name.match(/\.(ppt|pptx)$/)) return 'fa-file-powerpoint';
  if (name.match(/\.(zip|rar|7z)$/)) return 'fa-file-zipper';
  if (category === 'image') return 'fa-file-image';
  if (category === 'video') return 'fa-file-video';
  if (category === 'audio') return 'fa-file-audio';
  return 'fa-file-lines';
}

const MessageBubble = ({ message, isFirstInGroup }: MessageBubbleProps) => {
  const category = getMediaCategory(message.mediaType, message.mediaUrl);

  return (
    <ChatMessage
      id={`msg-${message.id}`}
      className={`${message.isOpponent ? "chat__msg--received" : "chat__msg--sent"} ${
        isFirstInGroup ? "first-in-group" : "consecutive-message"
      }`}
      style={{ flexDirection: 'column' }}
    >
      {/* ── Imagem ──────────────────────────────────────────────────────────── */}
      {category === 'image' && message.mediaUrl && (
        <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: 4 }}>
          <img
            src={message.mediaUrl}
            alt={message.fileName || 'Imagem'}
            style={{ maxWidth: 260, maxHeight: 200, borderRadius: 10, objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </a>
      )}

      {/* ── Vídeo ───────────────────────────────────────────────────────────── */}
      {category === 'video' && message.mediaUrl && (
        <video
          src={message.mediaUrl}
          controls
          style={{ maxWidth: 260, borderRadius: 10, marginBottom: 4, display: 'block' }}
        />
      )}

      {/* ── Áudio ───────────────────────────────────────────────────────────── */}
      {category === 'audio' && message.mediaUrl && (
        <audio
          src={message.mediaUrl}
          controls
          style={{ width: 220, marginBottom: 4 }}
        />
      )}

      {/* ── Documento / PDF / Arquivo ────────────────────────────────────────── */}
      {category === 'document' && message.mediaUrl && (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="document-bubble"
          title="Clique para baixar"
        >
          <div className="document-icon">
            <i className={`fa-solid ${getFileIcon(message.fileName, category)}`}></i>
          </div>
          <div className="document-info">
            <span>{message.fileName || 'Documento'}</span>
            <small>{message.fileName?.split('.').pop()?.toUpperCase() || 'ARQUIVO'}</small>
          </div>
          <div className="download-button">
            <i className="fa-solid fa-download"></i>
          </div>
        </a>
      )}

      {/* ── Texto / Legenda ─────────────────────────────────────────────────── */}
      {message.body && (
        <span style={{ display: 'block', padding: category ? '4px 2px' : '0' }}>
          {message.body}
        </span>
      )}

      {/* ── Fallback: mídia sem tipo reconhecido ────────────────────────────── */}
      {!category && !message.body && message.mediaUrl && (
        <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontSize: 12 }}>
          📎 Ver anexo
        </a>
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
