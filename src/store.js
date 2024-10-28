import { createStore } from 'vuex';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore"; 
import { db } from "@/firebase/config.js"; 
import bcrypt from 'bcryptjs'; 

export const store = createStore({
  state: {
    users: [], // Danh sách người dùng
    posts: [], // Danh sách bài đăng
    theme: localStorage.getItem('theme') || 'light',  // Lấy giá trị theme từ localStorage hoặc mặc định là 'light'
    currentUser: null,  // Người dùng hiện tại (đã đăng nhập)
    selectedUser: null,  // Người dùng khác (người đăng bài, bình luận, v.v.)
    comments: {}, // Lưu các bình luận của bài viết theo postId
  },
  mutations: {
    addUser(state, user) {
      state.users.push(user);
    },
    setPosts(state, posts) {
      state.posts = posts;
    },
    setUsers(state, users) {
      state.users = users;
    },
    setTheme(state, theme) {
      state.theme = theme;
      localStorage.setItem('theme', theme);
    },
    setCurrentUser(state, user) {
      state.currentUser = user; 
    },
    setSelectedUser(state, user) {
      state.selectedUser = user;
    },
    clearCurrentUser(state) {
      state.currentUser = null; 
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
    updateUserInfo(state, updatedUser) {
      const index = state.users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        state.users[index] = updatedUser;
      }
      if (state.currentUser && state.currentUser.id === updatedUser.id) {
        state.currentUser = updatedUser; 
      }
    },
    addNewPost(state, post) {
      state.posts.push(post); 
    },
    removePost(state, postId) {
      state.posts = state.posts.filter(post => post.id !== postId);
    },
    updatePost(state, updatedPost) {
      const index = state.posts.findIndex(post => post.id === updatedPost.id);
      if (index !== -1) {
        state.posts[index] = updatedPost;
      }
    },
    updateFollowing(state, following) {
      state.currentUser.following = following; 
    },
    setComments(state, { postId, comments }) {
      state.comments[postId] = comments; // Lưu các bình luận theo postId
    },
    addComment(state, { postId, comment }) {
      if (!state.comments[postId]) {
        state.comments[postId] = [];
      }
      state.comments[postId].push(comment); // Thêm bình luận mới vào danh sách
    },
    removeComment(state, { postId, commentId }) {
      const index = state.comments[postId].findIndex(comment => comment.id === commentId);
      if (index !== -1) {
        state.comments[postId].splice(index, 1); // Xóa bình luận khỏi danh sách
      }    
    },
    updateCommentLikes(state, { commentId, likes }) {
      const comment = state.comments.find(c => c.id === commentId);
      if (comment) {
        comment.likes = likes;
      }
    }
  },
  actions: {
    // Thêm người dùng vào Firestore
    async addUser({ commit }, user) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10); // Mã hóa mật khẩu
        const newUser = { ...user, password: hashedPassword }; 
        const docRef = await addDoc(collection(db, "users"), newUser);
        commit('addUser', { id: docRef.id, ...newUser });
      } catch (error) {
        console.error("Error adding user to Firestore: ", error);
        throw error;
      }
    },

    // Lấy người dùng theo email (để đăng nhập)
    async fetchUserByEmail({ commit }) {
      try {
        const email = localStorage.getItem('loggedInUser')?.replace(/"/g, '').trim();
        if (!email) throw new Error("No email found in localStorage");

        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) throw new Error("User not found");

        const user = querySnapshot.docs[0].data();
        user.id = querySnapshot.docs[0].id; 
        commit('setCurrentUser', user); 
      } catch (error) {
        console.error("Error fetching user from Firestore: ", error);
        throw error;
      }
    },

    // Lấy người dùng theo id (người đăng bài hoặc bình luận)
    async fetchUserById({ commit }, userId) {
      try {
        const userRef = doc(db, "users", userId);  // Lấy tham chiếu đến user với id
        const userSnap = await getDoc(userRef);    // Lấy tài liệu từ Firestore

        if (!userSnap.exists()) {
          throw new Error("User not found");  // Nếu không tìm thấy user
        }

        const user = { id: userSnap.id, ...userSnap.data() };  // Lấy dữ liệu user từ tài liệu
        commit('setSelectedUser', user);  // Lưu user vào state selectedUser
      } catch (error) {
        console.error("Error fetching user by ID: ", error);
        throw error;
      }
    },

    // Lấy tất cả người dùng
    async fetchUsers({ commit }) {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
        commit('setUsers', users);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    },

    // Theo dõi người dùng mới
    async followUser({ commit, state }, userIdToFollow) {
      try {
        const currentUserFollowing = state.currentUser.following || [];
        
        // Kiểm tra xem đã follow người này chưa
        if (!currentUserFollowing.includes(userIdToFollow)) {
          const updatedFollowing = [...currentUserFollowing, userIdToFollow];

          // Cập nhật danh sách following của người dùng hiện tại
          const userRef = doc(db, "users", state.currentUser.id);
          await updateDoc(userRef, { following: updatedFollowing });
          commit('updateFollowing', updatedFollowing);

          // Cập nhật danh sách follower của người dùng được theo dõi
          const followedUserRef = doc(db, "users", userIdToFollow);
          const followedUserSnap = await getDoc(followedUserRef);
          const followedUserData = followedUserSnap.data();

          // Nếu người dùng được theo dõi có danh sách follower, thêm user hiện tại vào
          const updatedFollowers = [...(followedUserData.follower || []), state.currentUser.id];
          await updateDoc(followedUserRef, { follower: updatedFollowers });

          console.log("Successfully followed the user.");
        } else {
          console.log("User already followed.");
        }
      } catch (error) {
        console.error("Error following user:", error);
      }
    },

    // Lấy tất cả bài viết
    async fetchPosts({ commit }) {
      try {
        const q = query(collection(db, "posts"));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setPosts', posts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    },

    // Tạo bài viết mới
    async createNewPost({ commit }, post) {
      try {
        const postRef = await addDoc(collection(db, "posts"), post);
        const newPost = { id: postRef.id, ...post };
        commit('addNewPost', newPost);
      } catch (error) {
        console.error("Error creating new post:", error);
      }
    },

    // Xóa bài đăng
    async deletePost({ commit }, postId) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        commit('removePost', postId);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    },

    // Cập nhật thông tin bài đăng
    async updatePost({ commit }, updatedPost) {
      try {
        const postRef = doc(db, "posts", updatedPost.id); 
        await updateDoc(postRef, updatedPost); 
        commit('updatePost', updatedPost); 
      } catch (error) {
        console.error("Error updating post:", error);
      }
    },

    // Lấy tất cả bình luận cho bài đăng
    async fetchComments({ commit }, postId) {
      try {
        const q = query(collection(db, "comments"), where("idPost", "==", postId));
        const querySnapshot = await getDocs(q);
        const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setComments', { postId, comments });
      } catch (error) {
        console.error("Error fetching comments: ", error);
      }
    },
    async updateCommentLikes({ commit }, { commentId, likes }) {
      try {
        const commentRef = doc(db, "comments", commentId);
        await updateDoc(commentRef, { likes });
        commit('updateCommentLikes', { commentId, likes });
      } catch (error) {
        console.error("Error updating comment likes:", error);
      }
    },

    // Thêm bình luận mới
    async addComment({ commit, state }, { postId, content }) {
      try {
        const newComment = {
          content,
          createdAt: new Date(),
          idPost: postId,
          userId: state.currentUser.id,
          userName: state.currentUser.userName,
          likes: []
        };

        const docRef = await addDoc(collection(db, "comments"), newComment);
        commit('addComment', { postId, comment: { id: docRef.id, ...newComment } });
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },

    // Xóa bình luận
    async removeComment({ commit }, { postId, commentId }) {
      try {
        await deleteDoc(doc(db, "comments", commentId));
        commit('removeComment', { postId, commentId });
      } catch (error) {
        console.error("Error removing comment:", error);
      }
    },

    // Cập nhật thông tin người dùng
    async updateUserProfile({ commit, state }, updatedUser) {
      try {
        const userRef = doc(db, "users", state.currentUser.id);
        await updateDoc(userRef, updatedUser); 
        commit('updateUserInfo', updatedUser); 
      } catch (error) {
        console.error("Error updating user profile: ", error);
      }
    },

    // Đổi mật khẩu người dùng
    async changePassword({ commit, state }, { oldPassword, newPassword }) {
      try {
        const user = state.currentUser;

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
          throw new Error("Old password is incorrect");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { password: hashedNewPassword });

        commit('updateUserInfo', { ...user, password: hashedNewPassword });

        return true;
      } catch (error) {
        console.error("Error changing password:", error);
        throw error;
      }
    },

    // Thay đổi theme giữa dark và light
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      commit('setTheme', newTheme);
    },

    // Đăng xuất
    logout({ commit }) {
      localStorage.removeItem('loggedInUser');
      commit('clearCurrentUser');
    },
  },
  getters: {
    users: (state) => state.users,
    getUserById: (state) => (userId) => {
      return state.users.find(user => user.id === userId);
    },
    posts: (state) => state.posts,
    currentUser: (state) => state.currentUser, 
    selectedUser: (state) => state.selectedUser, 
    theme: (state) => state.theme,
    comments: (state) => (postId) => state.comments[postId] || [], // Lấy các bình luận theo postId
  }
});
