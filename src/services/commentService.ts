import { supabase } from '../lib/supabase';
import { Comment } from '../types';

// 댓글 조회
export const fetchComments = async (targetType: 'dancer' | 'crew', targetId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        replies:comments!parent_id(*)
      `)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchComments:', error);
    return [];
  }
};

// 댓글 추가
export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment | null> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        content: comment.content,
        author_name: comment.authorName,
        author_email: comment.authorEmail,
        author_id: comment.authorId,
        target_type: comment.targetType,
        target_id: comment.targetId,
        mentions: comment.mentions,
        parent_id: comment.parentId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    // Supabase 컬럼명을 Comment 타입으로 변환
    return {
      id: data.id,
      content: data.content,
      authorName: data.author_name,
      authorEmail: data.author_email,
      authorId: data.author_id,
      targetType: data.target_type,
      targetId: data.target_id,
      mentions: data.mentions || [],
      parentId: data.parent_id,
      replies: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in addComment:', error);
    return null;
  }
};

// 댓글 수정
export const updateComment = async (commentId: string, content: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (error) {
      console.error('Error updating comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateComment:', error);
    return false;
  }
};

// 댓글 삭제
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    // 먼저 답글들 삭제
    await supabase
      .from('comments')
      .delete()
      .eq('parent_id', commentId);

    // 메인 댓글 삭제
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return false;
  }
};
