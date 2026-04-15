import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * If no chat inbox selected, navigate to /chat to stay in the conversations tab.
 * Uses a ref to distinguish between first render (no selection yet) and
 * an active conversation becoming undefined (e.g. after delete).
 */
export default function useNavigateToChat(activeInbox?: any) {
  const navigate = useNavigate();
  const hasHadActiveInbox = useRef(false);

  useEffect(() => {
    if (activeInbox) {
      hasHadActiveInbox.current = true;
    } else if (hasHadActiveInbox.current) {
      // Only redirect to /chat if we previously had a chat open (e.g. after delete)
      navigate("/chat");
    }
  }, [activeInbox, navigate]);
}
