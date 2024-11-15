import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import toast from 'react-hot-toast';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

const firebaseConfig = {
  apiKey: "AIzaSyAQZQtWzdKepDwzzhOAw_F8A4xkhtwz9p0",
  authDomain: "cim-storage.firebaseapp.com",
  projectId: "cim-storage",
  storageBucket: "cim-storage.appspot.com",
  messagingSenderId: "616767248215",
  appId: "1:616767248215:web:b554a837f3229fdc155012",
  measurementId: "G-YN9S75JSNB",
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const MinigameShop = () => {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/check-auth');
        if (!response.data.authenticated) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
    fetchItems();
  }, [navigate]);

  // Fetch all items (GET /items)
  const fetchItems = async () => {
    try {
      const response = await axios.get('/items');
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load items: ' + error.message);
    }
  };

  // Handle Image Selection and Preview
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setItemImage(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage)); // Preview the image
    }
  };

  // Handle New Item Upload (POST /add-item)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !itemImage) {
      alert('Please fill out all fields!');
      return;
    }

    setIsUploading(true);

    // Upload image to Firebase Storage
    const storageRef = ref(storage, `images/${itemImage.name}`);
    const uploadTask = uploadBytesResumable(storageRef, itemImage);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        alert('Upload failed:', error.message);
        setIsUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Send item data to the backend
          const response = await axios.post('/add-item', {
            name: itemName,
            price: itemPrice,
            picture: downloadURL,
          });

          toast.success('Item added successfully!');
          fetchItems(); // Refresh the item list
          setItemName('');
          setItemPrice('');
          setItemImage(null);
          setImagePreview(null); // Clear image preview after submission
          setIsModalOpen(false); // Close modal after adding item
        } catch (error) {
          toast.error('Failed to add item: ' + error.message);
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  // Handle item update (PUT /update-item/:id)
  const handleUpdate = async (id) => {
    const updatedItem = {
      name: itemName,
      price: itemPrice,
      picture: imagePreview || '', // You can update this with a new image URL if it's updated
    };

    try {
      await axios.put(`/update-item/${id}`, updatedItem);
      toast.success('Item updated successfully!');
      fetchItems(); // Refresh the item list
    } catch (error) {
      toast.error('Failed to update item: ' + error.message);
    }
  };

  // Handle item deletion (DELETE /delete-item/:id)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/delete-item/${id}`);
      toast.success('Item deleted successfully!');
      fetchItems(); // Refresh the item list
    } catch (error) {
      toast.error('Failed to delete item: ' + error.message);
    }
  };

  return (
    <div className="minigame-shop max-w-4xl mx-auto py-10 px-6">
      <h2 className="text-4xl font-semibold text-center text-gray-800 mb-6">Minigame Shop</h2>

      {/* Button to open modal */}
      <div className="mb-8 flex justify-center">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn btn-primary"
        >
          Add New Item
        </button>
      </div>

      {/* Add New Item Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">Add New Item</h3>
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Item Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="input input-bordered w-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg shadow-md p-3"
                />
              </div>

              {/* Item Price */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Clawmark Price</label>
                <input
                  type="number"
                  placeholder="Enter item price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="input input-bordered w-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg shadow-md p-3"
                />
              </div>

              {/* Image Upload with Preview */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered w-full bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg shadow-md p-3"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className={`btn w-full py-3 text-white text-lg font-semibold ${isUploading ? 'bg-gray-400' : 'bg-blue-500'} rounded-lg shadow-md`}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Add Item'}
                </button>
              </div>
            </form>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Item List */}
      <div className="item-list bg-white border border-gray-300 p-8 rounded-xl shadow-lg">
        <h3 className="text-3xl font-semibold text-center text-gray-800 mb-6">Shop Inventory</h3>
        <ul>
          {items.map((item) => (
            <li key={item._id} className="flex justify-between items-center py-4 border-b">
              <div className="flex items-center">
                <img 
                  src={item.picture} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded-lg mr-4" 
                />
                <div>
                  <h4 className="text-xl font-semibold">{item.name}</h4>
                  <p>{item.price} Clawmarks</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleUpdate(item._id)}
                >
                  Update
                </button>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MinigameShop;
