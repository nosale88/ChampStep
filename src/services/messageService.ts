import { supabase } from '../lib/supabase';
import { Message } from '../types';

export async function fetchMessages(targetType: 'dancer' | 'crew', targetId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(msg => ({
      id: msg.id,
      content: msg.content,
      authorName: msg.author_name,
      authorEmail: msg.author_email,
      targetType: msg.target_type,
      targetId: msg.target_id,
      isPublic: msg.is_public,
      createdAt: msg.created_at
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function sendMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: message.content,
        author_name: message.authorName,
        author_email: message.authorEmail,
        target_type: message.targetType,
        target_id: message.targetId,
        is_public: message.isPublic
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      content: data.content,
      authorName: data.author_name,
      authorEmail: data.author_email,
      targetType: data.target_type,
      targetId: data.target_id,
      isPublic: data.is_public,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const { error } = await supabase
      .from('message_reads')
      .upsert({
        message_id: messageId,
        user_id: userData.user.id
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

export async function getUnreadMessageCount(targetType: 'dancer' | 'crew', targetId: string): Promise<number> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return 0;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id')
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (messagesError) throw messagesError;

    const messageIds = (messages || []).map(m => m.id);
    if (messageIds.length === 0) return 0;

    const { data: readMessages, error: readsError } = await supabase
      .from('message_reads')
      .select('message_id')
      .eq('user_id', userData.user.id)
      .in('message_id', messageIds);

    if (readsError) throw readsError;

    const readMessageIds = (readMessages || []).map(r => r.message_id);
    return messageIds.filter(id => !readMessageIds.includes(id)).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// 실시간 메시지 구독
export function subscribeToMessages(
  targetType: 'dancer' | 'crew',
  targetId: string,
  callback: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${targetType}:${targetId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `target_type=eq.${targetType},target_id=eq.${targetId}`
      },
      (payload) => {
        const msg = payload.new;
        callback({
          id: msg.id,
          content: msg.content,
          authorName: msg.author_name,
          authorEmail: msg.author_email,
          targetType: msg.target_type,
          targetId: msg.target_id,
          isPublic: msg.is_public,
          createdAt: msg.created_at
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
} 