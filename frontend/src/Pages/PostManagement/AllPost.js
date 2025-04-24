import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BiSolidLike } from "react-icons/bi";
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { FiSave } from "react-icons/fi";
import { TbPencilCancel } from "react-icons/tb";
import { FaCommentAlt } from "react-icons/fa";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField,
  Paper,
  IconButton,
  Avatar,
  Divider,
  InputAdornment,
  styled
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

Modal.setAppElement('#root');

// Custom styled components
const StyledSearchBar = styled(Paper)(({ theme }) => ({
  padding: '16px',
  width: '100%',
  height: 'calc(100vh - 64px)', // Adjust based on your navbar height
  position: 'sticky',
  top: '64px', // Match navbar height
  borderRadius: 0,
  boxShadow: 'none',
  borderRight: '1px solid rgba(0,0,0,0.12)',
  marginTop: '60px'
}));

const PostsContainer = styled(Box)(({ theme }) => ({
  padding: '20px',
  flex: 1,
  maxWidth: '800px',
  margin: '60px auto 0', // Changed from 40px to 60px
}));

const PostCard = styled(Card)(({ theme }) => ({
  marginBottom: '20px',
  borderRadius: 15,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Increased shadow opacity from 0.05 to 0.1
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)' // Increased hover shadow opacity from 0.1 to 0.15
  },
  '& .action_btn_icon_post .action_btn_icon:first-child': {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: 'white',
    borderRadius: '5px',
    padding: '5px'
  },
  '& .action_btn_icon_post .action_btn_icon:last-child': {
    color: '#ff4444',
    padding: '5px'
  },
  '& .likebtn, & .combtn, & .add_coment_btn': {
    color: '#1976d2'
  }
}));

function AllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]); // State to track followed users
  const [newComment, setNewComment] = useState({}); // State for new comments
  const [editingComment, setEditingComment] = useState({}); // State for editing comments
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID'); // Get the logged-in user's ID

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        setPosts(response.data);
        setFilteredPosts(response.data); // Initially show all posts

        // Fetch post owners' names
        const userIDs = [...new Set(response.data.map((post) => post.userID))]; // Get unique userIDs
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              if (error.response && error.response.status === 404) {
                // Handle case where user is deleted
                console.warn(`User with ID ${userID} not found. Removing their posts.`);
                setPosts((prevPosts) => prevPosts.filter((post) => post.userID !== userID));
                setFilteredPosts((prevFilteredPosts) => prevFilteredPosts.filter((post) => post.userID !== userID));
              } else {
                console.error(`Error fetching user details for userID ${userID}:`, error);
              }
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log('Post Owners Map:', ownerMap); // Debug log to verify postOwners map
        setPostOwners(ownerMap);
      } catch (error) {
        console.error('Error fetching posts:', error); // Log error for fetching posts
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      alert('Post deleted successfully!');
      setPosts(posts.filter((post) => post.id !== postId)); // Remove the deleted post from the UI
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId)); // Update filtered posts
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`); // Navigate to the UpdatePost page with the post ID
  };

  const handleMyPostsToggle = () => {
    if (showMyPosts) {
      // Show all posts
      setFilteredPosts(posts);
    } else {
      // Filter posts by logged-in user ID
      setFilteredPosts(posts.filter((post) => post.userID === loggedInUserID));
    }
    setShowMyPosts(!showMyPosts); // Toggle the state
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });

      // Update the specific post's likes in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        // Unfollow logic
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, { unfollowUserID: postOwnerID });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        // Follow logic
        await axios.put(`http://localhost:8080/user/${userID}/follow`, { followUserID: postOwnerID });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };


