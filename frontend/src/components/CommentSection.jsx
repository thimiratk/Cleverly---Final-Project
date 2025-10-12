import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaUser, FaHeart, FaReply, FaEdit, FaTrash, FaEllipsisH } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment
} from '../services/api';

const formatRelativeTime = (timeString) => {
  try {
    const date = new Date(timeString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  } catch (_error) {
    return 'Recently';
  }
};

const updateNodeInTree = (nodes, targetId, updater) => {
  let changed = false;
  const nextNodes = nodes.map((node) => {
    if (node.id === targetId) {
      changed = true;
      return updater(node);
    }
    if (node.replies && node.replies.length > 0) {
      const { changed: childChanged, nodes: childNodes } = updateNodeInTree(node.replies, targetId, updater);
      if (childChanged) {
        changed = true;
        return { ...node, replies: childNodes };
      }
    }
    return node;
  });
  return { changed, nodes: changed ? nextNodes : nodes };
};

const appendReplyToTree = (nodes, parentId, reply) => {
  let changed = false;
  const nextNodes = nodes.map((node) => {
    if (node.id === parentId) {
      changed = true;
      return {
        ...node,
        replies: [...(node.replies || []), reply],
        _count: { ...(node._count || {}), replies: (node._count?.replies || 0) + 1 }
      };
    }
    if (node.replies && node.replies.length > 0) {
      const { changed: childChanged, nodes: childNodes } = appendReplyToTree(node.replies, parentId, reply);
      if (childChanged) {
        changed = true;
        return { ...node, replies: childNodes };
      }
    }
    return node;
  });
  return { changed, nodes: changed ? nextNodes : nodes };
};

const removeNodeFromTree = (nodes, targetId) => {
  let changed = false;
  const nextNodes = [];

  nodes.forEach((node) => {
    if (node.id === targetId) {
      changed = true;
      return;
    }

    if (node.replies && node.replies.length > 0) {
      const { changed: childChanged, nodes: childNodes } = removeNodeFromTree(node.replies, targetId);
      if (childChanged) {
        changed = true;
        nextNodes.push({
          ...node,
          replies: childNodes,
          _count: { ...(node._count || {}), replies: Math.max(0, (node._count?.replies || 0) - 1) }
        });
        return;
      }
    }

    nextNodes.push(node);
  });

  return { changed, nodes: changed ? nextNodes : nodes };
};

const findIsLiked = (nodes, targetId) => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return Boolean(node.__likedByMe);
    }
    if (node.replies && node.replies.length > 0) {
      const liked = findIsLiked(node.replies, targetId);
      if (liked !== null) {
        return liked;
      }
    }
  }
  return null;
};

