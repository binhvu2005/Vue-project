<template>
    <div>
      <Header />
      <h2>Users Management</h2>
  
      <!-- Ô tìm kiếm -->
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Search users by name or email..." />
      </div>
  
      <!-- Nút sắp xếp -->
      <div class="sort-buttons">
        <button @click="sortBy('name')">Sort by Name</button>
        <button @click="sortBy('email')">Sort by Email</button>
      </div>
  
      <!-- Kiểm tra nếu không có kết quả tìm kiếm -->
      <div v-if="paginatedUsers.length === 0" class="no-data">
        Không có dữ liệu
      </div>
  
      <!-- Bảng dữ liệu người dùng -->
      <table v-else>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Bio</th>
            <th>Followers</th>
            <th>Following</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.bio }}</td>
            <td>{{ user.follower?.length || 0 }}</td>
            <td>{{ user.following?.length || 0 }}</td>
            <td>
              <button @click="viewDetail(user)">
                <i class="fa fa-info-circle"></i> Detail
              </button>
              <button v-if="user.admin_lock" @click="confirmUnlockUser(user)">
                <i class="fa fa-unlock"></i> Unlock
              </button>
              <button v-else @click="confirmLockUser(user)">
                <i class="fa fa-lock"></i> Lock
              </button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Phân trang -->
      <div class="pagination" v-if="paginatedUsers.length > 0">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
  
      <!-- Modal hiển thị chi tiết người dùng -->
      <div v-if="selectedUser" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2>User Details</h2>
          <img :src="selectedUser.avatar" alt="User Avatar" class="user-avatar" />
          <p><strong>Name:</strong> {{ selectedUser.name }}</p>
          <p><strong>Username:</strong> {{ selectedUser.userName }}</p>
          <p><strong>Bio:</strong> {{ selectedUser.bio }}</p>
          <p><strong>Posts:</strong> {{ selectedUserPosts.length }}</p>
          <p><strong>Followers:</strong> {{ selectedUser.follower?.length || 0 }}</p>
          <p><strong>Following:</strong> {{ selectedUser.following?.length || 0 }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useStore } from 'vuex';
  import Header from './Header.vue';
  import Swal from 'sweetalert2';
  
  const store = useStore();
  const searchQuery = ref('');
  const sortKey = ref('');
  const usersPerPage = 5;
  const currentPage = ref(1);
  const users = computed(() => store.getters.users);
  const posts = computed(() => store.getters.posts); // Lấy tất cả các bài đăng từ Vuex
  const selectedUser = ref(null); // Lưu thông tin người dùng khi nhấn nút "Detail"
  const selectedUserPosts = ref([]); // Lưu bài đăng của người dùng được chọn
  
  // Tính tổng số trang
  const totalPages = computed(() => {
    return Math.ceil(filteredAndSortedUsers.value.length / usersPerPage);
  });
  
  // Lọc và sắp xếp danh sách người dùng
  const filteredAndSortedUsers = computed(() => {
    let filteredUsers = users.value.filter((user) => {
      return (
        user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });
  
    if (sortKey.value === 'name') {
      filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortKey.value === 'email') {
      filteredUsers.sort((a, b) => a.email.localeCompare(b.email));
    }
  
    return filteredUsers;
  });
  
  // Lấy danh sách người dùng phân trang
  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * usersPerPage;
    const end = start + usersPerPage;
    return filteredAndSortedUsers.value.slice(start, end);
  });
  
  // Chuyển trang
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
  
  // Sắp xếp theo tên hoặc email
  const sortBy = (key) => {
    sortKey.value = key;
  };
  
  // Hiển thị chi tiết người dùng
  const viewDetail = (user) => {
    selectedUser.value = user;
    selectedUserPosts.value = posts.value.filter(post => post.userId === user.id); // Lọc bài đăng của người dùng
  };
  
  // Đóng modal
  const closeModal = () => {
    selectedUser.value = null;
  };
  
  // Khóa tài khoản và xác nhận bằng SweetAlert2
  const confirmLockUser = (user) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to lock this user!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, lock it!'
    }).then((result) => {
      if (result.isConfirmed) {
        lockUser(user);
        Swal.fire('Locked!', 'The user has been locked.', 'success');
      }
    });
  };
  
  // Mở khóa tài khoản và xác nhận bằng SweetAlert2
  const confirmUnlockUser = (user) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to unlock this user!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, unlock it!'
    }).then((result) => {
      if (result.isConfirmed) {
        unlockUser(user);
        Swal.fire('Unlocked!', 'The user has been unlocked.', 'success');
      }
    });
  };
  
  // Khóa tài khoản và cập nhật trên Firebase
  const lockUser = (user) => {
    user.admin_lock = true;
    store.dispatch('updateUser', user);
  };
  
  // Mở khóa tài khoản và cập nhật trên Firebase
  const unlockUser = (user) => {
    user.admin_lock = false;
    store.dispatch('updateUser', user);
  };
  
  // Lấy danh sách người dùng và bài đăng khi component được mount
  store.dispatch('fetchUsers');
  store.dispatch('fetchPosts');
  </script>
  
  <style scoped>
  .div {
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #f7f9fc;
  }
  
  h2 {
    font-size: 24px;
    color: #2c3e50;
    margin-bottom: 20px;
  }
  
  .search-bar {
    margin-bottom: 15px;
  }
  
  .search-bar input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
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
  
  thead {
    background-color: #34495e;
    color: white;
  }
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 0.1em;
  }
  
  tbody tr:hover {
    background-color: #f1f1f1;
  }
  
  .no-data {
    margin: 20px 0;
    text-align: center;
    font-size: 18px;
    color: #e74c3c;
  }
  
  button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-right: 10px;
    transition: background-color 0.3s ease;
  }
  
  button i {
    margin-right: 5px;
  }
  
  button:hover {
    opacity: 0.9;
  }
  
  button:focus {
    outline: none;
  }
  
  button:first-child {
    background-color: #3498db;
    color: white;
  }
  
  button:first-child:hover {
    background-color: #2980b9;
  }
  
  button:last-child {
    background-color: #e74c3c;
    color: white;
  }
  
  button:last-child:hover {
    background-color: #c0392b;
  }
  
  .pagination {
    margin-bottom: 20px;
  }
  
  .pagination button {
    padding: 8px 12px;
    margin: 0 5px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination button:disabled {
    background-color: #bdc3c7;
  }
  
  .pagination span {
    font-size: 16px;
    font-weight: 600;
  }
  
  /* CSS cho modal */
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
    text-align: center;
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
  
  .user-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-bottom: 15px;
  }
  </style>
  