<template>
    <div>
      <button class="new-post-btn" @click="openModal">+ New Post</button>
  
      <!-- Modal thêm bài đăng -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>Create New Post</h2>
  
          <!-- Chọn hình ảnh hoặc video -->
          <label for="media">Select Media (Image/Video)</label>
          <input type="file" @change="handleMediaUpload" accept="image/*,video/*" multiple />
          
          <!-- Xem trước ảnh/video đã chọn -->
          <div class="media-preview" v-if="mediaPreviews.length">
            <div v-for="(media, index) in mediaPreviews" :key="index" class="preview-item">
              <img v-if="media.type === 'image'" :src="media.preview" class="media-preview-image" />
              <video v-if="media.type === 'video'" :src="media.preview" controls class="media-preview-video"></video>
            </div>
          </div>
  
          <!-- Thêm nội dung bài đăng -->
          <label for="content">Post Content</label>
          <textarea v-model="postContent" placeholder="Write your post content here"></textarea>
  
          <!-- Lựa chọn trạng thái -->
          <label for="status">Post Status</label>
          <select v-model="postStatus">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="friends">Friends</option>
          </select>
  
          <!-- Nút xác nhận và hủy bỏ -->
          <button @click="confirmSavePost">Save Post</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useStore } from 'vuex';
  import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
  import Swal from 'sweetalert2';
  import { db, storage } from '@/firebase/config'; // Import cấu hình Firebase
  
  const store = useStore();
  const showModal = ref(false);
  const mediaFiles = ref([]);
  const mediaPreviews = ref([]);
  const postContent = ref('');
  const postStatus = ref('public'); // Mặc định là công khai
  
  // Mở và đóng modal
  const openModal = () => {
    mediaFiles.value = [];
    mediaPreviews.value = [];
    postContent.value = '';
    postStatus.value = 'public'; // Reset lại trạng thái
    showModal.value = true;
  };
  
  const closeModal = () => {
    showModal.value = false;
  };
  
  // Xử lý khi người dùng chọn nhiều ảnh/video
  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    mediaFiles.value = files;
    mediaPreviews.value = files.map(file => ({
      type: file.type.startsWith('image') ? 'image' : 'video',
      preview: URL.createObjectURL(file)
    }));
  };
  
  // Xác nhận và lưu bài đăng với SweetAlert2
  const confirmSavePost = async () => {
    if (!mediaFiles.value.length || !postContent.value) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select media and write content!',
      });
      return;
    }
  
    // Xác nhận lưu bài đăng
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this post?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Tải lên tất cả media
        const mediaURLs = await Promise.all(mediaFiles.value.map(uploadMediaToFirebase));
  
        // Tạo đối tượng bài đăng mới
        const newPost = {
          content: {
            media: mediaURLs.map((url, index) => ({
              type: mediaFiles.value[index].type.startsWith('image') ? 'image' : 'video',
              url: url
            })),
            text: postContent.value
          },
          createdAt: new Date(),
          hide_post: false,
          like: [],
          status: postStatus.value, // Trạng thái bài đăng
          userName: store.getters.currentUser.userName,
          userId: store.getters.currentUser.id
        };
  
        // Lưu bài đăng vào Firestore
        store.dispatch('createNewPost', newPost);
  
        Swal.fire({
          icon: 'success',
          title: 'Post saved!',
          showConfirmButton: false,
          timer: 1500
        });
  
        // Đóng modal và làm sạch dữ liệu
        closeModal();
      }
    });
  };
  
  // Tải media lên Firebase Storage
  const uploadMediaToFirebase = async (file) => {
    return new Promise((resolve, reject) => {
      const mediaStorageRef = storageRef(storage, `posts/${file.name}`);
      const uploadTask = uploadBytesResumable(mediaStorageRef, file);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Có thể thêm xử lý tiến trình upload (nếu cần)
        },
        (error) => {
          console.error('Error uploading file:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };
  </script>
  
  <style scoped>
  .new-post-btn {
    padding: 8px 15px;
    background-color: #333;
    color: white;
    cursor: pointer;
    border: none;
    border-radius: 5px;
  }
  
  .modal {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
    text-align: center;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  .modal-content h2 {
    margin-bottom: 20px;
  }
  
  .modal-content input,
  .modal-content textarea,
  .modal-content select {
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
  }
  
  .modal-content button:hover {
    background-color: #555;
  }
  
  .media-preview {
    margin-top: 10px;
  }
  
  .preview-item {
    margin-bottom: 10px;
  }
  
  .media-preview-image,
  .media-preview-video {
    max-width: 100%;
    height: auto;
  }
  </style>
  