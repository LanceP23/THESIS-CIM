import React, { useState } from 'react';
import axios from 'axios';
import {toast} from 'react-hot-toast';

const UpdateUser = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.studentemail);
  const [position, setPosition] = useState(user.position || ''); 
  const [organization, setOrganization] = useState(user.organization || ''); 
  const [schoolYear, setSchoolYear] = useState(user.schoolYear || ''); 
  const [department, setDepartment] = useState(user.department || ''); 
  //lahat tong nasa taas meaning null sila pag wala silang ganun omsim

  const handleChangeName = (e) => {
    setName(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangePosition = (e) => {
    setPosition(e.target.value);
  };

  const handleChangeOrganization = (e) => {
    setOrganization(e.target.value);
  };

  const handleChangeSchoolYear = (e) => {
    setSchoolYear(e.target.value);
  };

  const handleChangeDepartment = (e) => {
    setDepartment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedUser = {
      name,
      studentemail: email,
      position: user.adminType === 'Organization Officer' ? position : undefined, // update this pag org off
      organization: user.adminType === 'Organization Officer' ? organization : undefined, // update this pag org off
      schoolYear: user.adminType !== 'Staff' ? schoolYear : undefined, // testing lang to
      department: user.adminType === 'Program Head' || user.adminType === 'Instructor' ? department : undefined // pag prog head and instructor update nya to
    };

    try {
      await axios.put(`/users/${user._id}/update`, updatedUser);
      onUpdate(updatedUser);
      toast.success('User updated sucessfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user')
    }
  };

  return (
    <div>
      <h4>Update User</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={handleChangeName} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={handleChangeEmail} />
        </div>
        {user.adminType === 'Organization Officer' && (
          <div>
            <label>Position:</label>
            <input type="text" value={position} onChange={handleChangePosition} />
            <br />
            <label>Organization:</label>
            <input type="text" value={organization} onChange={handleChangeOrganization} />
          </div>
        )}
        {user.adminType !== 'Staff' && (
          <div>
            <label>School Year:</label>
            <input type="text" value={schoolYear} onChange={handleChangeSchoolYear} />
          </div>
        )}
        {(user.adminType === 'Program Head' || user.adminType === 'Instructor') && (
          <div>
            <label>Department:</label>
            <input type="text" value={department} onChange={handleChangeDepartment} />
          </div>
        )}
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default UpdateUser;