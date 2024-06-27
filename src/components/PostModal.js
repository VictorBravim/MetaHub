import React from 'react';
import Modal from 'react-modal';
import { FaHeart, FaRegHeart, FaTrash } from 'react-icons/fa';

// Configuração inicial do react-modal para definir o appElement
if (typeof document !== 'undefined') {
  Modal.setAppElement('#root');
}

const PostModal = ({ isOpen, onRequestClose, post, onLike, onDelete, userLiked, currentUserId }) => {
  if (!post) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="post-modal bg-black rounded-lg p-6 max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-90"
    >
      <div className="post-modal-content flex flex-col justify-center items-center text-white">
        <img src={post.postImageUrl} alt="Post" className="w-full h-auto rounded-lg mb-4" />
        <div className="w-full flex items-center justify-center mt-2">
          <button onClick={() => onLike(post.id)} className="flex items-center">
            {userLiked ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-xl" />}
          </button>
          <span className="ml-2">{post.likeCount || 0}</span>
          {post.userId === currentUserId && (
            <button onClick={() => onDelete(post.id, post.postImageUrl)} className="ml-4 text-red-600">
              <FaTrash className="text-xl" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PostModal;