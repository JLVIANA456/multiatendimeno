import { memo, useCallback } from "react";
import Icon from "common/components/icons";
import { Inbox } from "common/types/common.type";
import {
  Avatar,
  AvatarWrapper,
  BottomContent,
  Contact,
  Content,
  MessageStatusIcon,
  MessageWrapper,
} from "./styles";

type ChatItemProps = {
  inbox: Inbox;
  isActive: boolean;
  onChangeChat: (inbox: Inbox) => void;
};

function ChatItem({ inbox, isActive, onChangeChat }: ChatItemProps) {
  const { name, lastMessage, image, timestamp, notificationsCount, isPinned, assignedTo, department } = inbox;

  const handleClick = useCallback(() => {
    onChangeChat(inbox);
  }, [inbox, onChangeChat]);

  return (
    <Contact isActive={isActive} onClick={handleClick} className="group relative !bg-white hover:!bg-gray-50 border-b border-gray-50/50">
      <AvatarWrapper>
        <Avatar src={image} />
      </AvatarWrapper>
      <Content>
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1 overflow-hidden flex-1">
            <h3 className="text-gray-900 font-normal text-[15px]">{name}</h3>
            <div className="flex gap-2 items-center">
               <span className="text-[9px] px-2 py-0.5 bg-primary-100 text-primary-700 rounded-md font-medium whitespace-nowrap">
                   {assignedTo || "Aguardando"}
               </span>
               <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-normal whitespace-nowrap">
                   {department || "Geral"}
               </span>
            </div>
          </div>

          <div className="flex flex-col items-end min-w-[60px]">
            {timestamp && <span className="text-[11px] text-gray-900 font-normal mb-1">{timestamp}</span>}
            <div className="h-6 flex items-center">
               <button
                  onClick={(e) => { e.stopPropagation(); (window as any).openTransferModal && (window as any).openTransferModal(); }}
                  className="w-6 h-6 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 transition-all opacity-0 group-hover:opacity-100"
                  title="Transferir"
                >
                    <i className="fa-solid fa-ellipsis text-xs"></i>
                </button>
            </div>
          </div>
        </div>

        <BottomContent>
          <MessageWrapper>
            <LastMessage lastMessage={lastMessage} messageStatus={inbox.messageStatus} />
          </MessageWrapper>

          <div className="flex items-center gap-2">
            {isPinned && <Icon id="pinned" className="sidebar-contact__icon scale-75 opacity-100 text-gray-900" />}
            {notificationsCount !== undefined && notificationsCount > 0 && (
              <div className="w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {notificationsCount}
              </div>
            )}
          </div>
        </BottomContent>
      </Content>
    </Contact>
  );
}

function LastMessage({ lastMessage, messageStatus }: Pick<Inbox, "messageStatus" | "lastMessage">) {
  if (!lastMessage) return null;
  return (
    <>
      <MessageStatusIcon
        isRead={messageStatus === "READ"}
        id={messageStatus === "SENT" ? "singleTick" : "doubleTick"}
        className="opacity-100"
      />
      <span className="text-gray-600 text-sm truncate max-w-[180px] font-normal">{lastMessage}</span>
    </>
  );
}

// Memoizado: só re-renderiza se a inbox ou isActive mudarem
export default memo(ChatItem, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.inbox.id === next.inbox.id &&
    prev.inbox.lastMessage === next.inbox.lastMessage &&
    prev.inbox.notificationsCount === next.inbox.notificationsCount &&
    prev.inbox.assignedTo === next.inbox.assignedTo &&
    prev.inbox.timestamp === next.inbox.timestamp
  );
});
