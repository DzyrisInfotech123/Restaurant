import axios from '../Components/Services/Api'

export const getUsersData = async () => {
    const allUsers = await axios.get("/getUsers", {
      headers: { "Content-Type": "application/json" },
    });
  
    // console.log(allUsers.data)
    
  
    let data = allUsers.data.map(user => {
      return {
        userName: user.userName,
        contactNo: user.contactNo,
        userId: user.userId? user.userId : "",
        role: user.role,
        status: user.active === true ? "Active" : "Inactive"
      }
    })
    // await setUsers([...data]);

    return data;
  }