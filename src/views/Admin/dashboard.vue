<template>
    <div>
      <Header />
      <div class="dashboard">
        <h1>Dashboard</h1>
  
        <div class="dashboard-stats">
          <!-- Total Users -->
          <div class="stat-item">
            <h2>Total Users</h2>
            <p>{{ totalUsers }}</p>
          </div>
  
          <!-- Total Posts -->
          <div class="stat-item">
            <h2>Total Posts</h2>
            <p>{{ totalPosts }}</p>
          </div>
  
          <!-- Post with Most Likes -->
          <div class="stat-item" v-if="mostLikedPost">
            <h2>Post with Most Likes</h2>
            <p>{{ mostLikedPost.content.text }}</p>
            <small>Likes: {{ mostLikedPost.like.length }}</small>
  
            <!-- Display Image if it exists -->
            <div class="post-image" v-if="mostLikedPost.content.media && mostLikedPost.content.media[0].type === 'image'">
              <img :src="mostLikedPost.content.media[0].url" alt="Post Image" />
            </div>
  
            <div class="post-details">
              <p><strong>Author:</strong> {{ mostLikedPost.userName }}</p>
              <p><strong>Date:</strong> {{ new Date(mostLikedPost.createdAt.seconds * 1000).toLocaleString() }}</p>
            </div>
          </div>
  
          <!-- User with Most Followers -->
          <div class="stat-item" v-if="userWithMostFollowers">
            <h2>User with Most Followers</h2>
            <p>{{ userWithMostFollowers.name }}</p>
            <small>Followers: {{ userWithMostFollowers.follower.length }}</small>
            <div class="user-details">
              <p><strong>Email:</strong> {{ userWithMostFollowers.email }}</p>
              <p><strong>Bio:</strong> {{ userWithMostFollowers.bio }}</p>
              <div class="post-image" >
                <img :src="userWithMostFollowers.avatar" alt="Post Image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import Header from '@/components/admin/Header.vue';
  import { computed, onMounted } from 'vue';
  import { useStore } from 'vuex';
  
  const store = useStore();
  
  // Computed properties for data from Vuex
  const users = computed(() => store.getters.users);
  const posts = computed(() => store.getters.posts);
  
  // Total number of users
  const totalUsers = computed(() => users.value.length);
  
  // Total number of posts
  const totalPosts = computed(() => posts.value.length);
  
  // Find the post with the most likes
  const mostLikedPost = computed(() => {
    if (posts.value.length > 0) {
      return posts.value.reduce((max, post) => (post.like.length > max.like.length ? post : max), posts.value[0]);
    }
    return null;
  });
  
  // Find the user with the most followers
  const userWithMostFollowers = computed(() => {
    if (users.value.length > 0) {
      return users.value.reduce((max, user) => (user.follower.length > max.follower.length ? user : max), users.value[0]);
    }
    return null;
  });
  
  // Fetch the data when the component is mounted
  onMounted(() => {
    store.dispatch('fetchUsers');
    store.dispatch('fetchPosts');
  });
  </script>
  
  <style scoped>
  .dashboard {
    padding: 20px;
  }
  
  .dashboard-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  }
  
  .stat-item {
    background-color: #f5f5f5;
    padding: 20px;
    text-align: center;
    border-radius: 10px;
    width: 30%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .stat-item h2 {
    font-size: 20px;
    color: #2c3e50;
  }
  
  .stat-item p {
    font-size: 36px;
    color: #3498db;
  }
  
  .stat-item small {
    display: block;
    margin-top: 10px;
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .post-details, .user-details {
    margin-top: 10px;
    text-align: left;
  }
  
  .post-details p, .user-details p {
    margin: 5px 0;
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .post-image img {
    max-width: 100%;
    height: auto;
    margin-top: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  </style>
  