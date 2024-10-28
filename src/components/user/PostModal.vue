<template>
  <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="post-user-info">
          <img :src="postUser?.avatar || 'https://via.placeholder.com/40'" alt="User avatar" class="user-avatar"/>
          <h3>{{ postUser?.userName || "Anonymous" }}</h3> <br>
          <span class="post-time">· {{ formatDate(post.createdAt) }}</span>
        </div>
        <button @click="closeModal" class="close-modal-btn">✕</button>
      </div>
      <p class="modal-description">{{ post.content.text }}</p>
      <div class="modal-body">
        <!-- Display media content -->
        <div v-if="post.content && post.content.media.length > 0" class="modal-media">
          <template v-if="post.content.media.length > 1">
            <button class="prev-btn" @click="prevMedia">❮</button>
            <img v-if="post.content.media[mediaIndex].type === 'image'" :src="post.content.media[mediaIndex].url" alt="Post media" />
            <video v-if="post.content.media[mediaIndex].type === 'video'" :src="post.content.media[mediaIndex].url" controls></video>
            <button class="next-btn" @click="nextMedia">❯</button>
          </template>
          <template v-else>
            <img v-if="post.content.media[0].type === 'image'" :src="post.content.media[0].url" alt="Post media" />
            <video v-if="post.content.media[0].type === 'video'" :src="post.content.media[0].url" controls></video>
          </template>
        </div>
      </div>
      <!-- Comments section -->
      <div class="modal-comments">
        <h4>Comments</h4>
        <!-- Dropdown chọn kiểu sắp xếp -->
        <select v-model="sortOption" @change="sortComments">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="mostLiked">Most Liked</option>
        </select>

        <!-- Render comments -->
        <div v-for="comment in sortedComments" :key="comment.id" class="comment">
          <img :src="comment.userInfo?.avatar || 'https://via.placeholder.com/40'" alt="User avatar" class="comment-avatar" />
          <div class="comment-content">
            <h5>{{ comment.userInfo?.userName || 'Anonymous' }}</h5>
            <span class="post-time">· {{ formatDate(comment.createdAt) }}</span>
            <!-- Nút like cho comment -->
            <button @click="toggleLikeComment(comment)" class="like-button">
              <i :class="{'fas fa-heart liked': hasLikedComment(comment), 'far fa-heart': !hasLikedComment(comment)}"></i>
              <span>{{ comment.likes.length }}</span>
            </button>
            <p>{{ comment.content }}</p>
          </div>
        </div>
        <!-- Comment input -->
        <div class="add-comment">
          <input type="text" v-model="newComment" placeholder="Add a comment..." />
          <button @click="addComment">Post</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose } from 'vue';
import { useStore } from 'vuex';

const isModalOpen = ref(false);
const post = ref({});  // Bài đăng hiện tại
const mediaIndex = ref(0);
const newComment = ref('');  // Bình luận mới
const comments = ref([]);  // Danh sách bình luận
const postUser = ref(null);  // Thông tin người đăng bài
const sortOption = ref('newest');  // Tùy chọn sắp xếp
const store = useStore();
const currentUserId = ref("currentUserIdFromAuth");  // User ID của người dùng hiện tại (thay bằng logic của bạn)
const formatDate = (timestamp) => {
  const date = timestamp.toDate();
  return date.toLocaleString();
};

// Mở modal và lấy thông tin bài viết và người dùng
const openModal = async (selectedPost) => {
  post.value = selectedPost;
  isModalOpen.value = true;
  mediaIndex.value = 0;
  
  // Lấy bình luận cho bài viết
  await fetchComments(selectedPost.id);
  
  // Lấy thông tin người đăng bài
  await fetchPostUser(selectedPost.userId);
};

// Lấy thông tin người đăng bài từ Firestore theo userId
const fetchPostUser = async (userId) => {
  await store.dispatch('fetchUserById', userId);
  postUser.value = store.getters.getUserById(userId);
};