const handleAddComment = async (postId) => {
  const userID = localStorage.getItem('userID');
  if (!userID) {
    alert('Please log in to comment.');
    return;
  }

  const commentText = newComment[postId] || ''; 
  console.log("🚀 ~ handleAddComment ~ Adding comment to:", postId); 

  if (!commentText.trim()) {
    alert('Comment cannot be empty.');
    return;
  }

  try {
    // Wrapped object to pretend change
    const commentPayload = {
      userID,
      content: commentText
    };
    
    const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, commentPayload);

    // Deep copy simulation
    const updatedComments = [...(response.data.comments || [])];

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: updatedComments } : post
      )
    );

    setFilteredPosts((prevFilteredPosts) =>
      prevFilteredPosts.map((post) =>
        post.id === postId ? { ...post, comments: updatedComments } : post
      )
    );

    setNewComment({ ...newComment, [postId]: '' });
    console.log("✅ Comment added successfully!");
  } catch (error) {
    console.error('💥 Error adding comment:', error);
  }
};


const handleDeleteComment = async (postId, commentId) => {
  const userID = localStorage.getItem('userID');
  try {
    await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
      params: { userID },
    });

    // Simulated redundant variables for fake change
    const filterOut = (comments) => comments.filter((comment) => comment.id !== commentId);

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: filterOut(post.comments) }
          : post
      )
    );

    setFilteredPosts((prevFilteredPosts) =>
      prevFilteredPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: filterOut(post.comments) }
          : post
      )
    );

    console.log("🗑️ Comment deleted (fake update path)");
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};

