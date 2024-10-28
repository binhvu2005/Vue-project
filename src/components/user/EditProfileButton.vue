<template>
    <div>
      <button class="edit-btn" @click="openModal">Edit Profile</button>
  
      <!-- Modal chỉnh sửa thông tin -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>Edit Profile</h2>
  
          <!-- Thay đổi tên người dùng -->
          <label>Username</label>
          <input v-model="newUserName" :placeholder="currentUser.userName" />
  
          <!-- Thay đổi bio -->
          <label>Bio</label>
          <input v-model="newBio" :placeholder="currentUser.bio" />
  
          <!-- Thay đổi trạng thái (locked/open) -->
        
          <label class="switch">
            <input type="checkbox" v-model="isLocked">
            <span class="slider round"></span>
          </label>
          <p>Status: {{ isLocked ? 'Locked' : 'Unlock' }}</p>
  
          <!-- Thay đổi ảnh đại diện -->
          <label>Avatar</label>
          <input type="file" @change="handleFileUpload" />
          <img v-if="previewImage" :src="previewImage" alt="Avatar Preview" class="avatar-preview" />
  
          <!-- Nút đổi mật khẩu -->
          <button class="change-password-btn" @click="openPasswordModal">Change Password</button>
  
          <!-- Nút xác nhận và hủy bỏ -->
          <button @click="confirmSaveChanges">Save Changes</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
  
      <!-- Modal đổi mật khẩu -->
      <div v-if="showPasswordModal" class="modal">
        <div class="modal-content">
          <h2>Change Password</h2>
  
          <!-- Mật khẩu cũ -->
          <label>Old Password</label>
          <input type="password" v-model="oldPassword" placeholder="Enter old password" />
  
          <!-- Mật khẩu mới -->
          <label>New Password</label>
          <input type="password" v-model="newPassword" placeholder="Enter new password" />
  
          <!-- Xác nhận mật khẩu mới -->
          <label>Confirm New Password</label>
          <input type="password" v-model="confirmNewPassword" placeholder="Confirm new password" />
  
          <!-- Nút xác nhận và hủy bỏ -->
          <button @click="confirmChangePassword">Change Password</button>
          <button @click="closePasswordModal">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useStore } from 'vuex';
  import Swal from 'sweetalert2';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage
  
  const store = useStore();
  const showModal = ref(false);
  const showPasswordModal = ref(false);
  const newUserName = ref('');
  const newBio = ref('');
  const isLocked = ref(false);
  const oldPassword = ref('');
  const newPassword = ref('');
  const confirmNewPassword = ref('');
  const previewImage = ref(null);
  let uploadedFile = ref(null); // File ảnh mới
  
  const currentUser = computed(() => store.getters.currentUser || {});
  
  // Mở và đóng modal chỉnh sửa thông tin
  const openModal = () => {
    newUserName.value = currentUser.value.userName; // Set giá trị hiện tại
    newBio.value = currentUser.value.bio || ''; // Set bio hiện tại
    isLocked.value = currentUser.value.locked ; // Set trạng thái hiện tại
    showModal.value = true;
  };
  
  const closeModal = () => {
    showModal.value = false;
  };
  
  // Mở và đóng modal đổi mật khẩu
  const openPasswordModal = () => {
    oldPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
    showPasswordModal.value = true;
  };
  
  const closePasswordModal = () => {
    showPasswordModal.value = false;
  };
  
  // Xử lý upload ảnh đại diện
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    uploadedFile.value = file;
    previewImage.value = URL.createObjectURL(file); // Tạo URL preview hình ảnh
  };
  
  // Xác nhận thay đổi thông tin người dùng
  const confirmSaveChanges = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to save the changes?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await saveChanges(); // Gọi hàm lưu thay đổi
      }
    });
  };
  
  // Lưu thay đổi thông tin người dùng
  const saveChanges = async () => {
    let avatarUrl = currentUser.value.avatar; // Nếu không đổi ảnh thì giữ ảnh cũ
  
    // Nếu có upload ảnh mới thì upload lên Firebase Storage
    if (uploadedFile.value) {
      const storage = getStorage();
      const storageReference = storageRef(storage, `avatars/${uploadedFile.value.name}`);
      await uploadBytes(storageReference, uploadedFile.value);
      avatarUrl = await getDownloadURL(storageReference); // Lấy URL ảnh mới
    }
  
    const updatedUser = {
      userName: newUserName.value || currentUser.value.userName,
      bio: newBio.value || currentUser.value.bio,
      locked: isLocked.value,
      avatar: avatarUrl // Lưu URL ảnh mới hoặc ảnh cũ
    };
  
    // Gọi Vuex action để cập nhật thông tin
    await store.dispatch('updateUserProfile', updatedUser); 
    closeModal();
  };
  
  // Xác nhận và xử lý đổi mật khẩu
  const confirmChangePassword = () => {
    if (newPassword.value !== confirmNewPassword.value) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'New passwords do not match!',
      });
      return;
    }
  
    // Giả sử bạn có logic kiểm tra mật khẩu cũ từ server
    store.dispatch('changePassword', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    }).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Password changed successfully!',
        showConfirmButton: false,
        timer: 1500
      });
      closePasswordModal();
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to change password. Please try again.',
      });
    });
  };
  </script>
  
  <style scoped>
  .edit-btn {

    padding: 8px 15px;
    border: none;
    background-color: #333;
    color: white;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6); /* Tạo hiệu ứng mờ cho background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-in-out; /* Hiệu ứng xuất hiện nhẹ */
  }
  
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%; /* Đảm bảo modal không vượt quá 90% chiều rộng màn hình */
    text-align: center;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-in-out; /* Hiệu ứng modal trượt lên */
  }
  
  .modal-content h2 {
    margin-bottom: 20px;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }
  
  .modal-content input {
    margin-bottom: 15px;
    padding: 10px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
  }
  
  .modal-content button {
    margin-top: 15px;
    padding: 10px 20px;
    background-color: #333;
    color: white;
    cursor: pointer;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    transition: background-color 0.3s ease;
  }
  
  .modal-content button:hover {
    background-color: #555;
  }
  
  .change-password-btn {
    margin-top: 10px;
    padding: 8px 15px;
    background-color: #ff6347;
    color: white;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    font-size: 16px;
  }
  
  .avatar-preview {
    margin-top: 10px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ddd;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Hiệu ứng trượt modal từ dưới lên */
  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  /* Hiệu ứng mờ cho nền */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  /* Switch styling for locked/unlocked status */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    margin: 20px;
  }
  
  .switch input {
    display: none;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
  }
  
  input:checked + .slider {
    background-color: #2196F3;
  }
  
  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
  
  .slider.round {
    border-radius: 34px;
  }
  
  .slider.round:before {
    border-radius: 50%;
  }
  </style>
  