<template>
  <div>
    <Header_Nav />
    <div class="profile-container">
      <!-- Header thông tin người dùng -->
      <div class="profile-header" v-if="currentUser">
        <div class="profile-picture">
          <img :src="currentUser.avatar" alt="Profile Avatar" />
        </div>
        <div class="profile-info">
          <h2>{{ currentUser.userName }}</h2>
          <p>{{ currentUser.bio }}</p>
          <div class="btnn">
            <EditProfileButton />
            <CreateNewPost/>
          </div>
          <div class="profile-stats">
            <span><strong>{{ userPosts.length }}</strong> posts</span>
            <span><strong>{{ currentUser.follower ? currentUser.follower.length : 0 }}</strong> followers</span>
            <span><strong>{{ currentUser.following ? currentUser.following.length : 0 }}</strong> following</span>
          </div>
        </div>
      </div>

      <!-- Điều hướng -->
      <div class="profile-nav">
        <ul>
          <li :class="{ active: activeTab === 'posts' }" @click="setActiveTab('posts')">POSTS</li>
          <li :class="{ active: activeTab === 'saved' }" @click="setActiveTab('saved')">SAVED</li>
          <li :class="{ active: activeTab === 'tagged' }" @click="setActiveTab('tagged')">TAGGED</li>
        </ul>
      </div>

      <!-- Gallery -->
      <div class="profile-gallery" v-if="userPosts.length">
        <div v-for="post in userPosts" :key="post.id" class="gallery-item">
          <img v-if="post.content.media[0].type === 'image'" :src="post.content.media[0].url" :alt="post.alt" />
          <video v-if="post.content.media[0].type === 'video'" :src="post.content.media[0].url" controls></video>

          <!-- Hover buttons -->
          <div class="hover-buttons">
            <button @click="viewPostDetails(post)">View Post</button>
            <button @click="editPost(post)">Edit Post</button>
            <button @click="deletePost(post)">Delete Post</button>
          </div>
        </div>
      </div>

      <!-- Thông báo không có bài viết -->
      <div class="no-posts" v-else>
        <i class="fas fa-camera-retro"></i>
        <p>Người dùng chưa đăng bất kỳ bài viết nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import CreateNewPost from '@/components/user/CreateNewPost.vue';
import EditProfileButton from '@/components/user/EditProfileButton.vue';
import Header_Nav from '@/components/user/Header_Nav.vue';
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const activeTab = ref('posts');

const currentUser = computed(() => store.getters.currentUser || {});

// Lọc các post có userId trùng với currentUser.id
const userPosts = computed(() =>
  store.getters.posts.filter(post => post.userId === currentUser.value.id)
);

onMounted(async () => {
  await store.dispatch('fetchUserByEmail'); 
  await store.dispatch('fetchPosts'); 
});

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// Functions for viewing and editing posts
const viewPostDetails = (post) => {
  console.log('Viewing post:', post);
};

const editPost = (post) => {
  console.log('Editing post:', post);
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

.profile-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.gallery-item {
  position: relative;
  width: 500px;
  height: 500px;
}

.gallery-item img,
.gallery-item video {
  width: 500px;
  height:500px;
  border-radius: 5px;
  object-fit: cover;
}

.hover-buttons {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
  flex-direction: column;
  gap: 10px;
}
.gallery-item:hover{
  opacity: 50px;
}
.gallery-item:hover .hover-buttons {
  display: flex;
}

button {
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

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