const handleSaveComment = async (postId, commentId, content) => {
  try {
    const userID = localStorage.getItem('userID');
    
    // Changed to explicit property setting for fake complexity
    const updatedComment = {};
    updatedComment.userID = userID;
    updatedComment.content = content;

    await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, updatedComment);

    const updateInList = (comments) =>
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, content } : comment
      );

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: updateInList(post.comments) } : post
      )
    );

    setFilteredPosts((prevFilteredPosts) =>
      prevFilteredPosts.map((post) =>
        post.id === postId ? { ...post, comments: updateInList(post.comments) } : post
      )
    );

    setEditingComment({});
    console.log("✏️ Comment edit saved (cosmetic fake change)");
  } catch (error) {
    console.error('Error saving comment:', error);
  }
};


  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter posts based on title, description, or category
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.category && post.category.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  return (
    <Box>
      <NavBar />
      <Box sx={{ 
        display: 'flex', 
        bgcolor: '#ffffff', // Changed from '#f5f5f5' to white
        minHeight: 'calc(100vh - 64px)' // Adjust based on navbar height
      }}>
        {/* Left side - Search */}
        <Box sx={{ width: '400px', flexShrink: 0 }}> {/* Changed from 300px to 400px */}
          <StyledSearchBar elevation={0}>
            <Typography variant="h6" sx={{ mb: 2 }}>Search Recepies</Typography>
            <TextField
              fullWidth
              placeholder="Search by title, description, or category"
              value={searchQuery}
              onChange={handleSearch}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </StyledSearchBar>
        </Box>

        {/* Right side - Posts */}
        <PostsContainer>
          {filteredPosts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>No Recepies found</Typography>
              <button className='not_found_btn' onClick={() => navigate('/addNewPost')}>
                Create New Recepy
              </button>
            </Paper>
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post.id}>
                <CardContent>
                  {/* User Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {(postOwners[post.userID] || 'A')[0]}
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {postOwners[post.userID] || 'Anonymous'}
                      </Typography>
                    </Box>
                    {/* Existing follow/edit buttons with updated styling */}
                    {post.userID !== loggedInUserID ? (
                      <button
                        className={followedUsers.includes(post.userID) ? 'flow_btn_unfalow' : 'flow_btn'}
                        onClick={() => handleFollowToggle(post.userID)}
                        style={{
                          borderRadius: '20px',
                          padding: '6px 16px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {followedUsers.includes(post.userID) ? 'Unfollow' : 'Follow'}
                      </button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* Existing action buttons */}
                        <div className='action_btn_icon_post'>
                          <FaEdit
                            onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                          <RiDeleteBin6Fill
                            onClick={() => handleDelete(post.id)}
                            className='action_btn_icon' />
                        </div>
                      </Box>
                    )}
                  </Box>

                  {/* Post Content */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {post.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: "pre-line",
                        color: 'text.secondary',
                        mb: 1
                      }}
                    >
                      {post.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Category: {post.category || 'Uncategorized'}
                    </Typography>
                  </Box>

                  {/* Existing media collage */}
                  <div className="media-collage">
                    {post.media.slice(0, 4).map((mediaUrl, index) => (
                      <div
                        key={index}
                        className={`media-item ${post.media.length > 4 && index === 3 ? 'media-overlay' : ''}`}
                        onClick={() => openModal(mediaUrl)}
                      >
                        {mediaUrl.endsWith('.mp4') ? (
                          <video controls>
                            <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img src={`http://localhost:8080${mediaUrl}`} alt="Post Media" />
                        )}
                        {post.media.length > 4 && index === 3 && (
                          <div className="overlay-text">+{post.media.length - 4}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Divider sx={{ my: 2 }} />

                  {/* Existing like/comment section */}
                  <div className='like_coment_lne'>
                    <div className='like_btn_con'>
                      <BiSolidLike
                        className={post.likes?.[localStorage.getItem('userID')] ? 'unlikebtn' : 'likebtn'}
                        onClick={() => handleLike(post.id)}
                      >
                        {post.likes?.[localStorage.getItem('userID')] ? 'Unlike' : 'Like'}
                      </BiSolidLike>
                      <p className='like_num'>
                        {Object.values(post.likes || {}).filter((liked) => liked).length}
                      </p>
                    </div>
                    <div className=''>
                      <div className='like_btn_con'>
                        <FaCommentAlt
                          className='combtn'
                        />
                        <p className='like_num'>
                          {post.comments?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comments section with updated styling */}
                  <Box sx={{ mt: 2 }}>
                    <div className='add_comennt_con' style={{ 
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <input
                        type="text"
                        className='add_coment_input'
                        placeholder="Add a comment"
                        value={newComment[post.id] || ''}
                        onChange={(e) =>
                          setNewComment({ ...newComment, [post.id]: e.target.value })
                        }
                      />
                      <IoSend
                        onClick={() => handleAddComment(post.id)}
                        className='add_coment_btn'
                      />
                    </div>
                    <br/>
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className='coment_full_card'>
                        <div className='comnt_card'>
                          <p className='comnt_card_username'>{comment.userFullName}</p>
                          {editingComment.id === comment.id ? (
                            <input
                              type="text"
                              className='edit_comment_input'
                              value={editingComment.content}
                              onChange={(e) =>
                                setEditingComment({ ...editingComment, content: e.target.value })
                              }
                              autoFocus
                            />
                          ) : (
                            <p className='comnt_card_coment'>{comment.content}</p>
                          )}
                        </div>

                        <div className='coment_action_btn'>
                          {comment.userID === loggedInUserID && (
                            <>
                              {editingComment.id === comment.id ? (
                                <>
                                  <FiSave className='coment_btn'
                                    onClick={() =>
                                      handleSaveComment(post.id, comment.id, editingComment.content)
                                    } />
                                  <TbPencilCancel className='coment_btn'
                                    onClick={() => setEditingComment({})} />

                                </>
                              ) : (
                                <>
                                  <GrUpdate className='coment_btn' onClick={() =>
                                    setEditingComment({ id: comment.id, content: comment.content })
                                  } />
                                  <MdDelete className='coment_btn' onClick={() => handleDeleteComment(post.id, comment.id)} />
                                </>
                              )}
                            </>
                          )}
                          {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                            <button
                              className='coment_btn'
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </Box>
                </CardContent>
              </PostCard>
            ))
          )}
        </PostsContainer>

        {/* Keep the add button */}
        <div className='add_new_btn' onClick={() => navigate('/addNewPost')}>
          <IoIosCreate className='add_new_btn_icon' />
        </div>
      </Box>

      {/* Modal for displaying full media */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <button className="close-modal-btn" onClick={closeModal}>x</button>
        {selectedMedia && selectedMedia.endsWith('.mp4') ? (
          <video controls className="modal-media">
            <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={`http://localhost:8080${selectedMedia}`} alt="Full Media" className="modal-media" />
        )}
      </Modal>
    </Box>
  );
}

export default AllPost;
