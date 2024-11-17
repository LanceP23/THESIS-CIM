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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [currentItem, setCurrentItem] = useState(null);

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
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !itemImage) {
      toast.error("Please fill out all fields!");
      return;
    }

    setIsUploading(true);
    const storageRef = ref(storage, `images/${itemImage.name}`);
    const uploadTask = uploadBytesResumable(storageRef, itemImage);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        toast.error("Image upload failed: " + error.message);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          await axios.post('/add-item', {
            name: itemName,
            price: itemPrice,
            picture: downloadURL,
          });
          toast.success("Item added successfully!");
          fetchItems();
          closeModals();
        } catch (error) {
          toast.error("Failed to add item: " + error.message);
        } finally {
          setIsUploading(false);
        }
      }
    );
  };
  

  const handleEditItem = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice) {
      toast.error("Please fill out all fields!");
      return;
    }

    setIsUploading(true);
    try {
      if (itemImage) {
        const storageRef = ref(storage, `images/${itemImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, itemImage);

        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            toast.error("Image upload failed: " + error.message);
            setIsUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await axios.put(`/update-item/${currentItem._id}`, {
              name: itemName,
              price: itemPrice,
              picture: downloadURL,
            });
            toast.success("Item updated successfully!");
            fetchItems();
            closeModals();
          }
        );
      } else {
        await axios.put(`/update-item/${currentItem._id}`, {
          name: itemName,
          price: itemPrice,
          picture: currentItem.picture,
        });
        toast.success("Item updated successfully!");
        fetchItems();
        closeModals();
      }
    } catch (error) {
      toast.error("Failed to update item: " + error.message);
    } finally {
      setIsUploading(false);
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

  const handleEdit = (item) => {
    setCurrentItem(item);
    setItemName(item.name);
    setItemPrice(item.price);
    setImagePreview(item.picture);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setItemName('');
    setItemPrice('');
    setItemImage(null);
    setImagePreview(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };
  
  
  

  return (
    <div className="mt-16 pt-4">
      <div className="p-4 bg-slate-200 shadow-lg rounded-2xl mb-6 ml-14 mr-5">
        <h2 className="font-semibold text-4xl text-green-800 border-b-2 border-yellow-500 py-2 mb-3">
          Minigame Shop
        </h2>
  
        {/* Add New Item Modal */}
        {isAddModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box">
              <div className="relative flex items-center mb-4">
                <h3 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-semibold text-gray-800 dark:text-white">
                  Add New Item
                </h3>
                <button
                  className="ml-auto btn btn-ghost btn-sm dark:text-white btn-circle"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
  
              <form onSubmit={handleAddItem} className="space-y-6">
                <div>
                  <label className="block dark:text-white font-semibold mb-2 text-left">
                    Item Name:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="input input-bordered input-success input-md w-full dark:text-white rounded-md shadow-xl"
                  />
                </div>
                <div>
                  <label className="block dark:text-white font-semibold mb-2 text-left">
                    Clawmark Price:
                  </label>
                  <input
                    type="number"
                    placeholder="Enter item price"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="input input-bordered input-success input-md w-full dark:text-white rounded-md shadow-xl"
                  />
                </div>
                <div className="flex flex-col justify-start">
                  <label className="block dark:text-white font-semibold mb-2 text-left">
                    Item Image:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input file-input-bordered file-input-success file-input-sm w-full dark:bg-white rounded-md shadow-xl"
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
                <div>
                  <button
                    type="submit"
                    className="btn btn-success btn-wide"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Save Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* Edit Item Modal */}
        {isEditModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box">
              <div className="relative flex items-center mb-4">
                <h3 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-semibold text-gray-800 dark:text-white">
                  Edit Item
                </h3>
                <button
                  className="ml-auto btn btn-ghost btn-sm dark:text-white btn-circle"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
  
              <form onSubmit={handleEditItem} className="space-y-6">
                <div>
                  <label className="block dark:text-white font-semibold mb-2 text-left">
                    Item Name:
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="input input-bordered input-success input-md w-full dark:text-white rounded-md shadow-xl"
                  />
                </div>
                <div>
                  <label className="block dark:text-white font-semibold mb-2 text-left">
                    Clawmark Price:
                  </label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="input input-bordered input-success input-md w-full dark:text-white rounded-md shadow-xl"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="btn btn-success btn-wide"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Updating...' : 'Update Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* Item List */}
        <div className="item-list bg-white border border-gray-300 p-8 rounded-xl shadow-lg">
          <div className="mb-8 flex items-center relative">
            <h3 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-semibold text-gray-800">
              Shop Inventory
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-accent ml-auto"
            >
              Add New Item
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white border border-gray-200 rounded-lg shadow p-4 flex flex-col items-center"
                >
                  <img
                    src={item.picture}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg mb-4"
                  />
                  <h4 className="text-xl font-semibold text-gray-800">
                    {item.name}
                  </h4>
                  <p className="text-gray-600">{item.price} Clawmarks</p>
                  <div className="mt-4 flex space-x-3">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default MinigameShop;
