<template>
    <div class="post-management">
      <Header />
      <div class="post-header">
        <h2>Posts Management</h2>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="Search posts by title or author..." />
        </div>
        <div class="sort-buttons">
          <label for="sortOption">Sort by:</label>
          <select id="sortOption" v-model="selectedSortOption" @change="sortPosts">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostLikes">Most Likes</option>
            <option value="fewestLikes">Fewest Likes</option>
          </select>
        </div>
      </div>
  
      <table class="post-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Likes</th>
            <th>Date Created</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in filteredPosts" :key="post.id">
            <td>{{ post.content.text }}</td>
            <td>{{ post.userName }}</td>
            <td>{{ post.like.length }}</td>
            <td>{{ new Date(post.createdAt.seconds * 1000).toLocaleString() }}</td>
            <td>{{ post.status }}</td>
            <td>
              <button @click="confirmDelete(post.id)" class="delete-button">Delete</button>
              <button @click="toggleVisibility(post)" class="toggle-button">
                {{ post.hide_post ? 'Unhide' : 'Hide' }}
              </button>
              <button @click="viewPostDetails(post)" class="details-button">Details</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Pagination -->
      <div class="pagination" v-if="filteredPosts.length > 0">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
  
      <!-- Modal for post details -->
      <div v-if="selectedPost" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2>Post Details</h2>
          <p><strong>Title:</strong> {{ selectedPost.content.text }}</p>
          <p><strong>Author:</strong> {{ selectedPost.userName }}</p>
          <p><strong>Likes:</strong> {{ selectedPost.like.length }}</p>
          <p><strong>Date Created:</strong> {{ new Date(selectedPost.createdAt.seconds * 1000).toLocaleString() }}</p>
          <p><strong>Status:</strong> {{ selectedPost.status }}</p>
  
          <!-- Image slider -->
          <div v-if="selectedPost.content.media.length > 0" class="image-slider">
            <img :src="selectedPost.content.media[currentImageIndex].url" alt="Post Media" class="slider-image" />
            <button v-if="currentImageIndex > 0" @click="previousImage" class="prev-button">
              <i class="fas fa-chevron-left"></i> <!-- Left arrow icon -->
            </button>
            <button v-if="currentImageIndex < selectedPost.content.media.length - 1" @click="nextImage" class="next-button">
              <i class="fas fa-chevron-right"></i> <!-- Right arrow icon -->
            </button>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useStore } from 'vuex';
  import Swal from 'sweetalert2';
  import Header from './Header.vue';
  
  const store = useStore();
  const searchQuery = ref('');
  const selectedSortOption = ref('newest'); // Default sorting option
  const currentPage = ref(1);
  const postsPerPage = 5; // Number of posts per page
  const posts = computed(() => store.getters.posts);
  const selectedPost = ref(null); // Store selected post for viewing details
  const currentImageIndex = ref(0); // Current image index for slider
  
  // Sort posts based on the selected option
  const sortPosts = () => {
    switch (selectedSortOption.value) {
      case 'newest':
        posts.value.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        break;
      case 'oldest':
        posts.value.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
        break;
      case 'mostLikes':
        posts.value.sort((a, b) => b.like.length - a.like.length);
        break;
      case 'fewestLikes':
        posts.value.sort((a, b) => a.like.length - b.like.length);
        break;
    }
  };
  
  // Filter and paginate posts
  const filteredPosts = computed(() => {
    const filtered = posts.value.filter(
      post =>
        post.content.text.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        post.userName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    const start = (currentPage.value - 1) * postsPerPage;
    const end = start + postsPerPage;
    return filtered.slice(start, end);
  });
  
  // Calculate total pages
  const totalPages = computed(() => Math.ceil(posts.value.length / postsPerPage));
  
  // Pagination controls
  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  // Toggle post visibility with SweetAlert2
  const toggleVisibility = post => {
    const action = post.hide_post ? 'Unhide' : 'Hide';
    
    Swal.fire({
      title: `Are you sure you want to ${action} this post?`,
      text: `The post will be ${action.toLowerCase()}d.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'No, cancel!',
    }).then(result => {
      if (result.isConfirmed) {
        post.hide_post = !post.hide_post;
        store.dispatch('updatePost', post);
        Swal.fire({
          title: `${action}d!`,
          text: `The post has been ${action.toLowerCase()}d.`,
          icon: 'success',
        });
      }
    });
  };
  
  // Confirm post deletion with SweetAlert2
  const confirmDelete = postId => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this post!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then(result => {
      if (result.isConfirmed) {
        deletePost(postId);
      }
    });
  };
  
  const deletePost = postId => {
    Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
    store.dispatch('deletePost', postId);
  };
  
  // View post details and initialize the image slider
  const viewPostDetails = post => {
    selectedPost.value = post;
    currentImageIndex.value = 0; // Reset image index when opening modal
  };
  
  // Navigate to the previous image in the slider
  const previousImage = () => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--;
    }
  };
  
  // Navigate to the next image in the slider
  const nextImage = () => {
    if (currentImageIndex.value < selectedPost.value.content.media.length - 1) {
      currentImageIndex.value++;
    }
  };
  
  // Close the modal
  const closeModal = () => {
    selectedPost.value = null;
  };
  
  store.dispatch('fetchPosts');
  </script>
<style scoped>
.post-management {
  padding: 20px;
  background-color: #f9f9f9;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  font-size: 24px;
  color: #2c3e50;
}

.search-bar input {
  width: 300px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.sort-buttons {
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #34495e;
  color: white;
}

tr:hover {
  background-color: #f1f1f1;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  transition: background-color 0.3s ease;
}

.edit-button {
  background-color: #3498db;
  color: white;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.toggle-button {
  background-color: #f39c12;
  color: white;
}

.details-button {
  background-color: #2ecc71;
  color: white;
}

button:hover {
  opacity: 0.9;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 5px;
}

.pagination span {
  font-size: 16px;
  font-weight: 600;
}

.pagination button:disabled {
  background-color: #bdc3c7;
}

/* Modal styles */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 10;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: left;
  width: 400px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
  font-size: 24px;
  color: #333;
}

.image-slider {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-top: 20px;
}

.slider-image {
  width: 100%;
  max-width: 350px;
  height: auto;
  border-radius: 8px;
}

.prev-button, .next-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 18px;
}

.prev-button {
  left: -50px;
}

.next-button {
  right: -50px;
}
</style>
    