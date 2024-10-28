<template>
  <section class="side-menu">
    <!-- Hiển thị thông tin người dùng đăng nhập -->
    <div class="side-menu__user-profile">
      <a href="#" class="side-menu__user-avatar">
        <img :src="currentUser.avatar || './assets/default-user.png'" alt="User Picture" />
      </a>
      <div class="side-menu__user-info">
        <a href="#">{{ currentUser.userName }}</a>
        <span>{{ currentUser.name }}</span>
      </div>
      <button class="side-menu__user-button">Switch</button>
    </div>

    <!-- Hiển thị gợi ý người dùng -->
    <div class="side-menu__suggestions-section">
      <div class="side-menu__suggestions-header">
        <h2>Suggestions for You</h2>
        <button>See All</button>
      </div>
      <div class="side-menu__suggestions-content">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="side-menu__suggestion"
        >
          <a href="#" class="side-menu__suggestion-avatar">
            <img :src="user.avatar || './assets/default-user.png'" alt="User Picture" />
          </a>
          <div class="side-menu__suggestion-info">
            <a href="#">{{ user.userName }}</a>
            <span>{{ user.name }}</span>
          </div>
          <button @click="followUser(user.id)" class="side-menu__suggestion-button">Follow</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';

const store = useStore();

// Lấy thông tin người dùng hiện tại
const currentUser = computed(() => store.getters.currentUser || {});

// Lấy danh sách người dùng
const users = computed(() => store.getters.users || []);

// Lọc danh sách người dùng để loại bỏ người đang đăng nhập và những người đã theo dõi
const filteredUsers = computed(() => {
  const followingIds = new Set(currentUser.value.following || []); // Sử dụng Set để tránh lặp
  return users.value
    .filter(user => user.id !== currentUser.value.id && !followingIds.has(user.id)) // Loại bỏ bản thân và những người đã theo dõi
    .sort(() => 0.5 - Math.random()) // Trộn ngẫu nhiên danh sách người dùng
    .slice(0, 5); // Lấy ngẫu nhiên 5 người
});

// Sự kiện Follow
const followUser = async (userId) => {
  try {
    // Cập nhật danh sách following
    const updatedFollowing = [...(currentUser.value.following || []), userId];

    // Cập nhật trên Firebase và store Vuex
    await store.dispatch('followUser', userId);

    // Sử dụng SweetAlert2 để thông báo thành công
    Swal.fire({
      icon: 'success',
      title: 'Followed!',
      text: 'You have followed the user successfully.',
      showConfirmButton: false,
      timer: 1500
    });
  } catch (error) {
    // Thông báo lỗi nếu có vấn đề xảy ra
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong. Please try again later.',
    });
    console.error('Error following user:', error);
  }
};
</script>

<style scoped>
/* Styles for the sidebar menu and user suggestions */
.side-menu {
  width: 300px;
}

.side-menu__user-profile {
  display: flex;
  align-items: center;
  padding: 20px;
}

.side-menu__user-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.side-menu__user-info {
  margin-left: 10px;
}

.side-menu__user-button {
  margin-left: auto;
  padding: 5px 10px;
}

.side-menu__suggestions-section {
  margin-top: 20px;
}

.side-menu__suggestions-header {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.side-menu__suggestions-content {
  padding: 10px 20px;
}

.side-menu__suggestion {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.side-menu__suggestion-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.side-menu__suggestion-info {
  margin-left: 10px;
}

.side-menu__suggestion-button {
  margin-left: auto;
  padding: 5px 10px;
}
</style>
