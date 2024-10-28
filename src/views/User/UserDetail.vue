<template>
    <div>
      <Header_Nav />
      <div class="profile-container">
        <!-- Thông tin người dùng -->
        <div class="profile-header" v-if="userDetail">
          <div class="profile-picture">
            <img :src="userDetail.avatar" alt="Profile Avatar" />
          </div>
          <div class="profile-info">
            <h2>{{ userDetail.userName }}</h2>
            <p>{{ userDetail.bio }}</p>
            <div class="btnn">
              <button v-if="!isFollowing" @click="followUser" class="follow-btn">Theo dõi</button>
              <button v-else @click="unfollowUser" class="unfollow-btn">Hủy theo dõi</button>
              <button class="message-btn" @click="sendMessage">Nhắn tin</button>
            </div>
            <div class="profile-stats">
              <span><strong>{{ userPosts.length }}</strong> posts</span>
              <span><strong>{{ userDetail.follower ? userDetail.follower.length : 0 }}</strong> followers</span>
              <span><strong>{{ userDetail.following ? userDetail.following.length : 0 }}</strong> following</span>
            </div>
          </div>
        </div>
  
        <!-- Gallery bài viết -->
        <div class="profile-gallery" v-if="userPosts.length > 0">
          <div v-for="post in userPosts" :key="post.id" class="gallery-item">
            <!-- Khóa phần bài viết nếu tài khoản bị khóa -->
            <div v-if="userDetail.locked" class="post-overlay">
              <i class="fas fa-lock"></i>
              <p>Bài viết không khả dụng</p>
            </div>
            <!-- Nếu không bị khóa, hiển thị bài viết -->
            <template v-else>
              <img v-if="post.content.media[0].type === 'image'" :src="post.content.media[0].url" :alt="post.alt" />
              <video v-if="post.content.media[0].type === 'video'" :src="post.content.media[0].url" controls></video>
            </template>
          </div>
        </div>
  
        <!-- Thông báo nếu không có bài viết -->
        <div v-else class="no-posts">
          <i class="fas fa-camera-retro"></i>
          <p>Người dùng chưa đăng bất kỳ bài viết nào</p>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
  import Header_Nav from '@/components/user/Header_Nav.vue';
  import { ref, onMounted, computed } from 'vue';
  import { useStore } from 'vuex';
  import { useRoute } from 'vue-router';
  
  const store = useStore();
  const route = useRoute();
  const activeTab = ref('posts');
  const userDetail = ref(null);
  const isFollowing = ref(false);
  
  const userId = route.params.id;  
  
  const userPosts = computed(() =>
    store.getters.posts.filter(post => post.userId === userDetail.value?.id)
  );
  
  const checkFollowingStatus = () => {
    const currentUser = store.state.currentUser;
    if (currentUser && currentUser.following.includes(userId)) {
      isFollowing.value = true;
    } else {
      isFollowing.value = false;
    }
  };
  
  onMounted(async () => {
    await store.dispatch('fetchUsers'); 
    await store.dispatch('fetchPosts');
    userDetail.value = store.state.users.find(user => user.id === userId);
    checkFollowingStatus();
  });
  
  const setActiveTab = (tab) => {
    activeTab.value = tab;
  };
  
  // Theo dõi người dùng
  const followUser = async () => {
    await store.dispatch('followUser', userId);
    isFollowing.value = true;
  };
  
  // Hủy theo dõi người dùng
  const unfollowUser = async () => {
    await store.dispatch('unfollowUser', userId);
    isFollowing.value = false;
  };
  
  // Nhắn tin cho người dùng (giả lập, có thể tích hợp tính năng nhắn tin sau)
  const sendMessage = () => {
    alert('Nhắn tin đến người dùng này.');
  };
  </script>
  
  <style scoped>
  .btnn {
    display: flex;
    gap: 30px;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  
  /* Container của trang */
  .profile-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 1200px;
    margin: 60px;
    padding: 20px;
    background-color: #ffffff;
    color: rgb(0, 0, 0);
  }
  
  /* Header profile */
  .profile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }
  
  .profile-picture img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .profile-info {
    flex: 1;
    margin-left: 20px;
  }
  
  .profile-info h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  .profile-stats {
    display: flex;
    gap: 20px;
    margin-top: 10px;
  }
  
  /* Nút theo dõi, hủy theo dõi, và nhắn tin */
  .follow-btn, .unfollow-btn, .message-btn {
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
  }
  
  .follow-btn {
    background-color: rgb(28, 183, 255);
    color: white;
  }
  
  .unfollow-btn {
    background-color: #f44336;
    color: white;
  }
  
  .message-btn {
    background-color: #555;
    color: white;
  }
  
  /* Navigation bar */
  .profile-nav ul {
    width: 1200px;
    display: flex;
    list-style: none;
    padding: 10px 0;
    justify-content: center;
    gap: 30px;
    border-bottom: 1px solid #333;
  }
  
  .profile-nav li {
    cursor: pointer;
    padding: 10px;
    color: #999;
    font-weight: bold;
  }
  
  .profile-nav .active {
    color: rgb(28, 183, 255);
    border-bottom: 2px solid white;
  }
  
  /* Gallery hiển thị hình ảnh */
  .profile-gallery {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 20px;
  }
  
  .gallery-item img,
  .gallery-item video {
    width: 500px;
    height: 500px;
    border-radius: 5px;
    object-fit: cover;
  }
  
  /* Thông báo khi không có bài viết */
  .no-posts {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
    color: #999;
  }
  
  .no-posts i {
    font-size: 100px;
    margin-bottom: 20px;
    color: #ccc;
  }
  
  .no-posts p {
    font-size: 20px;
    color: #555;
  }
  </style>
  