import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DeleteUser = ({ user, onDelete }) => {
  const handleDelete = async () => {
    // Show the confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this admin?");

    console.log(user._id);

    if (confirmed) {
      try {
        await axios.delete(`/users/${user._id}/delete`);
        onDelete(user._id);
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error("Error deleting user");
      }
    } else {
      toast.success("Deletion canceled");
    }
  };

  return (
    <div>
      <button onClick={handleDelete} className="btn btn-xs btn-error">
        Delete
      </button>
    </div>
  );
};

export default DeleteUser;
