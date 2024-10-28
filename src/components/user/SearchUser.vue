<template>
    <div class="header__search">
      <input
        type="text"
        v-model="searchQuery"
        @input="searchUsers"
        placeholder="Search"
      />
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M21.669 21.6543C21.8625 21.4622 21.863 21.1494 21.6703 20.9566L17.3049 16.5913C18.7912 14.9327 19.7017 12.7525 19.7017 10.3508C19.7017 5.18819 15.5135 1 10.3508 1C5.18819 1 1 5.18819 1 10.3508C1 15.5135 5.18819 19.7017 10.3508 19.7017C12.7624 19.7017 14.9475 18.7813 16.606 17.2852L20.9739 21.653C21.1657 21.8449 21.4765 21.8454 21.669 21.6543ZM1.9843 10.3508C1.9843 5.7394 5.7394 1.9843 10.3508 1.9843C14.9623 1.9843 18.7174 5.7394 18.7174 10.3508C18.7174 14.9623 14.9623 18.7174 10.3508 18.7174C5.7394 18.7174 1.9843 14.9623 1.9843 10.3508Z"
          fill="#A5A5A5"
          stroke="#A5A5A5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
  
      <ul class="search-results" v-if="filteredUsers.length > 0">
        <li v-for="user in filteredUsers" :key="user.id" class="user-item" @click="goToUserDetail(user.id)">
          <img :src="user.avatar" alt="User Avatar" class="user-avatar" />
          <div class="user-info">
            <p>{{ user.name }}</p>
            <p>{{ user.userName }}</p>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { useStore } from "vuex";
  import { useRouter } from "vue-router"; 
  
  const store = useStore();
  const router = useRouter(); 
  const searchQuery = ref("");
  
  const filteredUsers = computed(() => {
    const currentUserEmail = store.state.currentUser?.email || "";
    if (!searchQuery.value) return []; 
    return store.state.users.filter(
      (user) =>
        user.email !== currentUserEmail &&
        user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
  
  const searchUsers = () => {
    store.dispatch("fetchUsers"); 
  };
  
  const goToUserDetail = (userId) => {
    router.push({ name: "UserDetail", params: { id: userId } }); 
  };
  </script>
  <style scoped>
  .header__search {
    display: flex;
    align-items: center;
    position: relative;
  }
  
  .header__search input {
    width: 300px; /* Adjusted width */
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .header__search svg {
    margin-left: 8px;
    cursor: pointer;
  }
  
  .search-results {
    position: absolute;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    list-style: none;
    padding: 8px;
    margin: 0;
    margin-top: 150px; /* Adjusted margin to bring the box closer */
    z-index: 1000;
    width: 100%; /* Adjust width to match the input */
    max-height: 200px; /* Limit height and allow scrolling */
    overflow-y: auto; /* Scroll when results exceed max height */
    border-radius: 5px;
  }
  
  .search-results li {
    display: flex;
    align-items: center;
    padding: 5px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .search-results li:last-child {
    border-bottom: none;
  }
  
  .search-results li:hover {
    background-color: #f0f0f0;
  }
  
  .user-avatar {
    width: 30px; /* Reduced avatar size */
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-info p {
    margin: 0;
    font-size: 12px; /* Slightly reduced font size for a cleaner layout */
    color: #333;
  }
  
  .user-info p:first-child {
    font-weight: bold;
  }
  
  
  </style>
  