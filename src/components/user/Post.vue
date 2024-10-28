<template>
  <div>
    <div v-for="post in posts" :key="post.id" class="post-card">
      <!-- Header phần thông tin người đăng -->
      <div class="post-header">
        <div class="post-user-info">
          <div class="post-user-info-right">
            <img :src="getUserByUserName(post.userId)?.avatar || 'default-avatar.png'" class="profile-picture" alt="User profile" />
            <span class="user-name">{{ getUserByUserName(post.userId)?.userName || 'User' }}</span>
            <span class="post-time">· {{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-options">
          <button class="options-btn">...</button>
        </div>
      </div>

      <!-- Điều hướng và hiển thị media -->
      <div v-if="post.content && post.content.media && post.content.media.length > 0">
        <div v-if="post.content.media.length > 1" class="media-container">
          <button type="button" class="nav-btn prev-btn" @click="prevMedia(post)">❮</button>
          <template v-if="mediaIndex[post.id] !== undefined && post.content.media[mediaIndex[post.id]]">
            <img v-if="post.content.media[mediaIndex[post.id]].type === 'image'" :src="post.content.media[mediaIndex[post.id]].url" alt="Post media" />
            <video v-if="post.content.media[mediaIndex[post.id]].type === 'video'" :src="post.content.media[mediaIndex[post.id]].url" controls></video>
          </template>
          <button type="button" class="nav-btn next-btn" @click="nextMedia(post)">❯</button>
        </div>
        <div v-else>
          <img v-if="post.content.media[0].type === 'image'" :src="post.content.media[0].url" alt="Post media" />
          <video v-if="post.content.media[0].type === 'video'" :src="post.content.media[0].url" controls></video>
        </div>
      </div>

      <!-- Engagement: Likes, Comments, Share -->
      <div class="post-engagement">
        <div class="post-icons">
          <button @click="toggleLike(post)">
            <i :class="{'fas fa-heart liked': hasLiked(post), 'far fa-heart': !hasLiked(post)}"></i>
          </button>
          <button @click="openCommentModal(post)"><i class="far fa-comment"></i></button>
          <button><i class="far fa-paper-plane"></i></button>
          <button class="bookmark-btn"><i class="far fa-bookmark"></i></button>
        </div>
        <span class="post-likes">{{ post.like.length }} likes</span>
      </div>

      <!-- Mô tả bài đăng -->
      <div class="post-description">
        <span class="user-name">{{ getUserByUserName(post.userId)?.userName || 'User' }}: </span>
        <span>{{ post.content.text }}</span>
      </div>

      <div class="post-comment">
        <input type="text" placeholder="Add a comment..." @focus="openCommentModal(post)" />
      </div>
    </div>
    <PostModal ref="postModal" />
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { onMounted, computed, reactive, ref } from 'vue';
import { doc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { db } from '@/firebase/config'; // Firestore config
import PostModal from './PostModal.vue';

const store = useStore();
let currentUserId = null;
const mediaIndex = reactive({}); // Chỉ số media hiện tại cho từng post
const postModal = ref(null); // Dùng ref() để tham chiếu đến PostModal

onMounted(async () => {
  await store.dispatch('fetchUsers'); // Lấy danh sách người dùng trước
  await store.dispatch('fetchPosts');
  await store.dispatch('fetchUserByEmail'); // Lấy thông tin người dùng hiện tại dựa trên email

  const currentUser = store.getters.currentUser;
  currentUserId = currentUser ? currentUser.id : null; // Lấy user ID từ thông tin người dùng hiện tại

  store.getters.posts.forEach(post => {
    mediaIndex[post.id] = 0; // Bắt đầu từ media đầu tiên
  });
});

// Các biến tính toán cho bài đăng và người dùng
const posts = computed(() => store.getters.posts);
const users = computed(() => store.getters.users);

// Mở modal cho phần comment hoặc media
const openCommentModal = (post) => {
  if (postModal.value) {
    postModal.value.openModal(post); // Ensure the `openModal` function exists in PostModal
  }
};

// Tìm người dùng dựa vào userId
const getUserByUserName = (userId) => {
  const userPost = users.value.find(user => user.id === userId) || null;
  return userPost;
};

// Kiểm tra xem bài viết đã được like hay chưa
const hasLiked = (post) => {
  return post.like.some(like => like.user_id_like === currentUserId);
};

// Thực hiện thao tác like/unlike bài viết
const toggleLike = async (post) => {
  if (!currentUserId) return;

  const postRef = doc(db, 'posts', post.id);

  if (hasLiked(post)) {
    const newLikes = post.like.filter(like => like.user_id_like !== currentUserId);
    await updateDoc(postRef, { like: newLikes });
    post.like = newLikes; // Cập nhật local
  } else {
    const newLikes = [...post.like, { user_id_like: currentUserId }];
    await updateDoc(postRef, { like: newLikes });
    post.like = newLikes; // Cập nhật local
  }
};

// Hàm định dạng ngày
const formatDate = (timestamp) => {
  const date = timestamp.toDate();
  return date.toLocaleString();
};

// Chuyển đến media trước đó
const prevMedia = (post) => {
  if (mediaIndex[post.id] > 0) {
    mediaIndex[post.id]--;
  }
};

// Chuyển đến media tiếp theo
const nextMedia = (post) => {
  if (mediaIndex[post.id] < post.content.media.length - 1) {
    mediaIndex[post.id]++;
  }
};
</script>



<style scoped>
/* Styles tương tự như trước */
.post-card {
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 10px;
  max-width: 600px;
  background-color: white;
  border: 1px solid #ddd;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-weight: bold;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.media-container {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.post-image img,
.post-image video {
  width: 580px;
  height: 600px;
  object-fit: cover;
  border-radius: 8px;
}

.post-engagement {
  display: flex;
  flex-direction: column;
  margin: 20px 0;
}

.post-icons {
  display: flex;
  height: 30px;
}

.post-icons button {
  background: none;
  border: none;
  color: #000;
  margin-right: 10px;
  font-size: 20px;
}

.bookmark-btn {
  margin-left: auto;
}

.post-likes {
  font-weight: bold;
  margin-left: 5px;
}

.post-description {
  margin-bottom: 10px;
}

.post-comment input {
  width: 100%;
  padding: 10px;
  background-color: #ebe8e8;
  border: none;
  border-radius: 4px;
}
</style>


<style scoped>
.liked {
  color: red;
}

.post-user-info-right {
  display: flex;
  align-items: center;
}

.options-btn {
  color: #000000;
  border: none;
  background-color: transparent;
  padding: 5px;
  cursor: pointer;
}

.post-card {
  border-radius: 8px;
  margin-left:7px ;
  margin-bottom: 20px;
  padding: 10px;
  max-width: 600px;
  background-color: white;
  border: 1px solid #ddd;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-weight: bold;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-options {
  font-size: 20px;
  color: #999;
}

.media-container {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.post-image img,
.post-image video {
  width: 580px;
  height: 600px;
  object-fit: cover; /* Đảm bảo nội dung được cắt gọn để vừa với khung 600x600 */
  border-radius: 8px;
}

.media-container img,
.media-container video {
  width: 580px;
  height: 600px;
  object-fit: cover;
  border-radius: 8px;
}

.post-engagement {
  display: flex;
  flex-direction: column;
  margin: 20px 0;
}

.post-icons {
  display: flex;
  height: 30px;
}

.post-icons button {
  background: none;
  border: none;
  color: #000000;
  margin-right: 10px;
  font-size: 20px;
}

.bookmark-btn {
  margin-left: auto;
}

.post-likes {
  font-weight: bold;
  margin-left: 5px;
}

.post-description {
  margin-bottom: 10px;
}

.show-more-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
}

.post-comment input {
  width: 100%;
  padding: 10px;
  background-color: #ebe8e8;
  border: none;
  border-radius: 4px;
}
</style>