// Lấy bình luận của bài viết
const fetchComments = async (postId) => {
  await store.dispatch('fetchComments', postId);
  comments.value = store.getters.comments(postId);

  // Lấy thông tin người dùng cho mỗi bình luận
  for (const comment of comments.value) {
    await store.dispatch('fetchUserById', comment.userId);
    comment.userInfo = store.getters.getUserById(comment.userId);
  }
};

// Kiểm tra người dùng hiện tại đã like comment chưa
const hasLikedComment = (comment) => {
  return comment.likes.includes(currentUserId.value);
};

// Toggle like cho comment
const toggleLikeComment = async (comment) => {
  if (hasLikedComment(comment)) {
    // Bỏ like
    comment.likes = comment.likes.filter(userId => userId !== currentUserId.value);
  } else {
    // Thêm like
    comment.likes.push(currentUserId.value);
  }

  // Cập nhật số lượng like cho comment trong Firestore
  await store.dispatch('updateCommentLikes', { commentId: comment.id, likes: comment.likes });
};

// Thêm bình luận mới
const addComment = async () => {
  if (!newComment.value.trim()) return;

  const commentData = {
    postId: post.value.id,
    content: newComment.value,
  };

  await store.dispatch('addComment', commentData);
  newComment.value = ''; // Xóa nội dung input
  fetchComments(post.value.id); // Lấy lại bình luận sau khi thêm
};

// Đóng modal
const closeModal = () => {
  isModalOpen.value = false;
};

// Sắp xếp bình luận theo lựa chọn
const sortedComments = computed(() => {
  if (sortOption.value === 'newest') {
    return [...comments.value].sort((a, b) => b.createdAt - a.createdAt);
  } else if (sortOption.value === 'oldest') {
    return [...comments.value].sort((a, b) => a.createdAt - b.createdAt);
  } else if (sortOption.value === 'mostLiked') {
    return [...comments.value].sort((a, b) => b.likes.length - a.likes.length);
  }
  return comments.value;
});

// Di chuyển đến media trước đó
const prevMedia = () => {
  if (mediaIndex.value > 0) mediaIndex.value--;
};

// Di chuyển đến media tiếp theo
const nextMedia = () => {
  if (mediaIndex.value < post.value.content.media.length - 1) mediaIndex.value++;
};

// Lộ các hàm ra ngoài component để có thể gọi từ bên ngoài
defineExpose({ openModal });
</script>

<style scoped>
.modal-description {
  color: white;
  line-height: 1.5;
  font-size: 18px;
  word-break: break-all;
  margin: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.modal-content {
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  width: 90vw;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 20px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  color: white;
  margin-bottom: 20px;
}

.post-user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.close-modal-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
}

.modal-media img,
.modal-media video {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 15px;
}

.modal-comments {
  background-color: #262626;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
}

.modal-comments h4 {
  color: white;
  font-size: 18px;
  margin-bottom: 10px;
}

.comment {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #333;
  padding: 10px;
  border-radius: 10px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid #0095f6;
}

.comment-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.comment-content h5 {
  color: white;
  font-size: 16px;
  margin: 0;
}

.comment-content p {
  color: #aaa;
  font-size: 14px;
  margin: 5px 0 0 0;
}

.comment-content .post-time {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.like-button {
  background: none;
  border: none;
  color: #ccc;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 10px;
}

.like-button i {
  margin-right: 5px;
}

.like-button .fas {
  color: #ff4b5c;
}

.like-button:hover {
  color: #ff4b5c;
}

.add-comment {
  display: flex;
  margin-top: auto;
  padding: 10px;
  background-color: #444;
  border-radius: 25px;
  align-items: center;
}

.add-comment input {
  flex: 1;
  padding: 10px;
  border-radius: 25px;
  background-color: #333;
  color: white;
  border: none;
  outline: none;
  font-size: 14px;
}

.add-comment button {
  background-color: #0095f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  margin-left: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-comment button:hover {
  background-color: #007bb5;
}

select {
  background-color: #444;
  border: none;
  color: white;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
}

select option {
  background-color: #333;
  color: white;
}

.prev-btn, .next-btn {
  background-color: #444;
  border: none;
  color: white;
  padding: 10px;
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.prev-btn:hover, .next-btn:hover {
  background-color: #555;
}

</style>