const CommentItem = ({
  comment,
  isReply = false,
  currentUser,
  onToggleLike,
  onReply,
  onEdit,
  onDelete,
  isMutating
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.content || '');
  const [isReplying, setIsReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!showMenu) return;
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
  document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showMenu]);

  useEffect(() => {
    if (isEditing) {
      setEditDraft(comment.content || '');
    }
  }, [isEditing, comment.content]);

  useEffect(() => {
    if (!isReplying) {
      setReplyDraft('');
    }
  }, [isReplying]);

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editDraft.trim();
    if (!trimmed || isMutating) return;
    const success = await onEdit(comment.id, trimmed);
    if (success) {
      setIsEditing(false);
    }
  }, [comment.id, editDraft, isMutating, onEdit]);

  const handleSubmitReply = useCallback(async () => {
    const trimmed = replyDraft.trim();
    if (!trimmed || isMutating) return;
    const success = await onReply(comment.id, trimmed);
    if (success) {
      setReplyDraft('');
      setIsReplying(false);
    }
  }, [comment.id, isMutating, onReply, replyDraft]);

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} py-3`}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
            {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : <FaUser className="w-3 h-3" />}
          </div>
          {comment.user?.profilePicture && (
            <img
              src={comment.user.profilePicture}
              alt={comment.user.name}
              className="absolute inset-0 w-8 h-8 rounded-full object-cover border border-white"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {comment.user?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {currentUser?.id === comment.userId && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={showMenu}
                >
                  <FaEllipsisH className="w-3 h-3" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setEditDraft(comment.content || '');
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FaEdit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(comment.id);
                      }}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <FaTrash className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editDraft}
                onChange={(event) => setEditDraft(event.target.value)}
                className="w-full p-2 border rounded-lg text-sm resize-none"
                rows="2"
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isMutating}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditDraft(comment.content || '');
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{comment.content}</p>
          )}

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => onToggleLike(comment.id)}
              className={`flex items-center gap-1 transition-colors ${comment.__likedByMe ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <FaHeart className="w-3 h-3" />
              <span>{comment._count?.likes || 0}</span>
            </button>
            {!isReply && (
              <button
                type="button"
                onClick={() => setIsReplying((prev) => !prev)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <FaReply className="w-3 h-3" />
                Reply
              </button>
            )}
            {comment._count?.replies > 0 && (
              <span className="text-gray-500">
                {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>

          {isReplying && (
            <div className="mt-3">
              <textarea
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
                className="w-full p-2 border rounded-lg text-sm resize-none"
                rows="2"
                placeholder={`Reply to ${comment.user?.name || 'this comment'}...`}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleSubmitReply}
                  disabled={isMutating || !replyDraft.trim()}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply
                  currentUser={currentUser}
                  onToggleLike={onToggleLike}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isMutating={isMutating}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function CommentSection({ reviewId, isVisible, onCommentCountChange }) {
  const { user: currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!isVisible || !reviewId) {
      return;
    }

    let isCancelled = false;
    setLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
  const response = await getComments(reviewId, { sortBy, userId: currentUser?.id });
        if (isCancelled) return;

        const fetchedComments = Array.isArray(response?.comments) ? response.comments : [];
        const normalizeComments = (list) => list.map((comment) => ({
          ...comment,
          __likedByMe: Boolean(comment.likedByCurrentUser),
          replies: comment.replies ? normalizeComments(comment.replies) : [],
        }));

        const normalized = normalizeComments(fetchedComments);
        const nextCount = typeof response?.totalCount === 'number' ? response.totalCount : fetchedComments.length;

        setComments(normalized);
        setTotalCount(nextCount);
        if (onCommentCountChange) {
          onCommentCountChange(nextCount);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading comments:', error);
          if (error.response?.status === 429) {
            console.warn('Rate limited - will retry comments later');
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isVisible, reviewId, sortBy, onCommentCountChange, currentUser?.id]);

  const handleAddComment = useCallback(async (event) => {
    event.preventDefault();
    if (!currentUser) {
      alert('Please log in to comment');
      return;
    }

    if (!newComment.trim() || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await addComment(reviewId, currentUser.id, newComment.trim());
      const added = response?.comment;
      if (added) {
        const hydrated = {
          ...added,
          __likedByMe: false,
          replies: added.replies || []
        };
        setComments((prev) => [hydrated, ...prev]);
      }

      setNewComment('');
      setTotalCount((prev) => {
        const nextCount = prev + 1;
        if (onCommentCountChange) {
          onCommentCountChange(nextCount);
        }
        return nextCount;
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment before commenting again.');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    } finally {
      setTimeout(() => setSubmitting(false), 1000);
    }
  }, [currentUser, newComment, onCommentCountChange, reviewId, submitting]);

  const handleEditComment = useCallback(async (commentId, content) => {
    if (!currentUser) {
      alert('Please log in to edit comments');
      return false;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return false;
    }

    setSubmitting(true);
    try {
      await updateComment(commentId, trimmed, currentUser.id);
      setComments((prev) => {
        const { changed, nodes } = updateNodeInTree(prev, commentId, (node) => ({ ...node, content: trimmed }));
        return changed ? nodes : prev;
      });
      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [currentUser]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!currentUser) {
      alert('Please log in to delete comments');
      return false;
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return false;
    }

    try {
      await deleteComment(commentId, currentUser.id);
      let removed = false;
      setComments((prev) => {
        const { changed, nodes } = removeNodeFromTree(prev, commentId);
        removed = changed;
        return changed ? nodes : prev;
      });

      if (removed) {
        setTotalCount((prev) => {
          const nextCount = Math.max(0, prev - 1);
          if (onCommentCountChange) {
            onCommentCountChange(nextCount);
          }
          return nextCount;
        });
      }
      return removed;
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
      return false;
    }
  }, [currentUser, onCommentCountChange]);

  const handleReply = useCallback(async (parentCommentId, content) => {
    if (!currentUser) {
      alert('Please log in to reply');
      return false;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return false;
    }

    setSubmitting(true);
    try {
      const response = await addComment(reviewId, currentUser.id, trimmed, parentCommentId);
      const reply = response?.comment;
      if (reply) {
        const hydratedReply = {
          ...reply,
          __likedByMe: false,
          replies: reply.replies || []
        };
        setComments((prev) => {
          const { changed, nodes } = appendReplyToTree(prev, parentCommentId, hydratedReply);
          return changed ? nodes : prev;
        });
      }

      setTotalCount((prev) => {
        const nextCount = prev + 1;
        if (onCommentCountChange) {
          onCommentCountChange(nextCount);
        }
        return nextCount;
      });
      return true;
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [currentUser, onCommentCountChange, reviewId]);

  const toggleCommentLike = useCallback(async (commentId) => {
    if (!currentUser) {
      alert('Please log in to like comments');
      return;
    }

    const liked = Boolean(findIsLiked(comments, commentId));

    const applyOptimistic = (like) => {
      setComments((prev) => {
        const { changed, nodes } = updateNodeInTree(prev, commentId, (node) => {
          const currentLikes = node._count?.likes || 0;
          return {
            ...node,
            _count: { ...(node._count || {}), likes: like ? currentLikes + 1 : Math.max(0, currentLikes - 1) },
            __likedByMe: like
          };
        });
        return changed ? nodes : prev;
      });
    };

    applyOptimistic(!liked);

    try {
      const response = liked
        ? await unlikeComment(commentId, currentUser.id)
        : await likeComment(commentId, currentUser.id);

      const likeCount = response?.likeCount;
      if (typeof likeCount === 'number') {
        setComments((prev) => {
          const { changed, nodes } = updateNodeInTree(prev, commentId, (node) => ({
            ...node,
            _count: { ...(node._count || {}), likes: likeCount },
            __likedByMe: !liked
          }));
          return changed ? nodes : prev;
        });
      }
    } catch (error) {
      applyOptimistic(liked);
      console.error('Failed to toggle like', error);
    }
  }, [comments, currentUser]);

  if (!isVisible) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Comments ({totalCount})</h3>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="text-sm border rounded-lg px-2 py-1 bg-white"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {currentUser ? (
        <form onSubmit={handleAddComment} className="mb-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <FaUser className="w-3 h-3" />}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Write a comment..."
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please <a href="/login" className="font-semibold hover:underline">log in</a> to add a comment.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onToggleLike={toggleCommentLike}
              onReply={handleReply}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              isMutating={submitting}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}

export default CommentSection;