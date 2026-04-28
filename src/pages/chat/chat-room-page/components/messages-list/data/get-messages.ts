import { MessageStatus } from "common/types/common.type";

export type Message = {
  id: string;
  body: string; // Caption ou texto
  date: string;
  timestamp: string;
  messageStatus: MessageStatus;
  isOpponent: boolean;
  isPending?: boolean;
  mediaUrl?: string; // Link para o arquivo
  fileName?: string; // Nome original do arquivo
  mediaType?: 'conversation' | 'image' | 'video' | 'document' | 'audio';
};

const messages: Message[] = [
  {
    id: "1",
    body: "Você pode me enviar aquele arquivo?",
    date: "19/02/2026",
    timestamp: "08:58",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "2",
    body: "Com certeza, envio sim.",
    date: "20/02/2026",
    timestamp: "09:01",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "3",
    body: "Acabei de mandar mais uma mensagem aqui..",
    date: "20/02/2026",
    timestamp: "09:05",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "4",
    body: "A que horas devemos nos encontrar?",
    date: "20/02/2026",
    timestamp: "12:30",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "5",
    body: "Pode me confirmar se recebeu o arquivo?",
    date: "21/02/2026",
    timestamp: "15:42",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "6",
    body: "Estarei lá em 10 minutos.",
    date: "22/02/2026",
    timestamp: "10:12",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "7",
    body: "Vamos nos encontrar na cafeteria.",
    date: "23/02/2026",
    timestamp: "18:03",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "8",
    body: "Desculpe, não poderei ir hoje.",
    date: "24/02/2026",
    timestamp: "13:25",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "9",
    body: "Sem problemas, podemos remarcar.",
    date: "25/02/2026",
    timestamp: "16:08",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "10",
    body: "Você tem alguma sugestão para o jantar?",
    date: "26/02/2026",
    timestamp: "20:12",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "11",
    body: "Que tal aquele novo restaurante italiano?",
    date: "27/02/2026",
    timestamp: "09:52",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "12",
    body: "Parece ótimo para mim.",
    date: "28/02/2026",
    timestamp: "14:27",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "13",
    body: "Fico feliz em ouvir isso!",
    date: "28/02/2026",
    timestamp: "14:30",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "14",
    body: "Que horas fica bom para você?",
    date: "01/03/2026",
    timestamp: "11:45",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "15",
    body: "Que tal às 14h?",
    date: "01/03/2026",
    timestamp: "11:47",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "16",
    body: "14h está perfeito para mim!",
    date: "01/03/2026",
    timestamp: "11:50",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "17",
    body: "Te vejo lá!",
    date: "01/03/2026",
    timestamp: "11:55",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "18",
    body: "Ei, como estão as coisas?",
    date: "02/03/2026",
    timestamp: "16:35",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "19",
    body: "Tudo certo, e por aí?",
    date: "02/03/2026",
    timestamp: "16:40",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "20",
    body: "Só relaxando em casa hoje.",
    date: "02/03/2026",
    timestamp: "16:42",
    messageStatus: "READ",
    isOpponent: false,
  },
  {
    id: "21",
    body: "Parece bom. Algum plano para o fim de semana?",
    date: "03/03/2026",
    timestamp: "09:20",
    messageStatus: "READ",
    isOpponent: true,
  },
  {
    id: "22",
    body: "Ainda não, você tem alguma sugestão?",
    date: "03/03/2026",
    timestamp: "09:23",
    messageStatus: "DELIVERED",
    isOpponent: false,
  },
];

export function getMessages(): Message[] {
  const totalMessagesLength = messages.length;
  let randomNumber = Math.floor(Math.random() * totalMessagesLength);

  if (randomNumber > totalMessagesLength) randomNumber = totalMessagesLength;
  if (randomNumber === 1) randomNumber = 2; // so we always have atleast 1-2 messages.

  return messages.slice(0, randomNumber);
}
